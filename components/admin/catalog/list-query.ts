import { firstParam, type AdminQuery } from "@/components/admin/query-string";
import { normalizeSearch } from "@/lib/utils";
import type { Paginated } from "@/types";
import { ADMIN_PAGE_SIZE } from "@/types/admin-data";

/* ==========================================================================
   Reading the URL of the catalogue lists (?q=…&status=…&page=…) and
   filtering / paginating the small lists that are loaded in full
   (categories, ingredients, artisans: a few dozen rows at most).
   Pure functions: never throw, whatever the URL contains.
   ========================================================================== */

/** The search params without the one-shot "?ok=" flag (so pagination links never repeat the message). */
export function listQuery(query: AdminQuery): AdminQuery {
  return Object.fromEntries(Object.entries(query).filter(([key]) => key !== "ok"));
}

/** A trimmed text param ("" or too long → undefined). */
export function textParam(query: AdminQuery, key: string, maxLength = 100): string | undefined {
  const value = firstParam(query[key])?.trim();
  return value && value.length <= maxLength ? value : undefined;
}

/** A param that must be one of `allowed` (anything else → undefined). */
export function choiceParam<T extends string>(query: AdminQuery, key: string, allowed: readonly T[]): T | undefined {
  const value = firstParam(query[key]);
  return allowed.find((item) => item === value);
}

/** A positive whole number (an id), or undefined. */
export function idParam(query: AdminQuery, key: string): number | undefined {
  const value = Number(firstParam(query[key]));
  return Number.isInteger(value) && value > 0 && value <= 2_147_483_647 ? value : undefined;
}

/** ?page= (1 when missing or invalid). */
export function pageParam(query: AdminQuery): number {
  const page = Number(firstParam(query.page));
  return Number.isInteger(page) && page >= 1 && page <= 10_000 ? page : 1;
}

/** Does one of the texts contain the search (lower case, accents ignored: "ble" finds "Blé")? */
export function matchesSearch(search: string | undefined, ...texts: (string | null | undefined)[]): boolean {
  const wanted = search ? normalizeSearch(search) : "";
  if (!wanted) return true;
  return texts.some((text) => (text ? normalizeSearch(text).includes(wanted) : false));
}

/** One page of a list that is already in memory (20 rows per page, like the database lists). */
export function paginateRows<T>(rows: T[], page: number, pageSize = ADMIN_PAGE_SIZE): Paginated<T> {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  return {
    items: rows.slice((current - 1) * pageSize, current * pageSize),
    total: rows.length,
    page: current,
    pageSize,
    pageCount,
  };
}

/** "1 produit" / "3 produits". */
export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}
