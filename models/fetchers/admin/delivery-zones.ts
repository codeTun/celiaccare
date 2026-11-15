import "server-only";

import { db } from "@/lib/prisma";
import type { AdminDeliveryZoneForm, AdminDeliveryZoneRow } from "@/types/admin-data";

import { isValidId, toIso } from "./helpers";

/**
 * ADMIN — delivery zones: price and delay per governorate (never cached).
 * Call requireAdmin() before using these functions.
 */

/** Every zone (A → Z) with the number of orders delivered to it. */
export async function listDeliveryZones(): Promise<AdminDeliveryZoneRow[]> {
  const rows = await db.orm.public.DeliveryZone.select("id", "governorate", "fee", "delay", "freeFrom", "isActive", "updatedAt")
    .include("orders", (orders) => orders.count())
    .orderBy([(z) => z.governorate.asc(), (z) => z.id.asc()])
    .all();

  return rows.map((row) => ({
    id: row.id,
    governorate: row.governorate,
    fee: row.fee,
    delay: row.delay,
    freeFrom: row.freeFrom,
    isActive: row.isActive,
    orderCount: row.orders,
    updatedAt: toIso(row.updatedAt),
  }));
}

/** One zone, to pre-fill its edit form. null when it does not exist. */
export async function getDeliveryZone(id: number): Promise<AdminDeliveryZoneForm | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.DeliveryZone.first({ id });
  if (!row) return null;
  return {
    id: row.id,
    governorate: row.governorate,
    fee: row.fee,
    delay: row.delay,
    freeFrom: row.freeFrom,
    isActive: row.isActive,
  };
}
