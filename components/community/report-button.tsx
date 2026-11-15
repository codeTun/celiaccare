"use client";

import { CircleCheck, Flag } from "lucide-react";
import { useActionState, useId, useState } from "react";

import { submitReport, type ReportTargetRef } from "@/app/[lang]/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { HoneypotField, SelectField, TextareaField, TextField } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { interpolate } from "@/i18n/interpolate";
import type { CommunityDict } from "@/i18n/resources/fr/community";
import type { ActionState } from "@/lib/validators";
import { REPORT_REASONS, type Locale, type ReportTarget } from "@/types";

export type ReportButtonProps = {
  locale: Locale;
  /** The sheet the visitor reports (the name is shown in the dialog) */
  target: { type: ReportTarget; id: number; name: string };
  dict: CommunityDict;
  /** Label of the dialog's close button, e.g. common.actions.close */
  closeLabel: string;
  /** Extra classes for the button */
  className?: string;
};

/**
 * "Signaler une erreur" button (EF-20). It opens a dialog with a short form
 * (reason, message, optional contact) sent to the submitReport Server Action.
 * Client Component. Do not place it inside a <p> (the dialog is a block element).
 *
 * @example
 * <ReportButton
 *   locale={lang}
 *   target={{ type: "PRODUCT", id: product.id, name: product.name }}
 *   dict={dict.community}
 *   closeLabel={dict.common.actions.close}
 * />
 */
export function ReportButton({ locale, target, dict, closeLabel, className }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  // A new key each time the dialog opens = a new, empty form.
  const [formKey, setFormKey] = useState(0);

  function openDialog() {
    setFormKey((key) => key + 1);
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
  }

  return (
    <>
      <Button variant="ghost" aria-haspopup="dialog" onClick={openDialog} className={className}>
        <Flag aria-hidden="true" />
        {dict.report.button}
      </Button>

      <Dialog
        open={open}
        onClose={closeDialog}
        title={dict.report.title}
        description={interpolate(dict.report.description, { name: target.name })}
        closeLabel={closeLabel}
      >
        <ReportForm
          key={formKey}
          locale={locale}
          target={{ type: target.type, id: target.id }}
          labels={dict.report}
          closeLabel={closeLabel}
          onClose={closeDialog}
        />
      </Dialog>
    </>
  );
}

const initialState: ActionState = { status: "idle" };

/** The form inside the dialog, then the "thank you" message once it is sent. */
function ReportForm({
  locale,
  target,
  labels,
  closeLabel,
  onClose,
}: {
  locale: Locale;
  target: ReportTargetRef;
  labels: CommunityDict["report"];
  closeLabel: string;
  onClose: () => void;
}) {
  const id = useId();
  // Binding the action here is fine: this form only exists in the browser (in the open
  // dialog), never in server-rendered HTML (unlike the review form, see review-form.tsx).
  const [state, formAction] = useActionState(submitReport.bind(null, locale, target), initialState);
  // After an error, React empties the form: we refill it with what was sent.
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  // The chosen reason: a gluten problem shows a health notice.
  const [reason, setReason] = useState(values.reason ?? "");

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600 ring-8 ring-brand-50/60">
          <CircleCheck className="size-7" aria-hidden="true" />
        </span>
        <h3 ref={focusOnMount} tabIndex={-1} className="mt-5 text-base font-bold text-ink focus:outline-none">
          {labels.successTitle}
        </h3>
        <p role="status" className="mt-1 text-sm leading-relaxed text-ink-muted">
          {state.message}
        </p>
        <Button className="mt-6 w-full sm:w-auto" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="relative flex flex-col gap-5">
      <SelectField
        id={`${id}-reason`}
        name="reason"
        label={labels.reason}
        required
        defaultValue={values.reason ?? ""}
        error={errors.reason}
        onChange={(event) => setReason(event.target.value)}
      >
        <option value="" disabled>
          {labels.reasonPlaceholder}
        </option>
        {REPORT_REASONS.map((value) => (
          <option key={value} value={value}>
            {labels.reasons[value]}
          </option>
        ))}
      </SelectField>

      {reason === "GLUTEN_CONCERN" ? <Alert tone="warning">{labels.glutenNotice}</Alert> : null}

      <TextareaField
        id={`${id}-message`}
        name="message"
        label={labels.message}
        hint={labels.messageHint}
        placeholder={labels.messagePlaceholder}
        required
        minLength={10}
        maxLength={1000}
        rows={4}
        defaultValue={values.message}
        error={errors.message}
      />

      {/* E-mails and phone numbers are always written left-to-right, even in Arabic. */}
      <TextField
        id={`${id}-contact`}
        name="contact"
        label={labels.contact}
        hint={labels.contactHint}
        placeholder={labels.contactPlaceholder}
        maxLength={120}
        autoComplete="email"
        dir="ltr"
        className="rtl:text-right"
        defaultValue={values.contact}
        error={errors.contact}
      />

      <HoneypotField />

      {state.status === "error" && state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
          {labels.cancel}
        </Button>
        <SubmitButton className="w-full sm:w-auto" pendingLabel={labels.sending}>
          {labels.submit}
        </SubmitButton>
      </div>
    </form>
  );
}

/** Moves the focus to the "thank you" title when it appears (screen readers read it). */
function focusOnMount(element: HTMLElement | null) {
  element?.focus();
}
