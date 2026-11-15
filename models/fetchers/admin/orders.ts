import "server-only";

import { all, and, or, type Condition } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { ORDER_STATUSES, type OrderStatus, type Paginated } from "@/types";
import {
  ACTIVE_ORDER_STATUSES,
  ANONYMIZED_PHONE,
  ORDER_STATUS_TRANSITIONS,
  type AdminActiveDelivery,
  type AdminOrderDetail,
  type AdminOrderFilters,
  type AdminOrderRow,
} from "@/types/admin-data";

import { containsPattern, isValidId, pageWindow, paginated, toIso } from "./helpers";

/**
 * ADMIN — customer orders (never cached; they contain personal data).
 * Call requireAdmin() before using these functions.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** The orders matching the filters (status, type, search), as a collection to read or count. */
function filterOrders(filters: Pick<AdminOrderFilters, "status" | "type" | "q">) {
  const q = filters.q?.trim();
  return db.orm.public.Order.where((o) => {
    const conditions: Condition[] = [];
    if (filters.status) conditions.push(o.status.eq(filters.status));
    if (filters.type) conditions.push(o.type.eq(filters.type));
    if (q) {
      const matches = [o.reference.ilike(containsPattern(q)), o.customerName.ilike(containsPattern(q))];
      // Phones are stored as 8 digits: "20 123 456" must find "20123456".
      const digits = q.replace(/\D/g, "");
      if (digits.length >= 2) matches.push(o.phone.like(containsPattern(digits)));
      conditions.push(or(...matches));
    }
    return conditions.length > 0 ? and(...conditions) : all();
  });
}

/** Orders matching the filters, newest first, 20 per page. */
export async function listOrders(filters: AdminOrderFilters = {}): Promise<Paginated<AdminOrderRow>> {
  const { page, pageSize, offset } = pageWindow(filters);

  // The same filtered collection is used twice: for the rows of the page and for the total count.
  const filtered = filterOrders(filters);

  const [rows, count] = await Promise.all([
    filtered
      .select(
        "id",
        "reference",
        "type",
        "status",
        "paymentMethod",
        "customerName",
        "phone",
        "governorate",
        "city",
        "total",
        "createdAt",
      )
      .include("items", (items) => items.sum("quantity"))
      .include("restaurant", (restaurant) => restaurant.select("name"))
      .include("deliverer", (deliverer) => deliverer.select("name"))
      .orderBy([(o) => o.createdAt.desc(), (o) => o.id.desc()])
      .limit(pageSize)
      .offset(offset)
      .all(),
    filtered.aggregate((a) => ({ total: a.count() })),
  ]);

  const items = rows.map((row) => ({
    id: row.id,
    reference: row.reference,
    type: row.type,
    status: row.status,
    paymentMethod: row.paymentMethod,
    customerName: row.customerName,
    phone: row.phone,
    governorate: row.governorate,
    city: row.city,
    total: row.total,
    itemCount: row.items ?? 0,
    restaurantName: row.restaurant?.name ?? null,
    delivererName: row.deliverer?.name ?? null,
    createdAt: toIso(row.createdAt),
  }));

  return paginated(items, count.total, page, pageSize);
}

/**
 * Number of orders in each status for the status tabs of the orders list.
 * Uses the same type / search filters as listOrders() (not the status itself), plus `all`.
 */
export async function countOrdersByStatus(
  filters: Pick<AdminOrderFilters, "type" | "q"> = {},
): Promise<Record<OrderStatus, number> & { all: number }> {
  const groups = await filterOrders({ type: filters.type, q: filters.q })
    .groupBy("status")
    .aggregate((a) => ({ n: a.count() }));

  const counts = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, groups.find((group) => group.status === status)?.n ?? 0]),
  ) as Record<OrderStatus, number>;
  const all = ORDER_STATUSES.reduce((sum, status) => sum + counts[status], 0);
  return { ...counts, all };
}

/**
 * Closed orders whose personal data must now be removed (spec 6.4, retention of `days` days):
 * DELIVERED / CANCELLED for more than `days` days and not anonymised yet.
 * Shared by countOrdersToAnonymize() (personal data card of the Clients page) and
 * anonymizeOldOrders() (models/puters/orders.ts), so both always agree.
 */
export function ordersToAnonymize(days: number, now: Date = new Date()) {
  const cutoff = new Date(now.getTime() - days * DAY_MS);
  return db.orm.public.Order.where((o) =>
    and(
      o.phone.neq(ANONYMIZED_PHONE),
      or(
        and(o.status.eq("DELIVERED"), o.deliveredAt.lt(cutoff)),
        and(o.status.eq("CANCELLED"), o.cancelledAt.lt(cutoff)),
        // closed orders without a closing date (older data): use the order date
        and(o.status.in(["DELIVERED", "CANCELLED"]), o.deliveredAt.isNull(), o.cancelledAt.isNull(), o.createdAt.lt(cutoff)),
      ),
    ),
  );
}

