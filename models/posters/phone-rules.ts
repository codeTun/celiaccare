import "server-only";

import { db } from "@/lib/prisma";
import { normalizeTunisianPhone } from "@/lib/tunisia";
import { ModelError } from "@/models/errors";
import type { PhoneRuleType } from "@/types";
import type { PhoneRuleInput, PhoneRuleMutationResult } from "@/types/admin-data";

/**
 * ADMIN — block an abusive number or allow a justified exception to the
 * 3-orders-per-day limit (spec EF-39). One rule per number: saving a rule for a
 * number that already has one replaces it. No auth check here: the Server Action
 * calls requireAdmin() first.
 */

/** Highest daily limit an EXCEPTION may give. */
export const MAX_EXCEPTION_PER_DAY = 50;

/**
 * Checks shared by create (upsertPhoneRule) and update (models/puters/phone-rules.ts).
 * Returns the columns to save, except the phone. Throws INVALID_MAX_PER_DAY or INVALID_EXPIRES_AT.
 */
export function phoneRuleFields(input: Omit<PhoneRuleInput, "phone">) {
  // A blocked number has no daily limit; an exception must say how many orders per day it allows.
  const maxPerDay = input.type === "EXCEPTION" ? input.maxPerDay : null;
  if (
    input.type === "EXCEPTION" &&
    (maxPerDay === null || !Number.isInteger(maxPerDay) || maxPerDay < 1 || maxPerDay > MAX_EXCEPTION_PER_DAY)
  ) {
    throw new ModelError(
      "INVALID_MAX_PER_DAY",
      `Indiquez le nombre de commandes autorisées par jour (1 à ${MAX_EXCEPTION_PER_DAY}).`,
    );
  }
  if (input.expiresAt !== null && Number.isNaN(input.expiresAt.getTime())) {
    throw new ModelError("INVALID_EXPIRES_AT", "Date de fin invalide.");
  }

  return {
    type: input.type as PhoneRuleType,
    maxPerDay,
    reason: input.reason?.trim() || null,
    expiresAt: input.expiresAt,
  };
}

export async function upsertPhoneRule(input: PhoneRuleInput): Promise<PhoneRuleMutationResult> {
  const phone = normalizeTunisianPhone(input.phone);
  if (!phone) throw new ModelError("INVALID_PHONE", "Numéro tunisien invalide (8 chiffres).");

  const fields = phoneRuleFields(input);
  const existing = await db.orm.public.PhoneRule.select("id").first({ phone });
  const row = await db.orm.public.PhoneRule.upsert({
    create: { phone, ...fields },
    update: fields,
    conflictOn: { phone },
  });
  return { id: row.id, phone: row.phone, type: row.type, created: existing === null };
}
