"use client";

import { Trash } from "lucide-react";
import Link from "next/link";

import { MAX_QUANTITY } from "@/components/cart/cart-provider";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { CloudImage } from "@/components/ui/cloud-image";
import { Price } from "@/components/ui/price";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { CartDict } from "@/i18n/resources/fr/cart";
import { formatPrice } from "@/lib/format";
import type { CartItem, Locale } from "@/types";

/** One line of the cart page: photo, name, merchant, unit price, quantity, line total, remove. */
export function CartLine({
  lang,
  item,
  texts,
  onQuantityChange,
  onRemove,
}: {
  lang: Locale;
  item: CartItem;
  texts: CartDict["line"];
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-4 px-5 py-5 sm:px-6">
      <CloudImage
        src={item.imageUrl}
        alt={item.name}
        sizes="96px"
        fallbackIcon={item.kind === "DISH" ? "meals" : null}
        className="size-20 shrink-0 sm:size-24"
        rounded="rounded-xl"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="min-w-0 flex-1">
          <h3 className="leading-snug font-semibold text-ink">
            {item.href ? (
              <Link
                href={localePath(lang, item.href)}
                className="underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
              >
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </h3>
          <p className="mt-0.5 truncate text-sm text-ink-muted">{interpolate(texts.by, { name: item.merchantName })}</p>
          <p className="mt-0.5 text-sm text-ink-subtle">
            {interpolate(texts.unitPrice, { price: formatPrice(item.price, lang) })}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="flex flex-col items-start gap-1">
            <QuantityStepper
              value={item.quantity}
              onChange={onQuantityChange}
              labels={{ group: `${texts.quantity} – ${item.name}`, decrease: texts.decrease, increase: texts.increase }}
            />
            {item.quantity >= MAX_QUANTITY ? (
              <p className="text-xs text-ink-subtle">{interpolate(texts.max, { max: MAX_QUANTITY })}</p>
            ) : null}
          </div>
          <Price value={item.price * item.quantity} locale={lang} className="text-base text-ink sm:min-w-24 sm:text-end" />
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={interpolate(texts.removeLabel, { name: item.name })}
        title={texts.remove}
        className="-me-2 -mt-2 grid size-11 shrink-0 place-items-center self-start rounded-full text-ink-subtle transition-colors hover:bg-red-50 hover:text-red-700"
      >
        <Trash className="size-[18px]" aria-hidden="true" />
      </button>
    </li>
  );
}
