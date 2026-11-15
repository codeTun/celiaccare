import { Banknote, CreditCard, MapPin, MessageSquareText, Pencil, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import type { ReactNode, Ref } from "react";

import { placeLabel } from "@/components/directory/place";
import { CloudImage } from "@/components/ui/cloud-image";
import { Price } from "@/components/ui/price";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { formatPhone, formatPrice } from "@/lib/format";
import { normalizeTunisianPhone } from "@/lib/tunisia";
import type { CartItem, Locale } from "@/types";

import type { DeliveryQuote } from "./delivery";
import type { DeliveryValues } from "./rules";
import { isolate } from "./text";

/** Step 2 of the checkout (spec EF-34): everything the visitor is about to order, before sending. */
export function OrderReview({
  lang,
  texts,
  values,
  governorate,
  items,
  quote,
  headingRef,
  disabled,
  onEdit,
}: {
  lang: Locale;
  texts: CheckoutDict;
  values: DeliveryValues;
  governorate: string;
  items: CartItem[];
  quote: DeliveryQuote | null;
  headingRef: Ref<HTMLHeadingElement>;
  /** true while the order is being sent */
  disabled: boolean;
  /** Back to step 1 */
  onEdit: () => void;
}) {
  const phone = normalizeTunisianPhone(values.phone);
  const PaymentIcon = values.paymentMethod === "CARD_ON_DELIVERY" ? CreditCard : Banknote;
  const editButton = (
    <button
      type="button"
      onClick={onEdit}
      disabled={disabled}
      aria-label={texts.review.editLabel}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
    >
      <Pencil className="size-3.5" aria-hidden="true" />
      {texts.review.edit}
    </button>
  );

  return (
    <section
      aria-labelledby="checkout-review-title"
      className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-7"
    >
      <h2
        id="checkout-review-title"
        ref={headingRef}
        tabIndex={-1}
        className="scroll-mt-28 text-xl font-extrabold text-ink outline-none sm:text-2xl"
      >
        {texts.review.title}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">{texts.review.intro}</p>

      <div className="mt-6 divide-y divide-line">
        <ReviewBlock icon={<MapPin />} title={texts.review.delivery} action={editButton}>
          <p className="font-semibold text-ink">{values.fullName.trim()}</p>
          {phone ? (
            <p>
              <span dir="ltr">{formatPhone(phone)}</span>
            </p>
          ) : null}
          <p>{values.street.trim()}</p>
          {values.addressDetails.trim() ? <p>{values.addressDetails.trim()}</p> : null}
          <p>
            {placeLabel(values.city.trim(), governorate, lang)}
          </p>
          {quote ? (
            <p className="mt-2 font-semibold text-brand-700">
              {interpolate(texts.review.estimatedDelay, { delay: isolate(quote.delay) })}
            </p>
          ) : null}
        </ReviewBlock>

        <ReviewBlock icon={<PaymentIcon />} title={texts.review.payment} action={editButton}>
          <p className="font-semibold text-ink">{texts.payment[values.paymentMethod].label}</p>
          <p>{texts.payment[values.paymentMethod].description}</p>
        </ReviewBlock>

        {values.note.trim() ? (
          <ReviewBlock icon={<MessageSquareText />} title={texts.review.note}>
            <p className="break-words whitespace-pre-line">{values.note.trim()}</p>
          </ReviewBlock>
        ) : null}

        <ReviewBlock
          icon={<ShoppingBasket />}
          title={texts.review.items}
          action={
            <Link
              href={localePath(lang, "/panier")}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              {texts.review.edit}
            </Link>
          }
        >
          <ul className="mt-1 divide-y divide-line">
            {items.map((item) => (
              <li key={item.key} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
                <CloudImage
                  src={item.imageUrl}
                  alt={item.name}
                  sizes="56px"
                  fallbackIcon={item.kind === "DISH" ? "meals" : null}
                  className="size-14 shrink-0"
                  rounded="rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="tabular text-xs text-ink-subtle">
                    {interpolate(texts.summary.quantity, { quantity: item.quantity })} ·{" "}
                    {formatPrice(item.price, lang)}
                  </p>
                </div>
                <Price value={item.price * item.quantity} locale={lang} className="text-ink" />
              </li>
            ))}
          </ul>
        </ReviewBlock>
      </div>
    </section>
  );
}

function ReviewBlock({
  icon,
  title,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 [&_svg]:size-[18px]"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-ink">{title}</h3>
          {action}
        </div>
        <div className="mt-1 space-y-0.5 text-sm leading-relaxed text-ink-muted">{children}</div>
      </div>
    </div>
  );
}
