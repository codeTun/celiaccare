import { ArrowRight, MessagesSquare } from "lucide-react";
import Link from "next/link";

import { orderRequestHref, type OrderRequestTarget } from "@/components/contact/contact-params";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

/* ==========================================================================
   Every purchase goes through CeliacCare: visitors never get a business's own
   contacts. When a business cannot be ordered from on the site yet (no products,
   no dishes, or a restaurant that is not a partner), they ask us instead: these
   links open our contact form on "Une commande" for this business (by its slug:
   the contact page reads its name from the database), and our team contacts the
   business for them. Texts: dict.common.ordering.
   ========================================================================== */

export type OrderingTexts = CommonDict["ordering"];

/** "Demander sur CeliacCare" button: our contact form, pre-filled for this business or product. */
export function OrderRequestButton({
  target,
  locale,
  label,
  variant = "primary",
  size = "md",
  className,
}: {
  /** The artisan, restaurant or product asked for: { kind: "artisan", slug: producer.slug } */
  target: OrderRequestTarget;
  locale: Locale;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link href={orderRequestHref(locale, target)} className={buttonStyles({ variant, size, className })}>
      <MessagesSquare aria-hidden="true" />
      {label}
    </Link>
  );
}

/**
 * The clear box "Pas encore disponible à la commande sur CeliacCare — demandez-le : nous contactons
 * le commerce pour vous", with the request button.
 */
export function OrderRequestBox({
  target,
  locale,
  texts,
  headingLevel = 2,
  className,
}: {
  /** The artisan or restaurant asked for: { kind: "restaurant", slug: restaurant.slug } */
  target: OrderRequestTarget;
  locale: Locale;
  texts: OrderingTexts;
  /** 3 when the box sits inside a section that already has an <h2> */
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <section
      aria-labelledby="order-request-title"
      className={cn(
        "flex flex-col gap-4 rounded-[var(--radius-card)] border border-brand-100 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-brand-700 shadow-soft"
          aria-hidden="true"
        >
          <MessagesSquare className="size-5" />
        </span>
        <div className="min-w-0">
          <Heading id="order-request-title" className="text-base font-bold text-ink">
            {texts.requestTitle}
          </Heading>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{texts.requestText}</p>
        </div>
      </div>
      <Link
        href={orderRequestHref(locale, target)}
        className={buttonStyles({ className: "w-full shrink-0 sm:w-auto" })}
      >
        {texts.request}
        <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
      </Link>
    </section>
  );
}
