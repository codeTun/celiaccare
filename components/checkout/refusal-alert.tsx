import Link from "next/link";
import type { ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { Button, buttonStyles } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { governorateLabel } from "@/lib/tunisia";
import type { CartState, Locale } from "@/types";

import { ltr } from "./text";
import type { CheckoutRestaurant, PlaceOrderData, PlaceOrderError } from "./types";

const KNOWN_ERRORS: PlaceOrderError[] = [
  "EMPTY",
  "MIXED_CART",
  "UNAVAILABLE_ITEMS",
  "RESTAURANT_UNAVAILABLE",
  "ZONE_NOT_COVERED",
  "MIN_ORDER",
  "BLOCKED",
  "DAILY_LIMIT",
  "INVALID",
  "RATE_LIMIT",
  "ERROR",
];

function toErrorCode(message: string | undefined): PlaceOrderError {
  return KNOWN_ERRORS.find((code) => code === message) ?? "ERROR";
}

/**
 * Explains why the server did not accept the order (spec EF-37 for the daily limit),
 * with a way to fix it when there is one (remove unavailable items, change the address...).
 */
export function RefusalAlert({
  message,
  data,
  lang,
  texts,
  cart,
  governorate,
  restaurant,
  onRemoveItems,
  onEditDetails,
}: {
  /** The `message` of the action result: a PlaceOrderError code */
  message: string | undefined;
  data: PlaceOrderData | undefined;
  lang: Locale;
  texts: CheckoutDict["refusals"];
  cart: CartState;
  governorate: string;
  restaurant: CheckoutRestaurant | null;
  /** Removes these cart lines (keys "PRODUCT:12"...) */
  onRemoveItems: (keys: string[]) => void;
  onEditDetails: () => void;
}) {
  const code = toErrorCode(message);
  const linkStyles = buttonStyles({ variant: "outline", size: "sm", className: "mt-3" });
  let text: string = texts[code];
  let action: ReactNode = null;

  switch (code) {
    case "BLOCKED":
      text = interpolate(texts.BLOCKED, { phone: ltr(siteConfig.phone) });
      break;
    case "UNAVAILABLE_ITEMS": {
      // The server sends product ids (shop cart) or dish ids (restaurant cart).
      const kind = cart.type === "RESTAURANT" ? "DISH" : "PRODUCT";
      const ids = new Set(data?.unavailableIds ?? []);
      const lines = cart.items.filter((item) => item.kind === kind && ids.has(item.id));
      text = interpolate(texts.UNAVAILABLE_ITEMS, { names: lines.map((item) => `« ${item.name} »`).join(lang === "ar" ? "، " : ", ") });
      if (lines.length > 0) {
        action = (
          <Button variant="outline" size="sm" className="mt-3" onClick={() => onRemoveItems(lines.map((item) => item.key))}>
            {texts.removeItems}
          </Button>
        );
      }
      break;
    }
    case "ZONE_NOT_COVERED":
      text = restaurant
        ? interpolate(texts.ZONE_NOT_COVERED_RESTAURANT, { governorate: governorateLabel(restaurant.governorate, lang) })
        : interpolate(texts.ZONE_NOT_COVERED, { governorate: governorateLabel(governorate, lang) });
      action = (
        <Button variant="outline" size="sm" className="mt-3" onClick={onEditDetails}>
          {texts.editDetails}
        </Button>
      );
      break;
    case "MIN_ORDER": {
      const minOrder = data?.minOrder ?? restaurant?.minOrder ?? 0;
      text = interpolate(texts.MIN_ORDER, { min: formatPrice(minOrder, lang) });
      if (cart.restaurantSlug) {
        action = (
          <Link href={localePath(lang, `/restaurants/${cart.restaurantSlug}`)} className={linkStyles}>
            {texts.addDishes}
          </Link>
        );
      }
      break;
    }
    case "INVALID":
      action = (
        <Button variant="outline" size="sm" className="mt-3" onClick={onEditDetails}>
          {texts.editDetails}
        </Button>
      );
      break;
    case "MIXED_CART":
    case "EMPTY":
    case "RESTAURANT_UNAVAILABLE":
      action = (
        <Link href={localePath(lang, "/panier")} className={linkStyles}>
          {texts.goToCart}
        </Link>
      );
      break;
    default:
      // DAILY_LIMIT (exact sentence of the spec, EF-37), RATE_LIMIT, ERROR: the text is enough.
      break;
  }

  return (
    <Alert tone="error" title={texts.title}>
      <p>{text}</p>
      {action}
    </Alert>
  );
}
