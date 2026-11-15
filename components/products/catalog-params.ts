import "server-only";

import { z } from "zod";

import { localePath } from "@/i18n/config";
import { parsePriceToMillimes } from "@/lib/format";
import type { GuaranteeLevel, Locale, ProductFilters, ProductSort } from "@/types";

import { buildCatalogHref, type CatalogQuery } from "./catalog-url";

/* ==========================================================================
   Catalogue filters <-> URL (server side).
   URL parameters are in French and readable:
     /fr/produits?q=couscous&categorie=couscous-pates&ingredients=mais,sorgho
                 &sans=lait,oeufs&garantie=certifie&prixMin=5&prixMax=20
                 &artisan=dar-jasmin&tri=prix-croissant&page=2
   ========================================================================== */

/** What Next.js gives a page in `searchParams` (after `await`). */
export type RawSearchParams = Record<string, string | string[] | undefined>;

/** ?garantie= values (French words are nicer to read and share than "CERTIFIED"). */
export const GUARANTEE_PARAM: Record<GuaranteeLevel, string> = {
  CERTIFIED: "certifie",
  NATURALLY_GF: "naturel",
  TRACES_RISK: "traces",
};

/** ?tri= values. "new" (newest first) is the default: it never appears in links. */
export const SORT_PARAM: Record<ProductSort, string> = {
  new: "nouveautes",
  "price-asc": "prix-croissant",
  "price-desc": "prix-decroissant",
  name: "nom",
  rating: "populaires",
};

const MAX_LIST_ITEMS = 20;
const MAX_PRICE_MILLIMES = 10_000_000; // 10 000 DT
const MAX_PAGE = 500;

/* --------------------------------------------------------------------------
   Reading raw URL values
   -------------------------------------------------------------------------- */

/** First value of a parameter: "?a=1&a=2" -> "1". */
function firstValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

/** Items of a list parameter: "?sans=lait,oeufs" and "?sans=lait&sans=oeufs" both give ["lait", "oeufs"]. */
function listItems(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values.filter((item): item is string => typeof item === "string").flatMap((item) => item.split(","));
}

/** The key whose URL value is `value`. The English names ("CERTIFIED", "price-asc") are accepted too. */
function keyOfParam<T extends string>(map: Record<T, string>, value: string): T | undefined {
  const wanted = value.trim().toLowerCase();
  return (Object.keys(map) as T[]).find((key) => map[key] === wanted || key.toLowerCase() === wanted);
}

/* --------------------------------------------------------------------------
   zod schemas: each field falls back to "no filter" when it is missing or
   malformed, so parsing a URL never fails.
   -------------------------------------------------------------------------- */

const slugValue = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const searchParam = z.preprocess(firstValue, z.string()).transform((text) => text.trim().slice(0, 100) || undefined);

const slugParam = z.preprocess(firstValue, slugValue);

/** Valid slugs only, without duplicates, sorted (the same filters always give the same cache key). */
const slugListParam = z.unknown().transform((value) => {
  const slugs = listItems(value).flatMap((item) => {
    const result = slugValue.safeParse(item);
    return result.success ? [result.data] : [];
  });
  return [...new Set(slugs)].sort().slice(0, MAX_LIST_ITEMS);
});

const guaranteeParam = z.preprocess(firstValue, z.string()).transform((text) => keyOfParam(GUARANTEE_PARAM, text));

const sortParam = z.preprocess(firstValue, z.string()).transform((text) => keyOfParam(SORT_PARAM, text));

/** A price typed in dinars ("12", "12.5", "12,500") -> millimes. */
const priceParam = z.preprocess(firstValue, z.string().max(12)).transform((text) => {
  const millimes = parsePriceToMillimes(text);
  return millimes !== null && millimes > 0 && millimes <= MAX_PRICE_MILLIMES ? millimes : undefined;
});

const pageParam = z.preprocess(firstValue, z.coerce.number().int().min(1).max(MAX_PAGE));

