import "server-only";

import { or } from "@prisma/orm-postgres/orm-client";

import { cachePolicy } from "@/lib/cache";
import { TAGS } from "@/lib/cache-tags";
import { governorateLabel } from "@/lib/tunisia";
import { clamp, localize, needsReview, normalizeSearch } from "@/lib/utils";
import {
  isOneOf,
  isPositiveInteger,
  publicProducers,
  publicProducts,
  required,
  searchWords,
  selectProductCards,
  sortByName,
  toIngredientDTO,
  toProductCardDTO,
  toReviewDTO,
  type ProductCardRow,
  type PublicProductQuery,
} from "@/models/fetchers/mappers";
import {
  GUARANTEE_LEVELS,
  type Locale,
  type Paginated,
  type ProductCardDTO,
  type ProductDetailDTO,
  type ProductFilters,
  type ProductSort,
} from "@/types";

/** The sort options of the catalogue ("new" is the default). */
export const PRODUCT_SORTS = ["new", "price-asc", "price-desc", "name", "rating"] as const satisfies readonly ProductSort[];

/** Biggest page a caller may ask for (protects the database). */
const MAX_PAGE_SIZE = 48;

/** Product lists show data from products, categories, producers and reviews. */
const LIST_TAGS = [TAGS.products, TAGS.categories, TAGS.producers, TAGS.reviews];

/* --------------------------------------------------------------------------
   Catalogue (search + filters + sort + pagination)
   -------------------------------------------------------------------------- */

/**
 * One page of the catalogue.
 * - q: every word must appear in the product's search text or name (accents and case ignored),
 *   or in the town / governorate (French or Arabic) of its artisan: "sousse" finds the products made in Sousse;
 * - category / producer: slugs; guarantee: guarantee level; minPrice / maxPrice: millimes (0 = no limit);
 * - ingredients: the product must contain ALL of them; exclude: it must contain NONE of them (allergens);
 * - sort: "new" (default), "price-asc", "price-desc", "name", "rating" (most approved reviews first);
 * - page: 1-based, brought back between 1 and the last page.
 */
export async function getProducts(
  locale: Locale,
  filters: ProductFilters,
  pageSize = 12,
): Promise<Paginated<ProductCardDTO>> {
  "use cache";
  cachePolicy(LIST_TAGS);

  const size = clamp(Math.trunc(pageSize) || 12, 1, MAX_PAGE_SIZE);
  const words = searchWords(filters.q);
  const query = applyFilters(filters, words, await producersByPlace(words));

  // 1. How many products match? (same filters, no sort)
  const { total } = await query.aggregate((a) => ({ total: a.count() }));
  const pageCount = Math.max(1, Math.ceil(total / size));
  const page = clamp(Math.trunc(filters.page ?? 1) || 1, 1, pageCount);

  // 2. The products of the requested page.
  const rows =
    total === 0
      ? []
      : await sortProducts(selectProductCards(query), filters.sort, locale)
          .limit(size)
          .offset((page - 1) * size)
          .all();

  return {
    items: rows.map((row) => toProductCardDTO(row, locale)),
    total,
    page,
    pageSize: size,
    pageCount,
  };
}

/** Turns the catalogue filters into database conditions (each `.where` is added with AND). */
function applyFilters(
  filters: ProductFilters,
  words: string[],
  producerIdsByWord: Map<string, number[]>,
): PublicProductQuery {
  let query = publicProducts();

  for (const word of words) {
    const pattern = `%${word}%`;
    // the artisan's town or governorate also counts ("sousse" finds the products made in Sousse)
    const producerIds = producerIdsByWord.get(word) ?? [];
    query = query.where((p) =>
      or(
        p.searchText.ilike(pattern),
        p.name.ilike(pattern),
        p.nameAr.ilike(pattern),
        ...(producerIds.length > 0 ? [p.producerId.in(producerIds)] : []),
      ),
    );
  }

  const categorySlug = filters.category;
  if (categorySlug) query = query.where((p) => p.category.some((category) => category.slug.eq(categorySlug)));

  const producerSlug = filters.producer;
  if (producerSlug) query = query.where((p) => p.producer.some((producer) => producer.slug.eq(producerSlug)));

  // The product must contain EVERY chosen ingredient...
  for (const ingredientSlug of cleanSlugs(filters.ingredients)) {
    query = query.where((p) => p.ingredients.some((ingredient) => ingredient.slug.eq(ingredientSlug)));
  }

  // ...and NONE of the excluded ones (allergens the visitor must avoid).
  const excluded = cleanSlugs(filters.exclude);
  if (excluded.length > 0) query = query.where((p) => p.ingredients.none((ingredient) => ingredient.slug.in(excluded)));

  const guarantee = filters.guarantee;
  if (isOneOf(GUARANTEE_LEVELS, guarantee)) query = query.where({ guaranteeLevel: guarantee });

  // Prices in millimes; 0 or missing = no limit.
  const { minPrice, maxPrice } = filters;
  if (isPositiveInteger(minPrice)) query = query.where((p) => p.price.gte(minPrice));
  if (isPositiveInteger(maxPrice)) query = query.where((p) => p.price.lte(maxPrice));

  return query;
}

