"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ORDER_RETURN_TARGETS,
  ORDER_STATUS_ACTIONS,
  type OrderReturnTarget,
} from "@/components/admin/orders/order-labels";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getIpHash } from "@/lib/request";
import { idSchema, type ActionState } from "@/lib/validators";
import { ModelError } from "@/models/errors";
import { assignDeliverer, updateOrderStatus } from "@/models/puters/orders";
import { ORDER_STATUSES } from "@/types";

/* ==========================================================================
   Server Actions of the orders (Commandes) — also used by the delivery board
   (Livraisons → En cours). Each one starts with requireAdmin(), checks its
   inputs, writes the audit log and goes back to the page it came from.
   Orders are not in any public cache: no updateTag() here.
   ========================================================================== */

const returnTargetSchema = z.enum(ORDER_RETURN_TARGETS);
const targetStatusSchema = z.enum(ORDER_STATUSES).exclude(["PENDING"]);
/** "" = take the order back from its deliverer. */
const delivererIdSchema = z.union([z.literal("").transform(() => null), idSchema]);

/** French messages of the errors thrown by models/puters/orders.ts. */
const ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: "Cette commande n'existe plus.",
  INVALID_ID: "Commande introuvable.",
  INVALID_STATUS: "Statut inconnu.",
  INVALID_TRANSITION:
    "Ce changement n'est plus possible : la commande a sans doute été modifiée entre-temps. Rechargez la page.",
  ORDER_CLOSED: "Cette commande est terminée (livrée ou annulée) : son livreur ne peut plus changer.",
  DELIVERER_UNAVAILABLE: "Ce livreur n'existe plus ou est désactivé. Choisissez-en un autre.",
};

/** Page to go back to after a change, with the ?ok=<code> confirmation. */
function returnPath(target: OrderReturnTarget, orderId: number, okCode: string) {
  return target === "board" ? `/admin/livraisons?ok=${okCode}` : `/admin/commandes/${orderId}?ok=${okCode}`;
}

/** Send an error back to the form, and refresh the page data (another admin may have changed the order). */
function failure(error: unknown): ActionState {
  let message = "error";
  if (error instanceof ModelError) message = ERROR_MESSAGES[error.code] ?? error.message;
  else console.error("[admin/commandes] action failed", error);
  refresh();
  return { status: "error", message };
}

/**
 * Move an order to its next status (Confirmer, Mettre en préparation, Expédier, Marquer livrée, Annuler).
 * Bound on the server: `updateOrderStatusAction.bind(null, order.id, "detail")`; the clicked button
 * sends the target status (`<button name="status" value="CONFIRMED">`). The model checks the
 * transition again (ORDER_STATUS_TRANSITIONS), so a stale page cannot skip a step.
 */
export async function updateOrderStatusAction(
  orderId: number,
  returnTo: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();

  const id = idSchema.safeParse(orderId);
  const back = returnTargetSchema.safeParse(returnTo);
  const target = targetStatusSchema.safeParse(formData.get("status"));
  if (!id.success || !back.success || !target.success) {
    refresh();
    return { status: "error", message: "invalid" };
  }

  let change;
  try {
    change = await updateOrderStatus(id.data, target.data);
  } catch (error) {
    return failure(error);
  }

  await logAdminAction(
    admin,
    "status",
    "order",
    change.id,
    `${change.reference} : ${change.from} → ${change.to}`,
    await getIpHash(),
  );
  redirect(returnPath(back.data, change.id, ORDER_STATUS_ACTIONS[target.data].flashCode));
}

/**
 * Give an order to a delivery person, or take it back (empty choice).
 * Bound on the server: `assignDelivererAction.bind(null, order.id, "board")`; reads `delivererId`.
 */
export async function assignDelivererAction(
  orderId: number,
  returnTo: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();

  const id = idSchema.safeParse(orderId);
  const back = returnTargetSchema.safeParse(returnTo);
  const delivererId = delivererIdSchema.safeParse(formData.get("delivererId") ?? "");
  if (!id.success || !back.success) {
    refresh();
    return { status: "error", message: "invalid" };
  }
  if (!delivererId.success) {
    refresh();
    return { status: "error", message: "invalid", fieldErrors: { delivererId: ["Choisissez un livreur de la liste."] } };
  }

  let assignment;
  try {
    assignment = await assignDeliverer(id.data, delivererId.data);
  } catch (error) {
    return failure(error);
  }

  await logAdminAction(
    admin,
    "update",
    "order",
    assignment.orderId,
    assignment.delivererName
      ? `${assignment.reference} : livreur ${assignment.delivererName}`
      : `${assignment.reference} : livreur retiré`,
    await getIpHash(),
  );
  redirect(returnPath(back.data, assignment.orderId, assignment.delivererId ? "livreur-assigne" : "livreur-retire"));
}
