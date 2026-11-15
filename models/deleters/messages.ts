import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";

/**
 * ADMIN — delete a contact message (e.g. spam). No auth check here: the Server Action
 * calls requireAdmin() first.
 */

export async function deleteMessage(id: number): Promise<{ id: number }> {
  assertId(id);
  const row = await db.orm.public.ContactMessage.where({ id }).select("id").delete();
  if (!row) throw new ModelError("NOT_FOUND", "Ce message n'existe plus.");
  return { id: row.id };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Personal data retention (privacy policy): contact messages are kept 12 months, then deleted.
 * Runs once a day from the admin dashboard (scheduleDailyRetention). Returns how many were deleted.
 */
export async function purgeOldMessages(days = 365, now: Date = new Date()): Promise<number> {
  if (!Number.isInteger(days) || days < 1) throw new ModelError("INVALID_DAYS", "Nombre de jours invalide.");
  const cutoff = new Date(now.getTime() - days * DAY_MS);
  return db.orm.public.ContactMessage.where((m) => m.createdAt.lt(cutoff)).deleteAndCount();
}
