import type { CartState, DeliveryZoneDTO } from "@/types";

import { MAX_ORDER_LINES } from "./rules";
import type { CheckoutRestaurant } from "./types";

/* ==========================================================================
   Delivery estimates shown in the cart and the checkout.
   They follow the same rules as createOrder() (models/posters/orders.ts),
   which computes the real amounts on the server when the order is sent.
   ========================================================================== */

/** Estimated delivery for one governorate. */
export type DeliveryQuote = {
  fee: number; // millimes (0 when free)
  delay: string;
  /** Free-delivery threshold of the zone (shop orders), in millimes. */
  freeFrom: number | null;
  isFree: boolean;
};

/** The partner restaurant of a restaurant cart (null for a shop cart or when it is no longer a partner). */
export function findCartRestaurant(cart: CartState, restaurants: CheckoutRestaurant[]): CheckoutRestaurant | null {
  if (cart.type !== "RESTAURANT") return null;
  return restaurants.find((restaurant) => restaurant.id === cart.restaurantId) ?? null;
}

/** Can we deliver this cart to this governorate? */
export function canDeliverTo(
  governorate: string,
  cart: CartState,
  zones: DeliveryZoneDTO[],
  restaurant: CheckoutRestaurant | null,
): boolean {
  if (cart.type === "RESTAURANT") return restaurant !== null && restaurant.governorate === governorate;
  return zones.some((zone) => zone.governorate === governorate);
}

/** Fee and delay for this governorate, or null when we do not deliver there. */
export function quoteDelivery(
  governorate: string,
  cart: CartState,
  zones: DeliveryZoneDTO[],
  restaurant: CheckoutRestaurant | null,
  subtotal: number,
): DeliveryQuote | null {
  if (!canDeliverTo(governorate, cart, zones, restaurant)) return null;

  // Restaurant orders: delivered by the restaurant, at its own price.
  if (restaurant) {
    return { fee: restaurant.deliveryFee, delay: restaurant.deliveryTime, freeFrom: null, isFree: restaurant.deliveryFee === 0 };
  }

  // Shop orders: the zone of the governorate sets the fee, free above its threshold.
  const zone = zones.find((item) => item.governorate === governorate)!; // canDeliverTo() checked it
  const isFree = zone.freeFrom !== null && subtotal >= zone.freeFrom;
  return { fee: isFree ? 0 : zone.fee, delay: zone.delay, freeFrom: zone.freeFrom, isFree };
}

/** The cheapest delivery fee of the shop zones ("dès 5,000 DT"), or null without zones. */
export function cheapestZoneFee(zones: DeliveryZoneDTO[]): number | null {
  return zones.length > 0 ? Math.min(...zones.map((zone) => zone.fee)) : null;
}

/**
 * Problems that prevent ordering the cart at all (shown on the cart page and the checkout):
 *  - RESTAURANT_UNAVAILABLE: the restaurant no longer takes online orders;
 *  - MIN_ORDER: below the restaurant's minimum order;
 *  - NO_ZONES: no shop delivery zone is open yet;
 *  - TOO_MANY_LINES: more different items than an order accepts.
 */
export type CartBlocker = "RESTAURANT_UNAVAILABLE" | "MIN_ORDER" | "NO_ZONES" | "TOO_MANY_LINES";

export function findCartBlocker(
  cart: CartState,
  zones: DeliveryZoneDTO[],
  restaurant: CheckoutRestaurant | null,
  subtotal: number,
): CartBlocker | null {
  if (cart.items.length > MAX_ORDER_LINES) return "TOO_MANY_LINES";
  if (cart.type === "RESTAURANT") {
    if (!restaurant) return "RESTAURANT_UNAVAILABLE";
    if (subtotal < restaurant.minOrder) return "MIN_ORDER";
    return null;
  }
  return zones.length === 0 ? "NO_ZONES" : null;
}
