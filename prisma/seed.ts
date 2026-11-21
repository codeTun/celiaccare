/**
 * Demo data for CeliacCare:      pnpm db:seed
 *
 * Fills the database with a realistic but entirely FICTIONAL catalogue (categories, ingredients,
 * small businesses, products), partner restaurants and their menus, delivery zones and delivery
 * people, six months of orders, contact messages, error reports, reviews, and the first admin account.
 * The data lives in prisma/seed-data/*.ts: edit those files, then run the seed again.
 *
 * Safe to run several times:
 * - nothing is ever deleted;
 * - catalogue rows are found by their unique key (slug, governorate, phone, e-mail). Missing rows are
 *   created. For rows that already exist, only texts, prices and contact details are refreshed from
 *   the files. What the admin decides in the panel is never overwritten: photos, on/off switches
 *   (active, featured, available, partner, zone open), guarantee level, preparation practices,
 *   certification, "may contain" warnings, allergen flags, verification date and source, phone rules.
 *   Ingredient links are only added, never removed;
 * - the demo activity (orders, refused attempts, daily counters, messages, reports, reviews) is added
 *   only when the Order table is empty, i.e. on the first run;
 * - the admin password is set when the account is created. To change it later:
 *       pnpm db:seed --reset-admin-password      (this also signs out the open admin sessions)
 *   Both are written in the admin journal (AuditLog), like scripts/create-admin.ts does.
 *
 * Needs DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters, letters and digits) in .env.
 * This script runs outside Next.js: it imports nothing that uses "server-only" or "next/*".
 */
import { z } from "zod";

import { MAX_PASSWORD_LENGTH } from "../lib/auth/guard";
import { checkPasswordStrength, hashPassword } from "../lib/auth/password";
import { closeDb, db } from "../lib/prisma";
import { GOVERNORATES } from "../lib/tunisia";
import { normalizeSearch } from "../lib/utils";
import { CATEGORIES } from "./seed-data/categories";
import { CONTACT_MESSAGES, REPORTS, REVIEWS } from "./seed-data/community";
import { DELIVERERS, DELIVERY_ZONES } from "./seed-data/delivery";
import { INGREDIENTS } from "./seed-data/ingredients";
import { buildDemoOrders, type CatalogForOrders, type DemoOrderItem } from "./seed-data/orders";
import { BLOCKED_NUMBER, CRECHE, CUSTOMERS, PHONE_RULES } from "./seed-data/people";
import { PRODUCERS } from "./seed-data/producers";
import { PRODUCTS } from "./seed-data/products";
import { createRandom } from "./seed-data/random";
import { RESTAURANTS } from "./seed-data/restaurants";

// =============================================================================
// Settings and small helpers
// =============================================================================

/** The same number always gives the same demo orders (only the dates follow today's date). */
const RANDOM_SEED = 20261115;
/** The directory went online 16 months ago; online ordering opened about 6 months ago. */
const DIRECTORY_LAUNCH_MONTHS_AGO = 16;
const ORDERING_LAUNCH_DAYS_AGO = 185;
/** Rows inserted per INSERT statement for the big tables (orders, order lines). */
const BATCH_SIZE = 250;
const KNOWN_OPTIONS = ["--reset-admin-password"];

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const AVERAGE_MONTH_MS = 30.44 * DAY_MS;

/** "Now" is read once, so every date of this run is consistent. */
const now = new Date();

function daysAgo(days: number): Date {
  return new Date(now.getTime() - days * DAY_MS);
}

function monthsAgo(months: number): Date {
  return new Date(now.getTime() - months * AVERAGE_MONTH_MS);
}

/** `hours` after `date`, but never in the future. */
function hoursLater(date: Date, hours: number): Date {
  return new Date(Math.min(date.getTime() + hours * HOUR_MS, now.getTime() - MINUTE_MS));
}

function latest(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}

/** Read a value that must exist (a slug used in the seed files), with a clear error otherwise. */
function must<T>(map: Map<string, T>, key: string, what: string): T {
  const value = map.get(key);
  if (value === undefined) throw new Error(`Unknown ${what} "${key}".`);
  return value;
}

/** Split a long list into smaller lists (one INSERT per list). */
function inBatches<T>(rows: T[], size = BATCH_SIZE): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < rows.length; i += size) batches.push(rows.slice(i, i + size));
  return batches;
}

// =============================================================================
// Summary (printed at the end)
// =============================================================================

type TableResult = { table: string; created: number; updated: number; unchanged: number; note?: string };
const results: TableResult[] = [];

// =============================================================================
// 1. Checks before writing anything
// =============================================================================

function readOptions() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const unknown = args.filter((arg) => !KNOWN_OPTIONS.includes(arg));
  if (unknown.length > 0) {
    throw new Error(`Unknown option(s): ${unknown.join(", ")}. Available: ${KNOWN_OPTIONS.join(", ")}.`);
  }
  return { resetAdminPassword: args.includes("--reset-admin-password") };
}

