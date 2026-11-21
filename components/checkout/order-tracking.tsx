"use client";

import {
  Bike,
  Check,
  ChefHat,
  CircleCheck,
  CircleX,
  ClipboardList,
  PackageCheck,
  Store,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import { useCallback } from "react";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { interpolate } from "@/i18n/interpolate";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Locale, OrderStatus, OrderTrackingDTO } from "@/types";

import { OrderHelp } from "./order-help";

/** The normal life of an order, in order. */
const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

const statusIcons: Record<OrderStatus, LucideIcon> = {
  PENDING: ClipboardList,
  CONFIRMED: CircleCheck,
  PREPARING: ChefHat,
  OUT_FOR_DELIVERY: Bike,
  DELIVERED: PackageCheck,
  CANCELLED: CircleX,
};

/** Colours of the status badge (same meaning as in the admin panel). */
const statusTones: Record<OrderStatus, BadgeTone> = {
  PENDING: "amber",
  CONFIRMED: "blue",
  PREPARING: "blue",
  OUT_FOR_DELIVERY: "violet",
  DELIVERED: "brand",
  CANCELLED: "red",
};

type TimelineStep = {
  status: OrderStatus;
  date: string | null;
  state: "done" | "current" | "upcoming" | "cancelled";
};

/** Steps of the timeline: Reçue → Confirmée → En préparation → En livraison → Livrée (or → Annulée). */
function timelineSteps(order: OrderTrackingDTO): TimelineStep[] {
  if (order.status === "CANCELLED") {
    return [
      { status: "PENDING", date: order.createdAt, state: "done" },
      ...(order.confirmedAt ? [{ status: "CONFIRMED" as const, date: order.confirmedAt, state: "done" as const }] : []),
      { status: "CANCELLED", date: order.cancelledAt, state: "cancelled" },
    ];
  }
  const dates: Partial<Record<OrderStatus, string | null>> = {
    PENDING: order.createdAt,
    CONFIRMED: order.confirmedAt,
    DELIVERED: order.deliveredAt,
  };
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  return STATUS_FLOW.map((status, index) => ({
    status,
    date: index <= currentIndex ? (dates[status] ?? null) : null,
    // A delivered order has no "current" step left: everything is done.
    state:
      index < currentIndex || order.status === "DELIVERED" ? "done" : index === currentIndex ? "current" : "upcoming",
  }));
}

/**
 * Result of the order tracking: status, timeline with dates, lines and amounts (no address, no phone),
 * and CeliacCare's own support contacts (never the business's).
 */
