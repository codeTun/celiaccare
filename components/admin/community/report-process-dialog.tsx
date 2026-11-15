"use client";

import { Check, ClipboardCheck, X } from "lucide-react";
import { useActionState, useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";

import { FormMessage } from "@/components/admin/admin-form";
import { REPORT_STATUS_LABELS } from "@/components/admin/status-badge";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleState, type ActionState } from "@/lib/validators";
import { REPORT_STATUSES, type ReportStatus } from "@/types";

/** What each status means for the team. */
const STATUS_HINTS: Record<ReportStatus, string> = {
  OPEN: "Pas encore regardé.",
  IN_REVIEW: "Vous vérifiez l'information (appel, visite…).",
  RESOLVED: "Vérifié : la fiche a été corrigée si besoin.",
  REJECTED: "Le signalement n'était pas fondé.",
};

/**
 * "Traiter" button of a report row: opens a dialog with the whole report, the status
 * (À traiter → En vérification → Corrigé / Rejeté) and an internal note.
 * `action` is bound on the server: updateReportAction.bind(null, report.id); it refreshes
 * the page, and the dialog closes after a successful save.
 */
export function ReportProcessDialog({
  action,
  status,
  adminNote,
  title,
  summary,
  links,
  triggerVariant = "outline",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  status: ReportStatus;
  adminNote: string | null;
  /** e.g. "Produit · Makroudh au maïs" */
  title: string;
  /** The report itself (reason, message, contact...), rendered by the page. */
  summary: ReactNode;
  /** Links to the reported sheet (public page, admin edit page). */
  links?: ReactNode;
  triggerVariant?: ButtonVariant;
}) {
  const [state, formAction] = useActionState(action, idleState);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const current = state.values?.status ?? status;

  // Saved → close the dialog (the page shows the new status).
  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state]);

  // Next.js keeps visited pages mounted but hidden: never leave the dialog open behind.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => dialog?.close();
  }, []);

  return (
    <>
      <Button variant={triggerVariant} size="sm" aria-haspopup="dialog" onClick={() => dialogRef.current?.showModal()}>
        <ClipboardCheck aria-hidden="true" />
        Traiter
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-line bg-white p-0 text-ink shadow-lift backdrop:bg-brand-950/40 backdrop:backdrop-blur-[2px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.08em] text-ink-subtle uppercase">Signalement</p>
            <h2 id={titleId} className="mt-0.5 text-lg font-bold break-words text-ink">
              {title}
            </h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => dialogRef.current?.close()}>
            <X aria-hidden="true" />
            <span className="sr-only">Fermer</span>
          </Button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-2xl bg-canvas/70 p-4 text-sm ring-1 ring-line">{summary}</div>
          {links ? <div className="flex flex-wrap gap-2">{links}</div> : null}

          <form action={formAction} className="space-y-5">
            <FormMessage state={state} />
            <fieldset>
              <legend className="text-sm font-semibold text-ink">Statut</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {REPORT_STATUSES.map((value) => (
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
                      <span className="block text-sm font-semibold text-ink">{REPORT_STATUS_LABELS[value]}</span>
                      <span className="block text-xs text-ink-subtle">{STATUS_HINTS[value]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <TextareaField
              name="adminNote"
              label="Note interne"
              rows={3}
              maxLength={2000}
              placeholder="Ex. Vérifié avec le gérant le 14/11 : la recette a changé, fiche corrigée."
              hint="Ce qui a été vérifié ou corrigé. Visible seulement par les administrateurs."
              defaultValue={state.values?.adminNote ?? adminNote ?? ""}
              error={state.fieldErrors?.adminNote}
            />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => dialogRef.current?.close()}>
                Annuler
              </Button>
              <SubmitButton pendingLabel="Enregistrement…">
                <Check aria-hidden="true" />
                Enregistrer
              </SubmitButton>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
