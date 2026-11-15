import "server-only";

import { tunisDayKey } from "@/lib/tunisia";
import { slugify } from "@/lib/utils";
import { ModelError, isPgError, isUniqueViolation } from "@/models/errors";
import type { Paginated } from "@/types";
import { ADMIN_PAGE_SIZE, type ImageChange, type PageQuery } from "@/types/admin-data";

/**
 * Small helpers shared by the whole ADMIN data layer:
 * models/fetchers/admin/*, models/posters/*, models/puters/*, models/deleters/*.
 */

/* --------------------------------------------------------------------------
   Ids
   -------------------------------------------------------------------------- */

/** true for a positive whole number that fits in a Postgres "integer" column. */
export function isValidId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 2_147_483_647;
}

/**
 * Stop before a write when the id is missing or invalid.
 * Prisma 8 silently ignores `where({ id: undefined })`, which would change EVERY row.
 */
export function assertId(value: unknown): asserts value is number {
  if (!isValidId(value)) throw new ModelError("INVALID_ID", "Identifiant invalide.");
}

/* --------------------------------------------------------------------------
   Dates
   -------------------------------------------------------------------------- */

/** Date → ISO string ("2026-11-15T13:45:00.000Z"), null stays null. */
export function toIso(date: Date): string;
export function toIso(date: Date | null): string | null;
export function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

/** Date → "2026-11-15" (calendar day in Tunis), the format of <input type="date">. */
export function toDateInput(date: Date): string;
export function toDateInput(date: Date | null): string | null;
export function toDateInput(date: Date | null): string | null {
  return date ? tunisDayKey(date) : null;
}

/** The instant 365 days before `now`: sheets verified before it must be reviewed (spec 6.1). */
export function reviewCutoff(now: Date = new Date()) {
  return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
}

/* --------------------------------------------------------------------------
   Search & pagination
   -------------------------------------------------------------------------- */

/** Escape the LIKE wildcards (% and _) typed by the admin, then wrap the text in %...%. */
export function containsPattern(text: string) {
  const escaped = text.replace(/[\\%_]/g, (char) => "\\" + char);
  return `%${escaped}%`;
}

