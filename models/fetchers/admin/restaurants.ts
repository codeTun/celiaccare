import "server-only";

import { all, and, or, type Condition } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { needsReview } from "@/lib/utils";
import type { GuaranteeLevel, Paginated } from "@/types";
import type { AdminRestaurantFilters, AdminRestaurantForm, AdminRestaurantRow, PageQuery } from "@/types/admin-data";

import { containsPattern, isValidId, pageWindow, paginated, toDateInput, toIso } from "./helpers";

/**
 * ADMIN — partner restaurants (never cached).
 * Call requireAdmin() before using these functions.
 */

/** A line of the paginated restaurants table: the shared row + the convention details. */
export type AdminRestaurantListRow = AdminRestaurantRow & {
  /** When the convention was signed (ISO), null for a directory-only restaurant. */
  partnerSince: string | null;
  minOrder: number; // millimes
};

export type AdminRestaurantPageFilters = AdminRestaurantFilters & PageQuery;

/** Numbers shown on the filter tabs of the restaurants page. */
export type AdminRestaurantCounts = {
  total: number;
  partners: number;
  directoryOnly: number;
  active: number;
  inactive: number;
};

/** The restaurants matching the filters (search, governorate, partner, active). */
function filteredRestaurants(filters: AdminRestaurantFilters) {
  const q = filters.q?.trim();
  return db.orm.public.Restaurant.where((r) => {
    const conditions: Condition[] = [];
    if (q) {
      const pattern = containsPattern(q);
      conditions.push(or(r.name.ilike(pattern), r.city.ilike(pattern), r.cuisine.ilike(pattern), r.slug.ilike(pattern)));
    }
    if (filters.governorate) conditions.push(r.governorate.eq(filters.governorate));
    if (filters.partner !== undefined) conditions.push(r.isPartner.eq(filters.partner));
    if (filters.active !== undefined) conditions.push(r.isActive.eq(filters.active));
    return conditions.length > 0 ? and(...conditions) : all();
  });
}

/** Rows (A → Z) with their number of dishes; `window` = one page of the list. */
async function findRestaurantRows(filters: AdminRestaurantFilters, window?: { limit: number; offset: number }) {
  let query = filteredRestaurants(filters)
    .select(
      "id",
      "slug",
      "name",
      "cuisine",
      "city",
      "governorate",
      "guaranteeLevel",
      "phone",
      "imageUrl",
      "isPartner",
      "partnerSince",
      "minOrder",
      "isActive",
      "verificationSource",
      "verifiedAt",
      "updatedAt",
    )
    .include("dishes", (dishes) =>
      dishes.combine({
        total: dishes.count(),
        available: dishes.where((d) => d.isAvailable.eq(true)).count(),
      }),
    )
    .orderBy([(r) => r.name.asc(), (r) => r.id.asc()]);
  if (window) query = query.limit(window.limit).offset(window.offset);
  return query.all();
}

type RestaurantRowFields = {
  id: number;
  slug: string;
  name: string;
  cuisine: string | null;
  city: string;
  governorate: string;
  guaranteeLevel: GuaranteeLevel;
  phone: string;
  imageUrl: string | null;
  isPartner: boolean;
  partnerSince: Date | null;
  minOrder: number;
  isActive: boolean;
  verificationSource: string;
  verifiedAt: Date;
  updatedAt: Date;
  dishes: { total: number; available: number };
};

function toListRow(row: RestaurantRowFields, now: Date): AdminRestaurantListRow {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    cuisine: row.cuisine,
    city: row.city,
    governorate: row.governorate,
    guaranteeLevel: row.guaranteeLevel,
    phone: row.phone,
    imageUrl: row.imageUrl,
    isPartner: row.isPartner,
    partnerSince: toIso(row.partnerSince),
    minOrder: row.minOrder,
    isActive: row.isActive,
    verificationSource: row.verificationSource,
    verifiedAt: toIso(row.verifiedAt),
    needsReview: needsReview(row.verifiedAt, now),
    dishCount: row.dishes.total,
    availableDishCount: row.dishes.available,
    updatedAt: toIso(row.updatedAt),
  };
}

/** Restaurants (A → Z) matching the filters, with their number of dishes. */
export async function listRestaurants(filters: AdminRestaurantFilters = {}): Promise<AdminRestaurantRow[]> {
  const rows = await findRestaurantRows(filters);
  const now = new Date();
  return rows.map((row) => toListRow(row, now));
}

/** Same list, 20 per page (admin table), with the convention details. */
export async function listRestaurantsPage(
  filters: AdminRestaurantPageFilters = {},
): Promise<Paginated<AdminRestaurantListRow>> {
  const { page, pageSize, offset } = pageWindow(filters);
  const [rows, count] = await Promise.all([
    findRestaurantRows(filters, { limit: pageSize, offset }),
    filteredRestaurants(filters).aggregate((a) => ({ total: a.count() })),
  ]);
  const now = new Date();
  return paginated(
    rows.map((row) => toListRow(row, now)),
    count.total,
    page,
    pageSize,
  );
}

/** How many restaurants in total, partners ("conventionnés") and visible on the site. */
export async function countRestaurants(): Promise<AdminRestaurantCounts> {
  const [everything, partners, active] = await Promise.all([
    db.orm.public.Restaurant.aggregate((a) => ({ n: a.count() })),
    db.orm.public.Restaurant.where({ isPartner: true }).aggregate((a) => ({ n: a.count() })),
    db.orm.public.Restaurant.where({ isActive: true }).aggregate((a) => ({ n: a.count() })),
  ]);
  return {
    total: everything.n,
    partners: partners.n,
    directoryOnly: everything.n - partners.n,
    active: active.n,
    inactive: everything.n - active.n,
  };
}

/** One restaurant, to pre-fill its edit form. null when it does not exist. */
export async function getRestaurant(id: number): Promise<AdminRestaurantForm | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.Restaurant.first({ id });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    descriptionAr: row.descriptionAr,
    cuisine: row.cuisine,
    city: row.city,
    governorate: row.governorate,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    website: row.website,
    instagram: row.instagram,
    facebook: row.facebook,
    openingHours: row.openingHours,
    guaranteeLevel: row.guaranteeLevel,
    dedicatedKitchen: row.dedicatedKitchen,
    dedicatedUtensils: row.dedicatedUtensils,
    trainedStaff: row.trainedStaff,
    verificationSource: row.verificationSource,
    verifiedAt: toDateInput(row.verifiedAt),
    imageUrl: row.imageUrl,
    logoUrl: row.logoUrl,
    priceRange: row.priceRange,
    isPartner: row.isPartner,
    partnerSince: toDateInput(row.partnerSince),
    deliveryTime: row.deliveryTime,
    minOrder: row.minOrder,
    isActive: row.isActive,
  };
}
