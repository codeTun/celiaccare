import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { applyImageChange, assertId, chooseSlug, rethrowSlugConflict } from "@/models/fetchers/admin/helpers";
import { assertCategoryIcon, isCategorySlugTaken } from "@/models/posters/categories";
import type { CategoryInput, SlugMutationResult } from "@/types/admin-data";

import { refreshProductSearchText } from "./products";

/**
 * ADMIN — update a category. No auth check here: the Server Action calls requireAdmin() first,
 * then refreshes TAGS.categories and TAGS.products.
 */

export async function updateCategory(id: number, input: CategoryInput): Promise<SlugMutationResult> {
  assertId(id);
  assertCategoryIcon(input.icon);
  const current = await db.orm.public.Category.select("id", "slug", "name", "imagePublicId").first({ id });
  if (!current) throw new ModelError("NOT_FOUND", "Cette catégorie n'existe plus.");

  const slug = await chooseSlug({
    requested: input.slug,
    name: input.name,
    fallback: "categorie",
    isTaken: (candidate) => isCategorySlugTaken(candidate, id),
  });
  const image = applyImageChange(input.image, current.imagePublicId);

  try {
    await db.transaction(async (tx) => {
      const saved = await tx.orm.public.Category.where({ id }).update({
        slug,
        name: input.name,
        nameAr: input.nameAr,
        description: input.description,
        descriptionAr: input.descriptionAr,
        icon: input.icon,
        sortOrder: input.sortOrder,
        ...image.fields,
      });
      if (!saved) throw new ModelError("NOT_FOUND", "Cette catégorie n'existe plus."); // deleted meanwhile
      // The category name is part of the search text of its products.
      if (current.name !== input.name) await refreshProductSearchText({ categoryId: id }, tx);
    });
  } catch (error) {
    rethrowSlugConflict(error);
  }

  return {
    id,
    slug,
    previousSlug: current.slug !== slug ? current.slug : null,
    imagesToDelete: image.imagesToDelete,
  };
}
