"use client";

import { Search } from "lucide-react";
import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { HoneypotField, TextField } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import type { Locale } from "@/types";

import { OrderTracking } from "./order-tracking";
import type { TrackOrderAction, TrackOrderError, TrackOrderState } from "./types";

const INITIAL_STATE: TrackOrderState = { status: "idle" };

const MESSAGES: TrackOrderError[] = ["NOT_FOUND", "INVALID", "RATE_LIMIT", "ERROR"];

/**
 * Order tracking form (/suivi): reference + phone number → status of the order.
 * `defaultReference` comes from the link of the confirmation screen (/suivi?ref=CC-...).
 */
export function TrackingForm({
  lang,
  texts,
  defaultReference,
  trackOrder,
}: {
  lang: Locale;
  /** dict.checkout */
  texts: CheckoutDict;
  defaultReference: string;
  /**
   * The Server Action trackOrderAction of app/[lang]/suivi/actions.ts, ALREADY bound to the language
   * by the page (trackOrderAction.bind(null, lang)). Never bind it here: see KNOWN-ISSUES (React 19).
   */
  trackOrder: TrackOrderAction;
}) {
  const t = texts.tracking;
  const [state, formAction] = useActionState(trackOrder, INITIAL_STATE);

  const order = state.status === "success" ? state.data : undefined;
  const errorCode = MESSAGES.find((code) => code === state.message) ?? "ERROR";

  return (
    <div className="space-y-8">
      <form
        action={formAction}
        noValidate
        aria-labelledby="tracking-form-title"
        className="relative mx-auto max-w-3xl rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-7"
      >
        <h2 id="tracking-form-title" className="flex items-center gap-2.5 text-lg font-extrabold text-ink sm:text-xl">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"
          >
            <Search className="size-[18px]" />
          </span>
          {t.form.title}
        </h2>

        {state.status === "error" ? (
          <Alert tone="error" className="mt-5">
            {t.messages[errorCode]}
          </Alert>
        ) : null}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <TextField
            name="reference"
            label={t.form.reference.label}
            placeholder={t.form.reference.placeholder}
            hint={t.form.reference.hint}
            defaultValue={state.values?.reference ?? defaultReference}
            error={state.fieldErrors?.reference}
            dir="ltr"
            className="uppercase placeholder:normal-case rtl:text-right"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            maxLength={20}
            required
          />
          <TextField
            name="phone"
            type="tel"
            inputMode="tel"
            label={t.form.phone.label}
            placeholder={t.form.phone.placeholder}
            defaultValue={state.values?.phone ?? ""}
            error={state.fieldErrors?.phone}
            autoComplete="tel"
            maxLength={20}
            required
          />
        </div>

        <HoneypotField />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-ink-subtle sm:max-w-sm">{t.form.privacy}</p>
          <SubmitButton size="lg" pendingLabel={t.form.sending} className="w-full sm:w-auto">
            <Search aria-hidden="true" />
            {t.form.submit}
          </SubmitButton>
        </div>
      </form>

      {order ? (
        // A new answer = a new result block (its title takes the focus again).
        <OrderTracking
          key={`${order.reference}-${order.status}`}
          lang={lang}
          texts={t}
          paymentTexts={texts.payment}
          helpTexts={texts.help}
          order={order}
        />
      ) : null}
    </div>
  );
}