/**
 * For each search word, the public artisans whose town or governorate (French or Arabic name) contains it.
 * Artisans are few, so the comparison runs here with accents ignored ("beja" finds "Béja"),
 * which SQL LIKE cannot do. No query when there is no search.
 */
async function producersByPlace(words: string[]): Promise<Map<string, number[]>> {
  if (words.length === 0) return new Map();
  const producers = await publicProducers().select("id", "city", "governorate").all();
  const places = producers.map((producer) => ({
    id: producer.id,
    text: normalizeSearch(`${producer.city} ${producer.governorate} ${governorateLabel(producer.governorate, "ar")}`),
  }));
  return new Map(words.map((word) => [word, places.filter((place) => place.text.includes(word)).map((place) => place.id)]));
}

/** Slugs from the URL: no empty values, no duplicates, at most 20. */
function cleanSlugs(slugs: readonly string[] | undefined): string[] {
  if (!Array.isArray(slugs)) return [];
  const valid = slugs.filter((slug): slug is string => typeof slug === "string" && slug.length > 0 && slug.length <= 120);
  return [...new Set(valid)].slice(0, 20);
}

type ProductCardQuery = ReturnType<typeof selectProductCards>;

/** The ORDER BY of the catalogue. The id is always last so that pages never overlap. */
function sortProducts(query: ProductCardQuery, sort: ProductSort | undefined, locale: Locale) {
  switch (sort) {
    case "price-asc":
      return query.orderBy([(p) => p.price.asc(), (p) => p.id.asc()]);
    case "price-desc":
      return query.orderBy([(p) => p.price.desc(), (p) => p.id.desc()]);
    case "name":
      // In Arabic, products with an Arabic name come first, in Arabic alphabetical order.
      return locale === "ar"
        ? query.orderBy([(p) => p.nameAr.asc({ nulls: "last" }), (p) => p.name.asc(), (p) => p.id.asc()])
        : query.orderBy([(p) => p.name.asc(), (p) => p.id.asc()]);
    case "rating":
      return query.orderBy([
        (p) => p.reviews.count((review) => review.status.eq("APPROVED")).desc(),
        (p) => p.createdAt.desc(),
        (p) => p.id.desc(),
      ]);
    default: // "new"
      return query.orderBy([(p) => p.createdAt.desc(), (p) => p.id.desc()]);
  }
}

/* --------------------------------------------------------------------------
   Home page, product page, related products
   -------------------------------------------------------------------------- */

/**
 * Products for the home page: featured products first, then the others;
 * in each group available products come before unavailable ones, newest first.
 */
export async function getFeaturedProducts(locale: Locale, limit = 8): Promise<ProductCardDTO[]> {
  "use cache";
  cachePolicy(LIST_TAGS);

  const wanted = clamp(Math.trunc(limit) || 8, 1, MAX_PAGE_SIZE);
  // Prisma 8 cannot ORDER BY a true/false column: we read the newest products of each group,
  // one group after the other, and stop as soon as we have enough (usually after the first query).
  // Sequential on purpose: parallel queries inside a cached function compete for the shared
  // connection pool with the other cached functions of the page.
  const groups = [
    { isFeatured: true, isAvailable: true },
    { isFeatured: true, isAvailable: false },
    { isFeatured: false, isAvailable: true },
    { isFeatured: false, isAvailable: false },
  ];
  const rows: ProductCardRow[] = [];
  for (const group of groups) {
    if (rows.length >= wanted) break;
    const groupRows = await selectProductCards(publicProducts().where(group))
      .orderBy([(p) => p.createdAt.desc(), (p) => p.id.desc()])
      .limit(wanted - rows.length)
      .all();
    rows.push(...groupRows);
  }
  return rows.map((row) => toProductCardDTO(row, locale));
}

/**
 * The product page: card data + description, ingredients (alphabetical), producer summary
 * and the 20 latest approved reviews. Null when the product does not exist or is hidden.
 */
