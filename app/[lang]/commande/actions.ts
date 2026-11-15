"use server";

import { z } from "zod";

import { DELIVERY_LIMITS, MAX_LINE_QUANTITY, MAX_ORDER_LINES } from "@/components/checkout/rules";
import type { PlaceOrderError, PlaceOrderState } from "@/components/checkout/types";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { getIpHash } from "@/lib/request";
import { formDataToObject, governorate, optionalText, requiredText, tunisianPhone } from "@/lib/validators";
import { createOrder, recordRateLimitedOrder, type CreateOrderResult } from "@/models/posters/orders";
import { ITEM_KINDS, ORDER_TYPES, PAYMENT_METHODS, type Locale } from "@/types";

/* ==========================================================================
   Checkout Server Action (spec 5.4, EF-30 → EF-39).
   The browser sends the delivery form + the cart lines (ids and quantities only).
   Everything is checked again here; prices, fees and the "3 orders per day"
   rule are applied by createOrder() with the database values.
   ========================================================================== */

/** One cart line: a product or a dish and its quantity. */
const cartLineSchema = z.object({
  kind: z.enum(ITEM_KINDS),
  id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
});

/** The cart lines, sent as JSON in the "items" field: at most 30 lines, each item once. */
const cartLinesSchema = z
  .string()
  .max(5000)
  .transform((text, ctx) => {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Panier illisible." });
      return z.NEVER;
    }
  })
  .pipe(z.array(cartLineSchema).max(MAX_ORDER_LINES))
  .refine(
    (lines) => new Set(lines.map((line) => `${line.kind}:${line.id}`)).size === lines.length,
    "Le même article apparaît deux fois.",
  );

/** "" (shop order) → null, "12" → 12. */
const restaurantIdSchema = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      ctx.addIssue({ code: "custom", message: "Restaurant invalide." });
      return z.NEVER;
    }
    return id;
  });

const orderSchema = z.object({
  // The cart
  type: z.enum(ORDER_TYPES),
  restaurantId: restaurantIdSchema,
  items: cartLinesSchema,
  // The delivery form (same limits as the browser check, components/checkout/rules.ts)
  fullName: requiredText(DELIVERY_LIMITS.fullName.max, DELIVERY_LIMITS.fullName.min),
  phone: tunisianPhone, // → the 8 normalised digits
  governorate,
  city: requiredText(DELIVERY_LIMITS.city.max, DELIVERY_LIMITS.city.min),
  street: requiredText(DELIVERY_LIMITS.street.max, DELIVERY_LIMITS.street.min),
  addressDetails: optionalText(DELIVERY_LIMITS.addressDetails.max),
  note: optionalText(DELIVERY_LIMITS.note.max),
  paymentMethod: z.enum(PAYMENT_METHODS),
  consent: z.literal("on"),
});

/** Fields of the cart (not typed by the visitor): a problem there means the cart itself is broken. */
const CART_FIELDS = ["type", "restaurantId", "items"];

function refusal(message: PlaceOrderError, data?: PlaceOrderState["data"]): PlaceOrderState {
  return { status: "error", message, data };
}

/**
 * Places the order. Used with useActionState in <CheckoutFlow>, the language bound first:
 *   placeOrder.bind(null, lang)
 * Returns { status: "success", data: { order } } or { status: "error", message: <PlaceOrderError> }.
 */
export async function placeOrder(locale: Locale, _prevState: PlaceOrderState, formData: FormData): Promise<PlaceOrderState> {
  const lang: Locale = isLocale(locale) ? locale : "fr";

  // 1. Anti-robot: the invisible field must stay empty.
  const trap = formData.get("website");
  if (typeof trap === "string" && trap !== "") return refusal("ERROR");

  // 2. Validation (no database work: an invalid form does not use up the per-connection limit).
  const parsed = orderSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    const invalidFields = Object.keys(z.flattenError(parsed.error).fieldErrors);
    if (invalidFields.some((field) => CART_FIELDS.includes(field))) return refusal("MIXED_CART");

    // One clear message per wrong field, in the page language.
    const { errors } = getDictionary(lang).checkout;
    const fieldErrors: Record<string, string[]> = {};
    for (const field of invalidFields) {
      if (field in errors) fieldErrors[field] = [errors[field as keyof typeof errors]];
    }
    return { status: "error", message: "INVALID" satisfies PlaceOrderError, fieldErrors };
  }
  const input = parsed.data;

  // 3. Anti-abuse: 30 orders per hour per connection at most (LIMITS.order). The refusal is
  //    journaled for the admin like the other refused attempts (EF-38).
  const ipHash = await getIpHash();
  const { ok } = await rateLimit(`order:${ipHash}`, LIMITS.order);
  if (!ok) {
    try {
      await recordRateLimitedOrder({ phone: input.phone, customerName: input.fullName, ipHash });
    } catch (error) {
      console.error("[checkout] the refused attempt could not be journaled:", error instanceof Error ? error.message : error);
    }
    return refusal("RATE_LIMIT");
  }

  // 4. Save the order: prices, delivery fee and the daily limit are checked by the data layer.
  let result: CreateOrderResult;
  try {
    result = await createOrder({
      type: input.type,
      restaurantId: input.type === "RESTAURANT" ? input.restaurantId : null,
      items: input.items,
      customerName: input.fullName,
      phone: input.phone,
      governorate: input.governorate,
      city: input.city,
      street: input.street,
      addressDetails: input.addressDetails,
      note: input.note,
      paymentMethod: input.paymentMethod,
      ipHash,
    });
  } catch (error) {
    console.error("[checkout] the order could not be saved:", error instanceof Error ? error.message : error);
    return refusal("ERROR");
  }

  if (!result.ok) {
    const reason: PlaceOrderError = result.reason; // DAILY_LIMIT, BLOCKED, UNAVAILABLE_ITEMS...
    return refusal(reason, { unavailableIds: result.unavailableIds, minOrder: result.minOrder });
  }

  // Nothing public is cached about orders: no cache tag to refresh.
  return { status: "success", data: { order: result.order } };
}
