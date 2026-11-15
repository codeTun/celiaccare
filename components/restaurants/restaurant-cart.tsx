"use client";

import { ArrowRight, ShoppingBasket } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { buttonStyles } from "@/components/ui/button";
import { interpolate } from "@/i18n/interpolate";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/types";

/** Texts of the cart reminders (dict.restaurants.cart). */
type CartTexts = { title: string; view: string; itemsOne: string; itemsOther: string };

type RestaurantCartProps = {
  /** The restaurant of the page: the reminder only shows dishes of THIS restaurant */
  restaurantId: number;
  locale: Locale;
  /** Cart page, e.g. "/fr/panier" */
  cartHref: string;
  texts: CartTexts;
};

/** Number of dishes and subtotal when the cart holds dishes of this restaurant, otherwise null. */
function useRestaurantCart(restaurantId: number) {
  const { cart, count, subtotal, ready } = useCart();
  // The cart is read from localStorage after the first render: nothing to show before that.
  if (!ready || count === 0 || cart.type !== "RESTAURANT" || cart.restaurantId !== restaurantId) return null;
  return { count, subtotal };
}

function itemsLabel(texts: CartTexts, count: number) {
  return interpolate(count === 1 ? texts.itemsOne : texts.itemsOther, { count });
}

/** Mobile: a "Voir mon panier" bar fixed at the bottom of the screen. */
export function RestaurantCartBar({ restaurantId, locale, cartHref, texts }: RestaurantCartProps) {
  const summary = useRestaurantCart(restaurantId);
  if (!summary) return null;

  return (
    <>
      {/* empty space so the bar never hides the end of the page */}
      <div className="h-24 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lift backdrop-blur lg:hidden">
        <Link href={cartHref} className={buttonStyles({ size: "lg", className: "w-full justify-between" })}>
          <span className="flex items-center gap-2">
            <ShoppingBasket aria-hidden="true" />
            {texts.view}
          </span>
          <span className="text-sm tabular">
            {itemsLabel(texts, summary.count)} · {formatPrice(summary.subtotal, locale)}
          </span>
        </Link>
      </div>
    </>
  );
}

/** Large screens: a small summary card above the restaurant sheet. */
export function RestaurantCartCard({ restaurantId, locale, cartHref, texts }: RestaurantCartProps) {
  const summary = useRestaurantCart(restaurantId);
  if (!summary) return null;

  return (
    <div className="hidden rounded-[var(--radius-card)] border border-brand-200 bg-brand-50 p-5 lg:block">
      <p className="flex items-center gap-2 text-sm font-bold text-brand-900">
        <ShoppingBasket className="size-[18px]" aria-hidden="true" />
        {texts.title}
      </p>
      <p className="mt-1 text-sm text-brand-900/80 tabular">
        {itemsLabel(texts, summary.count)} · {formatPrice(summary.subtotal, locale)}
      </p>
      <Link href={cartHref} className={buttonStyles({ className: "mt-4 w-full" })}>
        {texts.view}
        <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
      </Link>
    </div>
  );
}
