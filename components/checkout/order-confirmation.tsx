"use client";

import { ArrowRight, Check, CircleCheck, Copy, Truck } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { LogoEmblem } from "@/components/logo";
import { buttonStyles } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { formatPhone } from "@/lib/format";
import type { Locale, PaymentMethod, PlacedOrderDTO } from "@/types";

import { ltr } from "./text";

/**
 * Screen shown once the order is saved: the reference (big), the amounts computed by the
 * SERVER, the delay and the payment method, with a link to the tracking page.
 */
export function OrderConfirmation({
  lang,
  texts,
  order,
  firstName,
  phone,
  paymentMethod,
}: {
  lang: Locale;
  texts: CheckoutDict;
  /** The result of placeOrder (server amounts, never the browser's) */
  order: PlacedOrderDTO;
  firstName: string;
  /** The 8 normalised digits */
  phone: string;
  paymentMethod: PaymentMethod;
}) {
  const t = texts.confirmation;
  const [copied, setCopied] = useState(false);

  // Move the focus (and the screen) to the good news when it appears. Stable function: React calls
  // it once when the title is mounted, not again at each re-render (e.g. after "Copier").
  const revealTitle = useCallback((node: HTMLHeadingElement | null) => {
    if (!node) return;
    node.focus({ preventScroll: true });
    node.scrollIntoView({ block: "center" });
  }, []);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(order.reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (old browser, no permission): the reference stays visible on screen.
    }
  }

  return (
    <section aria-labelledby="order-confirmation-title" className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-lift">
        {/* Dark green band with the Tunisian pattern */}
        <div className="relative isolate overflow-hidden bg-brand-950 bg-khatam-light px-6 py-10 text-center text-white sm:px-10 sm:py-12">
          <LogoEmblem className="absolute -end-10 -bottom-12 -z-10 size-48 opacity-10" />
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
            <CircleCheck className="size-9 text-saffron-400" aria-hidden="true" />
          </span>
          <p className="mt-5 text-xs font-bold tracking-[0.14em] text-brand-200 uppercase rtl:tracking-normal">
            {t.eyebrow}
          </p>
          <h2
            id="order-confirmation-title"
            tabIndex={-1}
            ref={revealTitle}
            className="mt-2 text-3xl font-extrabold outline-none sm:text-4xl"
          >
            {interpolate(t.title, { name: firstName })}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-brand-100/85">
            {interpolate(t.text, { phone: ltr(formatPhone(phone)) })}
          </p>
        </div>
        <div aria-hidden="true" className="studs h-1.5 bg-brand-50" />

        <div className="p-6 sm:p-10">
          {/* Reference */}
          <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-5 py-6 text-center">
            <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal">{t.reference}</p>
            <p dir="ltr" className="tabular mt-2 text-4xl font-extrabold tracking-[0.08em] text-brand-900 select-all sm:text-5xl">
              {order.reference}
            </p>
            <button
              type="button"
              onClick={copyReference}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-brand-800 shadow-sm ring-1 ring-brand-200 transition-colors hover:bg-brand-50"
            >
              {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copied ? t.copied : t.copy}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? t.copied : ""}
            </span>
            <p className="mt-3 text-sm text-ink-muted">{t.referenceHint}</p>
          </div>

          {/* Amounts (from the server), delay, payment */}
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-canvas p-4">
              <dt className="text-xs text-ink-subtle">{t.total}</dt>
              <dd className="mt-1">
                <Price value={order.total} locale={lang} className="text-2xl text-brand-800" />
              </dd>
              <dd className="mt-1 text-xs text-ink-muted">
                {t.subtotal} <Price value={order.subtotal} locale={lang} className="font-semibold" /> · {t.delivery}{" "}
                {order.deliveryFee === 0 ? (
                  <span className="font-semibold text-brand-700">{t.free}</span>
                ) : (
                  <Price value={order.deliveryFee} locale={lang} className="font-semibold" />
                )}
              </dd>
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              <dt className="text-xs text-ink-subtle">{t.delay}</dt>
              <dd className="mt-1 flex items-center gap-2 text-lg font-bold text-ink">
                <Truck className="size-5 shrink-0 text-brand-700" aria-hidden="true" />
                <bdi>{order.delay}</bdi>
              </dd>
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              <dt className="text-xs text-ink-subtle">{t.payment}</dt>
              <dd className="mt-1 text-base font-bold text-ink">{texts.payment.onDelivery}</dd>
              <dd className="text-xs text-ink-muted">{texts.payment[paymentMethod].label}</dd>
            </div>
          </dl>

          {/* What happens next */}
          <div className="mt-8">
            <h3 className="text-base font-bold text-ink">{t.nextTitle}</h3>
            <ol className="mt-4 space-y-3">
              {t.nextSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                  <span
                    aria-hidden="true"
                    className="tabular grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700"
                  >
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`${localePath(lang, "/suivi")}?ref=${encodeURIComponent(order.reference)}`}
              className={buttonStyles({ size: "lg" })}
            >
              {t.track}
              <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
            </Link>
            <Link href={localePath(lang, "/produits")} className={buttonStyles({ variant: "outline", size: "lg" })}>
              {t.continue}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
