"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  answer,
  deletePhotos,
  echoValues,
  hasFieldErrors,
  invalidState,
  modelErrorState,
  refreshTags,
  saveWithPhoto,
  withPhotoErrors,
  zodFieldErrors,
} from "@/components/admin/catalog/action-helpers";
import { auditLabel, PHOTO_SKIPPED_CODE } from "@/components/admin/catalog/labels";
import { optionalSlug, sortOrder } from "@/components/admin/catalog/schemas";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { isCategoryIconKey } from "@/lib/category-icons";
import { getIpHash } from "@/lib/request";
import { formDataToObject, idSchema, optionalText, requiredText, type ActionState } from "@/lib/validators";
import { deleteCategory } from "@/models/deleters/categories";
import { listCategories } from "@/models/fetchers/admin/categories";
import { createCategory } from "@/models/posters/categories";
import { updateCategory } from "@/models/puters/categories";
import type { AdminCategoryRow, CategoryInput, SlugDeleteResult } from "@/types/admin-data";

/* ==========================================================================
   Server Actions of the "Catégories" pages. Each one starts with requireAdmin(),
   validates everything (zod), writes an audit log line and refreshes the public
   pages that show categories (lib/cache-tags.ts: category → categories, products).
   ========================================================================== */

const LIST_PATH = "/admin/categories";

const categorySchema = z.object({
  name: requiredText(80),
  slug: optionalSlug,
  description: optionalText(600),
  icon: z.string({ error: "Choisissez une icône." }).refine(isCategoryIconKey, "Choisissez une icône dans la liste."),
  sortOrder,
  nameAr: optionalText(80),
  descriptionAr: optionalText(600),
});

type CategoryForm = { ok: true; input: Omit<CategoryInput, "image">; values: Record<string, string> } | { ok: false; state: ActionState };

/** Read and check the form (fields + photo). Nothing is saved or uploaded here. */
function readCategoryForm(formData: FormData): CategoryForm {
  const values = echoValues(formData);
  const parsed = categorySchema.safeParse(formDataToObject(formData));
  const fieldErrors = withPhotoErrors(zodFieldErrors(parsed.error), formData);
  if (!parsed.success || hasFieldErrors(fieldErrors)) return { ok: false, state: invalidState(fieldErrors, values) };
  return { ok: true, input: parsed.data, values };
}

/**
 * Spec 6.3: one distinct icon per category. Refuse an icon used by ANOTHER category,
 * unless this category already had it (old data is not blocked).
 */
function iconTakenError(categories: AdminCategoryRow[], icon: string, current: AdminCategoryRow | null): string | null {
  if (current?.icon === icon) return null;
  const owner = categories.find((category) => category.icon === icon && category.id !== current?.id);
  return owner ? `Cette icône est déjà utilisée par « ${owner.name} » : choisissez-en une autre.` : null;
}

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const form = readCategoryForm(formData);
  if (!form.ok) return answer(form.state);

  const iconError = iconTakenError(await listCategories(), form.input.icon, null);
  if (iconError) return answer(invalidState({ icon: [iconError] }, form.values));

  const saved = await saveWithPhoto(formData, "categories", form.values, (image) => createCategory({ ...form.input, image }));
  if (!saved.ok) return answer(saved.state);

  await logAdminAction(admin, "create", "category", saved.result.id, auditLabel(form.input.name, saved.result.slug), await getIpHash());
  refreshTags(TAGS.categories, TAGS.products);
  redirect(`${LIST_PATH}?ok=${saved.photoSkipped ? PHOTO_SKIPPED_CODE : "created"}`);
}

/** Bound on the server: `updateCategoryAction.bind(null, category.id)`. */
export async function updateCategoryAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const categoryId = idSchema.safeParse(id);
  if (!categoryId.success) return answer({ status: "error", message: "Catégorie introuvable." });

  const form = readCategoryForm(formData);
  if (!form.ok) return answer(form.state);

  const categories = await listCategories();
  const current = categories.find((category) => category.id === categoryId.data);
  if (!current) {
    return answer({ status: "error", message: "Cette catégorie n'existe plus : elle a sans doute été supprimée.", values: form.values });
  }
  const iconError = iconTakenError(categories, form.input.icon, current);
  if (iconError) return answer(invalidState({ icon: [iconError] }, form.values));

  const saved = await saveWithPhoto(formData, "categories", form.values, (image) =>
    updateCategory(categoryId.data, { ...form.input, image }),
  );
  if (!saved.ok) return answer(saved.state);

  const { result } = saved;
  const details = result.previousSlug ? `${auditLabel(form.input.name, result.slug)}, ancien slug : ${result.previousSlug}` : auditLabel(form.input.name, result.slug);
  await logAdminAction(admin, "update", "category", result.id, details, await getIpHash());
  refreshTags(TAGS.categories, TAGS.products);
  redirect(`${LIST_PATH}?ok=${saved.photoSkipped ? PHOTO_SKIPPED_CODE : "updated"}`);
}

/**
 * Delete a category (ConfirmDeleteButton, bound on the server: `deleteCategoryAction.bind(null, id)`).
 * Refused while products belong to it (ModelError IN_USE): the message is shown in the dialog.
 */
export async function deleteCategoryAction(id: number): Promise<ActionState> {
  const admin = await requireAdmin();
  const categoryId = idSchema.safeParse(id);
  if (!categoryId.success) return answer({ status: "error", message: "Catégorie introuvable." });

  let result: SlugDeleteResult;
  try {
    result = await deleteCategory(categoryId.data);
  } catch (error) {
    return answer(modelErrorState(error));
  }

  await deletePhotos(result.imagesToDelete);
  await logAdminAction(admin, "delete", "category", result.id, result.slug, await getIpHash());
  refreshTags(TAGS.categories, TAGS.products);
  redirect(`${LIST_PATH}?ok=deleted`);
}
