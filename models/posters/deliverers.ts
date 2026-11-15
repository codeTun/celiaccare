import "server-only";

import { and } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { normalizeTunisianPhone } from "@/lib/tunisia";
import { ModelError, isUniqueViolation } from "@/models/errors";
import type { DelivererInput, DelivererMutationResult } from "@/types/admin-data";

/**
 * ADMIN — create a delivery person (livreur). No auth check here: the Server Action
 * calls requireAdmin() first.
 */

/** Error used when another deliverer already has this phone number. */
export function phoneTaken() {
  return new ModelError("PHONE_TAKEN", "Un autre livreur utilise déjà ce numéro.");
}

/**
 * Checks shared by create and update. Returns the phone normalised to 8 digits.
 * Throws INVALID_PHONE or PHONE_TAKEN.
 */
export async function checkDelivererInput(input: DelivererInput, exceptId?: number): Promise<string> {
  const phone = normalizeTunisianPhone(input.phone);
  if (!phone) throw new ModelError("INVALID_PHONE", "Numéro tunisien invalide (8 chiffres).");

  const existing = await db.orm.public.Deliverer.select("id")
    .where((d) => (exceptId === undefined ? d.phone.eq(phone) : and(d.phone.eq(phone), d.id.neq(exceptId))))
    .first();
  if (existing) throw phoneTaken();
  return phone;
}

export async function createDeliverer(input: DelivererInput): Promise<DelivererMutationResult> {
  const phone = await checkDelivererInput(input);
  try {
    const row = await db.orm.public.Deliverer.create({
      name: input.name,
      phone,
      vehicle: input.vehicle,
      zone: input.zone,
      isActive: input.isActive,
      notes: input.notes,
    });
    return { id: row.id, name: row.name };
  } catch (error) {
    if (isUniqueViolation(error)) throw phoneTaken(); // created at the same moment by someone else
    throw error;
  }
}
