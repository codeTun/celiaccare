import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import { phoneRuleFields } from "@/models/posters/phone-rules";
import type { PhoneRuleInput, PhoneRuleMutationResult } from "@/types/admin-data";

/**
 * ADMIN — change an existing BLOCKED / EXCEPTION rule (spec EF-39). The number itself
 * never changes (to move a rule to another number, delete it and create a new one).
 * No auth check here: the Server Action calls requireAdmin() first.
 */

export async function updatePhoneRule(id: number, input: Omit<PhoneRuleInput, "phone">): Promise<PhoneRuleMutationResult> {
  assertId(id);
  const fields = phoneRuleFields(input);
  const row = await db.orm.public.PhoneRule.where({ id }).select("id", "phone", "type").update(fields);
  if (!row) throw new ModelError("NOT_FOUND", "Cette règle n'existe plus.");
  return { id: row.id, phone: row.phone, type: row.type, created: false };
}
