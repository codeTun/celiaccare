import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import type { DelivererMutationResult } from "@/types/admin-data";

/**
 * ADMIN — delete a delivery person. No auth check here: the Server Action calls requireAdmin() first.
 */

/**
 * Refused with ModelError("IN_USE") while one of their orders is OUT_FOR_DELIVERY.
 * Their other orders keep their history (delivererId becomes null).
 */
export async function deleteDeliverer(id: number): Promise<DelivererMutationResult> {
  assertId(id);
  return db.transaction(async (tx) => {
    // Lock the deliverer row: no order can be given to them while we check and delete.
    const current = await tx.orm.public.Deliverer.select("id", "name").where({ id }).forUpdate().first();
    if (!current) throw new ModelError("NOT_FOUND", "Ce livreur n'existe plus.");

    const onTheRoad = await tx.orm.public.Order.where({ delivererId: id, status: "OUT_FOR_DELIVERY" }).aggregate((a) => ({
      n: a.count(),
    }));
    if (onTheRoad.n > 0) {
      throw new ModelError(
        "IN_USE",
        `Ce livreur a ${onTheRoad.n} commande${onTheRoad.n > 1 ? "s" : ""} en cours de livraison. Attendez la fin de la livraison.`,
      );
    }

    await tx.orm.public.Deliverer.where({ id }).delete();
    return { id: current.id, name: current.name };
  });
}
