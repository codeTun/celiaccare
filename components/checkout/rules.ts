import { normalizeTunisianPhone } from "@/lib/tunisia";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types";

/* ==========================================================================
   Rules of the delivery form (spec EF-30 → EF-33).
   Used twice: by the browser (instant feedback, the visitor cannot continue
   while a field is wrong) and by the Server Action placeOrder (the real check:
   never trust the browser).
   ========================================================================== */

/** Length limits of the delivery fields (number of characters, spaces at both ends ignored). */
export const DELIVERY_LIMITS = {
  fullName: { min: 3, max: 80 },
  city: { min: 2, max: 80 },
  street: { min: 3, max: 160 },
  addressDetails: { max: 200 },
  note: { max: 500 },
} as const;

/** Most different lines in one order (same rule as createOrder in models/posters/orders.ts). */
export const MAX_ORDER_LINES = 30;

/** Most units of one item (same value as MAX_QUANTITY in components/cart/cart-provider.tsx). */
export const MAX_LINE_QUANTITY = 20;

/** What the visitor types in the delivery form. */
export type DeliveryValues = {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
  addressDetails: string;
  note: string;
  paymentMethod: PaymentMethod;
  consent: boolean;
};

export type DeliveryField = keyof DeliveryValues;

export const EMPTY_DELIVERY_VALUES: DeliveryValues = {
  fullName: "",
  phone: "",
  governorate: "",
  city: "",
  street: "",
  addressDetails: "",
  note: "",
  paymentMethod: "CASH_ON_DELIVERY",
  consent: false,
};

function isLengthBetween(text: string, min: number, max: number) {
  const length = text.trim().length;
  return length >= min && length <= max;
}

/**
 * Returns the fields that are not filled in correctly (an empty list = all good).
 * `canDeliverTo(governorate)` depends on the cart: any covered zone for a shop order,
 * only the restaurant's own governorate for a restaurant order.
 */
export function findDeliveryProblems(
  values: DeliveryValues,
  canDeliverTo: (governorate: string) => boolean,
): DeliveryField[] {
  const { fullName, city, street, addressDetails, note } = DELIVERY_LIMITS;
  const problems: DeliveryField[] = [];

  if (!isLengthBetween(values.fullName, fullName.min, fullName.max)) problems.push("fullName");
  if (normalizeTunisianPhone(values.phone) === null) problems.push("phone");
  if (!values.governorate || !canDeliverTo(values.governorate)) problems.push("governorate");
  if (!isLengthBetween(values.city, city.min, city.max)) problems.push("city");
  if (!isLengthBetween(values.street, street.min, street.max)) problems.push("street");
  if (values.addressDetails.trim().length > addressDetails.max) problems.push("addressDetails");
  if (values.note.trim().length > note.max) problems.push("note");
  if (!PAYMENT_METHODS.includes(values.paymentMethod)) problems.push("paymentMethod");
  if (!values.consent) problems.push("consent");

  return problems;
}
