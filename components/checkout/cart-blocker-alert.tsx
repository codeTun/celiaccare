import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { CartDict } from "@/i18n/resources/fr/cart";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/types";

import type { CartBlocker } from "./delivery";
import { MAX_ORDER_LINES } from "./rules";
import type { CheckoutRestaurant } from "./types";

/** Explains why this cart cannot be ordered yet, with a link to fix it (cart page and checkout). */
export function CartBlockerAlert({
  blocker,
  lang,
  texts,
  restaurant,
  subtotal,
  className,
}: {
  blocker: CartBlocker;
  lang: Locale;
  /** dict.cart */
  texts: CartDict;
  restaurant: CheckoutRestaurant | null;
  subtotal: number;
  className?: string;
}) {
  const linkStyles = "mt-2 inline-flex font-semibold underline underline-offset-4 hover:no-underline";

  if (blocker === "MIN_ORDER" && restaurant) {
    return (
      <Alert
        tone="warning"
        className={className}
        title={interpolate(texts.minOrder.title, { min: formatPrice(restaurant.minOrder, lang) })}
      >
        <p>{interpolate(texts.minOrder.text, { missing: formatPrice(restaurant.minOrder - subtotal, lang) })}</p>
        <Link href={localePath(lang, `/restaurants/${restaurant.slug}`)} className={linkStyles}>
          {texts.minOrder.action}
        </Link>
      </Alert>
    );
  }

  if (blocker === "TOO_MANY_LINES") {
    return (
      <Alert tone="warning" className={className} title={texts.tooManyLines.title}>
        {interpolate(texts.tooManyLines.text, { max: MAX_ORDER_LINES })}
      </Alert>
    );
  }

  if (blocker === "NO_ZONES") {
    return (
      <Alert tone="info" className={className} title={texts.noDelivery.title}>
        <p>{texts.noDelivery.text}</p>
        <Link href={localePath(lang, "/contact")} className={linkStyles}>
          {texts.delivery.contactTitle}
        </Link>
      </Alert>
    );
  }

  // RESTAURANT_UNAVAILABLE
  return (
    <Alert tone="warning" className={className} title={texts.restaurantClosed.title}>
      {texts.restaurantClosed.text}
    </Alert>
  );
}
