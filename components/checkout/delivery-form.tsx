"use client";

import { ArrowLeft, ArrowRight, Banknote, CreditCard, MapPin, Truck, UserRound, Wallet } from "lucide-react";
import Link from "next/link";
import type { ReactNode, Ref, SubmitEvent } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxField, HoneypotField, SelectField, TextareaField, TextField } from "@/components/ui/form";
import { Price } from "@/components/ui/price";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { formatPrice } from "@/lib/format";
import { GOVERNORATES, governorateLabel } from "@/lib/tunisia";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS, type DeliveryZoneDTO, type Locale, type OrderType, type PaymentMethod } from "@/types";

import type { DeliveryQuote } from "./delivery";
import { DELIVERY_LIMITS, type DeliveryField, type DeliveryValues } from "./rules";
import { isolate } from "./text";
import type { CheckoutRestaurant } from "./types";

export type DeliveryErrors = Partial<Record<DeliveryField, string>>;

const paymentIcons: Record<PaymentMethod, typeof Banknote> = {
  CASH_ON_DELIVERY: Banknote,
  CARD_ON_DELIVERY: CreditCard,
};

/**
 * Step 1 of the checkout: who and where to deliver, how to pay (spec EF-30 → EF-33).
 * Controlled form: the values and errors live in <CheckoutFlow>.
 */
