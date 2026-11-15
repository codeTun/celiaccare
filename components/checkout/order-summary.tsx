import type { ReactNode } from "react";

import { CloudImage } from "@/components/ui/cloud-image";
import { Price } from "@/components/ui/price";
import { interpolate } from "@/i18n/interpolate";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { cn } from "@/lib/utils";
import type { CartItem, Locale } from "@/types";

import type { DeliveryQuote } from "./delivery";

/**
 * "Votre commande" card beside the checkout: the lines (optional), the subtotal, the delivery
 * fee for the chosen governorate and the total. These are ESTIMATES: the server recomputes
 * every price when the order is sent. `children` = buttons / notices at the bottom of the card.
 */
export function OrderSummary({
  lang,
  texts,
  merchant,
  items,
  showItems,
  subtotal,
  quote,
  children,
  className,
}: {
  lang: Locale;
  /** dict.checkout.summary */
  texts: CheckoutDict["summary"];
  /** "Épicerie de nos artisans" or "Restaurant : …" */
  merchant: string;
  items: CartItem[];
  showItems: boolean;
  subtotal: number;
  quote: DeliveryQuote | null;
  children?: ReactNode;
  className?: string;
}) {
  const total = subtotal + (quote?.fee ?? 0);

  return (
    <section
      aria-labelledby="order-summary-title"
      className={cn("rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6", className)}
    >
      <h2 id="order-summary-title" className="text-lg font-extrabold text-ink">
        {texts.title}
      </h2>
      <p className="mt-0.5 text-sm text-ink-subtle">{merchant}</p>

      {showItems ? (
        <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto pe-1">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3">
              <CloudImage
                src={item.imageUrl}
                alt={item.name}
                sizes="48px"
                fallbackIcon={item.kind === "DISH" ? "meals" : null}
                className="size-12 shrink-0"
                rounded="rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                <p className="tabular text-xs text-ink-subtle">
                  {interpolate(texts.quantity, { quantity: item.quantity })}
                </p>
              </div>
              <Price value={item.price * item.quantity} locale={lang} className="text-sm text-ink" />
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-ink-muted">{texts.subtotal}</dt>
          <dd>
            <Price value={subtotal} locale={lang} className="text-ink" />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-ink-muted">{texts.delivery}</dt>
          <dd className="text-end">
            {quote === null ? (
              <span className="text-ink-subtle">{texts.deliveryPending}</span>
            ) : quote.fee === 0 ? (
              <span className="font-bold text-brand-700">{texts.free}</span>
            ) : (
              <Price value={quote.fee} locale={lang} className="text-ink" />
            )}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <dt className="text-base font-bold text-ink">{texts.total}</dt>
          <dd>
            <Price value={total} locale={lang} className="text-xl text-brand-800" />
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs leading-relaxed text-ink-subtle">{texts.estimate}</p>

      {children}
    </section>
  );
}
