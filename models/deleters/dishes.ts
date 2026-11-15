import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import type { DishMutationResult } from "@/types/admin-data";

/**
 * ADMIN — remove a dish from a menu. No auth check here: the Server Action calls requireAdmin()
 * first, then deletes the photo (deleteImage) and refreshes TAGS.restaurants and
 * TAGS.restaurant(restaurantSlug).
 */

/** Past orders keep their lines (name and price were copied at order time; dishId becomes null). */
export async function deleteDish(id: number): Promise<DishMutationResult> {
  assertId(id);
  const current = await db.orm.public.Dish.select("id", "restaurantId", "imagePublicId")
    .where({ id })
    .include("restaurant", (restaurant) => restaurant.select("slug"))
    .first();
  if (!current) throw new ModelError("NOT_FOUND", "Ce plat n'existe plus.");

  await db.orm.public.Dish.where({ id }).delete();
  return {
    id,
    restaurantId: current.restaurantId,
    restaurantSlug: current.restaurant?.slug ?? "",
    imagesToDelete: current.imagePublicId ? [current.imagePublicId] : [],
  };
}
