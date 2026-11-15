"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { MESSAGE_STATUS_LABELS } from "@/components/admin/status-badge";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getIpHash } from "@/lib/request";
import { formDataToObject, idSchema, optionalText, submittedValues, validationError, type ActionState } from "@/lib/validators";
import { deleteMessage } from "@/models/deleters/messages";
import { ModelError } from "@/models/errors";
import { markMessageOpened, updateMessage } from "@/models/puters/messages";
import { MESSAGE_STATUSES } from "@/types";
import type { MessageUpdateResult } from "@/types/admin-data";

/* ==========================================================================
   Server Actions of the Messages pages (contact form inbox).
   Each one starts with requireAdmin(), validates its input with zod and
   writes an audit log. Messages are private: no public cache to refresh.
   ========================================================================== */

const INBOX_PATH = "/admin/messages";

const followUpSchema = z.object({
  status: z.enum(MESSAGE_STATUSES, { error: "Choisissez un statut." }),
  adminNote: optionalText(2000),
});

const UNKNOWN_MESSAGE: ActionState = { status: "error", message: "Ce message n'existe pas (ou plus)." };

/** Answer the form AND refresh the page data (same as the Sécurité page). */
function answer(state: ActionState): ActionState {
  refresh();
  return state;
}

/** A ModelError (e.g. NOT_FOUND: deleted by another admin) → its French message; anything else → generic. */
function errorState(error: unknown, formData: FormData | null): ActionState {
  const values = formData ? submittedValues(formData) : undefined;
  if (error instanceof ModelError) return { status: "error", message: error.message, values };
  console.error("[admin] message action failed", error);
  return { status: "error", message: "error", values };
}

/** Status + internal note of a message (bound on the server: updateMessageAction.bind(null, message.id)). */
export async function updateMessageAction(messageId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(messageId);
  if (!id.success) return answer(UNKNOWN_MESSAGE);

  const parsed = followUpSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return answer(validationError(parsed.error, formData));

  let result: MessageUpdateResult;
  try {
    result = await updateMessage(id.data, parsed.data);
  } catch (error) {
    return answer(errorState(error, formData));
  }

  await logAdminAction(
    admin,
    "status",
    "message",
    result.id,
    `Statut « ${MESSAGE_STATUS_LABELS[result.status]} »${parsed.data.adminNote ? ", note interne enregistrée" : ""}`,
    await getIpHash(),
  );
  redirect(`${INBOX_PATH}/${result.id}?ok=updated`);
}

/**
 * Called once by the detail page when a NEW message is displayed: it becomes "En cours".
 * Bound on the server (markMessageOpenedAction.bind(null, message.id)); does nothing for
 * a message that is not NEW any more.
 */
export async function markMessageOpenedAction(messageId: number): Promise<void> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(messageId);
  if (!id.success) return;

  if (await markMessageOpened(id.data)) {
    await logAdminAction(admin, "status", "message", id.data, "Message ouvert : statut « En cours »", await getIpHash());
    refresh();
  }
}

/**
 * Delete a message (spam, duplicate...) with ConfirmDeleteButton. From the inbox (hidden
 * field stay=1) the list is refreshed; from the detail page, back to the inbox.
 */
export async function deleteMessageAction(messageId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(messageId);
  if (!id.success) return answer(UNKNOWN_MESSAGE);

  try {
    await deleteMessage(id.data);
  } catch (error) {
    return answer(errorState(error, null));
  }

  await logAdminAction(admin, "delete", "message", id.data, null, await getIpHash());
  if (formData.get("stay") === "1") return answer({ status: "success", message: "Message supprimé." });
  redirect(`${INBOX_PATH}?ok=deleted`);
}
