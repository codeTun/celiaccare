"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getIpHash } from "@/lib/request";
import {
  checkbox,
  formDataToObject,
  idSchema,
  optionalText,
  requiredText,
  submittedValues,
  tunisianPhone,
  validationError,
  type ActionState,
} from "@/lib/validators";
import { ModelError } from "@/models/errors";
import { deleteDeliverer } from "@/models/deleters/deliverers";
import { createDeliverer } from "@/models/posters/deliverers";
import { setDelivererActive, updateDeliverer } from "@/models/puters/deliverers";
import { VEHICLE_TYPES } from "@/types";

/* ==========================================================================
   Server Actions of the delivery people (Livraisons → Livreurs).
   requireAdmin() first, zod validation, audit log. Deliverers are never shown
   on the public site: no cache to refresh.
   ========================================================================== */

const DELIVERERS_PATH = "/admin/livraisons/livreurs";

const delivererSchema = z.object({
  name: requiredText(80, 2),
  phone: tunisianPhone,
  vehicle: z.enum(VEHICLE_TYPES, { error: "Choisissez un véhicule." }),
  zone: optionalText(120),
  isActive: checkbox,
  notes: optionalText(500),
});

/** Model errors → message under the right field (or at the top of the form / in the dialog). */
const KNOWN_ERRORS: Record<string, { field?: string; message: string }> = {
  INVALID_PHONE: { field: "phone", message: "Numéro tunisien invalide (8 chiffres)." },
  PHONE_TAKEN: { field: "phone", message: "Un autre livreur utilise déjà ce numéro." },
  NOT_FOUND: { message: "Ce livreur n'existe plus." },
  INVALID_ID: { message: "Livreur introuvable." },
};

/** Answer the form (with the typed values) and refresh the page data. */
function answer(state: ActionState): ActionState {
  refresh();
  return state;
}

function failure(error: unknown, formData?: FormData): ActionState {
  const values = formData ? submittedValues(formData) : undefined;
  if (error instanceof ModelError) {
    const known = KNOWN_ERRORS[error.code];
    if (known?.field) return answer({ status: "error", message: "invalid", fieldErrors: { [known.field]: [known.message] }, values });
    // e.g. IN_USE: "Ce livreur a 1 commande en cours de livraison…" (message written by the model)
    return answer({ status: "error", message: known?.message ?? error.message, values });
  }
  console.error("[admin/livreurs] action failed", error);
  return answer({ status: "error", message: "error", values });
}

export async function createDelivererAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = delivererSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return answer(validationError(parsed.error, formData));

  let deliverer;
  try {
    deliverer = await createDeliverer(parsed.data);
  } catch (error) {
    return failure(error, formData);
  }

  await logAdminAction(admin, "create", "deliverer", deliverer.id, deliverer.name, await getIpHash());
  redirect(`${DELIVERERS_PATH}?ok=created`);
}

/** Bound on the server: `updateDelivererAction.bind(null, deliverer.id)`. */
export async function updateDelivererAction(delivererId: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(delivererId);
  if (!id.success) return answer({ status: "error", message: "Livreur introuvable." });
  const parsed = delivererSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return answer(validationError(parsed.error, formData));

  let deliverer;
  try {
    deliverer = await updateDeliverer(id.data, parsed.data);
  } catch (error) {
    return failure(error, formData);
  }

  await logAdminAction(admin, "update", "deliverer", deliverer.id, deliverer.name, await getIpHash());
  redirect(`${DELIVERERS_PATH}?ok=updated`);
}

/**
 * Quick switch of the list: available (true) or not (false).
 * Bound on the server: `toggleDelivererAction.bind(null, deliverer.id, !deliverer.isActive)`.
 */
export async function toggleDelivererAction(delivererId: number, isActive: boolean): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(delivererId);
  const active = z.boolean().safeParse(isActive);
  if (!id.success || !active.success) return answer({ status: "error", message: "invalid" });

  let deliverer;
  try {
    deliverer = await setDelivererActive(id.data, active.data);
  } catch (error) {
    return failure(error);
  }

  await logAdminAction(
    admin,
    "update",
    "deliverer",
    deliverer.id,
    `${deliverer.name} : ${active.data ? "disponible" : "désactivé"}`,
    await getIpHash(),
  );
  return answer({ status: "success" });
}

/**
 * ConfirmDeleteButton: `deleteDelivererAction.bind(null, deliverer.id)`.
 * Refused (IN_USE) while one of their orders is out for delivery; the message is shown in the dialog.
 */
export async function deleteDelivererAction(delivererId: number): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(delivererId);
  if (!id.success) return answer({ status: "error", message: "Livreur introuvable." });

  let deliverer;
  try {
    deliverer = await deleteDeliverer(id.data);
  } catch (error) {
    return failure(error);
  }

  await logAdminAction(admin, "delete", "deliverer", deliverer.id, deliverer.name, await getIpHash());
  redirect(`${DELIVERERS_PATH}?ok=deleted`);
}
