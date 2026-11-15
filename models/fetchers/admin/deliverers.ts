import "server-only";

import { db } from "@/lib/prisma";
import { ACTIVE_ORDER_STATUSES, type AdminDelivererForm, type AdminDelivererRow } from "@/types/admin-data";

import { isValidId, toIso } from "./helpers";

/**
 * ADMIN — delivery people (livreurs). Never cached.
 * Call requireAdmin() before using these functions.
 */

/** Every deliverer (active ones first, then A → Z) with their current and delivered orders. */
export async function listDeliverers(): Promise<AdminDelivererRow[]> {
  const rows = await db.orm.public.Deliverer.select("id", "name", "phone", "vehicle", "zone", "isActive", "notes", "updatedAt")
    .include("orders", (orders) =>
      orders.combine({
        active: orders.where((o) => o.status.in([...ACTIVE_ORDER_STATUSES])).count(),
        delivered: orders.where((o) => o.status.eq("DELIVERED")).count(),
      }),
    )
    .orderBy([(d) => d.name.asc(), (d) => d.id.asc()])
    .all();

  // Active deliverers first (booleans cannot be sorted in SQL by the ORM; JS sort keeps the A → Z order).
  rows.sort((a, b) => Number(b.isActive) - Number(a.isActive));
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    vehicle: row.vehicle,
    zone: row.zone,
    isActive: row.isActive,
    notes: row.notes,
    activeOrderCount: row.orders.active,
    deliveredCount: row.orders.delivered,
    updatedAt: toIso(row.updatedAt),
  }));
}

/** One deliverer, to pre-fill the edit form. null when it does not exist. */
export async function getDeliverer(id: number): Promise<AdminDelivererForm | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.Deliverer.first({ id });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    vehicle: row.vehicle,
    zone: row.zone,
    isActive: row.isActive,
    notes: row.notes,
  };
}
