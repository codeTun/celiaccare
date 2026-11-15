import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { applyImageChange, assertId, rethrowCatalogWriteError } from "@/models/fetchers/admin/helpers";
import { checkDishInput, dishColumns } from "@/models/posters/dishes";
import type { DishInput, DishMutationResult } from "@/types/admin-data";

/**
 * ADMIN — update a dish of a restaurant menu. No auth check here: the Server Action calls
 * requireAdmin() first, then refreshes TAGS.restaurants and TAGS.restaurant(restaurantSlug).
 */

export async function updateDish(id: number, input: DishInput): Promise<DishMutationResult> {
  assertId(id);
  const current = await db.orm.public.Dish.select("id", "restaurantId", "imagePublicId")
    .where({ id })
    .include("restaurant", (restaurant) => restaurant.select("slug"))
    .include("ingredients", (ingredients) => ingredients.select("id"))
    .first();
  if (!current) throw new ModelError("NOT_FOUND", "Ce plat n'existe plus.");

  const ingredientIds = await checkDishInput(input);
  const image = applyImageChange(input.image, current.imagePublicId);

  // Ingredient links: add the newly ticked ones, remove the unticked ones, keep the others.
  const currentIds = current.ingredients.map((ingredient) => ingredient.id);
  const toConnect = ingredientIds.filter((ingredientId) => !currentIds.includes(ingredientId));
  const toDisconnect = currentIds.filter((ingredientId) => !ingredientIds.includes(ingredientId));

  try {
    // All or nothing: the dish fields and its ingredient links change together.
    await db.transaction(async (tx) => {
      const dish = tx.orm.public.Dish.where({ id });
      const saved = await dish.update({ ...dishColumns(input), ...image.fields });
      if (!saved) throw new ModelError("NOT_FOUND", "Ce plat n'existe plus."); // deleted meanwhile
      if (toDisconnect.length > 0) {
        await dish.update({ ingredients: (links) => links.disconnect(toDisconnect.map((x) => ({ id: x }))) });
      }
      if (toConnect.length > 0) {
        await dish.update({ ingredients: (links) => links.connect(toConnect.map((x) => ({ id: x }))) });
      }
    });
  } catch (error) {
    rethrowCatalogWriteError(error);
  }

  return {
    id,
    restaurantId: current.restaurantId,
    restaurantSlug: current.restaurant?.slug ?? "",
    imagesToDelete: image.imagesToDelete,
  };
}

/** Available (true) or "sold out today" (false): unavailable dishes cannot be ordered. */
export async function setDishAvailable(id: number, isAvailable: boolean): Promise<DishMutationResult> {
  assertId(id);
  const row = await db.orm.public.Dish.where({ id }).select("id", "restaurantId").update({ isAvailable });
  if (!row) throw new ModelError("NOT_FOUND", "Ce plat n'existe plus.");
  const restaurant = await db.orm.public.Restaurant.select("slug").first({ id: row.restaurantId });
  return { id: row.id, restaurantId: row.restaurantId, restaurantSlug: restaurant?.slug ?? "", imagesToDelete: [] };
}
