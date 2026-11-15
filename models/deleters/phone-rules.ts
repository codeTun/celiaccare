import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import type { PhoneRuleType } from "@/types";

/**
 * ADMIN — remove a BLOCKED / EXCEPTION rule: the number goes back to the normal
 * 3-orders-per-day limit. No auth check here: the Server Action calls requireAdmin() first.
 */

export async function deletePhoneRule(id: number): Promise<{ id: number; phone: string; type: PhoneRuleType }> {
  assertId(id);
  const row = await db.orm.public.PhoneRule.where({ id }).select("id", "phone", "type").delete();
  if (!row) throw new ModelError("NOT_FOUND", "Cette règle n'existe plus.");
  return { id: row.id, phone: row.phone, type: row.type };
}
