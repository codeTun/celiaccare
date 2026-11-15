import "server-only";

import { db } from "@/lib/prisma";
import type { PhoneRuleType } from "@/types";
import type { AdminPhoneRuleRow } from "@/types/admin-data";

import { isValidId, toIso } from "./helpers";

/**
 * ADMIN — phone rules (spec EF-39): BLOCKED numbers and justified EXCEPTIONS
 * to the 3-orders-per-day limit. Never cached.
 * Call requireAdmin() before using these functions.
 */

type PhoneRuleRecord = {
  id: number;
  phone: string;
  type: PhoneRuleType;
  maxPerDay: number | null;
  reason: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toPhoneRuleRow(row: PhoneRuleRecord, now: number): AdminPhoneRuleRow {
  return {
    id: row.id,
    phone: row.phone,
    type: row.type,
    maxPerDay: row.maxPerDay,
    reason: row.reason,
    expiresAt: toIso(row.expiresAt),
    isExpired: row.expiresAt !== null && row.expiresAt.getTime() <= now,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

/** Every rule, newest first. Expired rules are kept and flagged with isExpired. */
export async function listPhoneRules(): Promise<AdminPhoneRuleRow[]> {
  const rows = await db.orm.public.PhoneRule.orderBy([(r) => r.createdAt.desc(), (r) => r.id.desc()]).all();
  const now = Date.now();
  return rows.map((row) => toPhoneRuleRow(row, now));
}

/** One rule, to pre-fill its edit form. null when it does not exist. */
export async function getPhoneRule(id: number): Promise<AdminPhoneRuleRow | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.PhoneRule.first({ id });
  return row ? toPhoneRuleRow(row, Date.now()) : null;
}
