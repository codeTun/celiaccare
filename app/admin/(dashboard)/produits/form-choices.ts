import "server-only";

import { listCategories } from "@/models/fetchers/admin/categories";
import { listIngredientOptions } from "@/models/fetchers/admin/ingredients";
import { listProducers } from "@/models/fetchers/admin/producers";

import type { ProducerChoice } from "./product-form";

/**
 * The choices of the product form: categories (with their icon, for the photo
 * placeholder), artisans (with the verification of their sheet, which the product
 * inherits) and ingredients. Call it after requireAdmin().
 */
export async function loadProductFormChoices() {
  const [categories, producers, ingredients] = await Promise.all([listCategories(), listProducers(), listIngredientOptions()]);
  return {
    categories: categories.map((category) => ({ id: category.id, name: category.name, icon: category.icon })),
    producers: producers.map(
      (producer): ProducerChoice => ({
        id: producer.id,
        name: producer.name,
        city: producer.city,
        isActive: producer.isActive,
        verificationSource: producer.verificationSource,
        verifiedAt: producer.verifiedAt,
      }),
    ),
    ingredients,
  };
}
