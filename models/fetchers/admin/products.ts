import "server-only";

import { all, and, or, type Condition } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { needsReview, normalizeSearch } from "@/lib/utils";
import type { Paginated } from "@/types";
import type { AdminProductFilters, AdminProductForm, AdminProductRow, ProductFormOptions } from "@/types/admin-data";

import { containsPattern, isValidId, pageWindow, paginated, toDateInput, toIso } from "./helpers";
import { listIngredientOptions } from "./ingredients";

/**
 * ADMIN — products (never cached).
 * Call requireAdmin() before using these functions.
 */

/** Products matching the filters, newest first, 20 per page. */
export async function listProducts(filters: AdminProductFilters = {}): Promise<Paginated<AdminProductRow>> {
  const { page, pageSize, offset } = pageWindow(filters);
  const q = filters.q?.trim();
  const searchWords = q ? normalizeSearch(q) : "";

  // The same filtered collection is used twice: for the rows of the page and for the total count.
  const filtered = db.orm.public.Product.where((p) => {
    const conditions: Condition[] = [];
    if (q) {
      const matches = [p.name.ilike(containsPattern(q)), p.slug.ilike(containsPattern(q))];
      // searchText = name + category + producer + ingredients, without accents (see models/posters/products.ts)
      if (searchWords) matches.push(p.searchText.like(containsPattern(searchWords)));
      conditions.push(or(...matches));
    }
    if (isValidId(filters.categoryId)) conditions.push(p.categoryId.eq(filters.categoryId));
    if (isValidId(filters.producerId)) conditions.push(p.producerId.eq(filters.producerId));
    if (filters.status === "active") conditions.push(p.isActive.eq(true));
    if (filters.status === "inactive") conditions.push(p.isActive.eq(false));
    if (filters.status === "featured") conditions.push(p.isFeatured.eq(true));
    if (filters.status === "unavailable") conditions.push(p.isAvailable.eq(false));
    return conditions.length > 0 ? and(...conditions) : all();
  });

  const [rows, count] = await Promise.all([
    filtered
      .select(
        "id",
        "slug",
        "name",
        "price",
        "unit",
        "imageUrl",
        "guaranteeLevel",
        "isActive",
        "isFeatured",
        "isAvailable",
        "categoryId",
        "producerId",
        "verifiedAt",
        "updatedAt",
      )
      .include("category", (category) => category.select("name"))
      .include("producer", (producer) => producer.select("name", "slug"))
      .orderBy([(p) => p.createdAt.desc(), (p) => p.id.desc()])
      .limit(pageSize)
      .offset(offset)
      .all(),
    filtered.aggregate((a) => ({ total: a.count() })),
  ]);

  const now = new Date();
  const items = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    unit: row.unit,
    imageUrl: row.imageUrl,
    guaranteeLevel: row.guaranteeLevel,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    isAvailable: row.isAvailable,
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? "",
    producerId: row.producerId,
    producerName: row.producer?.name ?? "",
    producerSlug: row.producer?.slug ?? "",
    verifiedAt: toIso(row.verifiedAt),
    needsReview: needsReview(row.verifiedAt, now),
    updatedAt: toIso(row.updatedAt),
  }));

  return paginated(items, count.total, page, pageSize);
}

/** One product with all its fields and the ids of its ingredients, to pre-fill the edit form. */
export async function getProduct(id: number): Promise<AdminProductForm | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.Product.where({ id })
    .include("ingredients", (ingredients) => ingredients.select("id").orderBy((i) => i.id.asc()))
    .first();
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr,
    description: row.description,
    descriptionAr: row.descriptionAr,
    price: row.price,
    unit: row.unit,
    imageUrl: row.imageUrl,
    categoryId: row.categoryId,
    producerId: row.producerId,
    guaranteeLevel: row.guaranteeLevel,
    certification: row.certification,
    mayContain: row.mayContain,
    isAvailable: row.isAvailable,
    isFeatured: row.isFeatured,
    isActive: row.isActive,
    verifiedAt: toDateInput(row.verifiedAt),
    ingredientIds: row.ingredients.map((ingredient) => ingredient.id),
  };
}

/** Everything the product form needs for its selects and checkboxes. */
export async function getProductFormOptions(): Promise<ProductFormOptions> {
  const [categories, producers, ingredients] = await Promise.all([
    db.orm.public.Category.select("id", "name")
      .orderBy([(c) => c.sortOrder.asc(), (c) => c.name.asc()])
      .all(),
    db.orm.public.Producer.select("id", "name", "city", "isActive")
      .orderBy([(p) => p.name.asc(), (p) => p.id.asc()])
      .all(),
    listIngredientOptions(),
  ]);
  return {
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    producers: producers.map((p) => ({ id: p.id, name: p.name, city: p.city, isActive: p.isActive })),
    ingredients,
  };
}
