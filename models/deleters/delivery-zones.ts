import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import type { DeliveryZoneMutationResult } from "@/types/admin-data";

/**
 * ADMIN — delete a delivery zone. No auth check here: the Server Action calls requireAdmin()
 * first, then refreshes TAGS.zones.
 */

/**
 * Orders delivered to this zone keep their history (zoneId becomes null; the delivery fee
 * was copied on the order). To stop delivering a governorate for a while, deactivate the zone instead.
 */
export async function deleteDeliveryZone(id: number): Promise<DeliveryZoneMutationResult> {
  assertId(id);
  const row = await db.orm.public.DeliveryZone.where({ id }).select("id", "governorate").delete();
  if (!row) throw new ModelError("NOT_FOUND", "Cette zone n'existe plus.");
  return { id: row.id, governorate: row.governorate };
}
