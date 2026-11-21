"use client";

import { PenLine, Send } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxField, HoneypotField, SelectField, TextareaField, TextField } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { localePath } from "@/i18n/config";
import type { ContactDict } from "@/i18n/resources/fr/contact";
// Type only: the validation code itself stays on the server.
import type { ActionState } from "@/lib/validators";
import { MESSAGE_TOPICS, type Locale, type MessageTopic } from "@/types";

/**
 * A request to order from a business that cannot be ordered from on the site yet
 * (/contact?sujet=commande&artisan=…, &restaurant=… or &produit=…): texts already written by the
 * server with the business name read from the database.
 */
export type OrderRequest = {
  /** Default value of the "Objet" field, e.g. "Demande de commande : LilyDelights" */
  subject: string;
  /** Example text of the message while the topic stays "Une commande" */
  messagePlaceholder: string;
  /** Short note above the form: we contact the business for the visitor */
  notice: string;
};

export type ContactFormProps = {
  lang: Locale;
  /** sendContactMessage (app/[lang]/contact/actions.ts) with the page language already bound */
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  /** Topic chosen in the URL (/contact?sujet=PARTNERSHIP), GENERAL otherwise */
  defaultTopic: MessageTopic;
  /** Order request for a published business or product (/contact?sujet=commande&artisan=…), null otherwise */
  orderRequest?: OrderRequest | null;
  /** dict.contact.form */
  labels: ContactDict["form"];
};

const initialState: ActionState = { status: "idle" };

function isTopic(value: string | undefined): value is MessageTopic {
  return MESSAGE_TOPICS.some((topic) => topic === value);
}

/**
 * Contact form (topic, name, e-mail or phone, subject, message, consent).
 * Checked on the server; errors are shown under each field. After a successful
 * submission, a confirmation replaces the form, with a button to write another message.
 */
export function ContactForm(props: ContactFormProps) {
  // Each new message gets a brand-new form (a new `key` resets the fields and the result).
  const [round, setRound] = useState(0);
  return <ContactFormRound key={round} {...props} onWriteAnother={() => setRound((count) => count + 1)} />;
}

function ContactFormRound({
  lang,
  action,
  defaultTopic,
  orderRequest = null,
  labels,
  onWriteAnother,
}: ContactFormProps & { onWriteAnother: () => void }) {
  const [state, formAction] = useActionState(action, initialState);
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};
  // Neither e-mail nor phone: both fields are marked and their shared hint becomes the error message.
  const reachError = errors.reach?.[0];
  const reachA11y = reachError ? ({ "aria-invalid": true, "aria-describedby": "contact-reach-hint" } as const) : {};
  // Topic used to fill the select again after an error.
  const selectedTopic = isTopic(values.topic) ? values.topic : defaultTopic;
  // Topic currently chosen: the examples of the "subject" and "message" fields follow it.
  const [topic, setTopic] = useState<MessageTopic>(defaultTopic);
  // Order request for a business: its own message example while the topic stays "Une commande".
  const messagePlaceholder =
    orderRequest && topic === "ORDER" ? orderRequest.messagePlaceholder : labels.messagePlaceholders[topic];

  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Accessibility: after sending, move the focus to the confirmation, or to the first wrong field.
  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    if (state.status === "error") formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} className="space-y-5 rounded-2xl outline-none">
        <Alert tone="success" title={labels.successTitle}>
          {labels.successText}
        </Alert>
        <Button variant="secondary" onClick={onWriteAnother} className="w-full sm:w-auto">
          <PenLine aria-hidden="true" />
          {labels.writeAnother}
        </Button>
      </div>
    );
  }

  return (
    // noValidate: every check is done on the server, with messages in the page language.
    <form ref={formRef} action={formAction} noValidate className="relative space-y-5">
      {state.status === "error" && state.message ? <Alert tone="error">{state.message}</Alert> : null}
      {/* About this business only while the topic stays "Une commande" */}
      {orderRequest && topic === "ORDER" ? <Alert tone="info">{orderRequest.notice}</Alert> : null}

      <HoneypotField name="website" />

      <SelectField
        // The select is re-created when the submitted topic changes, so it keeps it after an error.
        key={selectedTopic}
        name="topic"
        label={labels.topic}
        required
        defaultValue={selectedTopic}
        onChange={(event) => {
          if (isTopic(event.target.value)) setTopic(event.target.value);
        }}
        error={errors.topic}
      >
        {MESSAGE_TOPICS.map((value) => (
          <option key={value} value={value}>
            {labels.topics[value]}
          </option>
        ))}
      </SelectField>

      <TextField
        name="name"
        label={labels.name}
        required
        autoComplete="name"
        maxLength={100}
        placeholder={labels.namePlaceholder}
        defaultValue={values.name}
        error={errors.name}
      />

      {/* E-mail and phone: at least one of the two (the hint, or its error, is read by screen readers for both). */}
      <div role="group" aria-describedby="contact-reach-hint" className="space-y-2">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="email"
            type="email"
            label={labels.email}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            placeholder={labels.emailPlaceholder}
            defaultValue={values.email}
            error={errors.email}
            {...reachA11y}
          />
          <TextField
            name="phone"
            type="tel"
            label={labels.phone}
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            placeholder={labels.phonePlaceholder}
            defaultValue={values.phone}
            error={errors.phone}
            {...reachA11y}
          />
        </div>
        {/* Different keys: the error replaces the hint as a new element, so screen readers announce it. */}
        {reachError ? (
          <p key="error" id="contact-reach-hint" className="text-xs font-medium text-red-600" role="alert">
            {reachError}
          </p>
        ) : (
          <p key="hint" id="contact-reach-hint" className="text-xs text-ink-subtle">
            {labels.reachHint}
          </p>
        )}
      </div>

      <TextField
        name="subject"
        label={labels.subject}
        required
        maxLength={150}
        placeholder={labels.subjectPlaceholders[topic]}
        // After an error, what the visitor sent; otherwise the subject written for an order request.
        defaultValue={values.subject ?? orderRequest?.subject}
        error={errors.subject}
      />

      <TextareaField
        name="message"
        label={labels.message}
        required
        rows={6}
        maxLength={3000}
        placeholder={messagePlaceholder}
        hint={labels.messageHint}
        defaultValue={values.message}
        error={errors.message}
      />

      <CheckboxField
        name="consent"
        label={labels.consent}
        required
        defaultChecked={values.consent === "on"}
        hint={
          <Link
            href={localePath(lang, "/confidentialite")}
            className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-800"
          >
            {labels.privacyLink}
          </Link>
        }
        error={errors.consent}
      />

      <SubmitButton size="lg" pendingLabel={labels.sending} className="w-full sm:w-auto">
        <Send className="rtl:-scale-x-100" aria-hidden="true" />
        {labels.submit}
      </SubmitButton>
    </form>
  );
}
