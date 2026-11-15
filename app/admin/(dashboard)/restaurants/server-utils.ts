import "server-only";

import { refresh, updateTag } from "next/cache";

import { TAGS } from "@/lib/cache-tags";
import { deleteImage, isCloudinaryConfigured, isEmptyFile, uploadImage, validateImageFile } from "@/lib/cloudinary";
import { submittedValues, type ActionState } from "@/lib/validators";
import { ModelError } from "@/models/errors";
import type { ImageChange, UploadedImageRef } from "@/types/admin-data";

/* ==========================================================================
   Helpers shared by the Server Actions of the restaurants and menus pages.
   ========================================================================== */

/**
 * Send a result back to the form AND refresh the page data.
 * refresh() also avoids a Next.js 16.4 development-mode bug with forms sent before the
 * page's JavaScript has loaded (see app/admin/login/actions.ts).
 */
export function answer(state: ActionState): ActionState {
  refresh();
  return state;
}

/** An error under one field, with the submitted values (to refill the form). */
export function fieldError(field: string, message: string, formData: FormData): ActionState {
  return { status: "error", message: "invalid", fieldErrors: { [field]: [message] }, values: submittedValues(formData) };
}

/**
 * Turn an error thrown by a model into a form answer:
 *  - a ModelError whose code is in `fieldOf` → message under that field;
 *  - another ModelError → its (French) message at the top of the form;
 *  - anything else (database down...) → logged, generic message ("L'enregistrement a échoué").
 */
export function modelErrorState(error: unknown, formData: FormData | null, fieldOf: Record<string, string> = {}): ActionState {
  const values = formData ? submittedValues(formData) : undefined;
  if (error instanceof ModelError) {
    const field = Object.hasOwn(fieldOf, error.code) ? fieldOf[error.code] : null;
    if (field) return { status: "error", message: "invalid", fieldErrors: { [field]: [error.message] }, values };
    return { status: "error", message: error.message, values };
  }
  console.error("[admin] unexpected error", error);
  return { status: "error", message: "error", values };
}

/* --------------------------------------------------------------------------
   Photos (Cloudinary)
   -------------------------------------------------------------------------- */

export type PhotoChoice =
  | {
      ok: true;
      /** What to save: undefined = keep, null = remove, { url, publicId } = new photo. */
      change: ImageChange;
      /** The photo uploaded by this request (to delete again if the save fails). */
      uploaded: UploadedImageRef | null;
      /** A photo was chosen but Cloudinary is not configured: saved without it. */
      skipped: boolean;
    }
  | { ok: false; error: string };

/**
 * Read the photo fields of a form (<ImageUploadField> names "image" and "removeImage"):
 *  - a new file → checked, then uploaded to Cloudinary in `folder`;
 *  - "Retirer la photo actuelle" ticked → null;
 *  - nothing → undefined (the current photo stays).
 * Call it AFTER the other fields are valid, so nothing is uploaded for a form with errors.
 */
export async function readPhotoChoice(formData: FormData, folder: "restaurants" | "dishes"): Promise<PhotoChoice> {
  const file = formData.get("image");
  const removeCurrent = formData.get("removeImage") === "on";
  const keepOrRemove: ImageChange = removeCurrent ? null : undefined;

  if (isEmptyFile(file)) return { ok: true, change: keepOrRemove, uploaded: null, skipped: false };
  if (!isCloudinaryConfigured()) return { ok: true, change: keepOrRemove, uploaded: null, skipped: true };

  const photo = file as File;
  const problem = validateImageFile(photo);
  if (problem) return { ok: false, error: problem };
  try {
    const { url, publicId } = await uploadImage(photo, folder);
    return { ok: true, change: { url, publicId }, uploaded: { url, publicId }, skipped: false };
  } catch (error) {
    console.error("[admin] photo upload failed", error);
    return { ok: false, error: "L'envoi de la photo a échoué. Réessayez dans un instant." };
  }
}

/** `data` of an error answer when a photo had been chosen (see withPhotoNotice). */
export type PhotoNotice = { photoNotSaved: true };

/**
 * The browser empties the file field when a form comes back with errors: the answer then says
 * so (data.photoNotSaved), and the form asks the admin to choose the photo again.
 */
export function withPhotoNotice(state: ActionState, formData: FormData): ActionState {
  if (isEmptyFile(formData.get("image"))) return state;
  const notice: PhotoNotice = { photoNotSaved: true };
  return { ...state, data: notice };
}

/** Delete photos that are no longer used (after a successful save or delete). Never throws. */
export async function deletePhotos(publicIds: readonly (string | null | undefined)[]) {
  await Promise.all(publicIds.map((publicId) => deleteImage(publicId)));
}

/* --------------------------------------------------------------------------
   Public caches (lib/cache-tags.ts: restaurant → restaurants, restaurant(slug), stats)
   -------------------------------------------------------------------------- */

/** After a restaurant change: its list, its page (old AND new address) and the site figures. */
export function refreshRestaurantCaches(slug: string, previousSlug: string | null = null) {
  updateTag(TAGS.restaurants);
  updateTag(TAGS.restaurant(slug));
  if (previousSlug && previousSlug !== slug) updateTag(TAGS.restaurant(previousSlug));
  updateTag(TAGS.stats);
}

/** After a dish change (lib/cache-tags.ts: dish → restaurants, restaurant(slug)). */
export function refreshMenuCaches(restaurantSlug: string) {
  updateTag(TAGS.restaurants);
  if (restaurantSlug) updateTag(TAGS.restaurant(restaurantSlug));
}
