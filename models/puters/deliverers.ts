import "server-only";

import { db } from "@/lib/prisma";
import { ModelError, isUniqueViolation } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import { checkDelivererInput, phoneTaken } from "@/models/posters/deliverers";
import type { DelivererInput, DelivererMutationResult } from "@/types/admin-data";

/**
 * ADMIN — update a delivery person. No auth check here: the Server Action calls requireAdmin() first.
 */

export async function updateDeliverer(id: number, input: DelivererInput): Promise<DelivererMutationResult> {
  assertId(id);
  const phone = await checkDelivererInput(input, id);
  try {
    const row = await db.orm.public.Deliverer.where({ id })
      .select("id", "name")
      .update({
        name: input.name,
        phone,
        vehicle: input.vehicle,
        zone: input.zone,
        isActive: input.isActive,
        notes: input.notes,
      });
    if (!row) throw new ModelError("NOT_FOUND", "Ce livreur n'existe plus.");
    return { id: row.id, name: row.name };
  } catch (error) {
    if (isUniqueViolation(error)) throw phoneTaken(); // changed at the same moment by someone else
    throw error;
  }
}

/**
 * Available (true) or not (false). An inactive deliverer keeps the orders already
 * assigned but cannot receive new ones (see assignDeliverer).
 */
export async function setDelivererActive(id: number, isActive: boolean): Promise<DelivererMutationResult> {
  assertId(id);
  const row = await db.orm.public.Deliverer.where({ id }).select("id", "name").update({ isActive });
  if (!row) throw new ModelError("NOT_FOUND", "Ce livreur n'existe plus.");
  return { id: row.id, name: row.name };
}