/** Turn ?page=..&pageSize=.. into safe numbers (page ≥ 1, 1 ≤ pageSize ≤ 100). */
export function pageWindow(query: PageQuery = {}) {
  const page = Number.isFinite(query.page) ? Math.max(1, Math.trunc(query.page as number)) : 1;
  const size = Number.isFinite(query.pageSize) ? Math.trunc(query.pageSize as number) : ADMIN_PAGE_SIZE;
  const pageSize = Math.min(100, Math.max(1, size));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

/** Build the Paginated<T> object returned by every paginated admin list. */
export function paginated<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

/* --------------------------------------------------------------------------
   Slugs (the name of a sheet in its URL: /produits/pain-de-mie-sans-gluten)
   -------------------------------------------------------------------------- */

type ChooseSlugOptions = {
  /** What the admin typed in the "slug" field (may be empty). */
  requested: string | null | undefined;
  /** The name of the sheet, used when no slug was typed. */
  name: string;
  /** Used when the name gives an empty slug (e.g. a name written only in Arabic). */
  fallback: string;
  /** Does ANOTHER row already use this slug? (exclude the row being edited) */
  isTaken: (slug: string) => Promise<boolean>;
};

/**
 * Choose the slug to save:
 *  - the admin typed one → it is cleaned up; if another sheet uses it → ModelError("SLUG_TAKEN");
 *  - left empty → built from the name, adding "-2", "-3"... until it is free.
 */
export async function chooseSlug({ requested, name, fallback, isTaken }: ChooseSlugOptions): Promise<string> {
  const typed = requested?.trim() ? slugify(requested) : "";
  if (typed) {
    if (await isTaken(typed)) throw new ModelError("SLUG_TAKEN", "Cette adresse (slug) est déjà utilisée.");
    return typed;
  }

  const base = slugify(name) || fallback;
  for (let n = 1; n <= 500; n++) {
    const suffix = n === 1 ? "" : `-${n}`;
    // keep the whole slug within 80 characters, without a dash before the suffix
    let head = base.slice(0, 80 - suffix.length);
    if (head.endsWith("-")) head = head.slice(0, -1);
    const candidate = head + suffix;
    if (!(await isTaken(candidate))) return candidate;
  }
  throw new ModelError("SLUG_TAKEN", "Impossible de trouver une adresse (slug) libre.");
}

/* --------------------------------------------------------------------------
   Photos (Cloudinary)
   -------------------------------------------------------------------------- */

/**
 * Turn an ImageChange into the columns to save and the Cloudinary photo to delete.
 *   undefined → nothing changes; null → photo removed; { url, publicId } → photo replaced.
 */
export function applyImageChange(change: ImageChange, currentPublicId: string | null) {
  if (change === undefined) {
    return { fields: {}, imagesToDelete: [] as string[] };
  }
  const imagesToDelete = currentPublicId && currentPublicId !== change?.publicId ? [currentPublicId] : [];
  const fields = change
    ? { imageUrl: change.url, imagePublicId: change.publicId }
    : { imageUrl: null, imagePublicId: null };
  return { fields, imagesToDelete };
}

/* --------------------------------------------------------------------------
   Database errors
   -------------------------------------------------------------------------- */

/**
 * Postgres refused a delete because other rows still point to this one:
 * 23503 (foreign key) or 23001 (ON DELETE RESTRICT, e.g. a category that still has products).
 */
export function isStillReferenced(error: unknown) {
  return isPgError(error) && (error.sqlState === "23503" || error.sqlState === "23001");
}

/** A unique "slug" constraint was violated (two saves at the same time) → ModelError("SLUG_TAKEN"). */
export function rethrowSlugConflict(error: unknown): never {
  if (isUniqueViolation(error) && isPgError(error) && error.constraint?.endsWith("_slug_key")) {
    throw new ModelError("SLUG_TAKEN", "Cette adresse (slug) est déjà utilisée.");
  }
  throw error;
}

/**
 * Errors of a product / dish save when a related row was deleted DURING the save
 * (after our checks): a category, producer or restaurant (foreign key 23503), or a
 * ticked ingredient (Prisma's connect() error ORM.RELATION_ROW_MISSING).
 * Translated into the same ModelErrors as the checks; anything else is re-thrown.
 */
export function rethrowCatalogWriteError(error: unknown): never {
  if (isPgError(error) && error.sqlState === "23503") {
    if (error.constraint === "Product_categoryId_fkey") {
      throw new ModelError("CATEGORY_NOT_FOUND", "Cette catégorie n'existe plus. Rechargez la page.");
    }
    if (error.constraint === "Product_producerId_fkey") {
      throw new ModelError("PRODUCER_NOT_FOUND", "Cet artisan n'existe plus. Rechargez la page.");
    }
    if (error.constraint === "Dish_restaurantId_fkey") {
      throw new ModelError("RESTAURANT_NOT_FOUND", "Ce restaurant n'existe plus.");
    }
  }
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  if (code === "ORM.RELATION_ROW_MISSING") {
    throw new ModelError("INGREDIENT_NOT_FOUND", "Un des ingrédients choisis n'existe plus. Rechargez la page.");
  }
  rethrowSlugConflict(error);
}

/** Check a list of ids (checkboxes) and remove duplicates. */
export function cleanIds(ids: readonly number[]): number[] {
  for (const id of ids) assertId(id);
  return Array.from(new Set(ids));
}

/** Prices and fees are whole, positive numbers of millimes (12,500 DT = 12500). */
export function assertMillimes(value: number, code = "INVALID_PRICE") {
  if (!Number.isInteger(value) || value < 0 || value > 100_000_000) {
    throw new ModelError(code, "Montant invalide.");
  }
}

/* --------------------------------------------------------------------------
   Verification of the information (spec 6.1: no sheet without a source and a date)
   -------------------------------------------------------------------------- */

/**
 * The verification date must be a real date and not in the future (a little
 * margin is kept because a date chosen in a form is stored at 12:00 UTC).
 * Pass `source` for the models that have a "verificationSource" field: it must not be empty.
 */
export function assertVerification(verifiedAt: Date, source?: string) {
  const isValidDate = verifiedAt instanceof Date && !Number.isNaN(verifiedAt.getTime());
  if (!isValidDate || verifiedAt.getTime() > Date.now() + 36 * 60 * 60 * 1000) {
    throw new ModelError("INVALID_VERIFIED_AT", "Date de vérification invalide (elle ne peut pas être dans le futur).");
  }
  if (source !== undefined && !source.trim()) {
    throw new ModelError("SOURCE_REQUIRED", "Indiquez comment l'information a été vérifiée (source).");
  }
}
