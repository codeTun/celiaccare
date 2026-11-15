import "server-only";

import { cachePolicy } from "@/lib/cache";
import { TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/prisma";
import { sortByName, toIngredientDTO } from "@/models/fetchers/mappers";
import type { IngredientDTO, Locale } from "@/types";

/**
 * Every ingredient, in alphabetical order (page language).
 * Used by the catalogue filters: "contains" and "without" (allergens: isAllergen = true).
 */
export async function getIngredients(locale: Locale): Promise<IngredientDTO[]> {
  "use cache";
  cachePolicy([TAGS.ingredients]);

  const rows = await db.orm.public.Ingredient.select("id", "slug", "name", "nameAr", "isAllergen").all();
  return sortByName(
    rows.map((row) => toIngredientDTO(row, locale)),
    locale,
  );
}