const catalogParamsSchema = z.object({
  q: searchParam.optional().catch(undefined),
  categorie: slugParam.optional().catch(undefined),
  ingredients: slugListParam.optional(),
  sans: slugListParam.optional(),
  garantie: guaranteeParam.optional().catch(undefined),
  prixMin: priceParam.optional().catch(undefined),
  prixMax: priceParam.optional().catch(undefined),
  artisan: slugParam.optional().catch(undefined),
  tri: sortParam.optional().catch(undefined),
  page: pageParam.optional().catch(undefined),
});

/* --------------------------------------------------------------------------
   Public helpers
   -------------------------------------------------------------------------- */

/**
 * Reads the catalogue filters from the page URL (`await searchParams`).
 * Never throws: unknown or malformed values are ignored. Default values
 * (sort "new", page 1) and empty lists are left out.
 */
export function parseCatalogParams(raw: RawSearchParams): ProductFilters {
  const parsed = catalogParamsSchema.safeParse(raw);
  if (!parsed.success) return {};
  const values = parsed.data;

  // "From 30 to 10 DT" is understood as "from 10 to 30 DT".
  let minPrice = values.prixMin;
  let maxPrice = values.prixMax;
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return withoutEmptyValues({
    q: values.q,
    category: values.categorie,
    ingredients: values.ingredients,
    exclude: values.sans,
    guarantee: values.garantie,
    minPrice,
    maxPrice,
    producer: values.artisan,
    sort: values.tri === "new" ? undefined : values.tri,
    page: values.page !== undefined && values.page > 1 ? values.page : undefined,
  });
}

/**
 * Drops the filters that point to something that does not exist (a deleted category,
 * a mistyped ingredient...), so the visitor sees products rather than an empty page.
 */
export function keepKnownFilters(
  filters: ProductFilters,
  known: { categories: string[]; ingredients: string[]; producers: string[] },
): ProductFilters {
  const ingredients = new Set(known.ingredients);
  return withoutEmptyValues({
    ...filters,
    category: filters.category && known.categories.includes(filters.category) ? filters.category : undefined,
    ingredients: filters.ingredients?.filter((slug) => ingredients.has(slug)),
    exclude: filters.exclude?.filter((slug) => ingredients.has(slug)),
    producer: filters.producer && known.producers.includes(filters.producer) ? filters.producer : undefined,
  });
}

/** Number of filters the visitor has chosen (the sort order and the page are not filters). */
export function countActiveFilters(filters: ProductFilters): number {
  return (
    (filters.q ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.ingredients?.length ?? 0) +
    (filters.exclude?.length ?? 0) +
    (filters.guarantee ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.producer ? 1 : 0)
  );
}

/** Millimes -> dinars, as written in the URL and in the price fields: 12500 -> "12.5". */
export function millimesToDinars(millimes: number): string {
  return String(millimes / 1000);
}

/** The URL parameters of these filters (French values, default values left out). */
export function catalogQuery(filters: ProductFilters): CatalogQuery {
  const query: CatalogQuery = {};
  if (filters.q) query.q = filters.q;
  if (filters.category) query.categorie = filters.category;
  if (filters.ingredients?.length) query.ingredients = filters.ingredients.join(",");
  if (filters.exclude?.length) query.sans = filters.exclude.join(",");
  if (filters.guarantee) query.garantie = GUARANTEE_PARAM[filters.guarantee];
  if (filters.minPrice) query.prixMin = millimesToDinars(filters.minPrice);
  if (filters.maxPrice) query.prixMax = millimesToDinars(filters.maxPrice);
  if (filters.producer) query.artisan = filters.producer;
  if (filters.sort && filters.sort !== "new") query.tri = SORT_PARAM[filters.sort];
  if (filters.page && filters.page > 1) query.page = String(filters.page);
  return query;
}

/** Link to the catalogue: catalogHref("fr", { category: "pains" }) -> "/fr/produits?categorie=pains" */
export function catalogHref(locale: Locale, filters: ProductFilters): string {
  return buildCatalogHref(localePath(locale, "/produits"), catalogQuery(filters));
}

/** Removes undefined values and empty lists (keeps cache keys and links short and stable). */
function withoutEmptyValues(filters: ProductFilters): ProductFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0)),
  ) as ProductFilters;
}
