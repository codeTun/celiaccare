import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId, toIso } from "@/models/fetchers/admin/helpers";
import { REPORT_STATUSES } from "@/types";
import type { ReportUpdateInput, ReportUpdateResult } from "@/types/admin-data";

/**
 * ADMIN — handle an error report ("Signaler une erreur", spec EF-23).
 * No auth check here: the Server Action calls requireAdmin() first.
 */

/**
 * Change the status and the internal note of a report.
 * resolvedAt is set when the report becomes RESOLVED or REJECTED (the first time only)
 * and cleared when it goes back to OPEN or IN_REVIEW.
 */
export async function updateReport(id: number, input: ReportUpdateInput): Promise<ReportUpdateResult> {
  assertId(id);
  if (!REPORT_STATUSES.includes(input.status)) throw new ModelError("INVALID_STATUS", "Statut inconnu.");
  const current = await db.orm.public.Report.select("id", "resolvedAt").first({ id });
  if (!current) throw new ModelError("NOT_FOUND", "Ce signalement n'existe plus.");

  const isClosed = input.status === "RESOLVED" || input.status === "REJECTED";
  const resolvedAt = isClosed ? (current.resolvedAt ?? new Date()) : null;
  const saved = await db.orm.public.Report.where({ id }).select("id").update({
    status: input.status,
    adminNote: input.adminNote?.trim() || null,
    resolvedAt,
  });
  if (!saved) throw new ModelError("NOT_FOUND", "Ce signalement n'existe plus."); // deleted meanwhile
  return { id, status: input.status, resolvedAt: toIso(resolvedAt) };
}
