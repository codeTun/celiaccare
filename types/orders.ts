import type { ItemKind, OrderStatus, OrderType, PaymentMethod } from "./enums";

/** One line of the shopping cart (kept in the browser, localStorage). */
export type CartItem = {
  key: string; // "PRODUCT:12" or "DISH:7"
  kind: ItemKind;
  id: number; // product id or dish id
  name: string;
  price: number; // millimes, display only — the server recomputes prices
  imageUrl: string | null;
  merchantName: string;
  href: string | null; // link back to the product / restaurant page (without locale)
  quantity: number;
};

/**
 * A cart holds either products from our small businesses (SHOP)
 * or dishes from ONE partner restaurant (RESTAURANT).
 */
export type CartState = {
  type: OrderType | null;
  restaurantId: number | null;
  restaurantName: string | null;
  restaurantSlug: string | null;
  items: CartItem[];
};

/** A governorate where the shop delivers (delivery is always free: only the delay differs). */
export type DeliveryZoneDTO = {
  id: number;
  governorate: string;
  delay: string;
};

/** Public order tracking result (no address / phone shown back). */
export type OrderTrackingDTO = {
  reference: string;
  type: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerFirstName: string;
  subtotal: number;
  /** 0 for every order since delivery became free; older orders keep the fee they were charged. */
  deliveryFee: number;
  total: number;
  createdAt: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  restaurantName: string | null;
  items: { name: string; quantity: number; lineTotal: number }[];
};

/** What the checkout Server Action returns once an order is saved (delivery is free: total = subtotal). */
export type PlacedOrderDTO = {
  reference: string;
  total: number;
  subtotal: number;
  delay: string;
};
