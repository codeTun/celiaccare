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
   Photos and logos (Cloudinary)
   -------------------------------------------------------------------------- */

/** One <ImageUploadField> of a form: what it holds, its file input and its "Retirer …" box. */
export type ImageInput = { kind: "photo" | "logo"; file: string; remove: string };

/** The photo of restaurants and dishes (<ImageUploadField> default names). */
export const PHOTO_INPUT: ImageInput = { kind: "photo", file: "image", remove: "removeImage" };

/** The official logo of restaurants: <ImageUploadField name="logo" removeName="removeLogo">. */
export const LOGO_INPUT: ImageInput = { kind: "logo", file: "logo", remove: "removeLogo" };

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
 * Read the photo fields of a form (<ImageUploadField> names "image" and "removeImage",
 * or those given in `input`, e.g. LOGO_INPUT with the folder "logos"):
 *  - a new file → checked, then uploaded to Cloudinary in `folder`;
 *  - "Retirer la photo actuelle" ticked → null;
 *  - nothing → undefined (the current photo stays).
 * Call it AFTER the other fields are valid, so nothing is uploaded for a form with errors.
 */
export async function readPhotoChoice(
  formData: FormData,
  folder: "restaurants" | "dishes" | "logos",
  input: ImageInput = PHOTO_INPUT,
): Promise<PhotoChoice> {
  const file = formData.get(input.file);
  const removeCurrent = formData.get(input.remove) === "on";
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
    console.error(`[admin] ${input.file} upload failed`, error);
    const what = input.kind === "logo" ? "du logo" : "de la photo";
    return { ok: false, error: `L'envoi ${what} a échoué. Réessayez dans un instant.` };
  }
}

/**
 * The problems of the chosen files (wrong type, more than 5 MB), all checked BEFORE anything is
 * uploaded: a wrong logo never leaves a new photo uploaded for nothing, and both messages show at
 * once. {} when every chosen file is fine. (Without Cloudinary the chosen files are ignored anyway,
 * as in readPhotoChoice: nothing to check then.)
 */
export function imageFileErrors(
  formData: FormData,
  inputs: readonly ImageInput[] = [PHOTO_INPUT, LOGO_INPUT],
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (!isCloudinaryConfigured()) return errors;
  for (const input of inputs) {
    const file = formData.get(input.file);
    if (isEmptyFile(file)) continue;
    const problem = validateImageFile(file as File);
    if (problem) errors[input.file] = [problem];
  }
  return errors;
}

/** `data` of an error answer when a photo (or a logo) had been chosen (see withPhotoNotice). */
export type PhotoNotice = { photoNotSaved?: true; logoNotSaved?: true };

/**
 * The browser empties the file fields when a form comes back with errors: the answer then says
 * so (data.photoNotSaved / data.logoNotSaved), and the form asks the admin to choose them again.
 * `inputs`: the file fields to check (by default the photo and the logo).
 */
export function withPhotoNotice(
  state: ActionState,
  formData: FormData,
  inputs: readonly ImageInput[] = [PHOTO_INPUT, LOGO_INPUT],
): ActionState {
  const notice: PhotoNotice = {};
  for (const input of inputs) {
    if (isEmptyFile(formData.get(input.file))) continue;
    if (input.kind === "logo") notice.logoNotSaved = true;
    else notice.photoNotSaved = true;
  }
  return notice.photoNotSaved || notice.logoNotSaved ? { ...state, data: notice } : state;
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
