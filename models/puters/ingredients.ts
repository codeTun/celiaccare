import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId, chooseSlug, rethrowSlugConflict } from "@/models/fetchers/admin/helpers";
import { isIngredientSlugTaken } from "@/models/posters/ingredients";
import type { IngredientInput, IngredientMutationResult } from "@/types/admin-data";

import { refreshProductSearchText } from "./products";

/**
 * ADMIN — update an ingredient / allergen. No auth check here: the Server Action calls
 * requireAdmin() first, then refreshes TAGS.ingredients, TAGS.products and TAGS.restaurants
 * (product and dish sheets show the ingredient names and allergens).
 */

export async function updateIngredient(id: number, input: IngredientInput): Promise<IngredientMutationResult> {
  assertId(id);
  const current = await db.orm.public.Ingredient.select("id", "slug", "name").first({ id });
  if (!current) throw new ModelError("NOT_FOUND", "Cet ingrédient n'existe plus.");

  const slug = await chooseSlug({
    requested: input.slug,
    name: input.name,
    fallback: "ingredient",
    isTaken: (candidate) => isIngredientSlugTaken(candidate, id),
  });

  try {
    await db.transaction(async (tx) => {
      const saved = await tx.orm.public.Ingredient.where({ id }).update({
        slug,
        name: input.name,
        nameAr: input.nameAr,
        isAllergen: input.isAllergen,
      });
      if (!saved) throw new ModelError("NOT_FOUND", "Cet ingrédient n'existe plus."); // deleted meanwhile
      // The ingredient name is part of the search text of the products that contain it.
      if (current.name !== input.name) await refreshProductSearchText({ ingredientId: id }, tx);
    });
  } catch (error) {
    rethrowSlugConflict(error);
  }

  return { id, slug, previousSlug: current.slug !== slug ? current.slug : null };
}
