import "server-only";

import { and, type ModelAccessor } from "@prisma/orm-postgres/orm-client";

import { publicLabel, publicText } from "@/lib/contacts";
import { db } from "@/lib/prisma";
import { localize, normalizeSearch } from "@/lib/utils";
import type { Contract } from "@/prisma/contract.d";
import type { GuaranteeLevel, IngredientDTO, Locale, ProductCardDTO, ReviewDTO } from "@/types";

/* ==========================================================================
   Shared building blocks of the PUBLIC data layer (models/fetchers, models/posters):
   1. what "public" means (only active data is shown on the website),
   2. the product card query, used by several pages,
   3. small helpers to turn database rows into DTOs (plain JSON objects):
      dates become ISO strings, money stays in millimes, texts are translated.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. What visitors are allowed to see
   -------------------------------------------------------------------------- */

type ProductFields = ModelAccessor<Contract, "Product", "public">;

/**
 * A product is public when it is active AND its producer (small business) is active:
 * hiding a producer hides all of its products. Works in any query on products:
 *   db.orm.public.Product.where(isPublicProduct)
 *   .include("products", (products) => products.where(isPublicProduct).count())
 */
export function isPublicProduct(product: ProductFields) {
  return and(
    product.isActive.eq(true),
    product.producer.some((producer) => producer.isActive.eq(true)),
  );
}

/** All the products the website may show. Chain more `.where(...)` filters on it. */
export function publicProducts() {
  return db.orm.public.Product.where(isPublicProduct);
}

/** The type of publicProducts() (it keeps this type after more `.where(...)` filters). */
export type PublicProductQuery = ReturnType<typeof publicProducts>;

/** All the producers (small businesses) the website may show. */
export function publicProducers() {
  return db.orm.public.Producer.where((producer) => producer.isActive.eq(true));
}

/** All the restaurants the website may show (partners or not). */
export function publicRestaurants() {
  return db.orm.public.Restaurant.where((restaurant) => restaurant.isActive.eq(true));
}

/* --------------------------------------------------------------------------
   2. Product cards (catalogue, home page, artisan pages, related products)
   -------------------------------------------------------------------------- */

/** Reads exactly what a ProductCardDTO needs, in ONE SQL query (relations included). */
export function selectProductCards(query: PublicProductQuery) {
  return query
    .select("id", "slug", "name", "nameAr", "price", "unit", "imageUrl", "guaranteeLevel", "isAvailable")
    .include("category", (category) => category.select("slug", "name", "nameAr", "icon"))
    .include("producer", (producer) => producer.select("id", "slug", "name", "city"))
    .include("reviews", (reviews) => {
      // Ratings only use the reviews approved by a moderator (EF-22).
      const approved = reviews.where((review) => review.status.eq("APPROVED"));
      return approved.combine({ count: approved.count(), average: approved.avg("rating") });
    });
}

/** One row returned by selectProductCards(). */
export type ProductCardRow = {
  id: number;
  slug: string;
  name: string;
  nameAr: string | null;
  price: number;
  unit: string | null;
  imageUrl: string | null;
  guaranteeLevel: GuaranteeLevel;
  isAvailable: boolean;
  // Prisma 8 types an included "to-one" relation as `| null`, even when it is required.
  category: { slug: string; name: string; nameAr: string | null; icon: string } | null;
  producer: { id: number; slug: string; name: string; city: string } | null;
  reviews: { count: number; average: number | null };
};

export function toProductCardDTO(row: ProductCardRow, locale: Locale): ProductCardDTO {
  const category = required(row.category, `category of product #${row.id}`);
  const producer = required(row.producer, `producer of product #${row.id}`);
  return {
    id: row.id,
    slug: row.slug,
    name: localize(locale, row.name, row.nameAr),
    price: row.price,
    unit: row.unit,
    imageUrl: row.imageUrl,
    guaranteeLevel: row.guaranteeLevel,
    isAvailable: row.isAvailable,
    categorySlug: category.slug,
    categoryName: localize(locale, category.name, category.nameAr),
    categoryIcon: category.icon,
    producerId: producer.id,
    producerSlug: producer.slug,
    producerName: producer.name,
    producerCity: producer.city,
    ratingAvg: roundRating(row.reviews.average),
    ratingCount: row.reviews.count,
  };
}

/* --------------------------------------------------------------------------
   3. Small helpers
   -------------------------------------------------------------------------- */

/**
 * A relation that always exists in the database (NOT NULL foreign key) but that
 * Prisma 8 types as `| null`. Throws if the database is inconsistent.
 */
export function required<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Missing ${what}: the database is inconsistent.`);
  }
  return value;
}

/** Average rating rounded to one decimal: 4.333 -> 4.3 (null when there is no approved review). */
export function roundRating(average: number | null): number | null {
  if (average === null) return null;
  return Math.round(Number(average) * 10) / 10;
}

export function toIngredientDTO(
  row: { id: number; slug: string; name: string; nameAr: string | null; isAllergen: boolean },
  locale: Locale,
): IngredientDTO {
  return { id: row.id, slug: row.slug, name: localize(locale, row.name, row.nameAr), isAllergen: row.isAllergen };
}

/** An approved review. Like every public text, it never carries a contact (lib/contacts.ts). */
export function toReviewDTO(row: {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}): ReviewDTO {
  return {
    id: row.id,
    authorName: publicLabel(row.authorName) ?? "",
    rating: row.rating,
    comment: publicText(row.comment) ?? "",
    createdAt: row.createdAt.toISOString(),
  };
}

const collators: Record<Locale, Intl.Collator> = {
  fr: new Intl.Collator("fr", { sensitivity: "base", numeric: true }),
  ar: new Intl.Collator("ar", { sensitivity: "base", numeric: true }),
};

/** Alphabetical order in the page language ("Épicerie" next to "Epices", Arabic in Arabic order). */
export function compareNames(a: string, b: string, locale: Locale) {
  return collators[locale].compare(a, b);
}

/** A copy of the list, sorted by `name` in the page language. */
export function sortByName<T extends { name: string }>(items: T[], locale: Locale): T[] {
  return [...items].sort((a, b) => compareNames(a.name, b.name, locale));
}

/**
 * Words typed in a search box, ready to compare with normalised texts:
 * "Pâtes  sans-gluten" -> ["pates", "sans", "gluten"] (lower case, no accents, at most 8 words).
 * Only letters and digits remain, so a word is safe inside a SQL LIKE pattern.
 */
export function searchWords(query: string | null | undefined): string[] {
  if (!query) return [];
  return normalizeSearch(query.slice(0, 200)).split(" ").filter(Boolean).slice(0, 8);
}

/** True when EVERY search word appears in at least one of the texts (accents and case ignored). */
export function matchesAllWords(texts: (string | null)[], words: string[]): boolean {
  if (words.length === 0) return true;
  const haystack = normalizeSearch(texts.filter((text): text is string => Boolean(text)).join(" "));
  return words.every((word) => haystack.includes(word));
}

/** Checks a value coming from a URL against a fixed list: isOneOf(GUARANTEE_LEVELS, value). */
export function isOneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

/** A positive whole number, e.g. a database id or an amount in millimes. */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}
