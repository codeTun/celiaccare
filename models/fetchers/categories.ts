import "server-only";

import { cachePolicy } from "@/lib/cache";
import { TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/prisma";
import { localize } from "@/lib/utils";
import { compareNames, isPublicProduct } from "@/models/fetchers/mappers";
import type { CategoryDTO, Locale } from "@/types";

/**
 * All product categories, ordered by `sortOrder` (chosen by the admin) then by name.
 * `productCount` = number of products visitors can see in the category (it may be 0).
 */
export async function getCategories(locale: Locale): Promise<CategoryDTO[]> {
  "use cache";
  cachePolicy([TAGS.categories, TAGS.products, TAGS.producers]);

  const rows = await db.orm.public.Category.select(
    "id",
    "slug",
    "name",
    "nameAr",
    "description",
    "descriptionAr",
    "icon",
    "imageUrl",
    "sortOrder",
  )
    .include("products", (products) => products.where(isPublicProduct).count())
    .all();

  return rows
    .map((row) => ({
      sortOrder: row.sortOrder,
      category: {
        id: row.id,
        slug: row.slug,
        name: localize(locale, row.name, row.nameAr),
        description: localize(locale, row.description, row.descriptionAr),
        icon: row.icon,
        imageUrl: row.imageUrl,
        productCount: row.products,
      } satisfies CategoryDTO,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || compareNames(a.category.name, b.category.name, locale))
    .map(({ category }) => category);
}
