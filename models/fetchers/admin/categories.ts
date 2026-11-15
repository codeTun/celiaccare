import "server-only";

import { db } from "@/lib/prisma";
import type { AdminCategoryForm, AdminCategoryRow } from "@/types/admin-data";

import { isValidId, toIso } from "./helpers";

/**
 * ADMIN — categories (never cached: the admin always sees fresh data).
 * Call requireAdmin() before using these functions.
 */

/** Every category, in menu order, with its number of products (all / active). */
export async function listCategories(): Promise<AdminCategoryRow[]> {
  const rows = await db.orm.public.Category.select("id", "slug", "name", "nameAr", "icon", "imageUrl", "sortOrder", "updatedAt")
    .include("products", (products) =>
      products.combine({
        total: products.count(),
        active: products.where((p) => p.isActive.eq(true)).count(),
      }),
    )
    .orderBy([(c) => c.sortOrder.asc(), (c) => c.name.asc(), (c) => c.id.asc()])
    .all();

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr,
    icon: row.icon,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    productCount: row.products.total,
    activeProductCount: row.products.active,
    updatedAt: toIso(row.updatedAt),
  }));
}

/** One category, to pre-fill its edit form. null when it does not exist. */
export async function getCategory(id: number): Promise<AdminCategoryForm | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.Category.first({ id });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameAr: row.nameAr,
    description: row.description,
    descriptionAr: row.descriptionAr,
    icon: row.icon,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
  };
}
