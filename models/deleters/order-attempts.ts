import "server-only";

import { db } from "@/lib/prisma";
import { tunisDayKey } from "@/lib/tunisia";
import { ModelError } from "@/models/errors";
import type { AntiAbusePurgeResult } from "@/types/admin-data";

/**
 * ADMIN — personal data retention for the anti-abuse journal (spec 6.4, law 2004-63).
 * Refused attempts (EF-38) and daily counters (EF-36) hold phone numbers and names:
 * they are useful for a few weeks only. Run it together with anonymizeOldOrders().
 * No auth check here: the Server Action (or a scheduled job) calls requireAdmin() first.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Delete refused attempts and order counters older than `days` days. Returns how many rows were deleted. */
export async function purgeOldAntiAbuseData(days = 90, now: Date = new Date()): Promise<AntiAbusePurgeResult> {
  if (!Number.isInteger(days) || days < 1) throw new ModelError("INVALID_DAYS", "Nombre de jours invalide.");
  const cutoff = new Date(now.getTime() - days * DAY_MS);
  const cutoffDayKey = tunisDayKey(cutoff); // "YYYY-MM-DD" strings compare like dates

  const [attempts, counters] = await Promise.all([
    db.orm.public.OrderAttempt.where((a) => a.createdAt.lt(cutoff)).deleteAndCount(),
    db.orm.public.OrderCounter.where((c) => c.dayKey.lt(cutoffDayKey)).deleteAndCount(),
  ]);
  return { attempts, counters };
}
