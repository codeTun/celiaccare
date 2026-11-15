import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import type { SlugDeleteResult } from "@/types/admin-data";

/**
 * ADMIN — delete a restaurant. No auth check here: the Server Action calls requireAdmin() first,
 * then deletes the photos (deleteImage) and refreshes TAGS.restaurants, TAGS.restaurant(slug)
 * and TAGS.stats.
 */

/**
 * The database also deletes its dishes and its reviews (ON DELETE CASCADE).
 * Past orders keep their history (restaurantId becomes null, names were copied at order time).
 * imagesToDelete contains the restaurant photo AND the photos of its dishes.
 */
export async function deleteRestaurant(id: number): Promise<SlugDeleteResult> {
  assertId(id);
  const current = await db.orm.public.Restaurant.select("id", "slug", "imagePublicId")
    .where({ id })
    .include("dishes", (dishes) => dishes.select("imagePublicId"))
    .first();
  if (!current) throw new ModelError("NOT_FOUND", "Ce restaurant n'existe plus.");

  await db.orm.public.Restaurant.where({ id }).delete();

  const imagesToDelete = [current.imagePublicId, ...current.dishes.map((dish) => dish.imagePublicId)].filter(
    (publicId): publicId is string => Boolean(publicId),
  );
  return { id, slug: current.slug, imagesToDelete };
}
