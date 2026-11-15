import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import type { AdminIngredientForm, AdminIngredientRow, IngredientOption } from "@/types/admin-data";

import { isValidId } from "./helpers";

/**
 * ADMIN — ingredients and allergens (never cached).
 * Call requireAdmin() before using these functions.
 */

/** Every ingredient (A → Z) with the number of products and dishes that contain it. */
export async function listIngredients(): Promise<AdminIngredientRow[]> {
  const rows = await db.orm.public.Ingredient.select("id", "slug", "name", "nameAr", "isAllergen")
    .include("products", (products) => products.count())
    .include("dishes", (dishes) => dishes.count())
    .orderBy([(i) => i.name.asc(), (i) => i.id.asc()])
    .all();

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr,
    isAllergen: row.isAllergen,
    productCount: row.products,
    dishCount: row.dishes,
  }));
}

/** Short list (id, name, allergen) for the ingredient checkboxes of the product and dish forms. */
export async function listIngredientOptions(): Promise<IngredientOption[]> {
  const rows = await db.orm.public.Ingredient.select("id", "name", "isAllergen")
    .orderBy([(i) => i.name.asc(), (i) => i.id.asc()])
    .all();
  return rows.map((row) => ({ id: row.id, name: row.name, isAllergen: row.isAllergen }));
}

/** One ingredient, to pre-fill its edit form. null when it does not exist. */
export async function getIngredient(id: number): Promise<AdminIngredientForm | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.Ingredient.first({ id });
  if (!row) return null;
  return { id: row.id, slug: row.slug, name: row.name, nameAr: row.nameAr, isAllergen: row.isAllergen };
}

/**
 * Load the ingredients ticked in a product / dish form.
 * Throws ModelError("INGREDIENT_NOT_FOUND") when one of them does not exist (any more).
 */
export async function findIngredientsOrThrow(ids: readonly number[]): Promise<{ id: number; name: string }[]> {
  if (ids.length === 0) return [];
  const rows = await db.orm.public.Ingredient.select("id", "name")
    .where((i) => i.id.in([...ids]))
    .all();
  if (rows.length !== new Set(ids).size) {
    throw new ModelError("INGREDIENT_NOT_FOUND", "Un des ingrédients choisis n'existe plus. Rechargez la page.");
  }
  return rows;
}
