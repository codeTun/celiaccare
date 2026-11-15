import "server-only";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";

import { deleteImage, isCloudinaryConfigured, isEmptyFile, uploadImage, validateImageFile } from "@/lib/cloudinary";
import { submittedValues, type ActionState } from "@/lib/validators";
import type { ImageChange } from "@/types/admin-data";

/* ==========================================================================
   Server-side helpers shared by the Server Actions of the catalogue
   (catégories, ingrédients, artisans, produits): answers sent back to the
   forms, French error messages, Cloudinary photos and cache refresh.
   Only import this file from the "use server" action files: it never checks
   the session itself (each action calls requireAdmin() first).
   ========================================================================== */

export type FieldErrors = Record<string, string[] | undefined>;

/**
 * Send a state back to the form AND refresh the page data (same pattern as
 * securite/actions.ts: refresh() also avoids a Next.js 16.4 development bug with
 * forms sent before the page's JavaScript has loaded).
 */
export function answer(state: ActionState): ActionState {
  refresh();
  return state;
}

/** The submitted text values, to refill the form; checkbox lists (`listKeys`) are joined with commas. */
export function echoValues(formData: FormData, listKeys: readonly string[] = []): Record<string, string> {
  const values = submittedValues(formData);
  for (const key of listKeys) {
    values[key] = formData
      .getAll(key)
      .filter((value): value is string => typeof value === "string")
      .join(",");
  }
  return values;
}

/** zod errors per field (zod 4: z.flattenError, not error.flatten()). */
export function zodFieldErrors(error: z.ZodError | undefined): FieldErrors {
  return error ? (z.flattenError(error).fieldErrors as FieldErrors) : {};
}

export function hasFieldErrors(fieldErrors: FieldErrors): boolean {
  return Object.values(fieldErrors).some((messages) => messages && messages.length > 0);
}

/** "Some fields are invalid": the generic message at the top + one message under each wrong field. */
export function invalidState(fieldErrors: FieldErrors, values: Record<string, string>): ActionState {
  return { status: "error", message: "invalid", fieldErrors, values };
}

/** Invalidate public cache tags (lib/cache-tags.ts), each once. Empty values are skipped. */
export function refreshTags(...tags: (string | null | undefined)[]) {
  for (const tag of new Set(tags)) {
    if (tag) updateTag(tag);
  }
}

/* --------------------------------------------------------------------------
   Errors of the data layer (models/errors.ts ModelError) → French messages
   -------------------------------------------------------------------------- */

/** Where to show each ModelError code: under a field, or at the top of the form. */
const MODEL_ERRORS: Record<string, { field?: string; message?: string }> = {
  SLUG_TAKEN: {
    field: "slug",
    message: "Cette adresse (slug) est déjà utilisée par une autre fiche : modifiez-la, ou laissez le champ vide.",
  },
  NOT_FOUND: { message: "Cette fiche n'existe plus : elle a sans doute été supprimée entre-temps." },
  INVALID_ID: { message: "Fiche introuvable (identifiant invalide)." },
  IN_USE: {}, // the model message says why (e.g. "Cette catégorie contient encore des produits (3 produits)…")
  CATEGORY_NOT_FOUND: { field: "categoryId", message: "Cette catégorie n'existe plus. Rechargez la page." },
  PRODUCER_NOT_FOUND: { field: "producerId", message: "Cet artisan n'existe plus. Rechargez la page." },
  INGREDIENT_NOT_FOUND: { field: "ingredientIds", message: "Un des ingrédients cochés n'existe plus. Rechargez la page." },
  INVALID_PRICE: { field: "price", message: "Prix invalide." },
  INVALID_VERIFIED_AT: {
    field: "verifiedAt",
    message: "Date de vérification invalide : elle ne peut pas être dans le futur.",
  },
  SOURCE_REQUIRED: { field: "verificationSource", message: "Indiquez comment l'information a été vérifiée." },
  INVALID_GOVERNORATE: { field: "governorate", message: "Choisissez un gouvernorat dans la liste." },
  INVALID_ICON: { field: "icon", message: "Choisissez une icône dans la liste." },
};

type ModelErrorLike = Error & { code: string };

/** An expected business error of the data layer (models/errors.ts), e.g. code "NOT_FOUND". */
export function isModelError(error: unknown): error is ModelErrorLike {
  return error instanceof Error && error.name === "ModelError" && typeof (error as { code?: unknown }).code === "string";
}

/**
 * The form state for an error thrown by a model function. Unexpected errors (database down…)
 * are logged on the server and shown as a generic "L'enregistrement a échoué".
 */
