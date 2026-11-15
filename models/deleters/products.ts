import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import type { ProductDeleteResult } from "@/types/admin-data";

/**
 * ADMIN — delete a product. No auth check here: the Server Action calls requireAdmin() first,
 * then deletes the photo (deleteImage) and refreshes TAGS.products, TAGS.product(slug),
 * TAGS.categories, TAGS.producers, TAGS.producer(producerSlug) and TAGS.stats.
 */

/**
 * The database also deletes its ingredient links and its reviews (ON DELETE CASCADE).
 * Past orders keep their lines (name and price were copied at order time; productId becomes null).
 */
export async function deleteProduct(id: number): Promise<ProductDeleteResult> {
  assertId(id);
  const current = await db.orm.public.Product.select("id", "slug", "imagePublicId")
    .where({ id })
    .include("producer", (producer) => producer.select("slug"))
    .first();
  if (!current) throw new ModelError("NOT_FOUND", "Ce produit n'existe plus.");

  await db.orm.public.Product.where({ id }).delete();
  return {
    id,
    slug: current.slug,
    producerSlug: current.producer?.slug ?? "",
    imagesToDelete: current.imagePublicId ? [current.imagePublicId] : [],
  };
}
