import "server-only";

import { db, type Db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { applyImageChange, assertId, chooseSlug, cleanIds, rethrowCatalogWriteError } from "@/models/fetchers/admin/helpers";
import { checkProductInput, isProductSlugTaken, productColumns, productSearchText } from "@/models/posters/products";
import type { ProductInput, ProductMutationResult, ProductToggleResult } from "@/types/admin-data";

/**
 * ADMIN — update products. No auth check here: the Server Action calls requireAdmin() first,
 * then refreshes TAGS.products, TAGS.product(slug) (+ previousSlug), TAGS.categories,
 * TAGS.producers, TAGS.producer(...) and TAGS.stats.
 */

export async function updateProduct(id: number, input: ProductInput): Promise<ProductMutationResult> {
  assertId(id);
  const current = await db.orm.public.Product.select("id", "slug", "imagePublicId")
    .where({ id })
    .include("producer", (producer) => producer.select("slug"))
    .include("ingredients", (ingredients) => ingredients.select("id"))
    .first();
  if (!current) throw new ModelError("NOT_FOUND", "Ce produit n'existe plus.");

  const checked = await checkProductInput(input);
  const slug = await chooseSlug({
    requested: input.slug,
    name: input.name,
    fallback: "produit",
    isTaken: (candidate) => isProductSlugTaken(candidate, id),
  });
  const image = applyImageChange(input.image, current.imagePublicId);

  // Ingredient links: add the newly ticked ones, remove the unticked ones, keep the others.
  const currentIds = current.ingredients.map((ingredient) => ingredient.id);
  const toConnect = checked.ingredientIds.filter((ingredientId) => !currentIds.includes(ingredientId));
  const toDisconnect = currentIds.filter((ingredientId) => !checked.ingredientIds.includes(ingredientId));

  try {
    // All or nothing: the product fields and its ingredient links change together.
    await db.transaction(async (tx) => {
      const product = tx.orm.public.Product.where({ id });
      const saved = await product.update({ slug, ...productColumns(input), searchText: checked.searchText, ...image.fields });
      if (!saved) throw new ModelError("NOT_FOUND", "Ce produit n'existe plus."); // deleted meanwhile
      if (toDisconnect.length > 0) {
        await product.update({ ingredients: (links) => links.disconnect(toDisconnect.map((x) => ({ id: x }))) });
      }
      if (toConnect.length > 0) {
        await product.update({ ingredients: (links) => links.connect(toConnect.map((x) => ({ id: x }))) });
      }
    });
  } catch (error) {
    rethrowCatalogWriteError(error);
  }

  const oldProducerSlug = current.producer?.slug;
  return {
    id,
    slug,
    previousSlug: current.slug !== slug ? current.slug : null,
    producerSlugs:
      oldProducerSlug && oldProducerSlug !== checked.producerSlug
        ? [checked.producerSlug, oldProducerSlug]
        : [checked.producerSlug],
    imagesToDelete: image.imagesToDelete,
  };
}

/* --------------------------------------------------------------------------
   Quick toggles from the products table
   -------------------------------------------------------------------------- */

type ProductFlag = { isActive: boolean } | { isFeatured: boolean } | { isAvailable: boolean };

async function setProductFlag(id: number, flag: ProductFlag): Promise<ProductToggleResult> {
  assertId(id);
  const row = await db.orm.public.Product.where({ id }).select("id", "slug", "producerId").update(flag);
  if (!row) throw new ModelError("NOT_FOUND", "Ce produit n'existe plus.");
  const producer = await db.orm.public.Producer.select("slug").first({ id: row.producerId });
  return { id: row.id, slug: row.slug, producerSlug: producer?.slug ?? "" };
}

/** Show (true) or hide (false) the product on the public site. */
export function setProductActive(id: number, isActive: boolean) {
  return setProductFlag(id, { isActive });
}

/** Highlight (true) or not (false) the product among the featured products of the home page. */
export function setProductFeatured(id: number, isFeatured: boolean) {
  return setProductFlag(id, { isFeatured });
}

/** In stock (true) or temporarily unavailable (false): unavailable products cannot be ordered. */
export function setProductAvailable(id: number, isAvailable: boolean) {
  return setProductFlag(id, { isAvailable });
}

/* --------------------------------------------------------------------------
   Search text kept up to date when a category, producer or ingredient changes
   -------------------------------------------------------------------------- */

/** Which products to refresh. */
export type SearchTextScope =
  | { categoryId: number }
  | { producerId: number }
  | { ingredientId: number }
  | { productIds: number[] };

/**
 * Recompute Product.searchText for the products concerned, after a change made
 * outside the product itself (category, producer or ingredient renamed, ingredient
 * deleted). Pass `tx` to run it inside a transaction. Returns how many products changed.
 */
export async function refreshProductSearchText(scope: SearchTextScope, client: Pick<Db, "orm"> = db): Promise<number> {
  if ("productIds" in scope) cleanIds(scope.productIds);
  else assertId(Object.values(scope)[0]);

  const rows = await client.orm.public.Product.select("id", "name", "nameAr", "description", "searchText")
    .where((p) => {
      if ("categoryId" in scope) return p.categoryId.eq(scope.categoryId);
      if ("producerId" in scope) return p.producerId.eq(scope.producerId);
      if ("ingredientId" in scope) return p.ingredients.some((i) => i.id.eq(scope.ingredientId));
      return p.id.in(scope.productIds);
    })
    .include("category", (category) => category.select("name"))
    .include("producer", (producer) => producer.select("name"))
    .include("ingredients", (ingredients) => ingredients.select("name"))
    .all();

  let changed = 0;
  for (const row of rows) {
    const searchText = productSearchText(row, {
      categoryName: row.category?.name ?? "",
      producerName: row.producer?.name ?? "",
      ingredientNames: row.ingredients.map((ingredient) => ingredient.name),
    });
    if (searchText !== row.searchText) {
      await client.orm.public.Product.where({ id: row.id }).update({ searchText });
      changed++;
    }
  }
  return changed;
}
