"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getIpHash } from "@/lib/request";
import { formDataToObject, idSchema, submittedValues, validationError, type ActionState } from "@/lib/validators";
import { deleteRestaurant } from "@/models/deleters/restaurants";
import { createRestaurant } from "@/models/posters/restaurants";
import { setRestaurantActive, updateRestaurant } from "@/models/puters/restaurants";
import type { ActiveToggleResult, RestaurantInput, SlugDeleteResult, SlugMutationResult } from "@/types/admin-data";

import { RESTAURANT_FIELD_NAMES, restaurantFormSchema, toRestaurantInput, withEmptyFields } from "./form-schemas";
import {
  answer,
  deletePhotos,
  fieldError,
  imageFileErrors,
  LOGO_INPUT,
  modelErrorState,
  PHOTO_INPUT,
  readPhotoChoice,
  refreshRestaurantCaches,
  withPhotoNotice,
} from "./server-utils";

/* ==========================================================================
   Server Actions of the Restaurants pages (partner restaurants, "conventionnés").
   Each one starts with requireAdmin(), validates everything with zod, writes an
   audit log and refreshes the public pages of the restaurant.
   ========================================================================== */

const LIST_PATH = "/admin/restaurants";

/** ModelError codes of models/*restaurants.ts → the form field that gets the message. */
const RESTAURANT_ERROR_FIELDS: Record<string, string> = {
  SLUG_TAKEN: "slug",
  INVALID_GOVERNORATE: "governorate",
  INVALID_VERIFIED_AT: "verifiedAt",
  SOURCE_REQUIRED: "verificationSource",
  INVALID_PRICE_RANGE: "priceRange",
  INVALID_MIN_ORDER: "minOrder",
};

const UNKNOWN_RESTAURANT: ActionState = { status: "error", message: "Ce restaurant n'existe pas (ou plus)." };

/**
 * Validate the form AND the chosen files (type, size), then upload the photo and the logo (only when
 * everything is valid), then call `save`. Returns the error to show, or the result of the save
 * (`photoSkipped`: a photo or a logo was chosen but not sent, Cloudinary not configured).
 */
async function saveRestaurantForm(
  formData: FormData,
  save: (input: RestaurantInput) => Promise<SlugMutationResult>,
): Promise<{ error: ActionState } | { result: SlugMutationResult; photoSkipped: boolean }> {
  const parsed = restaurantFormSchema.safeParse(withEmptyFields(RESTAURANT_FIELD_NAMES, formDataToObject(formData)));
  const fileErrors = imageFileErrors(formData);
  if (!parsed.success || Object.keys(fileErrors).length > 0) {
    const invalid: ActionState = parsed.success
      ? { status: "error", message: "invalid", values: submittedValues(formData) }
      : validationError(parsed.error, formData);
    // "choose it again" only under the chosen files that have no error of their own
    const reselect = [PHOTO_INPUT, LOGO_INPUT].filter((input) => !fileErrors[input.file]);
    return { error: withPhotoNotice({ ...invalid, fieldErrors: { ...invalid.fieldErrors, ...fileErrors } }, formData, reselect) };
  }

  const photo = await readPhotoChoice(formData, "restaurants");
  // (the logo, if one was chosen, was not sent either: the answer says so)
  if (!photo.ok) return { error: withPhotoNotice(fieldError("image", photo.error, formData), formData, [LOGO_INPUT]) };

  const logo = await readPhotoChoice(formData, "logos", LOGO_INPUT);
  if (!logo.ok) {
    await deletePhotos([photo.uploaded?.publicId]); // the new photo would stay unused
    return { error: withPhotoNotice(fieldError("logo", logo.error, formData), formData, [PHOTO_INPUT]) };
  }

  try {
    const result = await save(toRestaurantInput(parsed.data, photo.change, logo.change));
    return { result, photoSkipped: photo.skipped || logo.skipped };
  } catch (error) {
    await deletePhotos([photo.uploaded?.publicId, logo.uploaded?.publicId]); // they would stay unused
    return { error: withPhotoNotice(modelErrorState(error, formData, RESTAURANT_ERROR_FIELDS), formData) };
  }
}

/** Create a restaurant, then back to the list. */
export async function createRestaurantAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();

  const saved = await saveRestaurantForm(formData, createRestaurant);
  if ("error" in saved) return answer(saved.error);

  const { result, photoSkipped } = saved;
  await logAdminAction(admin, "create", "restaurant", result.id, `Restaurant « ${result.slug} » créé`, await getIpHash());
  refreshRestaurantCaches(result.slug);
  redirect(`${LIST_PATH}?ok=${photoSkipped ? "created-without-photo" : "created"}`);
}

/** Save the edit form (bound on the server: updateRestaurantAction.bind(null, restaurant.id)). */
export async function updateRestaurantAction(restaurantId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(restaurantId);
  if (!id.success) return answer(UNKNOWN_RESTAURANT);

  const saved = await saveRestaurantForm(formData, (input) => updateRestaurant(id.data, input));
  if ("error" in saved) return answer(saved.error);

  const { result, photoSkipped } = saved;
  await deletePhotos(result.imagesToDelete); // replaced or removed photo / logo
  const renamed = result.previousSlug ? ` (ancienne adresse « ${result.previousSlug} »)` : "";
  await logAdminAction(admin, "update", "restaurant", result.id, `Restaurant « ${result.slug} » modifié${renamed}`, await getIpHash());
  refreshRestaurantCaches(result.slug, result.previousSlug);
  redirect(`${LIST_PATH}?ok=${photoSkipped ? "updated-without-photo" : "updated"}`);
}

/**
 * Delete a restaurant with its dishes and reviews (past orders keep their history).
 * Used with ConfirmDeleteButton. From the list (hidden field stay=1) the page is simply
 * refreshed; from the edit page, back to the list with a confirmation.
 */
export async function deleteRestaurantAction(restaurantId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(restaurantId);
  if (!id.success) return answer(UNKNOWN_RESTAURANT);

  let result: SlugDeleteResult;
  try {
    result = await deleteRestaurant(id.data);
  } catch (error) {
    return answer(modelErrorState(error, null));
  }

  await deletePhotos(result.imagesToDelete); // the restaurant photo and logo, and the photos of its dishes
  await logAdminAction(admin, "delete", "restaurant", result.id, `Restaurant « ${result.slug} » supprimé avec son menu`, await getIpHash());
  refreshRestaurantCaches(result.slug);
  if (formData.get("stay") === "1") return answer({ status: "success", message: "Restaurant supprimé." });
  redirect(`${LIST_PATH}?ok=deleted`);
}

/**
 * Quick toggle of the list: show (true) or hide (false) the restaurant on the site.
 * Bound on the server: setRestaurantActiveAction.bind(null, restaurant.id, !restaurant.isActive)
 * (the form values are not needed).
 */
export async function setRestaurantActiveAction(restaurantId: number, isActive: boolean): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(restaurantId);
  const active = z.boolean().safeParse(isActive);
  if (!id.success || !active.success) return answer(UNKNOWN_RESTAURANT);

  let result: ActiveToggleResult;
  try {
    result = await setRestaurantActive(id.data, active.data);
  } catch (error) {
    return answer(modelErrorState(error, null));
  }

  await logAdminAction(
    admin,
    "status",
    "restaurant",
    result.id,
    result.isActive ? `« ${result.slug} » affiché sur le site` : `« ${result.slug} » masqué du site`,
    await getIpHash(),
  );
  refreshRestaurantCaches(result.slug);
  return answer({ status: "success", message: result.isActive ? "Restaurant affiché." : "Restaurant masqué." });
}
