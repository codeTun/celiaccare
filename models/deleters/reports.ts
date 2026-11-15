import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";

/**
 * ADMIN — delete an error report (e.g. spam). No auth check here: the Server Action
 * calls requireAdmin() first. Prefer the REJECTED status to keep a trace.
 */

export async function deleteReport(id: number): Promise<{ id: number }> {
  assertId(id);
  const row = await db.orm.public.Report.where({ id }).select("id").delete();
  if (!row) throw new ModelError("NOT_FOUND", "Ce signalement n'existe plus.");
  return { id: row.id };
}
