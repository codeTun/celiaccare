import "server-only";

import { and } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { applyImageChange, chooseSlug, rethrowSlugConflict } from "@/models/fetchers/admin/helpers";
import type { CategoryInput, SlugMutationResult } from "@/types/admin-data";

/**
 * ADMIN — create a category. No auth check here: the Server Action calls requireAdmin() first,
 * then refreshes TAGS.categories and TAGS.products.
 */

/** Is this slug already used by another category? (`exceptId` = the category being edited) */
export async function isCategorySlugTaken(slug: string, exceptId?: number) {
  const row = await db.orm.public.Category.select("id")
    .where((c) => (exceptId === undefined ? c.slug.eq(slug) : and(c.slug.eq(slug), c.id.neq(exceptId))))
    .first();
  return row !== null;
}

/**
 * The icon is a key of CATEGORY_ICONS in lib/icons.ts ("bread", "pastry"...). The Server Action
 * checks it against that list (lib/icons.ts imports React icons, so models do not import it);
 * here we only refuse values that cannot be a key. Unknown keys are shown with the "package" icon.
 */
export function assertCategoryIcon(icon: string) {
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(icon)) {
    throw new ModelError("INVALID_ICON", "Choisissez une icône dans la liste.");
  }
}

export async function createCategory(input: CategoryInput): Promise<SlugMutationResult> {
  assertCategoryIcon(input.icon);
  const slug = await chooseSlug({
    requested: input.slug,
    name: input.name,
    fallback: "categorie",
    isTaken: (candidate) => isCategorySlugTaken(candidate),
  });
  const image = applyImageChange(input.image, null);

  try {
    const row = await db.orm.public.Category.create({
      slug,
      name: input.name,
      nameAr: input.nameAr,
      description: input.description,
      descriptionAr: input.descriptionAr,
      icon: input.icon,
      sortOrder: input.sortOrder,
      ...image.fields,
    });
    return { id: row.id, slug: row.slug, previousSlug: null, imagesToDelete: [] };
  } catch (error) {
    rethrowSlugConflict(error);
  }
}