/** The first admin account comes from .env. The seed refuses to run with a weak password. */
function readAdminFromEnv() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env (see .env.example).");
  }
  if (!z.email().safeParse(email).success) {
    throw new Error(`ADMIN_EMAIL "${email}" is not a valid e-mail address.`);
  }
  const weakness = checkPasswordStrength(password); // at least 12 characters, letters and digits
  if (weakness) throw new Error(`ADMIN_PASSWORD is too weak: ${weakness}`);
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD is too long (${MAX_PASSWORD_LENGTH} characters at most).`);
  }
  return { email, password };
}

/*
 * Checks of prisma/seed-data/*.ts (unknown slug, duplicate key, bad phone...), run before
 * anything is written. Each function adds the problems it finds to the `problems` list.
 */

const isPhone = (phone: string) => /^[2-9]\d{7}$/.test(phone); // 8 digits, like the checkout
const isPrice = (millimes: number) => Number.isInteger(millimes) && millimes > 0;
const isAmount = (millimes: number) => Number.isInteger(millimes) && millimes >= 0;

function reportDuplicates(problems: string[], label: string, values: string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) problems.push(`${label} "${value}" is used twice.`);
    seen.add(value);
  }
}

function checkUniqueKeys(problems: string[]) {
  reportDuplicates(problems, "Category slug", CATEGORIES.map((c) => c.slug));
  reportDuplicates(problems, "Ingredient slug", INGREDIENTS.map((i) => i.slug));
  reportDuplicates(problems, "Producer slug", PRODUCERS.map((p) => p.slug));
  reportDuplicates(problems, "Product slug", PRODUCTS.map((p) => p.slug));
  reportDuplicates(problems, "Restaurant slug", RESTAURANTS.map((r) => r.slug));
  reportDuplicates(problems, "Delivery zone", DELIVERY_ZONES.map((z) => z.governorate));
  reportDuplicates(problems, "Deliverer phone", DELIVERERS.map((d) => d.phone));
  reportDuplicates(problems, "Customer phone", [...CUSTOMERS.map((c) => c.phone), CRECHE.phone, BLOCKED_NUMBER.phone]);
  reportDuplicates(problems, "Phone rule", PHONE_RULES.map((r) => r.phone));
}

/**
 * Ingredients are known and listed once. A dish lists at least one (menus describe them); a product
 * may list none when its maker does not publish the composition (the sheet then says so).
 */
function checkIngredientList(problems: string[], where: string, slugs: string[], required = false) {
  const known = new Set(INGREDIENTS.map((i) => i.slug));
  if (required && slugs.length === 0) problems.push(`${where}: needs at least one ingredient.`);
  for (const slug of slugs.filter((s) => !known.has(s))) problems.push(`${where}: unknown ingredient "${slug}".`);
  reportDuplicates(problems, `${where}: ingredient`, slugs);
}

function checkProducts(problems: string[]) {
  const categorySlugs = new Set(CATEGORIES.map((c) => c.slug));
  const producerBySlug = new Map(PRODUCERS.map((p) => [p.slug, p]));
  for (const product of PRODUCTS) {
    const where = `Product "${product.slug}"`;
    const producer = producerBySlug.get(product.producer);
    if (!categorySlugs.has(product.category)) problems.push(`${where}: unknown category "${product.category}".`);
    if (!producer) problems.push(`${where}: unknown producer "${product.producer}".`);
    if (producer && !producer.isActive && product.isActive !== false) {
      problems.push(`${where}: its producer is inactive, so the product must be inactive too.`);
    }
    checkIngredientList(problems, where, product.ingredients);
    if (product.guaranteeLevel === "CERTIFIED" && !product.certification) {
      problems.push(`${where}: a CERTIFIED product needs a certification text.`);
    }
    if (!isPrice(product.price)) problems.push(`${where}: invalid price ${product.price}.`);
    if (!product.nameAr.trim()) problems.push(`${where}: missing Arabic name.`);
  }
}

function checkProducers(problems: string[]) {
  const governorates = new Set<string>(GOVERNORATES.map((g) => g.value));
  for (const producer of PRODUCERS) {
    const where = `Producer "${producer.slug}"`;
    if (!governorates.has(producer.governorate)) problems.push(`${where}: unknown governorate.`);
    if (producer.phone !== null && !isPhone(producer.phone)) problems.push(`${where}: invalid phone "${producer.phone}".`);
    if (producer.whatsapp && !isPhone(producer.whatsapp)) problems.push(`${where}: invalid WhatsApp number.`);
    if (producer.joinedMonthsAgo < producer.verifiedMonthsAgo) {
      problems.push(`${where}: verified before joining (joinedMonthsAgo must be >= verifiedMonthsAgo).`);
    }
  }
}

function checkRestaurants(problems: string[]) {
  const governorates = new Set<string>(GOVERNORATES.map((g) => g.value));
  for (const restaurant of RESTAURANTS) {
    const where = `Restaurant "${restaurant.slug}"`;
    if (!governorates.has(restaurant.governorate)) problems.push(`${where}: unknown governorate.`);
    if (!isPhone(restaurant.phone)) problems.push(`${where}: invalid phone "${restaurant.phone}".`);
    if (!isAmount(restaurant.deliveryFee) || !isAmount(restaurant.minOrder)) {
      problems.push(`${where}: invalid delivery fee or minimum order.`);
    }
    if (restaurant.partnerSinceMonthsAgo !== null && restaurant.dishes.length === 0) {
      problems.push(`${where}: a partner restaurant (online ordering) needs at least one dish.`);
    }
    reportDuplicates(problems, `${where}: dish`, restaurant.dishes.map((d) => d.name));
    for (const dish of restaurant.dishes) {
      checkIngredientList(problems, `${where}, dish "${dish.name}"`, dish.ingredients, true);
      if (!isPrice(dish.price)) problems.push(`${where}, dish "${dish.name}": invalid price.`);
    }
  }
}

function checkDeliveryAndPeople(problems: string[]) {
  for (const { value } of GOVERNORATES) {
    if (!DELIVERY_ZONES.some((zone) => zone.governorate === value)) problems.push(`No delivery zone for "${value}".`);
  }
  const openZones = new Set<string>(DELIVERY_ZONES.filter((z) => z.isActive).map((z) => z.governorate));
  for (const customer of [...CUSTOMERS, CRECHE]) {
    if (!isPhone(customer.phone)) problems.push(`Customer ${customer.firstName}: invalid phone "${customer.phone}".`);
    if (!openZones.has(customer.governorate)) {
      problems.push(`Customer ${customer.firstName} lives in ${customer.governorate}, where delivery is not open.`);
    }
  }
  for (const deliverer of DELIVERERS.filter((d) => !isPhone(d.phone))) {
    problems.push(`Deliverer ${deliverer.name}: invalid phone.`);
  }
}

function checkCommunity(problems: string[]) {
  const slugsByTarget = {
    PRODUCT: new Set(PRODUCTS.map((p) => p.slug)),
    PRODUCER: new Set(PRODUCERS.map((p) => p.slug)),
    RESTAURANT: new Set(RESTAURANTS.map((r) => r.slug)),
  };
  for (const report of REPORTS) {
    if (!slugsByTarget[report.targetType].has(report.targetSlug)) {
      problems.push(`Report: unknown ${report.targetType} "${report.targetSlug}".`);
    }
  }
  for (const review of REVIEWS) {
    const where = `Review by ${review.authorName}`;
    if (Boolean(review.product) === Boolean(review.restaurant)) {
      problems.push(`${where}: give either a product or a restaurant.`);
    } else if (review.product && !slugsByTarget.PRODUCT.has(review.product)) {
      problems.push(`${where}: unknown product "${review.product}".`);
    } else if (review.restaurant && !slugsByTarget.RESTAURANT.has(review.restaurant)) {
      problems.push(`${where}: unknown restaurant "${review.restaurant}".`);
    }
  }
}

/** Stops the seed (before writing anything) when the files of prisma/seed-data contain a mistake. */
function checkSeedData() {
  const problems: string[] = [];
  checkUniqueKeys(problems);
  checkProducts(problems);
  checkProducers(problems);
  checkRestaurants(problems);
  checkDeliveryAndPeople(problems);
  checkCommunity(problems);
  if (problems.length > 0) {
    throw new Error(`The seed data has ${problems.length} problem(s):\n  - ${problems.join("\n  - ")}`);
  }
}

// =============================================================================
// 2. Insert-or-refresh helper used for every catalogue table
// =============================================================================

/** true when at least one of `fields` has another value in the database row. */
function differs(row: object, fields: object): boolean {
  const stored = row as Record<string, unknown>;
  return Object.entries(fields).some(([key, value]) => {
    const current = stored[key];
    if (current instanceof Date && value instanceof Date) return current.getTime() !== value.getTime();
    return current !== value;
  });
}

/**
 * Make a table match the seed files without deleting anything:
 * - an item whose key is not in the table yet is created (with all of `create`),
 * - an existing row receives the `refresh` fields, only when one of them changed,
 * - an identical row is left untouched, so running the seed twice changes nothing.
 */
async function syncTable<Row extends { id: number }, Create, Refresh extends object>(
  table: string,
  existingRows: readonly Row[],
  keyOf: (row: Row) => string,
  items: { key: string; create: Create; refresh: Refresh }[],
  createMany: (rows: Create[]) => PromiseLike<unknown>,
  updateOne: (id: number, refresh: Refresh) => PromiseLike<unknown>,
): Promise<void> {
  const existing = new Map(existingRows.map((row) => [keyOf(row), row]));
  const toCreate: Create[] = [];
  const result: TableResult = { table, created: 0, updated: 0, unchanged: 0 };
  for (const item of items) {
    const row = existing.get(item.key);
    if (!row) {
      toCreate.push(item.create);
    } else if (differs(row, item.refresh)) {
      await updateOne(row.id, item.refresh);
      result.updated += 1;
    } else {
      result.unchanged += 1;
    }
  }
  for (const batch of inBatches(toCreate)) await createMany(batch);
  result.created = toCreate.length;
  results.push(result);
}

/** One row of the ProductIngredient / DishIngredient tables ("this product contains this ingredient"). */
type ProductLink = { productId: number; ingredientId: number };
type DishLink = { dishId: number; ingredientId: number };

/** The links of a many-to-many table that are not saved yet (existing links are never removed). */
function missingLinks<Link>(
  table: string,
  wanted: Link[],
  existing: readonly Link[],
  keyOf: (link: Link) => string,
): Link[] {
  const known = new Set(existing.map(keyOf));
  const missing = wanted.filter((link) => !known.has(keyOf(link)));
  results.push({ table, created: missing.length, updated: 0, unchanged: wanted.length - missing.length });
  return missing;
}

// =============================================================================
// 3. Admin account
// =============================================================================

/** Written in the admin journal (Sécurité page), like scripts/create-admin.ts does. */
const AUDIT_AUTHOR = "script (pnpm db:seed)";

async function seedAdmin(admin: { email: string; password: string }, resetPassword: boolean) {
  const existing = await db.orm.public.AdminUser.select("id").first({ email: admin.email });
  if (existing && !resetPassword) {
    results.push({ table: "AdminUser", created: 0, updated: 0, unchanged: 1, note: `${admin.email} kept (password unchanged)` });
    return;
  }

  const passwordHash = await hashPassword(admin.password); // argon2id: the password itself is never stored
  await db.transaction(async (tx) => {
    if (!existing) {
      const created = await tx.orm.public.AdminUser.create({
        email: admin.email,
        name: "Administrateur",
        passwordHash,
        passwordChangedAt: now,
      });
      await tx.orm.public.AuditLog.create({
        adminEmail: AUDIT_AUTHOR,
        action: "create",
        entity: "admin",
        entityId: String(created.id),
        details: `Compte créé pour ${admin.email}`,
      });
      return;
    }
    await tx.orm.public.AdminUser.where({ id: existing.id }).update({
      passwordHash,
      passwordChangedAt: now,
      failedAttempts: 0,
      lockedUntil: null,
    });
    // A new password signs out every browser that was logged in with the old one.
    await tx.orm.public.AdminSession.where({ adminId: existing.id }).deleteAll();
    await tx.orm.public.AuditLog.create({
      adminEmail: AUDIT_AUTHOR,
      action: "update",
      entity: "admin",
      entityId: String(existing.id),
      details: `Mot de passe réinitialisé pour ${admin.email}, sessions fermées`,
    });
  });
  results.push(
    existing
      ? { table: "AdminUser", created: 0, updated: 1, unchanged: 0, note: `${admin.email}: password reset, sessions closed` }
      : { table: "AdminUser", created: 1, updated: 0, unchanged: 0, note: `${admin.email} created` },
  );
}

// =============================================================================
// 4. Catalogue: categories, ingredients, producers, products
// =============================================================================

async function seedCategories() {
  const createdAt = monthsAgo(DIRECTORY_LAUNCH_MONTHS_AGO);
  await syncTable(
    "Category",
    await db.orm.public.Category.all(),
    (row) => row.slug,
    CATEGORIES.map((category) => {
      const refresh = {
        name: category.name,
        nameAr: category.nameAr,
        description: category.description,
        descriptionAr: category.descriptionAr,
        icon: category.icon,
        sortOrder: category.sortOrder,
      };
      return { key: category.slug, create: { slug: category.slug, ...refresh, createdAt, updatedAt: createdAt }, refresh };
    }),
    (rows) => db.orm.public.Category.createAll(rows),
    (id, refresh) => db.orm.public.Category.where({ id }).update(refresh),
  );
}

async function seedIngredients() {
  const createdAt = monthsAgo(DIRECTORY_LAUNCH_MONTHS_AGO);
  await syncTable(
    "Ingredient",
    await db.orm.public.Ingredient.all(),
    (row) => row.slug,
    INGREDIENTS.map((ingredient) => {
      const refresh = { name: ingredient.name, nameAr: ingredient.nameAr };
      return {
        key: ingredient.slug,
        // The allergen flag is a safety decision: once in the database, only the admin changes it.
        create: { slug: ingredient.slug, ...refresh, isAllergen: ingredient.isAllergen, createdAt },
        refresh,
      };
    }),
    (rows) => db.orm.public.Ingredient.createAll(rows),
    (id, refresh) => db.orm.public.Ingredient.where({ id }).update(refresh),
  );
}

async function seedProducers() {
  await syncTable(
    "Producer",
    await db.orm.public.Producer.all(),
    (row) => row.slug,
    PRODUCERS.map((producer) => {
      const refresh = {
        name: producer.name,
        type: producer.type,
        description: producer.description,
        descriptionAr: producer.descriptionAr,
        city: producer.city,
        governorate: producer.governorate,
        address: producer.address,
        latitude: producer.latitude,
        longitude: producer.longitude,
        phone: producer.phone,
        whatsapp: producer.whatsapp,
        email: producer.email,
        website: producer.website,
        instagram: producer.instagram,
        facebook: producer.facebook,
        openingHours: producer.openingHours,
      };
      const verifiedAt = monthsAgo(producer.verifiedMonthsAgo);
      const createdAt = monthsAgo(producer.joinedMonthsAgo);
      return {
        key: producer.slug,
        create: {
          slug: producer.slug,
          ...refresh,
          // Decided by the admin after each verification: set once, never overwritten.
          guaranteeLevel: producer.guaranteeLevel,
          dedicatedSpace: producer.dedicatedSpace,
          dedicatedUtensils: producer.dedicatedUtensils,
          trainedStaff: producer.trainedStaff,
          verificationSource: producer.verificationSource,
          verifiedAt,
          isActive: producer.isActive,
          createdAt,
          updatedAt: verifiedAt,
        },
        refresh,
      };
    }),
    (rows) => db.orm.public.Producer.createAll(rows),
    (id, refresh) => db.orm.public.Producer.where({ id }).update(refresh),
  );
}

async function seedProducts() {
  const categories = new Map((await db.orm.public.Category.select("id", "slug", "name").all()).map((c) => [c.slug, c]));
  const producers = new Map((await db.orm.public.Producer.select("id", "slug", "name").all()).map((p) => [p.slug, p]));
  const ingredients = new Map((await db.orm.public.Ingredient.select("id", "slug", "name").all()).map((i) => [i.slug, i]));
  const producerData = new Map(PRODUCERS.map((producer) => [producer.slug, producer]));

  await syncTable(
    "Product",
    await db.orm.public.Product.all(),
    (row) => row.slug,
    PRODUCTS.map((product) => {
      const category = must(categories, product.category, "category");
      const producer = must(producers, product.producer, "producer");
      const producerInfo = must(producerData, product.producer, "producer");
      const ingredientNames = product.ingredients.map((slug) => must(ingredients, slug, "ingredient").name);

      const refresh = {
        name: product.name,
        nameAr: product.nameAr,
        description: product.description,
        descriptionAr: product.descriptionAr,
        price: product.price,
        unit: product.unit,
        categoryId: category.id,
        producerId: producer.id,
        // Same formula as productSearchText() in models/posters/products.ts (ingredient names sorted
        // with the default sort, so the admin panel computes exactly the same text).
        searchText: normalizeSearch(
          [product.name, product.nameAr, product.description, category.name, producer.name, ...[...ingredientNames].sort()].join(" "),
        ),
      };

      // A product appears when its producer joins (a few days apart), unless it is a recent addition.
      const position = PRODUCTS.filter((p) => p.producer === product.producer).indexOf(product);
      const createdAt =
        product.addedDaysAgo !== undefined
          ? daysAgo(product.addedDaysAgo)
          : new Date(monthsAgo(producerInfo.joinedMonthsAgo).getTime() + position * 3 * DAY_MS);
      // Checked at the producer's last visit, or when added if that came later.
      const verifiedAt = latest(monthsAgo(producerInfo.verifiedMonthsAgo), createdAt);

      return {
        key: product.slug,
        create: {
          slug: product.slug,
          ...refresh,
          // Safety and display decisions of the admin: set once, never overwritten.
          guaranteeLevel: product.guaranteeLevel,
          certification: product.certification ?? null,
          mayContain: product.mayContain ?? null,
          isAvailable: product.isAvailable ?? true,
          isFeatured: product.isFeatured ?? false,
          isActive: product.isActive ?? true,
          verifiedAt,
          createdAt,
          updatedAt: verifiedAt,
        },
        refresh,
      };
    }),
    (rows) => db.orm.public.Product.createAll(rows),
    (id, refresh) => db.orm.public.Product.where({ id }).update(refresh),
  );

  // Ingredient links (ProductIngredient): add the missing ones.
  const productIds = new Map((await db.orm.public.Product.select("id", "slug").all()).map((p) => [p.slug, p.id]));
  const wanted = PRODUCTS.flatMap((product) =>
    product.ingredients.map((slug): ProductLink => ({
      productId: must(productIds, product.slug, "product"),
      ingredientId: must(ingredients, slug, "ingredient").id,
    })),
  );
  const missing = missingLinks<ProductLink>(
    "ProductIngredient",
    wanted,
    await db.orm.public.ProductIngredient.all(),
    (link) => `${link.productId}:${link.ingredientId}`,
  );
  for (const batch of inBatches(missing)) await db.orm.public.ProductIngredient.createAll(batch, { onConflict: "skip" });
}

// =============================================================================
// 5. Restaurants and their dishes
// =============================================================================

async function seedRestaurants() {
  await syncTable(
    "Restaurant",
    await db.orm.public.Restaurant.all(),
    (row) => row.slug,
    RESTAURANTS.map((restaurant) => {
      const refresh = {
        name: restaurant.name,
        description: restaurant.description,
        descriptionAr: restaurant.descriptionAr,
        cuisine: restaurant.cuisine,
        city: restaurant.city,
        governorate: restaurant.governorate,
        address: restaurant.address,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        phone: restaurant.phone,
        whatsapp: restaurant.whatsapp,
        email: restaurant.email,
        website: restaurant.website,
        instagram: restaurant.instagram,
        facebook: restaurant.facebook,
        openingHours: restaurant.openingHours,
        priceRange: restaurant.priceRange,
        deliveryFee: restaurant.deliveryFee,
        deliveryTime: restaurant.deliveryTime,
        minOrder: restaurant.minOrder,
      };
      const verifiedAt = monthsAgo(restaurant.verifiedMonthsAgo);
      const isPartner = restaurant.partnerSinceMonthsAgo !== null;
      return {
        key: restaurant.slug,
        create: {
          slug: restaurant.slug,
          ...refresh,
          // Decided by the admin (verification, partnership): set once, never overwritten.
          guaranteeLevel: restaurant.guaranteeLevel,
          dedicatedKitchen: restaurant.dedicatedKitchen,
          dedicatedUtensils: restaurant.dedicatedUtensils,
          trainedStaff: restaurant.trainedStaff,
          verificationSource: restaurant.verificationSource,
          verifiedAt,
          isPartner,
          partnerSince: restaurant.partnerSinceMonthsAgo === null ? null : monthsAgo(restaurant.partnerSinceMonthsAgo),
          isActive: true,
          createdAt: monthsAgo(restaurant.joinedMonthsAgo),
          updatedAt: verifiedAt,
        },
        refresh,
      };
    }),
    (rows) => db.orm.public.Restaurant.createAll(rows),
    (id, refresh) => db.orm.public.Restaurant.where({ id }).update(refresh),
  );

  // Dishes: a dish is found by its restaurant + its name.
  const restaurants = await db.orm.public.Restaurant.select("id", "slug", "createdAt").all();
  const restaurantBySlug = new Map(restaurants.map((r) => [r.slug, r]));
  const ingredients = new Map((await db.orm.public.Ingredient.select("id", "slug").all()).map((i) => [i.slug, i.id]));
  const dishKey = (restaurantId: number, name: string) => `${restaurantId}|${name}`;

  await syncTable(
    "Dish",
    await db.orm.public.Dish.all(),
    (row) => dishKey(row.restaurantId, row.name),
    RESTAURANTS.flatMap((restaurant) => {
      const saved = must(restaurantBySlug, restaurant.slug, "restaurant");
      return restaurant.dishes.map((dish, index) => {
        const refresh = {
          nameAr: dish.nameAr,
          description: dish.description,
          descriptionAr: dish.descriptionAr,
          price: dish.price,
          course: dish.course,
          sortOrder: index + 1, // the order of the file
        };
        return {
          key: dishKey(saved.id, dish.name),
          create: {
            restaurantId: saved.id,
            name: dish.name,
            ...refresh,
            isAvailable: dish.isAvailable ?? true, // switch of the admin: set once
            createdAt: saved.createdAt,
            updatedAt: saved.createdAt,
          },
          refresh,
        };
      });
    }),
    (rows) => db.orm.public.Dish.createAll(rows),
    (id, refresh) => db.orm.public.Dish.where({ id }).update(refresh),
  );

  // Ingredient links (DishIngredient): add the missing ones.
  const dishes = await db.orm.public.Dish.select("id", "restaurantId", "name").all();
  const dishIds = new Map(dishes.map((d) => [dishKey(d.restaurantId, d.name), d.id]));
  const wanted = RESTAURANTS.flatMap((restaurant) => {
    const saved = must(restaurantBySlug, restaurant.slug, "restaurant");
    return restaurant.dishes.flatMap((dish) =>
      dish.ingredients.map((slug): DishLink => ({
        dishId: must(dishIds, dishKey(saved.id, dish.name), "dish"),
        ingredientId: must(ingredients, slug, "ingredient"),
      })),
    );
  });
  const missing = missingLinks<DishLink>(
    "DishIngredient",
    wanted,
    await db.orm.public.DishIngredient.all(),
    (link) => `${link.dishId}:${link.ingredientId}`,
  );
  for (const batch of inBatches(missing)) await db.orm.public.DishIngredient.createAll(batch, { onConflict: "skip" });
}

// =============================================================================
// 6. Delivery zones, delivery people and phone rules
// =============================================================================

async function seedDelivery() {
  const openedAt = daysAgo(ORDERING_LAUNCH_DAYS_AGO);
  await syncTable(
    "DeliveryZone",
    await db.orm.public.DeliveryZone.all(),
    (row) => row.governorate,
    DELIVERY_ZONES.map((zone) => {
      const refresh = { fee: zone.fee, delay: zone.delay, freeFrom: zone.freeFrom };
      return {
        key: zone.governorate,
        create: { governorate: zone.governorate, ...refresh, isActive: zone.isActive, createdAt: openedAt, updatedAt: openedAt },
        refresh,
      };
    }),
    (rows) => db.orm.public.DeliveryZone.createAll(rows),
    (id, refresh) => db.orm.public.DeliveryZone.where({ id }).update(refresh),
  );

  await syncTable(
    "Deliverer",
    await db.orm.public.Deliverer.all(),
    (row) => row.phone,
    DELIVERERS.map((deliverer, index) => {
      const refresh = {
        name: deliverer.name,
        vehicle: deliverer.vehicle,
        zone: deliverer.covers.join(", "),
        notes: deliverer.notes,
      };
      const createdAt = new Date(openedAt.getTime() + index * 9 * DAY_MS); // hired one after the other
      return { key: deliverer.phone, create: { phone: deliverer.phone, ...refresh, isActive: true, createdAt, updatedAt: createdAt }, refresh };
    }),
    (rows) => db.orm.public.Deliverer.createAll(rows),
    (id, refresh) => db.orm.public.Deliverer.where({ id }).update(refresh),
  );

  // Phone rules are decisions of the admin (EF-39): created once, never refreshed.
  await syncTable(
    "PhoneRule",
    await db.orm.public.PhoneRule.all(),
    (row) => row.phone,
    PHONE_RULES.map((rule) => {
      const createdAt = daysAgo(rule.createdDaysAgo);
      return {
        key: rule.phone,
        create: {
          phone: rule.phone,
          type: rule.type,
          maxPerDay: rule.maxPerDay,
          reason: rule.reason,
          expiresAt: rule.expiresInDays === null ? null : new Date(now.getTime() + rule.expiresInDays * DAY_MS),
          createdAt,
          updatedAt: createdAt,
        },
        refresh: {},
      };
    }),
    (rows) => db.orm.public.PhoneRule.createAll(rows),
    (id, refresh) => db.orm.public.PhoneRule.where({ id }).update(refresh),
  );
}

// =============================================================================
// 7. Demo activity: orders, refused attempts, counters, messages, reports, reviews
// =============================================================================

/** What the order generator needs, read from the database (so prices are the current ones). */
async function loadCatalogForOrders(): Promise<CatalogForOrders> {
  const products = await db.orm.public.Product.where({ isActive: true, isAvailable: true })
    .where((p) => p.producer.some((producer) => producer.isActive.eq(true)))
    .select("id", "slug", "name", "price", "isFeatured", "createdAt")
    .include("producer", (producer) => producer.select("name"))
    .all();
  const restaurants = await db.orm.public.Restaurant.where({ isActive: true, isPartner: true })
    .select("id", "slug", "name", "governorate", "minOrder", "partnerSince", "createdAt")
    .include("dishes", (dishes) => dishes.where({ isAvailable: true }).select("id", "name", "price", "course"))
    .all();
  const zones = await db.orm.public.DeliveryZone.select("id", "governorate", "delay").all();
  const deliverers = await db.orm.public.Deliverer.where({ isActive: true }).select("id", "phone").all();
  const coversByPhone = new Map(DELIVERERS.map((d) => [d.phone, d.covers as string[]]));

  return {
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      merchantName: p.producer?.name ?? "",
      isFeatured: p.isFeatured,
      createdAt: p.createdAt,
    })),
    restaurants: restaurants.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      governorate: r.governorate,
      minOrder: r.minOrder,
      partnerSince: r.partnerSince ?? r.createdAt,
      dishes: r.dishes,
    })),
    zones,
    deliverers: deliverers.map((d) => ({ id: d.id, covers: coversByPhone.get(d.phone) ?? [] })),
  };
}

async function seedDemoActivity() {
  const demoTables = ["Order", "OrderItem", "OrderAttempt", "OrderCounter", "ContactMessage", "Report", "Review"];
  const { n: existingOrders } = await db.orm.public.Order.aggregate((a) => ({ n: a.count() }));
  if (existingOrders > 0) {
    for (const table of demoTables) {
      results.push({ table, created: 0, updated: 0, unchanged: 0, note: "skipped: orders already exist" });
    }
    return;
  }

  const catalog = await loadCatalogForOrders();
  if (catalog.products.length === 0 || catalog.zones.length === 0) {
    throw new Error("No active product or delivery zone: cannot build the demo orders.");
  }
  const { orders, attempts, counters } = buildDemoOrders(catalog, now, createRandom(RANDOM_SEED));

  // Look-ups for reports and reviews (the slugs of the seed files → database rows).
  const products = new Map((await db.orm.public.Product.select("id", "slug", "name").all()).map((p) => [p.slug, p]));
  const producers = new Map((await db.orm.public.Producer.select("id", "slug", "name").all()).map((p) => [p.slug, p]));
  const restaurants = new Map((await db.orm.public.Restaurant.select("id", "slug", "name").all()).map((r) => [r.slug, r]));

  /** "{reference}" in a message → the sender's latest order before the message (orders are sorted by date). */
  const latestReference = (phone: string | null, before: Date) => {
    const mine = orders.filter((order) => order.phone === phone && order.createdAt.getTime() <= before.getTime());
    return mine.at(-1)?.reference ?? "de cette semaine";
  };

  const messages = CONTACT_MESSAGES.map((message, index) => {
    const createdAt = new Date(daysAgo(message.daysAgo).getTime() - ((index * 5) % 9) * HOUR_MS);
    const isHandled = message.status === "RESOLVED" || message.status === "ARCHIVED";
    const handledAt = isHandled ? hoursLater(createdAt, 3 + ((index * 7) % 30)) : null;
    const reference = latestReference(message.phone, createdAt);
    return {
      name: message.name,
      email: message.email,
      phone: message.phone,
      topic: message.topic,
      subject: message.subject.replace("{reference}", reference),
      message: message.message.replace("{reference}", reference),
      status: message.status,
      adminNote: message.adminNote,
      handledAt,
      createdAt,
      updatedAt: handledAt ?? (message.status === "IN_PROGRESS" ? hoursLater(createdAt, 20) : createdAt),
    };
  });

  const sheetsByTarget = { PRODUCT: products, PRODUCER: producers, RESTAURANT: restaurants };
  const reports = REPORTS.map((report, index) => {
    const target = must(sheetsByTarget[report.targetType], report.targetSlug, report.targetType.toLowerCase());
    const createdAt = new Date(daysAgo(report.daysAgo).getTime() - ((index * 3) % 7) * HOUR_MS);
    const isClosed = report.status === "RESOLVED" || report.status === "REJECTED";
    const resolvedAt = isClosed ? hoursLater(createdAt, 26 + index * 4) : null;
    return {
      targetType: report.targetType,
      targetId: target.id,
      targetName: target.name, // snapshot: the report keeps the name even if the sheet changes
      targetSlug: target.slug,
      reason: report.reason,
      message: report.message,
      contact: report.contact,
      status: report.status,
      adminNote: report.adminNote,
      resolvedAt,
      createdAt,
      updatedAt: resolvedAt ?? (report.status === "IN_REVIEW" ? hoursLater(createdAt, 18) : createdAt),
    };
  });

  const reviews = REVIEWS.map((review, index) => {
    const createdAt = new Date(daysAgo(review.daysAgo).getTime() - ((index * 5) % 11) * HOUR_MS);
    return {
      productId: review.product ? must(products, review.product, "product").id : null,
      restaurantId: review.restaurant ? must(restaurants, review.restaurant, "restaurant").id : null,
      authorName: review.authorName,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      moderatedAt: review.status === "PENDING" ? null : hoursLater(createdAt, 3 + ((index * 7) % 24)),
      createdAt,
    };
  });

  // An order = one Order row + its OrderItem rows (linked by the order id, known after the insert).
  const itemsByReference = new Map<string, DemoOrderItem[]>();
  const orderRows = orders.map(({ items, ...columns }) => {
    itemsByReference.set(columns.reference, items);
    return columns;
  });

  // Everything in one transaction: if anything fails, nothing is saved and the next run starts clean.
  await db.transaction(async (tx) => {
    const items: (DemoOrderItem & { orderId: number })[] = [];
    for (const batch of inBatches(orderRows)) {
      const saved = await tx.orm.public.Order.createAll(batch);
      for (const order of saved) {
        for (const item of must(itemsByReference, order.reference, "order")) items.push({ orderId: order.id, ...item });
      }
    }
    for (const batch of inBatches(items)) await tx.orm.public.OrderItem.createAll(batch);
    if (attempts.length > 0) await tx.orm.public.OrderAttempt.createAll(attempts);
    if (counters.length > 0) await tx.orm.public.OrderCounter.createAll(counters, { onConflict: "skip" });
    await tx.orm.public.ContactMessage.createAll(messages);
    await tx.orm.public.Report.createAll(reports);
    await tx.orm.public.Review.createAll(reviews);

    const counts: Record<string, number> = {
      Order: orders.length,
      OrderItem: items.length,
      OrderAttempt: attempts.length,
      OrderCounter: counters.length,
      ContactMessage: messages.length,
      Report: reports.length,
      Review: reviews.length,
    };
    for (const table of demoTables) results.push({ table, created: counts[table] ?? 0, updated: 0, unchanged: 0 });
  });
}

// =============================================================================
// 8. Summary
// =============================================================================

async function printSummary(startedAt: number) {
  const count = (query: PromiseLike<{ n: number }>) => query.then((row) => row.n);
  const totals: Record<string, number> = Object.fromEntries(
    await Promise.all(
      [
        ["AdminUser", count(db.orm.public.AdminUser.aggregate((a) => ({ n: a.count() })))],
        ["Category", count(db.orm.public.Category.aggregate((a) => ({ n: a.count() })))],
        ["Ingredient", count(db.orm.public.Ingredient.aggregate((a) => ({ n: a.count() })))],
        ["Producer", count(db.orm.public.Producer.aggregate((a) => ({ n: a.count() })))],
        ["Product", count(db.orm.public.Product.aggregate((a) => ({ n: a.count() })))],
        ["ProductIngredient", count(db.orm.public.ProductIngredient.aggregate((a) => ({ n: a.count() })))],
        ["Restaurant", count(db.orm.public.Restaurant.aggregate((a) => ({ n: a.count() })))],
        ["Dish", count(db.orm.public.Dish.aggregate((a) => ({ n: a.count() })))],
        ["DishIngredient", count(db.orm.public.DishIngredient.aggregate((a) => ({ n: a.count() })))],
        ["DeliveryZone", count(db.orm.public.DeliveryZone.aggregate((a) => ({ n: a.count() })))],
        ["Deliverer", count(db.orm.public.Deliverer.aggregate((a) => ({ n: a.count() })))],
        ["PhoneRule", count(db.orm.public.PhoneRule.aggregate((a) => ({ n: a.count() })))],
        ["Order", count(db.orm.public.Order.aggregate((a) => ({ n: a.count() })))],
        ["OrderItem", count(db.orm.public.OrderItem.aggregate((a) => ({ n: a.count() })))],
        ["OrderAttempt", count(db.orm.public.OrderAttempt.aggregate((a) => ({ n: a.count() })))],
        ["OrderCounter", count(db.orm.public.OrderCounter.aggregate((a) => ({ n: a.count() })))],
        ["ContactMessage", count(db.orm.public.ContactMessage.aggregate((a) => ({ n: a.count() })))],
        ["Report", count(db.orm.public.Report.aggregate((a) => ({ n: a.count() })))],
        ["Review", count(db.orm.public.Review.aggregate((a) => ({ n: a.count() })))],
      ].map(async ([table, total]) => [table, await total] as const),
    ),
  );

  const header = ["Table", "Created", "Updated", "Unchanged", "Total in DB", "Note"];
  const rows = results.map((r) => [r.table, r.created, r.updated, r.unchanged, totals[r.table] ?? "", r.note ?? ""].map(String));
  const widths = header.map((title, column) => Math.max(title.length, ...rows.map((row) => row[column].length)));
  const line = (cells: string[]) =>
    cells.map((cell, column) => (column >= 1 && column <= 4 ? cell.padStart(widths[column]) : cell.padEnd(widths[column]))).join("  ");

  console.log("");
  console.log(line(header));
  console.log(widths.map((width) => "-".repeat(width)).join("  "));
  for (const row of rows) console.log(line(row));
  console.log("");
  console.log(`Done in ${((Date.now() - startedAt) / 1000).toFixed(1)} s.`);
}

// =============================================================================
// Run
// =============================================================================

async function main() {
  const startedAt = Date.now();
  const options = readOptions();
  const admin = readAdminFromEnv(); // refuses to run without a valid admin e-mail and password
  checkSeedData(); // stops on any mistake in prisma/seed-data/*.ts, before writing anything

  console.log("Seeding the CeliacCare demo data...");
  await seedAdmin(admin, options.resetAdminPassword);
  await seedCategories();
  await seedIngredients();
  await seedProducers();
  await seedProducts();
  await seedRestaurants();
  await seedDelivery();
  await seedDemoActivity();
  await printSummary(startedAt);
}

try {
  await main();
} catch (error) {
  console.error(`\nSeed failed: ${error instanceof Error ? error.message : String(error)}`);
  if (error instanceof Error && error.stack && process.env.DEBUG) console.error(error.stack);
  process.exitCode = 1;
} finally {
  await closeDb();
}