export async function getProductBySlug(locale: Locale, slug: string): Promise<ProductDetailDTO | null> {
  "use cache";
  cachePolicy([...LIST_TAGS, TAGS.product(slug), TAGS.ingredients]);

  const row = await publicProducts()
    .where((p) => p.slug.eq(slug))
    .select(
      "id",
      "slug",
      "name",
      "nameAr",
      "description",
      "descriptionAr",
      "price",
      "unit",
      "imageUrl",
      "guaranteeLevel",
      "isAvailable",
      "certification",
      "mayContain",
      "verifiedAt",
      "updatedAt",
    )
    .include("category", (category) => category.select("slug", "name", "nameAr", "icon"))
    .include("producer", (producer) =>
      producer.select(
        "id",
        "slug",
        "name",
        "type",
        "city",
        "governorate",
        "imageUrl",
        "guaranteeLevel",
        "phone",
        "whatsapp",
        "verificationSource",
      ),
    )
    .include("ingredients", (ingredients) => ingredients.select("id", "slug", "name", "nameAr", "isAllergen"))
    .include("reviews", (reviews) => {
      const approved = reviews.where((review) => review.status.eq("APPROVED"));
      return approved.combine({
        count: approved.count(),
        average: approved.avg("rating"),
        latest: approved
          .select("id", "authorName", "rating", "comment", "createdAt")
          .orderBy([(review) => review.createdAt.desc(), (review) => review.id.desc()])
          .limit(20),
      });
    })
    .first();

  if (!row) return null;
  const producer = required(row.producer, `producer of product #${row.id}`);

  return {
    ...toProductCardDTO(row, locale),
    description: localize(locale, row.description, row.descriptionAr),
    certification: row.certification,
    mayContain: row.mayContain,
    verifiedAt: row.verifiedAt.toISOString(),
    needsReview: needsReview(row.verifiedAt),
    updatedAt: row.updatedAt.toISOString(),
    ingredients: sortByName(
      row.ingredients.map((ingredient) => toIngredientDTO(ingredient, locale)),
      locale,
    ),
    producer: {
      id: producer.id,
      slug: producer.slug,
      name: producer.name,
      type: producer.type,
      city: producer.city,
      governorate: producer.governorate,
      imageUrl: producer.imageUrl,
      guaranteeLevel: producer.guaranteeLevel,
      phone: producer.phone,
      whatsapp: producer.whatsapp,
      verificationSource: producer.verificationSource,
    },
    reviews: row.reviews.latest.map(toReviewDTO),
  };
}

/**
 * Other products of the same category (available ones first, newest first), without the product itself.
 * Only `id` and `categorySlug` are read from `product`, so you can pass the whole ProductDetailDTO.
 */
export async function getRelatedProducts(
  locale: Locale,
  product: { id: number; categorySlug: string },
  limit = 4,
): Promise<ProductCardDTO[]> {
  // Only plain values go to the cached function: its cache key stays small.
  return findRelatedProducts(locale, product.id, product.categorySlug, limit);
}

async function findRelatedProducts(
  locale: Locale,
  productId: number,
  categorySlug: string,
  limit: number,
): Promise<ProductCardDTO[]> {
  "use cache";
  cachePolicy(LIST_TAGS);

  const wanted = clamp(Math.trunc(limit) || 4, 1, MAX_PAGE_SIZE);
  // Available products first (Prisma 8 cannot ORDER BY a true/false column: one query per group).
  const rowsByGroup = await Promise.all(
    [true, false].map((isAvailable) =>
      selectProductCards(
        publicProducts()
          .where((p) => p.category.some((category) => category.slug.eq(categorySlug)))
          .where((p) => p.id.neq(productId))
          .where({ isAvailable }),
      )
        .orderBy([(p) => p.createdAt.desc(), (p) => p.id.desc()])
        .limit(wanted)
        .all(),
    ),
  );
  return rowsByGroup
    .flat()
    .slice(0, wanted)
    .map((row) => toProductCardDTO(row, locale));
}

/* --------------------------------------------------------------------------
   Helpers for pages (static params, price filter)
   -------------------------------------------------------------------------- */

/** Slugs of every public product (generateStaticParams of the product page). */
export async function getProductSlugs(): Promise<string[]> {
  "use cache";
  cachePolicy([TAGS.products, TAGS.producers]);

  const rows = await publicProducts()
    .select("slug")
    .orderBy((p) => p.slug.asc())
    .all();
  return rows.map((row) => row.slug);
}

/** Lowest and highest price (millimes) of the public products, for the price filter. { 0, 0 } when empty. */
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  "use cache";
  cachePolicy([TAGS.products, TAGS.producers]);

  const { min, max } = await publicProducts().aggregate((a) => ({ min: a.min("price"), max: a.max("price") }));
  return { min: min ?? 0, max: max ?? 0 };
}
