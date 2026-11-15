import "server-only";

import { db } from "@/lib/prisma";
import { ModelError, isForeignKeyViolation } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import { ordersToAnonymize } from "@/models/fetchers/admin/orders";
import { ORDER_STATUSES, type OrderStatus } from "@/types";
import {
  ANONYMIZED_CUSTOMER_NAME,
  ANONYMIZED_PHONE,
  ANONYMIZED_STREET,
  ORDER_STATUS_TRANSITIONS,
  type DelivererAssignment,
  type OrderStatusChange,
} from "@/types/admin-data";

/**
 * ADMIN — follow up customer orders. No auth check here: the Server Action calls
 * requireAdmin() first. Orders are not in any public cache: nothing to refresh.
 */

/**
 * Move an order to its next status. Allowed changes (ORDER_STATUS_TRANSITIONS):
 *   PENDING → CONFIRMED | CANCELLED,  CONFIRMED → PREPARING | CANCELLED,
 *   PREPARING → OUT_FOR_DELIVERY | CANCELLED,  OUT_FOR_DELIVERY → DELIVERED | CANCELLED.
 * Anything else throws ModelError("INVALID_TRANSITION").
 * The dates stay consistent: confirmedAt is set once the order is accepted,
 * deliveredAt when it is DELIVERED, cancelledAt when it is CANCELLED.
 */
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<OrderStatusChange> {
  assertId(id);
  if (!ORDER_STATUSES.includes(status)) throw new ModelError("INVALID_STATUS", "Statut inconnu.");

  return db.transaction(async (tx) => {
    // Lock the order until the end of the transaction: two admins clicking at the same time
    // cannot both apply a change based on the same old status.
    const order = await tx.orm.public.Order.select("id", "reference", "status", "confirmedAt", "deliveredAt", "cancelledAt")
      .where({ id })
      .forUpdate()
      .first();
    if (!order) throw new ModelError("NOT_FOUND", "Cette commande n'existe plus.");
    if (!ORDER_STATUS_TRANSITIONS[order.status].includes(status)) {
      throw new ModelError("INVALID_TRANSITION", `Impossible de passer une commande de « ${order.status} » à « ${status} ».`);
    }

    const now = new Date();
    await tx.orm.public.Order.where({ id }).update({
      status,
      confirmedAt: status === "CANCELLED" ? order.confirmedAt : (order.confirmedAt ?? now),
      deliveredAt: status === "DELIVERED" ? now : order.deliveredAt,
      cancelledAt: status === "CANCELLED" ? now : order.cancelledAt,
    });
    return { id: order.id, reference: order.reference, from: order.status, to: status };
  });
}

/**
 * Give an order to a delivery person, or take it back (delivererId = null).
 * The deliverer must exist and be active (DELIVERER_UNAVAILABLE); delivered or
 * cancelled orders cannot change (ORDER_CLOSED).
 */
export async function assignDeliverer(orderId: number, delivererId: number | null): Promise<DelivererAssignment> {
  assertId(orderId);
  if (delivererId !== null) assertId(delivererId);

  try {
    return await db.transaction(async (tx) => {
      // Lock the order until the end of the transaction: its status cannot change meanwhile.
      const order = await tx.orm.public.Order.select("id", "reference", "status").where({ id: orderId }).forUpdate().first();
      if (!order) throw new ModelError("NOT_FOUND", "Cette commande n'existe plus.");
      if (order.status === "DELIVERED" || order.status === "CANCELLED") {
        throw new ModelError("ORDER_CLOSED", "Cette commande est terminée : son livreur ne peut plus changer.");
      }

      let delivererName: string | null = null;
      if (delivererId !== null) {
        const deliverer = await tx.orm.public.Deliverer.select("id", "name", "isActive").first({ id: delivererId });
        if (!deliverer || !deliverer.isActive) {
          throw new ModelError("DELIVERER_UNAVAILABLE", "Ce livreur n'existe plus ou n'est pas actif.");
        }
        delivererName = deliverer.name;
      }

      await tx.orm.public.Order.where({ id: orderId }).update({ delivererId });
      return { orderId, reference: order.reference, delivererId, delivererName };
    });
  } catch (error) {
    // The deliverer was deleted at the same moment (the database refuses the link).
    if (isForeignKeyViolation(error)) throw new ModelError("DELIVERER_UNAVAILABLE", "Ce livreur n'existe plus.");
    throw error;
  }
}

/**
 * Personal data retention (spec 6.4, law 2004-63): delivery data is kept only as long as needed.
 * For DELIVERED / CANCELLED orders closed more than `days` days ago, the name, phone, street,
 * address details and note are replaced (the amounts, items, city and governorate stay for the
 * statistics). The daily counters use today's orders only, so a fake phone does not affect them.
 * Returns how many orders were anonymised now (already anonymised orders are skipped).
 */
export async function anonymizeOldOrders(days = 90, now: Date = new Date()): Promise<number> {
  if (!Number.isInteger(days) || days < 1) throw new ModelError("INVALID_DAYS", "Nombre de jours invalide.");

  // Same selection as countOrdersToAnonymize() (models/fetchers/admin/orders.ts).
  return ordersToAnonymize(days, now).updateAndCount({
    customerName: ANONYMIZED_CUSTOMER_NAME,
    phone: ANONYMIZED_PHONE,
    street: ANONYMIZED_STREET,
    addressDetails: null,
    note: null,
    ipHash: null,
  });
}
