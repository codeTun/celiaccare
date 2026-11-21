"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  answer,
  deletePhotos,
  echoValues,
  hasFieldErrors,
  invalidState,
  isModelError,
  modelErrorState,
  refreshTags,
  saveWithPhotoAndLogo,
  withPhotoAndLogoErrors,
  zodFieldErrors,
  type FieldErrors,
} from "@/components/admin/catalog/action-helpers";
import { splitCoordinates } from "@/components/admin/catalog/coordinates";
import { auditLabel, PHOTO_SKIPPED_CODE } from "@/components/admin/catalog/labels";
import { coordinate, optionalSlug, socialAccount, verificationDate, websiteUrl } from "@/components/admin/catalog/schemas";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { getIpHash } from "@/lib/request";
import {
  checkbox,
  formDataToObject,
  governorate,
  idSchema,
  optionalEmail,
  optionalText,
  optionalTunisianPhone,
  requiredText,
  type ActionState,
} from "@/lib/validators";
import { deleteProducer } from "@/models/deleters/producers";
import { createProducer } from "@/models/posters/producers";
import { setProducerActive, updateProducer } from "@/models/puters/producers";
import { LISTED_GUARANTEE_LEVELS, PRODUCER_TYPES } from "@/types";
import type { ProducerInput, SlugDeleteResult } from "@/types/admin-data";

/* ==========================================================================
   Server Actions of the "Artisans" pages (producers = small businesses).
   Each one starts with requireAdmin(), validates everything (zod), writes an
   audit log line and refreshes the public pages (lib/cache-tags.ts:
   producer → producers, producer(slug) old and new, products, stats).
   ========================================================================== */

const LIST_PATH = "/admin/artisans";

const producerSchema = z.object({
  // Identité
  name: requiredText(120),
  type: z.enum(PRODUCER_TYPES, { error: "Choisissez le type d'artisan." }),
  slug: optionalSlug,
  description: optionalText(2000),
  // Adresse
  governorate,
  city: requiredText(80),
  address: optionalText(200),
  latitude: coordinate("latitude"),
  longitude: coordinate("longitude"),
  // Contacts
  phone: optionalTunisianPhone,
  whatsapp: optionalTunisianPhone,
  email: optionalEmail,
  website: websiteUrl,
  instagram: socialAccount,
  facebook: socialAccount,
  // Horaires
  openingHours: optionalText(500),
  // Garantie & pratiques
  // Policy "100 % sans gluten only": the older levels (NATURALLY_GF, TRACES_RISK) can no longer be chosen
  guaranteeLevel: z.enum(LISTED_GUARANTEE_LEVELS, { error: "Choisissez le niveau de garantie." }),
  dedicatedSpace: checkbox,
  dedicatedUtensils: checkbox,
  trainedStaff: checkbox,
  // Vérification (spec 6.1: required)
  verificationSource: requiredText(200),
  verifiedAt: verificationDate,
  // Version arabe, publication
  descriptionAr: optionalText(2000),
  isActive: checkbox,
});

type ProducerForm =
  | { ok: true; input: Omit<ProducerInput, "image" | "logo">; values: Record<string, string> }
  | { ok: false; state: ActionState };

/** Read and check the form (fields + photo + logo). Nothing is saved or uploaded here. */
function readProducerForm(formData: FormData): ProducerForm {
  const values = echoValues(formData);
  const raw = formDataToObject(formData);

  // "36.80649, 10.18153" (copied from Google Maps) typed in the latitude field → both fields.
  const pair = typeof raw.latitude === "string" && !String(raw.longitude ?? "").trim() ? splitCoordinates(raw.latitude) : null;
  if (pair) [raw.latitude, raw.longitude] = pair;

  const parsed = producerSchema.safeParse(raw);
  let fieldErrors: FieldErrors = zodFieldErrors(parsed.error);
  if (parsed.success && (parsed.data.latitude === null) !== (parsed.data.longitude === null)) {
    const missing = parsed.data.latitude === null ? "latitude" : "longitude";
    fieldErrors = { ...fieldErrors, [missing]: [`Indiquez aussi la ${missing}, ou videz les deux champs.`] };
  }
  fieldErrors = withPhotoAndLogoErrors(fieldErrors, formData);

  if (!parsed.success || hasFieldErrors(fieldErrors)) return { ok: false, state: invalidState(fieldErrors, values) };
  return { ok: true, input: parsed.data, values };
}

