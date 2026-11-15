"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { REPORT_STATUS_LABELS } from "@/components/admin/status-badge";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getIpHash } from "@/lib/request";
import { formDataToObject, idSchema, optionalText, submittedValues, validationError, type ActionState } from "@/lib/validators";
import { deleteReport } from "@/models/deleters/reports";
import { ModelError } from "@/models/errors";
import { updateReport } from "@/models/puters/reports";
import { REPORT_STATUSES } from "@/types";
import type { ReportUpdateResult } from "@/types/admin-data";

/* ==========================================================================
   Server Actions of the Signalements page ("Signaler une erreur", spec EF-20 / EF-23).
   Each one starts with requireAdmin(), validates its input with zod and writes an
   audit log. Reports are private: no public cache to refresh (the reported sheet
   itself is corrected from its own edit page).
   ========================================================================== */

const processSchema = z.object({
  status: z.enum(REPORT_STATUSES, { error: "Choisissez un statut." }),
  adminNote: optionalText(2000),
});

const UNKNOWN_REPORT: ActionState = { status: "error", message: "Ce signalement n'existe pas (ou plus)." };

/** Answer the form AND refresh the page data (same as the Sécurité page). */
function answer(state: ActionState): ActionState {
  refresh();
  return state;
}

/** A ModelError (e.g. NOT_FOUND: deleted by another admin) → its French message; anything else → generic. */
function errorState(error: unknown, formData: FormData | null): ActionState {
  const values = formData ? submittedValues(formData) : undefined;
  if (error instanceof ModelError) return { status: "error", message: error.message, values };
  console.error("[admin] report action failed", error);
  return { status: "error", message: "error", values };
}

/**
 * Status + internal note of a report (dialog "Traiter").
 * Bound on the server: updateReportAction.bind(null, report.id).
 */
export async function updateReportAction(reportId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(reportId);
  if (!id.success) return answer(UNKNOWN_REPORT);

  const parsed = processSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return answer(validationError(parsed.error, formData));

  let result: ReportUpdateResult;
  try {
    result = await updateReport(id.data, parsed.data);
  } catch (error) {
    return answer(errorState(error, formData));
  }

  await logAdminAction(
    admin,
    "status",
    "report",
    result.id,
    `Statut « ${REPORT_STATUS_LABELS[result.status]} »${parsed.data.adminNote ? ", note interne enregistrée" : ""}`,
    await getIpHash(),
  );
  return answer({ status: "success", message: `Signalement « ${REPORT_STATUS_LABELS[result.status]} ».` });
}

/**
 * Delete a report (spam...) with ConfirmDeleteButton. From the queue (hidden field stay=1)
 * the list is refreshed; otherwise back to the queue with a confirmation.
 */
export async function deleteReportAction(reportId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(reportId);
  if (!id.success) return answer(UNKNOWN_REPORT);

  try {
    await deleteReport(id.data);
  } catch (error) {
    return answer(errorState(error, null));
  }

  await logAdminAction(admin, "delete", "report", id.data, null, await getIpHash());
  if (formData.get("stay") === "1") return answer({ status: "success", message: "Signalement supprimé." });
  redirect("/admin/signalements?ok=deleted");
}
