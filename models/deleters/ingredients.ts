import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import { refreshProductSearchText } from "@/models/puters/products";
import type { IngredientDeleteResult } from "@/types/admin-data";

/**
 * ADMIN — delete an ingredient. No auth check here: the Server Action calls requireAdmin() first,
 * then refreshes TAGS.ingredients, TAGS.products and TAGS.restaurants.
 */

/**
 * The ingredient disappears from every product and dish that contained it
 * (the link rows are deleted by the database: ON DELETE CASCADE).
 */
export async function deleteIngredient(id: number): Promise<IngredientDeleteResult> {
  assertId(id);
  const current = await db.orm.public.Ingredient.select("id", "slug")
    .where({ id })
    .include("products", (products) => products.select("id"))
    .include("dishes", (dishes) => dishes.count())
    .first();
  if (!current) throw new ModelError("NOT_FOUND", "Cet ingrédient n'existe plus.");

  const productIds = current.products.map((product) => product.id);
  await db.transaction(async (tx) => {
    await tx.orm.public.Ingredient.where({ id }).delete();
    // Its name must leave the search text of those products.
    if (productIds.length > 0) await refreshProductSearchText({ productIds }, tx);
  });
  return { id, slug: current.slug, productCount: productIds.length, dishCount: current.dishes };
}
