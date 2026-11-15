import "server-only";

import { and } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { chooseSlug, rethrowSlugConflict } from "@/models/fetchers/admin/helpers";
import type { IngredientInput, IngredientMutationResult } from "@/types/admin-data";

/**
 * ADMIN — create an ingredient / allergen. No auth check here: the Server Action calls
 * requireAdmin() first, then refreshes TAGS.ingredients.
 */

/** Is this slug already used by another ingredient? (`exceptId` = the ingredient being edited) */
export async function isIngredientSlugTaken(slug: string, exceptId?: number) {
  const row = await db.orm.public.Ingredient.select("id")
    .where((i) => (exceptId === undefined ? i.slug.eq(slug) : and(i.slug.eq(slug), i.id.neq(exceptId))))
    .first();
  return row !== null;
}

export async function createIngredient(input: IngredientInput): Promise<IngredientMutationResult> {
  const slug = await chooseSlug({
    requested: input.slug,
    name: input.name,
    fallback: "ingredient",
    isTaken: (candidate) => isIngredientSlugTaken(candidate),
  });

  try {
    const row = await db.orm.public.Ingredient.create({
      slug,
      name: input.name,
      nameAr: input.nameAr,
      isAllergen: input.isAllergen,
    });
    return { id: row.id, slug: row.slug, previousSlug: null };
  } catch (error) {
    rethrowSlugConflict(error);
  }
}