export function DeliveryForm({
  lang,
  texts,
  values,
  governorate,
  errors,
  showErrorSummary,
  cartType,
  zones,
  restaurant,
  quote,
  headingRef,
  onFieldChange,
  onFieldBlur,
  onSubmit,
}: {
  lang: Locale;
  texts: CheckoutDict;
  values: DeliveryValues;
  /** The governorate shown in the select (a restaurant cart starts with the restaurant's one) */
  governorate: string;
  errors: DeliveryErrors;
  /** true after "Continuer" was clicked while some fields were wrong */
  showErrorSummary: boolean;
  cartType: OrderType;
  zones: DeliveryZoneDTO[];
  restaurant: CheckoutRestaurant | null;
  /** Fee and delay for the chosen governorate (null when none or not covered) */
  quote: DeliveryQuote | null;
  headingRef: Ref<HTMLHeadingElement>;
  onFieldChange: <F extends DeliveryField>(field: F, value: DeliveryValues[F]) => void;
  onFieldBlur: (field: DeliveryField) => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
}) {
  const { fields } = texts;

  /** Props shared by the text inputs: value, error and change / blur handlers. */
  function textProps(field: "fullName" | "phone" | "city" | "street" | "addressDetails" | "note") {
    return {
      name: field,
      value: values[field],
      error: errors[field],
      onChange: (event: { target: { value: string } }) => onFieldChange(field, event.target.value),
      onBlur: () => onFieldBlur(field),
    };
  }

  /** Text of a governorate in the select, e.g. "Sousse — 8,000 DT · 48 h" or "Kébili — pas encore desservi". */
  function governorateOption(value: string): { label: string; deliverable: boolean } {
    const name = governorateLabel(value, lang);
    if (cartType === "RESTAURANT") {
      if (restaurant && restaurant.governorate === value) {
        const fee = restaurant.deliveryFee === 0 ? texts.summary.free : formatPrice(restaurant.deliveryFee, lang);
        return { label: `${name} — ${fee} · ${isolate(restaurant.deliveryTime)}`, deliverable: true };
      }
      return { label: `${name} — ${fields.governorate.outsideRestaurant}`, deliverable: false };
    }
    const zone = zones.find((item) => item.governorate === value);
    if (!zone) return { label: `${name} — ${fields.governorate.notCovered}`, deliverable: false };
    const fee = zone.fee === 0 ? texts.summary.free : formatPrice(zone.fee, lang);
    return { label: `${name} — ${fee} · ${isolate(zone.delay)}`, deliverable: true };
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-labelledby="checkout-details-title"
      className="relative rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-7"
    >
      <h2
        id="checkout-details-title"
        ref={headingRef}
        tabIndex={-1}
        className="scroll-mt-28 text-xl font-extrabold text-ink outline-none sm:text-2xl"
      >
        {texts.details.title}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">{texts.details.intro}</p>

      {/* 1. Contact */}
      <Section icon={<UserRound />} legend={texts.details.contactLegend}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            {...textProps("fullName")}
            label={fields.fullName.label}
            placeholder={fields.fullName.placeholder}
            autoComplete="name"
            maxLength={DELIVERY_LIMITS.fullName.max}
            required
          />
          <TextField
            {...textProps("phone")}
            type="tel"
            inputMode="tel"
            label={fields.phone.label}
            placeholder={fields.phone.placeholder}
            hint={fields.phone.hint}
            autoComplete="tel"
            maxLength={20}
            required
          />
        </div>
      </Section>

      {/* 2. Address */}
      <Section icon={<MapPin />} legend={texts.details.addressLegend}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SelectField
              name="governorate"
              label={fields.governorate.label}
              value={governorate}
              onChange={(event) => onFieldChange("governorate", event.target.value)}
              onBlur={() => onFieldBlur("governorate")}
              error={errors.governorate}
              hint={
                cartType === "RESTAURANT" && restaurant
                  ? interpolate(fields.governorate.restaurantHint, {
                      governorate: governorateLabel(restaurant.governorate, lang),
                    })
                  : undefined
              }
              autoComplete="address-level1"
              required
            >
              <option value="" disabled>
                {fields.governorate.placeholder}
              </option>
              {GOVERNORATES.map(({ value }) => {
                const option = governorateOption(value);
                return (
                  <option key={value} value={value} disabled={!option.deliverable}>
                    {option.label}
                  </option>
                );
              })}
            </SelectField>
            {quote ? <ZoneDetails lang={lang} texts={texts} quote={quote} /> : null}
          </div>
          <TextField
            {...textProps("city")}
            label={fields.city.label}
            placeholder={fields.city.placeholder}
            autoComplete="address-level2"
            maxLength={DELIVERY_LIMITS.city.max}
            required
          />
          <TextField
            {...textProps("street")}
            label={fields.street.label}
            placeholder={fields.street.placeholder}
            autoComplete="address-line1"
            maxLength={DELIVERY_LIMITS.street.max}
            required
          />
          <TextField
            {...textProps("addressDetails")}
            label={fields.addressDetails.label}
            placeholder={fields.addressDetails.placeholder}
            autoComplete="address-line2"
            maxLength={DELIVERY_LIMITS.addressDetails.max}
            wrapperClassName="sm:col-span-2"
          />
          <TextareaField
            {...textProps("note")}
            label={fields.note.label}
            placeholder={fields.note.placeholder}
            maxLength={DELIVERY_LIMITS.note.max}
            rows={3}
            wrapperClassName="sm:col-span-2"
          />
        </div>
      </Section>

      {/* 3. Payment */}
      <Section icon={<Wallet />} legend={texts.details.paymentLegend}>
        <div className="grid gap-3 sm:grid-cols-2">
          {PAYMENT_METHODS.map((method) => {
            const Icon = paymentIcons[method];
            return (
              <label
                key={method}
                className="flex cursor-pointer gap-3 rounded-2xl border border-line-strong bg-white p-4 transition-colors hover:border-brand-300 has-checked:border-brand-500 has-checked:bg-brand-50/60 has-checked:ring-2 has-checked:ring-brand-100 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-600"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={values.paymentMethod === method}
                  onChange={() => onFieldChange("paymentMethod", method)}
                  className="mt-1 size-4 shrink-0 cursor-pointer accent-brand-600 focus-visible:outline-none"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    <Icon className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
                    {texts.payment[method].label}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-ink-muted">
                    {texts.payment[method].description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* 4. Consent (law n° 2004-63) */}
      <div className="mt-7 rounded-2xl bg-canvas p-4">
        <CheckboxField
          name="consent"
          checked={values.consent}
          onChange={(event) => onFieldChange("consent", event.target.checked)}
          error={errors.consent}
          required
          label={
            <>
              {fields.consent.before}
              <Link
                href={localePath(lang, "/confidentialite")}
                target="_blank"
                className="font-semibold text-brand-700 underline underline-offset-2 hover:no-underline"
              >
                {fields.consent.link}
              </Link>
              {fields.consent.after}
            </>
          }
        />
      </div>

      {/* Anti-bot field, invisible to people */}
      <HoneypotField />

      {showErrorSummary ? (
        <Alert tone="error" className="mt-6">
          {texts.errors.summary}
        </Alert>
      ) : null}

      <div className="mt-7 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={localePath(lang, "/panier")}
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          {texts.details.backToCart}
        </Link>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          {texts.details.continue}
          <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

/** A group of fields with its title. */
function Section({ icon, legend, children }: { icon: ReactNode; legend: string; children: ReactNode }) {
  return (
    <fieldset className="mt-8 border-t border-line pt-6">
      <legend className="sr-only">{legend}</legend>
      <p aria-hidden="true" className="mb-5 flex items-center gap-2.5 text-base font-bold text-ink">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 [&_svg]:size-4">
          {icon}
        </span>
        {legend}
      </p>
      {children}
    </fieldset>
  );
}

/** Fee and delay of the chosen governorate, under the select. */
function ZoneDetails({ lang, texts, quote }: { lang: Locale; texts: CheckoutDict; quote: DeliveryQuote }) {
  // Zones with a free-delivery threshold: "offerte dès 80 DT" or "offerte pour cette commande".
  let freeText: string | null = null;
  if (quote.freeFrom !== null) {
    freeText = quote.isFree
      ? texts.zone.freeApplied
      : interpolate(texts.zone.freeFrom, { price: formatPrice(quote.freeFrom, lang) });
  }

  return (
    <div className="mt-3 rounded-xl bg-brand-50/70 p-3.5 ring-1 ring-brand-100">
      <div className="flex items-start gap-3">
        <Truck className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
        <dl className="grid flex-1 grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-ink-muted">{texts.zone.fee}</dt>
            <dd className="font-bold text-ink">
              {quote.fee === 0 ? (
                <span className="text-brand-700">{texts.summary.free}</span>
              ) : (
                <Price value={quote.fee} locale={lang} />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">{texts.zone.delay}</dt>
            <dd className="font-bold text-ink">
              <bdi>{quote.delay}</bdi>
            </dd>
          </div>
        </dl>
      </div>
      {freeText ? (
        <p className={cn("mt-2 ps-7 text-xs text-brand-700", quote.isFree && "font-semibold")}>{freeText}</p>
      ) : null}
    </div>
  );
}
