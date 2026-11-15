import "server-only";

import { all, and, type Condition } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { MAX_ORDERS_PER_DAY, tunisDayKey } from "@/lib/tunisia";
import type { Paginated, PhoneRuleType, RefusalReason } from "@/types";
import type { AdminOrderCounterRow, AdminRefusedAttemptRow, PageQuery } from "@/types/admin-data";

import { containsPattern, pageWindow, paginated, toIso } from "./helpers";

/**
 * ADMIN — anti-abuse journal (spec EF-36 / EF-38): refused order attempts and
 * today's order counters per phone number. Never cached (personal data).
 * Call requireAdmin() before using these functions.
 */

/** Filters of the refused attempts journal. */
export type RefusedAttemptFilters = PageQuery & {
  reason?: RefusalReason;
  /** Part of the phone number (digits only are used). */
  q?: string;
};

/**
 * A refused attempt as shown in the journal, with `ipTag`: the first 8 characters of the
 * hashed IP (lib/request.ts). It never reveals the IP, but the same tag on several lines
 * means the same connection (e.g. one robot trying many numbers).
 */
export type RefusedAttemptLogRow = AdminRefusedAttemptRow & { ipTag: string | null };

/** EF-38: refused order attempts, most recent first, 20 per page. */
export async function listRefusedAttempts(query: RefusedAttemptFilters = {}): Promise<Paginated<RefusedAttemptLogRow>> {
  const { page, pageSize, offset } = pageWindow(query);
  const digits = query.q?.replace(/\D/g, "") ?? "";

  const filtered = db.orm.public.OrderAttempt.where((a) => {
    const conditions: Condition[] = [];
    if (query.reason) conditions.push(a.reason.eq(query.reason));
    if (digits) conditions.push(a.phone.like(containsPattern(digits)));
    return conditions.length > 0 ? and(...conditions) : all();
  });

  const [rows, count] = await Promise.all([
    filtered
      .select("id", "phone", "customerName", "dayKey", "reason", "ipHash", "createdAt")
      .orderBy([(a) => a.createdAt.desc(), (a) => a.id.desc()])
      .limit(pageSize)
      .offset(offset)
      .all(),
    filtered.aggregate((a) => ({ total: a.count() })),
  ]);
  const items = rows.map((row) => ({
    id: row.id,
    phone: row.phone,
    customerName: row.customerName,
    dayKey: row.dayKey,
    reason: row.reason,
    ipTag: row.ipHash ? row.ipHash.slice(0, 8) : null,
    createdAt: toIso(row.createdAt),
  }));
  return paginated(items, count.total, page, pageSize);
}

/**
 * EF-36: today's counters (Tunis day), the busiest numbers first, with the
 * daily limit that applies to each number (3, more with an EXCEPTION, 0 when BLOCKED).
 */
export async function getTodayCounters(now: Date = new Date()): Promise<AdminOrderCounterRow[]> {
  const dayKey = tunisDayKey(now);
  const counters = await db.orm.public.OrderCounter.where({ dayKey })
    .orderBy([(c) => c.count.desc(), (c) => c.refused.desc(), (c) => c.id.asc()])
    .all();
  if (counters.length === 0) return [];

  // Rules (not expired) of these numbers, in one query.
  const rules = await db.orm.public.PhoneRule.select("phone", "type", "maxPerDay", "expiresAt")
    .where((r) => r.phone.in(counters.map((c) => c.phone)))
    .all();
  const activeRules = new Map(
    rules.filter((r) => r.expiresAt === null || r.expiresAt.getTime() > now.getTime()).map((r) => [r.phone, r]),
  );

  return counters.map((counter) => {
    const rule = activeRules.get(counter.phone);
    const ruleType: PhoneRuleType | null = rule?.type ?? null;
    let dailyLimit = MAX_ORDERS_PER_DAY;
    if (rule?.type === "BLOCKED") dailyLimit = 0;
    if (rule?.type === "EXCEPTION") dailyLimit = rule.maxPerDay ?? MAX_ORDERS_PER_DAY;
    return {
      id: counter.id,
      phone: counter.phone,
      dayKey: counter.dayKey,
      count: counter.count,
      refused: counter.refused,
      ruleType,
      dailyLimit,
    };
  });
}