export function modelErrorState(error: unknown, values?: Record<string, string>): ActionState {
  if (!isModelError(error)) {
    console.error("[admin catalogue] unexpected error", error);
    return { status: "error", message: "error", values };
  }
  const known = Object.hasOwn(MODEL_ERRORS, error.code) ? MODEL_ERRORS[error.code] : undefined;
  const message = known?.message ?? error.message;
  if (known?.field) return { status: "error", message: "invalid", fieldErrors: { [known.field]: [message] }, values };
  return { status: "error", message, values };
}

/* --------------------------------------------------------------------------
   Photos (Cloudinary). Field names are those of <ImageUploadField>:
   "image" (the file) and "removeImage" (the "Retirer la photo actuelle" box).
   -------------------------------------------------------------------------- */

export type PhotoFolder = "categories" | "producers" | "products";

const PHOTO_FIELD = "image";
const REMOVE_PHOTO_FIELD = "removeImage";

const RESELECT_PHOTO = "Choisissez à nouveau la photo : elle n'a pas été envoyée car d'autres champs sont à corriger.";
const UPLOAD_FAILED = "L'envoi de la photo vers Cloudinary a échoué. Réessayez, ou enregistrez sans changer la photo.";

/**
 * Add the photo problems to the field errors, BEFORE anything is uploaded or saved:
 * wrong type / too heavy; and, when other fields are wrong, a reminder to choose the
 * photo again (the browser forgets the chosen file after the submission).
 */
export function withPhotoErrors(fieldErrors: FieldErrors, formData: FormData): FieldErrors {
  const file = formData.get(PHOTO_FIELD);
  if (isEmptyFile(file)) return fieldErrors;
  const problem = validateImageFile(file as File);
  if (problem) return { ...fieldErrors, [PHOTO_FIELD]: [problem] };
  // (Without Cloudinary the photo is ignored anyway: no reminder then.)
  if (hasFieldErrors(fieldErrors) && isCloudinaryConfigured()) return { ...fieldErrors, [PHOTO_FIELD]: [RESELECT_PHOTO] };
  return fieldErrors;
}

/** Delete photos that are not used any more. Never throws (deleteImage ignores Cloudinary errors). */
export async function deletePhotos(publicIds: readonly (string | null | undefined)[]) {
  await Promise.all(publicIds.map((publicId) => deleteImage(publicId)));
}

type PreparedPhoto = {
  /** What the model must do with the photo (undefined = keep the current one, null = remove it). */
  change: ImageChange;
  /** Cloudinary id of the photo uploaded by this request (deleted again if the save fails). */
  uploadedPublicId: string | null;
  /** A new photo was chosen but Cloudinary is not configured: the sheet is saved without it. */
  skipped: boolean;
};

async function preparePhoto(formData: FormData, folder: PhotoFolder): Promise<PreparedPhoto> {
  const file = formData.get(PHOTO_FIELD);
  if (!isEmptyFile(file)) {
    if (!isCloudinaryConfigured()) return { change: undefined, uploadedPublicId: null, skipped: true };
    const image = await uploadImage(file as File, folder);
    return { change: { url: image.url, publicId: image.publicId }, uploadedPublicId: image.publicId, skipped: false };
  }
  if (formData.get(REMOVE_PHOTO_FIELD) === "on") return { change: null, uploadedPublicId: null, skipped: false };
  return { change: undefined, uploadedPublicId: null, skipped: false };
}

export type SaveResult<T> = { ok: true; result: T; photoSkipped: boolean } | { ok: false; state: ActionState };

/**
 * Save a sheet that has a photo, with Cloudinary kept tidy:
 *  1. the new photo is uploaded (only now: the fields were validated before);
 *  2. `save(image)` calls the model (createX / updateX);
 *  3. the save failed → the photo uploaded in step 1 is deleted again;
 *     the save worked → the photos the model replaced or removed are deleted.
 * Returns the model result, or the error state to send back to the form.
 */
export async function saveWithPhoto<T extends { imagesToDelete: string[] }>(
  formData: FormData,
  folder: PhotoFolder,
  values: Record<string, string>,
  save: (image: ImageChange) => Promise<T>,
): Promise<SaveResult<T>> {
  let photo: PreparedPhoto;
  try {
    photo = await preparePhoto(formData, folder);
  } catch (error) {
    console.error("[admin catalogue] photo upload failed", error);
    return { ok: false, state: invalidState({ [PHOTO_FIELD]: [UPLOAD_FAILED] }, values) };
  }

  let result: T;
  try {
    result = await save(photo.change);
  } catch (error) {
    await deletePhotos([photo.uploadedPublicId]);
    return { ok: false, state: modelErrorState(error, values) };
  }

  await deletePhotos(result.imagesToDelete);
  return { ok: true, result, photoSkipped: photo.skipped };
}