export function OrderTracking({
  lang,
  texts,
  paymentTexts,
  helpTexts,
  order,
}: {
  lang: Locale;
  /** dict.checkout.tracking */
  texts: CheckoutDict["tracking"];
  /** dict.checkout.payment */
  paymentTexts: CheckoutDict["payment"];
  /** dict.checkout.help */
  helpTexts: CheckoutDict["help"];
  order: OrderTrackingDTO;
}) {
  const t = texts.result;
  const steps = timelineSteps(order);
  const StatusIcon = statusIcons[order.status];

  // Bring the answer into view when it appears (stable function: not again at each re-render).
  const revealTitle = useCallback((node: HTMLHeadingElement | null) => {
    if (!node) return;
    node.focus({ preventScroll: true });
    node.scrollIntoView({ block: "start", behavior: "smooth" });
  }, []);

  return (
    <section aria-labelledby="tracking-result-title" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      {/* Status and timeline */}
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-7">
        <p className="text-sm text-ink-muted">{interpolate(t.greeting, { name: order.customerFirstName })}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h2
            id="tracking-result-title"
            tabIndex={-1}
            ref={revealTitle}
            dir="ltr"
            className="tabular scroll-mt-28 text-2xl font-extrabold tracking-wide text-ink outline-none sm:text-3xl"
          >
            {order.reference}
          </h2>
          <Badge tone={statusTones[order.status]} className="px-3 py-1 text-sm">
            <StatusIcon aria-hidden="true" />
            {texts.statuses[order.status]}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-ink-subtle">
          {interpolate(t.placedOn, { date: formatDateTime(order.createdAt, lang) })}
        </p>
        <p
          className={cn(
            "mt-5 rounded-2xl p-4 text-sm leading-relaxed",
            order.status === "CANCELLED" ? "bg-red-50 text-red-800" : "bg-brand-50/70 text-brand-900",
          )}
        >
          {texts.statusHints[order.status]}
        </p>

        <h3 className="mt-7 text-base font-bold text-ink">{t.timeline}</h3>
        <ol className="mt-4">
          {steps.map((step, index) => {
            const Icon = step.state === "done" ? Check : statusIcons[step.status];
            const isLast = index === steps.length - 1;
            return (
              <li
                key={step.status}
                aria-current={step.state === "current" ? "step" : undefined}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {/* line to the next step */}
                {isLast ? null : (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute start-[17px] top-10 bottom-1 w-0.5 rounded-full",
                      step.state === "done" ? "bg-brand-400" : "bg-line-strong",
                    )}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative grid size-9 shrink-0 place-items-center rounded-full [&_svg]:size-[18px]",
                    step.state === "done" && "bg-brand-600 text-white",
                    step.state === "current" && "bg-white text-brand-700 ring-2 ring-brand-600",
                    step.state === "upcoming" && "bg-canvas text-ink-subtle ring-1 ring-line-strong",
                    step.state === "cancelled" && "bg-red-600 text-white",
                  )}
                >
                  <Icon strokeWidth={step.state === "done" ? 3 : 2} />
                </span>
                <div className="min-w-0 pt-1.5">
                  <p
                    className={cn(
                      "font-semibold",
                      step.state === "upcoming" ? "text-ink-subtle" : "text-ink",
                      step.state === "cancelled" && "text-red-700",
                    )}
                  >
                    {texts.statuses[step.status]}
                    {step.state === "current" ? <span className="sr-only"> ({t.currentStep})</span> : null}
                  </p>
                  {step.date ? (
                    <p className="tabular text-xs text-ink-subtle">
                      <time dateTime={step.date}>{formatDateTime(step.date, lang)}</time>
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Lines and amounts */}
      <aside className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6">
        <h3 className="text-base font-bold text-ink">{t.items}</h3>
        <p className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
          {order.restaurantName ? (
            <UtensilsCrossed className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
          ) : (
            <Store className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
          )}
          {order.restaurantName ? interpolate(t.restaurant, { name: order.restaurantName }) : t.shop}
        </p>
        <ul className="mt-4 space-y-2.5 text-sm">
          {order.items.map((item, index) => (
            <li key={`${index}-${item.name}`} className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 text-ink">
                {item.name} <span className="tabular text-ink-subtle">× {item.quantity}</span>
              </span>
              <Price value={item.lineTotal} locale={lang} className="text-ink" />
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-muted">{t.subtotal}</dt>
            <dd>
              <Price value={order.subtotal} locale={lang} className="text-ink" />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-muted">{t.delivery}</dt>
            <dd>
              {/* Free for every order since delivery became free; older orders show the fee they were charged. */}
              {order.deliveryFee === 0 ? (
                <span className="font-bold text-brand-700">{t.free}</span>
              ) : (
                <Price value={order.deliveryFee} locale={lang} className="text-ink" />
              )}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
            <dt className="font-bold text-ink">{t.total}</dt>
            <dd>
              <Price value={order.total} locale={lang} className="text-lg text-brand-800" />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-muted">{t.payment}</dt>
            <dd className="text-end font-semibold text-ink">{paymentTexts[order.paymentMethod].label}</dd>
          </div>
        </dl>
        {/* Questions about the order come to CeliacCare (lib/site-config.ts), never to the business directly. */}
        <OrderHelp
          lang={lang}
          texts={helpTexts}
          text={helpTexts.orderText}
          id="tracking-help-title"
          className="mt-5"
        />
      </aside>
    </section>
  );
}
