import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId, isStillReferenced } from "@/models/fetchers/admin/helpers";
import type { SlugDeleteResult } from "@/types/admin-data";

/**
 * ADMIN — delete a producer. No auth check here: the Server Action calls requireAdmin() first,
 * then deletes the photos (deleteImage) and refreshes TAGS.producers, TAGS.producer(slug),
 * TAGS.products and TAGS.stats.
 */

/** Refused with ModelError("IN_USE") while the producer still has products (deactivate it instead). */
export async function deleteProducer(id: number): Promise<SlugDeleteResult> {
  assertId(id);
  const current = await db.orm.public.Producer.select("id", "slug", "imagePublicId")
    .where({ id })
    .include("products", (products) => products.count())
    .first();
  if (!current) throw new ModelError("NOT_FOUND", "Cet artisan n'existe plus.");
  if (current.products > 0) throw inUse(current.products);

  try {
    await db.orm.public.Producer.where({ id }).delete();
  } catch (error) {
    // A product was added in the meantime (the database refuses: ON DELETE RESTRICT).
    if (isStillReferenced(error)) throw inUse();
    throw error;
  }
  return { id, slug: current.slug, imagesToDelete: current.imagePublicId ? [current.imagePublicId] : [] };
}

function inUse(productCount?: number) {
  const detail = productCount ? ` (${productCount} produit${productCount > 1 ? "s" : ""})` : "";
  return new ModelError(
    "IN_USE",
    `Cet artisan a encore des produits${detail}. Supprimez-les ou désactivez l'artisan.`,
  );
}
