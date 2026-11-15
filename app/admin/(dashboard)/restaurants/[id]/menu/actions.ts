"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getIpHash } from "@/lib/request";
import { formDataToObject, idSchema, validationError, type ActionState } from "@/lib/validators";
import { deleteDish } from "@/models/deleters/dishes";
import { createDish } from "@/models/posters/dishes";
import { setDishAvailable, updateDish } from "@/models/puters/dishes";
import type { DishInput, DishMutationResult } from "@/types/admin-data";

import { DISH_FIELD_NAMES, dishFormSchema, toDishInput, withEmptyFields } from "../../form-schemas";
import {
  answer,
  deletePhotos,
  fieldError,
  modelErrorState,
  readPhotoChoice,
  refreshMenuCaches,
  withPhotoNotice,
} from "../../server-utils";

/* ==========================================================================
   Server Actions of the menu pages (/admin/restaurants/[id]/menu).
   Each one starts with requireAdmin(), validates everything with zod, writes an
   audit log and refreshes the public page of the restaurant.
   ========================================================================== */

const menuPath = (restaurantId: number) => `/admin/restaurants/${restaurantId}/menu`;

/** ModelError codes of models/*dishes.ts → the form field that gets the message. */
const DISH_ERROR_FIELDS: Record<string, string> = {
  INVALID_PRICE: "price",
  INVALID_SORT_ORDER: "sortOrder",
  INGREDIENT_NOT_FOUND: "ingredientIds",
};

const UNKNOWN_DISH: ActionState = { status: "error", message: "Ce plat n'existe pas (ou plus)." };

/**
 * Validate the form, then the photo (uploaded only when everything else is valid),
 * then call `save`. Returns the error to show, or the result of the save.
 */
async function saveDishForm(
  formData: FormData,
  save: (input: DishInput) => Promise<DishMutationResult>,
): Promise<{ error: ActionState } | { result: DishMutationResult; name: string; photoSkipped: boolean }> {
  const parsed = dishFormSchema.safeParse(withEmptyFields(DISH_FIELD_NAMES, formDataToObject(formData, ["ingredientIds"])));
  if (!parsed.success) return { error: withPhotoNotice(validationError(parsed.error, formData), formData) };

  const photo = await readPhotoChoice(formData, "dishes");
  if (!photo.ok) return { error: fieldError("image", photo.error, formData) };

  try {
    const result = await save(toDishInput(parsed.data, photo.change));
    return { result, name: parsed.data.name, photoSkipped: photo.skipped };
  } catch (error) {
    await deletePhotos([photo.uploaded?.publicId]); // the new photo would stay unused
    return { error: withPhotoNotice(modelErrorState(error, formData, DISH_ERROR_FIELDS), formData) };
  }
}

/** Add a dish to the menu (bound on the server: createDishAction.bind(null, restaurant.id)). */
export async function createDishAction(restaurantId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(restaurantId);
  if (!id.success) return answer({ status: "error", message: "Ce restaurant n'existe pas (ou plus)." });

  const saved = await saveDishForm(formData, (input) => createDish(id.data, input));
  if ("error" in saved) return answer(saved.error);

  const { result, name, photoSkipped } = saved;
  await logAdminAction(admin, "create", "dish", result.id, `« ${name} » ajouté au menu de « ${result.restaurantSlug} »`, await getIpHash());
  refreshMenuCaches(result.restaurantSlug);
  redirect(`${menuPath(result.restaurantId)}?ok=${photoSkipped ? "created-without-photo" : "created"}`);
}

/** Save the dish edit form (bound on the server: updateDishAction.bind(null, dish.id)). */
export async function updateDishAction(dishId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(dishId);
  if (!id.success) return answer(UNKNOWN_DISH);

  const saved = await saveDishForm(formData, (input) => updateDish(id.data, input));
  if ("error" in saved) return answer(saved.error);

  const { result, name, photoSkipped } = saved;
  await deletePhotos(result.imagesToDelete); // replaced or removed photo
  await logAdminAction(admin, "update", "dish", result.id, `« ${name} » modifié (menu de « ${result.restaurantSlug} »)`, await getIpHash());
  refreshMenuCaches(result.restaurantSlug);
  redirect(`${menuPath(result.restaurantId)}?ok=${photoSkipped ? "updated-without-photo" : "updated"}`);
}

/**
 * Remove a dish from the menu (ConfirmDeleteButton). Past orders keep their lines.
 * From the menu (hidden field stay=1) the page is refreshed; from the edit page, back to the menu.
 */
export async function deleteDishAction(dishId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(dishId);
  if (!id.success) return answer(UNKNOWN_DISH);

  let result: DishMutationResult;
  try {
    result = await deleteDish(id.data);
  } catch (error) {
    return answer(modelErrorState(error, null));
  }

  await deletePhotos(result.imagesToDelete);
  await logAdminAction(admin, "delete", "dish", result.id, `Plat retiré du menu de « ${result.restaurantSlug} »`, await getIpHash());
  refreshMenuCaches(result.restaurantSlug);
  if (formData.get("stay") === "1") return answer({ status: "success", message: "Plat supprimé." });
  redirect(`${menuPath(result.restaurantId)}?ok=deleted`);
}

/**
 * Quick toggle of the menu: available (true) or "épuisé" (false, cannot be ordered).
 * Bound on the server: setDishAvailableAction.bind(null, dish.id, !dish.isAvailable).
 */
export async function setDishAvailableAction(dishId: number, isAvailable: boolean): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(dishId);
  const available = z.boolean().safeParse(isAvailable);
  if (!id.success || !available.success) return answer(UNKNOWN_DISH);

  let result: DishMutationResult;
  try {
    result = await setDishAvailable(id.data, available.data);
  } catch (error) {
    return answer(modelErrorState(error, null));
  }

  await logAdminAction(
    admin,
    "status",
    "dish",
    result.id,
    available.data ? "Plat de nouveau disponible" : "Plat marqué indisponible",
    await getIpHash(),
  );
  refreshMenuCaches(result.restaurantSlug);
  return answer({ status: "success", message: available.data ? "Plat disponible." : "Plat indisponible." });
}
