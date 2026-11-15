import "server-only";

import { and } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { isGovernorate } from "@/lib/tunisia";
import { ModelError, isUniqueViolation } from "@/models/errors";
import { assertMillimes } from "@/models/fetchers/admin/helpers";
import type { DeliveryZoneInput, DeliveryZoneMutationResult } from "@/types/admin-data";

/**
 * ADMIN — create a delivery zone (one per governorate). No auth check here: the Server Action
 * calls requireAdmin() first, then refreshes TAGS.zones.
 */

/** Checks shared by create and update. Throws INVALID_GOVERNORATE, GOVERNORATE_TAKEN, INVALID_FEE... */
export async function checkDeliveryZoneInput(input: DeliveryZoneInput, exceptId?: number) {
  if (!isGovernorate(input.governorate)) {
    throw new ModelError("INVALID_GOVERNORATE", "Choisissez un gouvernorat de la liste.");
  }
  assertMillimes(input.fee, "INVALID_FEE");
  if (input.freeFrom !== null) assertMillimes(input.freeFrom, "INVALID_FREE_FROM");

  const existing = await db.orm.public.DeliveryZone.select("id")
    .where((z) =>
      exceptId === undefined
        ? z.governorate.eq(input.governorate)
        : and(z.governorate.eq(input.governorate), z.id.neq(exceptId)),
    )
    .first();
  if (existing) throw governorateTaken();
}

/** Error used when a zone already exists for this governorate. */
export function governorateTaken() {
  return new ModelError("GOVERNORATE_TAKEN", "Une zone existe déjà pour ce gouvernorat.");
}

export async function createDeliveryZone(input: DeliveryZoneInput): Promise<DeliveryZoneMutationResult> {
  await checkDeliveryZoneInput(input);
  try {
    const row = await db.orm.public.DeliveryZone.create({
      governorate: input.governorate,
      fee: input.fee,
      delay: input.delay,
      freeFrom: input.freeFrom,
      isActive: input.isActive,
    });
    return { id: row.id, governorate: row.governorate };
  } catch (error) {
    if (isUniqueViolation(error)) throw governorateTaken(); // created at the same moment by someone else
    throw error;
  }
}
