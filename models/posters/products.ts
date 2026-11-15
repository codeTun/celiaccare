import "server-only";

import { and } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { normalizeSearch } from "@/lib/utils";
import { ModelError } from "@/models/errors";
import {
  applyImageChange,
  assertId,
  assertMillimes,
  assertVerification,
  chooseSlug,
  cleanIds,
  rethrowCatalogWriteError,
} from "@/models/fetchers/admin/helpers";
import { findIngredientsOrThrow } from "@/models/fetchers/admin/ingredients";
import type { ProductInput, ProductMutationResult } from "@/types/admin-data";

/**
 * ADMIN — create a product. No auth check here: the Server Action calls requireAdmin() first,
 * then refreshes TAGS.products, TAGS.product(slug), TAGS.categories, TAGS.producers,
 * TAGS.producer(producerSlug) and TAGS.stats.
 */

/** Is this slug already used by another product? (`exceptId` = the product being edited) */
export async function isProductSlugTaken(slug: string, exceptId?: number) {
  const row = await db.orm.public.Product.select("id")
    .where((p) => (exceptId === undefined ? p.slug.eq(slug) : and(p.slug.eq(slug), p.id.neq(exceptId))))
    .first();
  return row !== null;
}

/**
 * The text the search box looks into (Product.searchText): name (fr + ar), description,
 * category, producer and ingredients — lower case, without accents.
 */
export function productSearchText(
  product: { name: string; nameAr: string | null; description: string },
  related: { categoryName: string; producerName: string; ingredientNames: string[] },
) {
  return normalizeSearch(
    [
      product.name,
      product.nameAr ?? "",
      product.description,
      related.categoryName,
      related.producerName,
      ...[...related.ingredientNames].sort(), // sorted: the same ingredients always give the same text
    ].join(" "),
  );
}

/**
 * Check the form values shared by create and update and load the related rows
 * (needed for the search text). Throws ModelError CATEGORY_NOT_FOUND / PRODUCER_NOT_FOUND /
 * INGREDIENT_NOT_FOUND / INVALID_PRICE / INVALID_VERIFIED_AT.
 */
export async function checkProductInput(input: ProductInput) {
  assertMillimes(input.price);
  assertVerification(input.verifiedAt);
  assertId(input.categoryId);
  assertId(input.producerId);
  const ingredientIds = cleanIds(input.ingredientIds);

  const [category, producer, ingredients] = await Promise.all([
    db.orm.public.Category.select("id", "name").first({ id: input.categoryId }),
    db.orm.public.Producer.select("id", "name", "slug").first({ id: input.producerId }),
    findIngredientsOrThrow(ingredientIds),
  ]);
  if (!category) throw new ModelError("CATEGORY_NOT_FOUND", "Cette catégorie n'existe plus. Rechargez la page.");
  if (!producer) throw new ModelError("PRODUCER_NOT_FOUND", "Cet artisan n'existe plus. Rechargez la page.");

  return {
    ingredientIds,
    producerSlug: producer.slug,
    searchText: productSearchText(input, {
      categoryName: category.name,
      producerName: producer.name,
      ingredientNames: ingredients.map((ingredient) => ingredient.name),
    }),
  };
}

/** The columns written by create and update (everything except slug, search text, photo and ingredients). */
export function productColumns(input: ProductInput) {
  return {
    name: input.name,
    nameAr: input.nameAr,
    description: input.description,
    descriptionAr: input.descriptionAr,
    price: input.price,
    unit: input.unit,
    categoryId: input.categoryId,
    producerId: input.producerId,
    guaranteeLevel: input.guaranteeLevel,
    certification: input.certification,
    mayContain: input.mayContain,
    isAvailable: input.isAvailable,
    isFeatured: input.isFeatured,
    isActive: input.isActive,
    verifiedAt: input.verifiedAt,
  };
}

export async function createProduct(input: ProductInput): Promise<ProductMutationResult> {
  const checked = await checkProductInput(input);
  const slug = await chooseSlug({
    requested: input.slug,
    name: input.name,
    fallback: "produit",
    isTaken: (candidate) => isProductSlugTaken(candidate),
  });
  const image = applyImageChange(input.image, null);

  try {
    // The product and its ingredient links are written together (all or nothing).
    const row = await db.orm.public.Product.create({
      slug,
      ...productColumns(input),
      searchText: checked.searchText,
      ...image.fields,
      ingredients: (ingredients) => ingredients.connect(checked.ingredientIds.map((id) => ({ id }))),
    });
    return {
      id: row.id,
      slug: row.slug,
      previousSlug: null,
      producerSlugs: [checked.producerSlug],
      imagesToDelete: [],
    };
  } catch (error) {
    rethrowCatalogWriteError(error);
  }
}
