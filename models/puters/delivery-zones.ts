import "server-only";

import { db } from "@/lib/prisma";
import { ModelError, isUniqueViolation } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import { checkDeliveryZoneInput, governorateTaken } from "@/models/posters/delivery-zones";
import type { DeliveryZoneInput, DeliveryZoneMutationResult } from "@/types/admin-data";

/**
 * ADMIN — update a delivery zone. No auth check here: the Server Action calls
 * requireAdmin() first, then refreshes TAGS.zones.
 */

export async function updateDeliveryZone(id: number, input: DeliveryZoneInput): Promise<DeliveryZoneMutationResult> {
  assertId(id);
  await checkDeliveryZoneInput(input, id);
  try {
    const row = await db.orm.public.DeliveryZone.where({ id })
      .select("id", "governorate")
      .update({
        governorate: input.governorate,
        fee: input.fee,
        delay: input.delay,
        freeFrom: input.freeFrom,
        isActive: input.isActive,
      });
    if (!row) throw new ModelError("NOT_FOUND", "Cette zone n'existe plus.");
    return { id: row.id, governorate: row.governorate };
  } catch (error) {
    if (isUniqueViolation(error)) throw governorateTaken(); // changed at the same moment by someone else
    throw error;
  }
}

/**
 * Open (true) or close (false) the delivery to this governorate. A closed zone is hidden
 * from the checkout; its settings and past orders are kept.
 */
export async function setDeliveryZoneActive(id: number, isActive: boolean): Promise<DeliveryZoneMutationResult> {
  assertId(id);
  const row = await db.orm.public.DeliveryZone.where({ id }).select("id", "governorate").update({ isActive });
  if (!row) throw new ModelError("NOT_FOUND", "Cette zone n'existe plus.");
  return { id: row.id, governorate: row.governorate };
}