/** How many closed orders still hold personal data older than `days` days (nothing is changed). */
export async function countOrdersToAnonymize(days: number, now: Date = new Date()): Promise<number> {
  if (!Number.isInteger(days) || days < 1) return 0;
  const { n } = await ordersToAnonymize(days, now).aggregate((a) => ({ n: a.count() }));
  return n;
}

/** Everything about one order (items, delivery zone, deliverer, restaurant). null when it does not exist. */
export async function getOrderDetail(id: number): Promise<AdminOrderDetail | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.Order.where({ id })
    .include("items", (items) =>
      items.orderBy((item) => item.id.asc()).include("product", (product) => product.select("slug")),
    )
    .include("restaurant", (restaurant) => restaurant.select("id", "name", "slug", "phone"))
    .include("zone", (zone) => zone.select("id", "governorate", "fee", "delay"))
    .include("deliverer", (deliverer) => deliverer.select("id", "name", "phone", "vehicle", "isActive"))
    .first();
  if (!row) return null;

  // Fields are copied one by one on purpose: ipHash (and anything added later) never leaves the server.
  return {
    id: row.id,
    reference: row.reference,
    type: row.type,
    status: row.status,
    paymentMethod: row.paymentMethod,
    customerName: row.customerName,
    phone: row.phone,
    governorate: row.governorate,
    city: row.city,
    street: row.street,
    addressDetails: row.addressDetails,
    note: row.note,
    dayKey: row.dayKey,
    subtotal: row.subtotal,
    deliveryFee: row.deliveryFee,
    total: row.total,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    confirmedAt: toIso(row.confirmedAt),
    deliveredAt: toIso(row.deliveredAt),
    cancelledAt: toIso(row.cancelledAt),
    restaurant: row.restaurant
      ? { id: row.restaurant.id, name: row.restaurant.name, slug: row.restaurant.slug, phone: row.restaurant.phone }
      : null,
    zone: row.zone
      ? { id: row.zone.id, governorate: row.zone.governorate, fee: row.zone.fee, delay: row.zone.delay }
      : null,
    deliverer: row.deliverer
      ? {
          id: row.deliverer.id,
          name: row.deliverer.name,
          phone: row.deliverer.phone,
          vehicle: row.deliverer.vehicle,
          isActive: row.deliverer.isActive,
        }
      : null,
    items: row.items.map((item) => ({
      id: item.id,
      kind: item.kind,
      productId: item.productId,
      dishId: item.dishId,
      productSlug: item.product?.slug ?? null,
      name: item.name,
      merchantName: item.merchantName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    nextStatuses: [...ORDER_STATUS_TRANSITIONS[row.status]],
    isAnonymized: row.phone === ANONYMIZED_PHONE,
  };
}

/** Accepted orders not delivered yet (CONFIRMED, PREPARING, OUT_FOR_DELIVERY), oldest first. */
export async function listActiveDeliveries(): Promise<AdminActiveDelivery[]> {
  const rows = await db.orm.public.Order.select(
    "id",
    "reference",
    "type",
    "status",
    "paymentMethod",
    "customerName",
    "phone",
    "governorate",
    "city",
    "street",
    "addressDetails",
    "total",
    "createdAt",
    "confirmedAt",
  )
    .where((o) => o.status.in([...ACTIVE_ORDER_STATUSES]))
    .include("restaurant", (restaurant) => restaurant.select("name"))
    .include("zone", (zone) => zone.select("governorate", "delay"))
    .include("deliverer", (deliverer) => deliverer.select("id", "name", "phone", "vehicle"))
    .orderBy([(o) => o.createdAt.asc(), (o) => o.id.asc()])
    .all();

  return rows.map((row) => ({
    id: row.id,
    reference: row.reference,
    type: row.type,
    status: row.status,
    paymentMethod: row.paymentMethod,
    customerName: row.customerName,
    phone: row.phone,
    governorate: row.governorate,
    city: row.city,
    street: row.street,
    addressDetails: row.addressDetails,
    total: row.total,
    createdAt: toIso(row.createdAt),
    confirmedAt: toIso(row.confirmedAt),
    restaurantName: row.restaurant?.name ?? null,
    zone: row.zone ? { governorate: row.zone.governorate, delay: row.zone.delay } : null,
    deliverer: row.deliverer
      ? { id: row.deliverer.id, name: row.deliverer.name, phone: row.deliverer.phone, vehicle: row.deliverer.vehicle }
      : null,
  }));
}
