import "server-only";

import { db } from "@/lib/prisma";
import { normalizeTunisianPhone } from "@/lib/tunisia";
import type { OrderTrackingDTO } from "@/types";

/**
 * Cleans an order reference typed by a customer: " cc-7k2p9q " -> "CC-7K2P9Q".
 * The "CC-" prefix may be forgotten ("7K2P9Q"); the former "SG-" prefix is accepted too. Returns null when it cannot be a reference.
 */
export function normalizeOrderReference(input: string): string | null {
  const compact = input.replace(/\s+/g, "").toUpperCase();
  const match = /^(?:(?:CC|SG)-?)?([A-Z0-9]{6})$/.exec(compact);
  return match ? `CC-${match[1]}` : null;
}

/**
 * Public order tracking ("Suivi de commande"): the customer gives the order reference AND the
 * phone number used for the order. Both must match, otherwise the result is null (we never say
 * which one is wrong). Only the first name and the order contents are returned: no address, no phone.
 * NOT cached (personal data). The calling Server Action must rate-limit it (LIMITS.tracking).
 */
export async function trackOrder(reference: string, phone: string): Promise<OrderTrackingDTO | null> {
  const orderReference = normalizeOrderReference(reference);
  const customerPhone = normalizeTunisianPhone(phone);
  if (!orderReference || !customerPhone) return null;

  const order = await db.orm.public.Order.where((o) => o.reference.eq(orderReference))
    .where((o) => o.phone.eq(customerPhone))
    .select(
      "reference",
      "type",
      "status",
      "paymentMethod",
      "customerName",
      "subtotal",
      "deliveryFee",
      "total",
      "createdAt",
      "confirmedAt",
      "deliveredAt",
      "cancelledAt",
    )
    .include("restaurant", (restaurant) => restaurant.select("name"))
    .include("items", (items) => items.select("name", "quantity", "lineTotal").orderBy((item) => item.id.asc()))
    .first();
  if (!order) return null;

  return {
    reference: order.reference,
    type: order.type,
    status: order.status,
    paymentMethod: order.paymentMethod,
    customerFirstName: order.customerName.trim().split(/\s+/)[0] ?? "",
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    restaurantName: order.restaurant?.name ?? null,
    items: order.items.map((item) => ({ name: item.name, quantity: item.quantity, lineTotal: item.lineTotal })),
  };
}
