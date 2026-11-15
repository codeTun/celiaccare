import "server-only";

import { and } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId, toIso } from "@/models/fetchers/admin/helpers";
import { MESSAGE_STATUSES } from "@/types";
import type { MessageUpdateInput, MessageUpdateResult } from "@/types/admin-data";

/**
 * ADMIN — follow up a contact message. No auth check here: the Server Action calls requireAdmin() first.
 */

/**
 * Change the status and the internal note of a message.
 * handledAt is set when the message becomes RESOLVED or ARCHIVED (the first time only)
 * and cleared when it goes back to NEW or IN_PROGRESS.
 */
export async function updateMessage(id: number, input: MessageUpdateInput): Promise<MessageUpdateResult> {
  assertId(id);
  if (!MESSAGE_STATUSES.includes(input.status)) throw new ModelError("INVALID_STATUS", "Statut inconnu.");
  const current = await db.orm.public.ContactMessage.select("id", "handledAt").first({ id });
  if (!current) throw new ModelError("NOT_FOUND", "Ce message n'existe plus.");

  const isHandled = input.status === "RESOLVED" || input.status === "ARCHIVED";
  const handledAt = isHandled ? (current.handledAt ?? new Date()) : null;
  const saved = await db.orm.public.ContactMessage.where({ id }).select("id").update({
    status: input.status,
    adminNote: input.adminNote?.trim() || null,
    handledAt,
  });
  if (!saved) throw new ModelError("NOT_FOUND", "Ce message n'existe plus."); // deleted meanwhile
  return { id, status: input.status, handledAt: toIso(handledAt) };
}

/**
 * The admin opened a NEW message: it becomes IN_PROGRESS (the note is kept).
 * Only a NEW message changes, so calling it twice is harmless. Returns true when it changed.
 */
export async function markMessageOpened(id: number): Promise<boolean> {
  assertId(id);
  const row = await db.orm.public.ContactMessage.where((m) => and(m.id.eq(id), m.status.eq("NEW")))
    .select("id")
    .update({ status: "IN_PROGRESS" });
  return row !== null;
}
