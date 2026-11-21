import type { CartState, DeliveryZoneDTO } from "@/types";

import { MAX_ORDER_LINES } from "./rules";
import type { CheckoutRestaurant } from "./types";

/* ==========================================================================
   Delivery rules shown in the cart and the checkout. They follow the same rules
   as createOrder() (models/posters/orders.ts), which checks everything again on
   the server. Delivery is always free: the total to pay is the subtotal.
   ========================================================================== */

/** Delivery to one governorate (free): the announced delay. */
export type DeliveryQuote = {
  delay: string;
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

/** Delay of the (free) delivery to this governorate, or null when we do not deliver there. */
export function quoteDelivery(
  governorate: string,
  cart: CartState,
  zones: DeliveryZoneDTO[],
  restaurant: CheckoutRestaurant | null,
): DeliveryQuote | null {
  if (!canDeliverTo(governorate, cart, zones, restaurant)) return null;

  // Restaurant orders: delivered by the restaurant, with its own delay.
  if (restaurant) return { delay: restaurant.deliveryTime };

  // Shop orders: the zone of the governorate gives the delay.
  const zone = zones.find((item) => item.governorate === governorate)!; // canDeliverTo() checked it
  return { delay: zone.delay };
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
