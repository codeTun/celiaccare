"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";

import { FormMessage } from "@/components/admin/admin-form";
import { MESSAGE_STATUS_LABELS } from "@/components/admin/status-badge";
import { TextareaField } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleState, type ActionState } from "@/lib/validators";
import { MESSAGE_STATUSES, type MessageStatus } from "@/types";

/** What each status means for the team. */
const STATUS_HINTS: Record<MessageStatus, string> = {
  NEW: "Pas encore lu.",
  IN_PROGRESS: "Lu, réponse en préparation.",
  RESOLVED: "Réponse envoyée ou demande réglée.",
  ARCHIVED: "Classé sans suite (spam, doublon…).",
};

/**
 * Follow-up of a contact message: its status and an internal note (never shown to the sender).
 * `action` is bound on the server: updateMessageAction.bind(null, message.id).
 */
export function MessageFollowUpForm({
  action,
  status,
  adminNote,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  status: MessageStatus;
  adminNote: string | null;
}) {
  const [state, formAction] = useActionState(action, idleState);
  const current = state.values?.status ?? status;
  const statusError = state.fieldErrors?.status?.[0];

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />
      <fieldset aria-describedby={statusError ? "message-status-error" : undefined}>
        <legend className="text-sm font-semibold text-ink">Statut</legend>
        <div className="mt-2 grid gap-2">
          {MESSAGE_STATUSES.map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5 transition-colors hover:border-brand-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50/60 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-100"
            >
              <input
                type="radio"
                name="status"
                value={value}
                required
                defaultChecked={current === value}
                className="mt-0.5 size-4 shrink-0 accent-brand-600"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{MESSAGE_STATUS_LABELS[value]}</span>
                <span className="block text-xs text-ink-subtle">{STATUS_HINTS[value]}</span>
              </span>
            </label>
          ))}
        </div>
        {statusError ? (
          <p id="message-status-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
            {statusError}
          </p>
        ) : null}
      </fieldset>
      <TextareaField
        name="adminNote"
        label="Note interne"
        rows={4}
        maxLength={2000}
        placeholder="Ex. Rappelé le 12/11, attend un devis…"
        hint="Visible seulement par les administrateurs."
        defaultValue={state.values?.adminNote ?? adminNote ?? ""}
        error={state.fieldErrors?.adminNote}
      />
      <SubmitButton pendingLabel="Enregistrement…" className="w-full sm:w-auto">
        <Check aria-hidden="true" />
        Enregistrer le suivi
      </SubmitButton>
    </form>
  );
}
