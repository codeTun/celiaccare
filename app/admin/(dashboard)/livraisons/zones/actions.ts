"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { getIpHash } from "@/lib/request";
import {
  checkbox,
  formDataToObject,
  governorate,
  idSchema,
  optionalPriceInDinars,
  priceInDinars,
  requiredText,
  submittedValues,
  validationError,
  type ActionState,
} from "@/lib/validators";
import { ModelError } from "@/models/errors";
import { deleteDeliveryZone } from "@/models/deleters/delivery-zones";
import { createDeliveryZone } from "@/models/posters/delivery-zones";
import { setDeliveryZoneActive, updateDeliveryZone } from "@/models/puters/delivery-zones";

/* ==========================================================================
   Server Actions of the delivery zones (Livraisons → Zones).
   requireAdmin() first, zod validation, audit log, then TAGS.zones is refreshed:
   the checkout and the public pages read the zones from the cache.
   ========================================================================== */

const ZONES_PATH = "/admin/livraisons/zones";

const zoneSchema = z.object({
  governorate,
  fee: priceInDinars,
  delay: requiredText(40),
  freeFrom: optionalPriceInDinars,
  isActive: checkbox,
});

/** Model errors → message under the right field (or at the top of the form). */
const FIELD_ERRORS: Record<string, { field?: string; message: string }> = {
  INVALID_GOVERNORATE: { field: "governorate", message: "Choisissez un gouvernorat de la liste." },
  GOVERNORATE_TAKEN: { field: "governorate", message: "Une zone existe déjà pour ce gouvernorat : modifiez-la plutôt." },
  INVALID_FEE: { field: "fee", message: "Montant invalide." },
  INVALID_FREE_FROM: { field: "freeFrom", message: "Montant invalide." },
  NOT_FOUND: { message: "Cette zone n'existe plus." },
  INVALID_ID: { message: "Zone introuvable." },
};

/** Answer the form (with the typed values) and refresh the page data. */
function answer(state: ActionState): ActionState {
  refresh();
  return state;
}

function failure(error: unknown, formData?: FormData): ActionState {
  const values = formData ? submittedValues(formData) : undefined;
  if (error instanceof ModelError) {
    const known = FIELD_ERRORS[error.code];
    if (known?.field) return answer({ status: "error", message: "invalid", fieldErrors: { [known.field]: [known.message] }, values });
    return answer({ status: "error", message: known?.message ?? error.message, values });
  }
  console.error("[admin/zones] action failed", error);
  return answer({ status: "error", message: "error", values });
}

/** The public pages (checkout, home stats) read the zones from the cache. */
function refreshPublicZones() {
  updateTag(TAGS.zones);
}

export async function createDeliveryZoneAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = zoneSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return answer(validationError(parsed.error, formData));

  let zone;
  try {
    zone = await createDeliveryZone(parsed.data);
  } catch (error) {
    return failure(error, formData);
  }

  await logAdminAction(admin, "create", "zone", zone.id, zone.governorate, await getIpHash());
  refreshPublicZones();
  redirect(`${ZONES_PATH}?ok=created`);
}

/** Bound on the server: `updateDeliveryZoneAction.bind(null, zone.id)`. */
export async function updateDeliveryZoneAction(zoneId: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(zoneId);
  if (!id.success) return answer({ status: "error", message: "Zone introuvable." });
  const parsed = zoneSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return answer(validationError(parsed.error, formData));

  let zone;
  try {
    zone = await updateDeliveryZone(id.data, parsed.data);
  } catch (error) {
    return failure(error, formData);
  }

  await logAdminAction(admin, "update", "zone", zone.id, zone.governorate, await getIpHash());
  refreshPublicZones();
  redirect(`${ZONES_PATH}?ok=updated`);
}

/**
 * Quick switch of the list: open (true) or close (false) the delivery to a governorate.
 * Bound on the server: `toggleDeliveryZoneAction.bind(null, zone.id, !zone.isActive)`.
 * Stays on the (filtered) list: the badge and the button change.
 */
export async function toggleDeliveryZoneAction(zoneId: number, isActive: boolean): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(zoneId);
  const active = z.boolean().safeParse(isActive);
  if (!id.success || !active.success) return answer({ status: "error", message: "invalid" });

  let zone;
  try {
    zone = await setDeliveryZoneActive(id.data, active.data);
  } catch (error) {
    return failure(error);
  }

  await logAdminAction(admin, "update", "zone", zone.id, `${zone.governorate} : ${active.data ? "ouverte" : "fermée"}`, await getIpHash());
  refreshPublicZones();
  return answer({ status: "success" });
}

/** ConfirmDeleteButton: `deleteDeliveryZoneAction.bind(null, zone.id)`. Past orders keep their history. */
export async function deleteDeliveryZoneAction(zoneId: number): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(zoneId);
  if (!id.success) return answer({ status: "error", message: "Zone introuvable." });

  let zone;
  try {
    zone = await deleteDeliveryZone(id.data);
  } catch (error) {
    return failure(error);
  }

  await logAdminAction(admin, "delete", "zone", zone.id, zone.governorate, await getIpHash());
  refreshPublicZones();
  redirect(`${ZONES_PATH}?ok=deleted`);
}
