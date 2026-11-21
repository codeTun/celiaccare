"use client";

import { ArrowLeft, ArrowRight, Info, ShieldCheck, Store, Trash, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Button, buttonStyles } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Price } from "@/components/ui/price";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { CartDict } from "@/i18n/resources/fr/cart";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { MAX_ORDERS_PER_DAY } from "@/lib/tunisia";
import { cn } from "@/lib/utils";
import type { DeliveryZoneDTO, Locale } from "@/types";

import { CartBlockerAlert } from "./cart-blocker-alert";
import { CartLine } from "./cart-line";
import { findCartBlocker, findCartRestaurant } from "./delivery";
import { DeliveryInfo } from "./delivery-info";
import { EmptyCart } from "./empty-cart";
import { CartSkeleton } from "./skeletons";
import { countLabel } from "./text";
import type { CheckoutRestaurant } from "./types";

export type CartViewProps = {
  lang: Locale;
  /** dict.cart */
  texts: CartDict;
  /** dict.checkout.payment (names of the payment methods) */
  paymentTexts: CheckoutDict["payment"];
  /** Active shop delivery zones (getDeliveryZones()) */
  zones: DeliveryZoneDTO[];
  /** Delivery rules of the partner restaurants (toCheckoutRestaurants(getRestaurants(...))) */
  restaurants: CheckoutRestaurant[];
};

/**
 * The cart page (/panier). The cart lives in the browser (localStorage), so this is a
 * Client Component: it shows a skeleton until the saved cart has been read.
 */
export function CartView({ lang, texts, paymentTexts, zones, restaurants }: CartViewProps) {
  const { cart, ready, count, subtotal, setQuantity, remove, clear } = useCart();
  const [confirmingClear, setConfirmingClear] = useState(false);

  if (!ready) return <CartSkeleton label={texts.loading} />;
  if (cart.items.length === 0 || cart.type === null) return <EmptyCart lang={lang} texts={texts.empty} />;

  const isRestaurant = cart.type === "RESTAURANT";
  const restaurant = findCartRestaurant(cart, restaurants);
  const blocker = findCartBlocker(cart, zones, restaurant, subtotal);
  const itemCount = countLabel(count, texts.count);
  const restaurantHref = cart.restaurantSlug ? localePath(lang, `/restaurants/${cart.restaurantSlug}`) : null;
  const continueHref = isRestaurant && restaurantHref ? restaurantHref : localePath(lang, "/produits");
  const checkoutHref = localePath(lang, "/commande");
  // Delivery is free: the total is the subtotal (prices are checked again when the order is sent).

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-8">
          {/* Cart lines */}
          <section
            aria-labelledby="cart-title"
            className="rounded-[var(--radius-card)] border border-line bg-white shadow-soft"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"
                >
                  {isRestaurant ? <UtensilsCrossed className="size-5" /> : <Store className="size-5" />}
                </span>
                <div className="min-w-0">
                  <h2 id="cart-title" className="truncate text-base font-bold text-ink sm:text-lg">
                    {isRestaurant
                      ? interpolate(texts.header.restaurant, { name: cart.restaurantName ?? "" })
                      : texts.header.shop}
                  </h2>
                  <p className="text-xs text-ink-subtle sm:text-sm">
                    {itemCount} · {isRestaurant ? texts.header.restaurantHint : texts.header.shopHint}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingClear(true)} className="-me-2">
                <Trash aria-hidden="true" />
                {texts.clear.button}
              </Button>
            </div>

            <ul className="divide-y divide-line">
              {cart.items.map((item) => (
                <CartLine
                  key={item.key}
                  lang={lang}
                  item={item}
                  texts={texts.line}
                  onQuantityChange={(quantity) => setQuantity(item.key, quantity)}
                  onRemove={() => remove(item.key)}
                />
              ))}
            </ul>

            <div className="border-t border-line px-5 py-4 sm:px-6">
              <Link
                href={continueHref}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
              >
                <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                {isRestaurant ? texts.header.seeMenu : texts.summary.continueShopping}
              </Link>
            </div>
          </section>

          <DeliveryInfo
            lang={lang}
            cartTexts={texts}
            paymentTexts={paymentTexts}
            cartType={cart.type}
            zones={zones}
            restaurant={restaurant}
          />
        </div>

        {/* Summary */}
        <aside aria-labelledby="cart-summary-title" className="lg:sticky lg:top-24">
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6">
            <h2 id="cart-summary-title" className="text-lg font-extrabold text-ink">
              {texts.summary.title}
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-muted">
                  {texts.summary.subtotal} <span className="text-ink-subtle">({itemCount})</span>
                </dt>
                <dd>
                  <Price value={subtotal} locale={lang} className="text-ink" />
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-muted">{texts.summary.delivery}</dt>
                <dd className="font-bold text-brand-700">{texts.summary.free}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
                <dt className="font-bold text-ink">{texts.summary.total}</dt>
                <dd>
                  <Price value={subtotal} locale={lang} className="text-xl text-brand-800" />
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-subtle">{texts.summary.totalHint}</p>

            {blocker ? (
              <CartBlockerAlert
                blocker={blocker}
                lang={lang}
                texts={texts}
                restaurant={restaurant}
                subtotal={subtotal}
                className="mt-5"
              />
            ) : null}

            {/* On phones the button lives in the sticky bar at the bottom of the screen. */}
            <div className="mt-5 hidden lg:block">
              <CheckoutButton href={checkoutHref} label={texts.summary.checkout} disabled={blocker !== null} />
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-ink-muted">
              <ShieldCheck className="size-4 text-brand-600" aria-hidden="true" />
              {texts.summary.reassurance}
            </p>

            <div className="mt-5 flex gap-3 rounded-2xl bg-canvas p-4 text-xs leading-relaxed text-ink-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
              <div>
                <p className="font-semibold text-ink">
                  {interpolate(texts.dailyLimit.title, { max: MAX_ORDERS_PER_DAY })}
                </p>
                <p className="mt-0.5">{interpolate(texts.dailyLimit.text, { max: MAX_ORDERS_PER_DAY })}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky bar on phones: the total and the checkout button always within reach. */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgb(15_31_23/0.06)] backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-ink-subtle">{texts.summary.total}</p>
            <Price value={subtotal} locale={lang} className="text-lg text-ink" />
          </div>
          <CheckoutButton
            href={checkoutHref}
            label={texts.summary.checkout}
            disabled={blocker !== null}
            className="w-auto shrink-0"
          />
        </div>
      </div>

      <Dialog
        open={confirmingClear}
        onClose={() => setConfirmingClear(false)}
        title={texts.clear.title}
        closeLabel={texts.clear.close}
      >
        <p className="text-sm leading-relaxed text-ink-muted">{texts.clear.text}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setConfirmingClear(false)}>
            {texts.clear.cancel}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clear();
              setConfirmingClear(false);
            }}
          >
            {texts.clear.confirm}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

/** "Passer la commande": a link to /commande, or a disabled button when the cart cannot be ordered. */
function CheckoutButton({
  href,
  label,
  disabled,
  className,
}: {
  href: string;
  label: string;
  disabled: boolean;
  className?: string;
}) {
  if (disabled) {
    return (
      <Button size="lg" disabled className={cn("w-full", className)}>
        {label}
      </Button>
    );
  }
  return (
    <Link href={href} className={buttonStyles({ size: "lg", className: cn("w-full", className) })}>
      {label}
      <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
    </Link>
  );
}