function refreshProducerPages(...slugs: (string | null | undefined)[]) {
  refreshTags(TAGS.producers, ...slugs.map((slug) => (slug ? TAGS.producer(slug) : null)), TAGS.products, TAGS.stats);
}

export async function createProducerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const form = readProducerForm(formData);
  if (!form.ok) return answer(form.state);

  const saved = await saveWithPhotoAndLogo(formData, "producers", form.values, (image, logo) =>
    createProducer({ ...form.input, image, logo }),
  );
  if (!saved.ok) return answer(saved.state);

  const { result } = saved;
  await logAdminAction(admin, "create", "producer", result.id, auditLabel(form.input.name, result.slug), await getIpHash());
  refreshProducerPages(result.slug);
  redirect(`${LIST_PATH}?ok=${saved.photoSkipped ? PHOTO_SKIPPED_CODE : "created"}`);
}

/** Bound on the server: `updateProducerAction.bind(null, producer.id)`. */
export async function updateProducerAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const producerId = idSchema.safeParse(id);
  if (!producerId.success) return answer({ status: "error", message: "Artisan introuvable." });

  const form = readProducerForm(formData);
  if (!form.ok) return answer(form.state);

  const saved = await saveWithPhotoAndLogo(formData, "producers", form.values, (image, logo) =>
    updateProducer(producerId.data, { ...form.input, image, logo }),
  );
  if (!saved.ok) return answer(saved.state);

  const { result } = saved;
  const details = result.previousSlug
    ? `${auditLabel(form.input.name, result.slug)}, ancien slug : ${result.previousSlug}`
    : auditLabel(form.input.name, result.slug);
  await logAdminAction(admin, "update", "producer", result.id, details, await getIpHash());
  refreshProducerPages(result.slug, result.previousSlug);
  redirect(`${LIST_PATH}?ok=${saved.photoSkipped ? PHOTO_SKIPPED_CODE : "updated"}`);
}

/**
 * Show / hide an artisan on the site from the list (QuickToggle, bound on the server:
 * `toggleProducerActiveAction.bind(null, producer.id, !producer.isActive)`). The list is refreshed.
 */
export async function toggleProducerActiveAction(id: number, isActive: boolean): Promise<void> {
  const admin = await requireAdmin();
  const parsed = z.object({ id: idSchema, isActive: z.boolean() }).safeParse({ id, isActive });
  if (parsed.success) {
    try {
      const result = await setProducerActive(parsed.data.id, parsed.data.isActive);
      await logAdminAction(
        admin,
        "status",
        "producer",
        result.id,
        `${result.slug} : ${result.isActive ? "affiché sur le site" : "masqué du site"}`,
        await getIpHash(),
      );
      refreshProducerPages(result.slug);
    } catch (error) {
      // Deleted in the meantime (ModelError NOT_FOUND): the refreshed list simply no longer shows it.
      if (!isModelError(error)) throw error;
    }
  }
  refresh();
}

/**
 * Delete an artisan (ConfirmDeleteButton, bound on the server). Refused while products
 * belong to it (ModelError IN_USE): the message is shown in the dialog.
 */
export async function deleteProducerAction(id: number): Promise<ActionState> {
  const admin = await requireAdmin();
  const producerId = idSchema.safeParse(id);
  if (!producerId.success) return answer({ status: "error", message: "Artisan introuvable." });

  let result: SlugDeleteResult;
  try {
    result = await deleteProducer(producerId.data);
  } catch (error) {
    return answer(modelErrorState(error));
  }

  await deletePhotos(result.imagesToDelete); // its photo and its logo
  await logAdminAction(admin, "delete", "producer", result.id, result.slug, await getIpHash());
  refreshProducerPages(result.slug);
  redirect(`${LIST_PATH}?ok=deleted`);
}
