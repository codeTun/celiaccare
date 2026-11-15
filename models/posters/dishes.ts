import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { applyImageChange, assertId, assertMillimes, cleanIds, rethrowCatalogWriteError } from "@/models/fetchers/admin/helpers";
import { findIngredientsOrThrow } from "@/models/fetchers/admin/ingredients";
import type { DishInput, DishMutationResult } from "@/types/admin-data";

/**
 * ADMIN — add a dish to a restaurant menu. No auth check here: the Server Action calls
 * requireAdmin() first, then refreshes TAGS.restaurants and TAGS.restaurant(restaurantSlug).
 */

/** Checks shared by create and update: price and ingredients. Returns the cleaned ingredient ids. */
export async function checkDishInput(input: DishInput) {
  assertMillimes(input.price);
  if (!Number.isInteger(input.sortOrder)) throw new ModelError("INVALID_SORT_ORDER", "Ordre d'affichage invalide.");
  const ingredientIds = cleanIds(input.ingredientIds);
  await findIngredientsOrThrow(ingredientIds);
  return ingredientIds;
}

/** The columns written by create and update (everything except the restaurant, photo and ingredients). */
export function dishColumns(input: DishInput) {
  return {
    name: input.name,
    nameAr: input.nameAr,
    description: input.description,
    descriptionAr: input.descriptionAr,
    price: input.price,
    course: input.course,
    isAvailable: input.isAvailable,
    sortOrder: input.sortOrder,
  };
}

export async function createDish(restaurantId: number, input: DishInput): Promise<DishMutationResult> {
  assertId(restaurantId);
  const restaurant = await db.orm.public.Restaurant.select("id", "slug").first({ id: restaurantId });
  if (!restaurant) throw new ModelError("RESTAURANT_NOT_FOUND", "Ce restaurant n'existe plus.");
  const ingredientIds = await checkDishInput(input);
  const image = applyImageChange(input.image, null);

  try {
    // The dish and its ingredient links are written together (all or nothing).
    const row = await db.orm.public.Dish.create({
      restaurantId,
      ...dishColumns(input),
      ...image.fields,
      ingredients: (ingredients) => ingredients.connect(ingredientIds.map((id) => ({ id }))),
    });
    return { id: row.id, restaurantId, restaurantSlug: restaurant.slug, imagesToDelete: [] };
  } catch (error) {
    rethrowCatalogWriteError(error);
  }
}
