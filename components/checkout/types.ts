import type { ActionState } from "@/lib/validators";
import type { OrderTrackingDTO, PlacedOrderDTO, RestaurantCardDTO } from "@/types";

/* ==========================================================================
   Shapes shared by the cart page, the checkout and the order tracking page.
   ========================================================================== */

/** Delivery rules of a partner restaurant: what the cart and the checkout need to know. */
export type CheckoutRestaurant = {
  id: number;
  slug: string;
  name: string;
  city: string;
  /** The restaurant only delivers inside its own governorate. */
  governorate: string;
  deliveryFee: number; // millimes
  deliveryTime: string; // e.g. "30 à 45 min"
  minOrder: number; // millimes
};

/** Keep only what the browser needs from the partner restaurants (their delivery rules). */
export function toCheckoutRestaurants(restaurants: RestaurantCardDTO[]): CheckoutRestaurant[] {
  return restaurants
    .filter((restaurant) => restaurant.isPartner)
    .map((restaurant) => ({
      id: restaurant.id,
      slug: restaurant.slug,
      name: restaurant.name,
      city: restaurant.city,
      governorate: restaurant.governorate,
      deliveryFee: restaurant.deliveryFee,
      deliveryTime: restaurant.deliveryTime,
      minOrder: restaurant.minOrder,
    }));
}

/* --------------------------------------------------------------------------
   Server Action results
   -------------------------------------------------------------------------- */

/**
 * Why an order was not sent (the `message` of the action result). The first ones are the
 * refusals of createOrder() (models/posters/orders.ts), the last ones come from the action.
 * The browser turns each code into a sentence (dict.checkout.refusals).
 */
export type PlaceOrderError =
  | "EMPTY"
  | "MIXED_CART"
  | "UNAVAILABLE_ITEMS"
  | "RESTAURANT_UNAVAILABLE"
  | "ZONE_NOT_COVERED"
  | "MIN_ORDER"
  | "BLOCKED"
  | "DAILY_LIMIT"
  | "INVALID" // a field did not pass validation (see fieldErrors)
  | "RATE_LIMIT" // too many orders from this connection
  | "ERROR"; // unexpected problem (database down...)

export type PlaceOrderData = {
  /** Set on success: the order as saved by the server (its total is the one to show). */
  order?: PlacedOrderDTO;
  /** UNAVAILABLE_ITEMS: ids of the products or dishes that cannot be ordered any more. */
  unavailableIds?: number[];
  /** MIN_ORDER: the restaurant's minimum order, in millimes. */
  minOrder?: number;
};

export type PlaceOrderState = ActionState<PlaceOrderData>;

/** placeOrder() of app/[lang]/commande/actions.ts once the language is bound. */
export type PlaceOrderAction = (prevState: PlaceOrderState, formData: FormData) => Promise<PlaceOrderState>;

/** Why an order could not be shown on the tracking page. */
export type TrackOrderError = "NOT_FOUND" | "INVALID" | "RATE_LIMIT" | "ERROR";

export type TrackOrderState = ActionState<OrderTrackingDTO>;

/** trackOrderAction() of app/[lang]/suivi/actions.ts once the language is bound. */
export type TrackOrderAction = (prevState: TrackOrderState, formData: FormData) => Promise<TrackOrderState>;
