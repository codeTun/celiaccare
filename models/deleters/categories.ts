import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId, isStillReferenced } from "@/models/fetchers/admin/helpers";
import type { SlugDeleteResult } from "@/types/admin-data";

/**
 * ADMIN — delete a category. No auth check here: the Server Action calls requireAdmin() first,
 * then deletes the photos (deleteImage) and refreshes TAGS.categories and TAGS.products.
 */

/** Refused with ModelError("IN_USE") while products still belong to the category. */
export async function deleteCategory(id: number): Promise<SlugDeleteResult> {
  assertId(id);
  const current = await db.orm.public.Category.select("id", "slug", "imagePublicId")
    .where({ id })
    .include("products", (products) => products.count())
    .first();
  if (!current) throw new ModelError("NOT_FOUND", "Cette catégorie n'existe plus.");
  if (current.products > 0) throw inUse(current.products);

  try {
    await db.orm.public.Category.where({ id }).delete();
  } catch (error) {
    // A product was added to it in the meantime (the database refuses: ON DELETE RESTRICT).
    if (isStillReferenced(error)) throw inUse();
    throw error;
  }
  return { id, slug: current.slug, imagesToDelete: current.imagePublicId ? [current.imagePublicId] : [] };
}

function inUse(productCount?: number) {
  const detail = productCount ? ` (${productCount} produit${productCount > 1 ? "s" : ""})` : "";
  return new ModelError(
    "IN_USE",
    `Cette catégorie contient encore des produits${detail}. Déplacez-les ou supprimez-les d'abord.`,
  );
}
