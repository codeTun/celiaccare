import "server-only";

import { randomInt } from "node:crypto";

import { db } from "@/lib/prisma";
import { MAX_ORDERS_PER_DAY, tunisDayKey } from "@/lib/tunisia";
import { isUniqueViolation, ModelError } from "@/models/errors";
import { isOneOf, isPositiveInteger, publicProducts, required } from "@/models/fetchers/mappers";
import {
  ITEM_KINDS,
  ORDER_TYPES,
  PAYMENT_METHODS,
  type ItemKind,
  type OrderType,
  type PaymentMethod,
  type PlacedOrderDTO,
  type RefusalReason,
} from "@/types";

/* ==========================================================================
   Placing an order (spec 5.4, EF-30 → EF-39).
   The checkout Server Action validates the form first (zod), then calls createOrder().
   Here we re-read EVERYTHING from the database: the browser only sends ids and quantities,
   never prices.
   ========================================================================== */

export type CreateOrderInput = {
  type: OrderType;
  /** The partner restaurant of a RESTAURANT order (null for a SHOP order). */
  restaurantId: number | null;
  /** 1 to 30 lines, each one a product (SHOP) or a dish (RESTAURANT) with a quantity from 1 to 20. */
  items: { kind: ItemKind; id: number; quantity: number }[];
  customerName: string;
  /** The 8 normalised digits (normalizeTunisianPhone). */
  phone: string;
  governorate: string;
  city: string;
  street: string;
  addressDetails: string | null;
  note: string | null;
  paymentMethod: PaymentMethod;
  /** Hashed IP of the customer (getIpHash()), never the IP itself. */
  ipHash: string | null;
};

export type CreateOrderRefusal =
  | "EMPTY" // the cart has no line
  | "MIXED_CART" // products and dishes mixed, or dishes from another restaurant
  | "UNAVAILABLE_ITEMS" // some items no longer exist / are hidden / out of stock: see unavailableIds
  | "RESTAURANT_UNAVAILABLE" // the restaurant is hidden or not a partner (no online ordering)
  | "ZONE_NOT_COVERED" // we do not deliver to this governorate
  | "MIN_ORDER" // below the restaurant's minimum order: see minOrder (millimes)
  | "BLOCKED" // the admin blocked this phone number (EF-39)
  | "DAILY_LIMIT"; // already 3 orders today with this phone number (EF-35 / EF-37)

export type CreateOrderResult =
  | { ok: true; order: PlacedOrderDTO }
  | { ok: false; reason: CreateOrderRefusal; unavailableIds?: number[]; minOrder?: number };

type Refusal = Extract<CreateOrderResult, { ok: false }>;

const MAX_LINES = 30;
const MAX_QUANTITY = 20;

/**
 * Checks the cart, computes the prices and the delivery fee from the database, applies the
 * "3 orders per day and per phone number" rule and saves the order (status PENDING).
 * Expected problems are returned as { ok: false, reason } (show a message to the customer).
 * Throws ModelError("INVALID_ORDER_INPUT") when the input was not validated by the Server Action.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  assertWellFormed(input);
  if (input.items.length === 0) return { ok: false, reason: "EMPTY" };

  // 1. The lines, priced with the CURRENT database prices.
  const cart = input.type === "SHOP" ? await priceShopCart(input.items) : await priceRestaurantCart(input);
  if (!cart.ok) return cart;
  const subtotal = cart.lines.reduce((sum, line) => sum + line.lineTotal, 0);

  // 2. Delivery fee and delay.
  const delivery =
    cart.restaurant === null
      ? await shopDelivery(input.governorate, subtotal)
      : await restaurantDelivery(cart.restaurant, input.governorate, subtotal);
  if (!delivery.ok) return delivery;

  // 3. Save it (the daily limit is checked in the same transaction).
  return saveOrder(input, cart.lines, cart.restaurant, delivery, subtotal);
}

/* --------------------------------------------------------------------------
   1. Cart
   -------------------------------------------------------------------------- */

/** One order line, as it will be saved (name / merchant / price are snapshots). */
type PricedLine = {
  kind: ItemKind;
  productId: number | null;
  dishId: number | null;
  name: string;
  merchantName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type OrderRestaurant = {
  id: number;
  name: string;
  governorate: string;
  deliveryFee: number;
  deliveryTime: string;
  minOrder: number;
};

type PricedCart = { ok: true; lines: PricedLine[]; restaurant: OrderRestaurant | null };

/** Shop order: only products of our small businesses, each one public and available. */
async function priceShopCart(items: CreateOrderInput["items"]): Promise<PricedCart | Refusal> {
  if (items.some((item) => item.kind !== "PRODUCT")) return { ok: false, reason: "MIXED_CART" };

  const ids = items.map((item) => item.id);
  const products = await publicProducts()
    .where({ isAvailable: true })
    .where((p) => p.id.in(ids))
    .select("id", "name", "price")
    .include("producer", (producer) => producer.select("name"))
    .all();
  const byId = new Map(products.map((product) => [product.id, product]));

  const unavailableIds = ids.filter((id) => !byId.has(id));
  if (unavailableIds.length > 0) return { ok: false, reason: "UNAVAILABLE_ITEMS", unavailableIds };

  const lines = items.map((item): PricedLine => {
    const product = byId.get(item.id)!; // every id was found just above
    return {
      kind: "PRODUCT",
      productId: product.id,
      dishId: null,
      name: product.name,
      merchantName: required(product.producer, `producer of product #${product.id}`).name,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    };
  });
  return { ok: true, lines, restaurant: null };
}

/** Restaurant order: only available dishes of ONE active partner restaurant. */
async function priceRestaurantCart(input: CreateOrderInput): Promise<PricedCart | Refusal> {
  if (input.items.some((item) => item.kind !== "DISH")) return { ok: false, reason: "MIXED_CART" };

  const restaurantId = input.restaurantId;
  if (restaurantId === null) return { ok: false, reason: "RESTAURANT_UNAVAILABLE" };
  const restaurant = await db.orm.public.Restaurant.where((r) => r.id.eq(restaurantId))
    .where({ isActive: true, isPartner: true })
    .select("id", "name", "governorate", "deliveryFee", "deliveryTime", "minOrder")
    .first();
  if (!restaurant) return { ok: false, reason: "RESTAURANT_UNAVAILABLE" };

  const ids = input.items.map((item) => item.id);
  const dishes = await db.orm.public.Dish.where((d) => d.id.in(ids))
    .select("id", "name", "price", "restaurantId", "isAvailable")
    .all();
  const byId = new Map(dishes.map((dish) => [dish.id, dish]));

  // A dish of another restaurant cannot be in this cart.
  if (dishes.some((dish) => dish.restaurantId !== restaurant.id)) return { ok: false, reason: "MIXED_CART" };

  const unavailableIds = ids.filter((id) => !byId.get(id)?.isAvailable);
  if (unavailableIds.length > 0) return { ok: false, reason: "UNAVAILABLE_ITEMS", unavailableIds };

  const lines = input.items.map((item): PricedLine => {
    const dish = byId.get(item.id)!; // every id was found just above
    return {
      kind: "DISH",
      productId: null,
      dishId: dish.id,
      name: dish.name,
      merchantName: restaurant.name,
      unitPrice: dish.price,
      quantity: item.quantity,
      lineTotal: dish.price * item.quantity,
    };
  });
  return { ok: true, lines, restaurant };
}

/* --------------------------------------------------------------------------
   2. Delivery
   -------------------------------------------------------------------------- */

type Delivery = { ok: true; zoneId: number | null; fee: number; delay: string };

/** Shop orders: the delivery zone of the governorate sets the fee (free above `freeFrom`). */
async function shopDelivery(governorate: string, subtotal: number): Promise<Delivery | Refusal> {
  const zone = await db.orm.public.DeliveryZone.where({ governorate, isActive: true })
    .select("id", "fee", "delay", "freeFrom")
    .first();
  if (!zone) return { ok: false, reason: "ZONE_NOT_COVERED" };

  const isFree = zone.freeFrom !== null && subtotal >= zone.freeFrom;
  return { ok: true, zoneId: zone.id, fee: isFree ? 0 : zone.fee, delay: zone.delay };
}

/** Restaurant orders: delivered by the restaurant, in its own governorate only. */
async function restaurantDelivery(
  restaurant: OrderRestaurant,
  governorate: string,
  subtotal: number,
): Promise<Delivery | Refusal> {
  if (governorate !== restaurant.governorate) return { ok: false, reason: "ZONE_NOT_COVERED" };
  if (subtotal < restaurant.minOrder) return { ok: false, reason: "MIN_ORDER", minOrder: restaurant.minOrder };

  // Not required, but it lets the admin group orders by zone.
  const zone = await db.orm.public.DeliveryZone.where({ governorate }).select("id").first();
  return { ok: true, zoneId: zone?.id ?? null, fee: restaurant.deliveryFee, delay: restaurant.deliveryTime };
}

/* --------------------------------------------------------------------------
   3. Saving the order + daily limit
   -------------------------------------------------------------------------- */

/** The transaction handle given by db.transaction(async (tx) => ...). */
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Tries again with a new reference when two orders get the same random one (extremely rare). */
const MAX_REFERENCE_ATTEMPTS = 5;

async function saveOrder(
  input: CreateOrderInput,
  lines: PricedLine[],
  restaurant: OrderRestaurant | null,
  delivery: Delivery,
  subtotal: number,
): Promise<CreateOrderResult> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await db.transaction((tx) => saveOrderInTransaction(tx, input, lines, restaurant, delivery, subtotal));
    } catch (error) {
      // The transaction was rolled back (nothing was saved): it is safe to run it again.
      if (attempt < MAX_REFERENCE_ATTEMPTS && isUniqueViolation(error, "Order_reference_key")) continue;
      throw error;
    }
  }
}

async function saveOrderInTransaction(
  tx: Transaction,
  input: CreateOrderInput,
  lines: PricedLine[],
  restaurant: OrderRestaurant | null,
  delivery: Delivery,
  subtotal: number,
): Promise<CreateOrderResult> {
  const { phone } = input;
  const dayKey = tunisDayKey(); // the counter restarts at midnight, Tunis time (EF-36)

  // a) Today's counter for this phone number, LOCKED until the end of the transaction.
  const counter = await lockDailyCounter(tx, phone, dayKey);

  // b) Rule set by the admin for this number (EF-39), ignored once expired.
  const rule = await tx.orm.public.PhoneRule.where({ phone }).select("type", "maxPerDay", "expiresAt").first();
  const activeRule = rule && (rule.expiresAt === null || rule.expiresAt.getTime() > Date.now()) ? rule : null;

  // c) A refusal is recorded for the admin (EF-38). We RETURN (not throw), so the transaction
  //    is committed and the record is kept.
  const refuse = async (reason: "BLOCKED" | "DAILY_LIMIT"): Promise<CreateOrderResult> => {
    await logRefusal(tx, counter, { phone, customerName: input.customerName, dayKey, reason, ipHash: input.ipHash });
    return { ok: false, reason };
  };

  if (activeRule?.type === "BLOCKED") return refuse("BLOCKED");
  const dailyLimit =
    activeRule?.type === "EXCEPTION" ? (activeRule.maxPerDay ?? MAX_ORDERS_PER_DAY) : MAX_ORDERS_PER_DAY;
  if (counter.count >= dailyLimit) return refuse("DAILY_LIMIT");

  // d) The order and its lines.
  const deliveryFee = delivery.fee;
  const total = subtotal + deliveryFee;
  const order = await tx.orm.public.Order.select("id", "reference").create({
    reference: generateOrderReference(),
    type: input.type,
    status: "PENDING",
    paymentMethod: input.paymentMethod,
    customerName: input.customerName,
    phone,
    governorate: input.governorate,
    city: input.city,
    street: input.street,
    addressDetails: input.addressDetails,
    note: input.note,
    restaurantId: restaurant?.id ?? null,
    zoneId: delivery.zoneId,
    subtotal,
    deliveryFee,
    total,
    dayKey,
    ipHash: input.ipHash,
  });
  await tx.orm.public.OrderItem.createAll(lines.map((line) => ({ orderId: order.id, ...line })));

  // e) One more order today for this number.
  await tx.orm.public.OrderCounter.where({ id: counter.id }).update({ count: counter.count + 1 });

  return { ok: true, order: { reference: order.reference, total, deliveryFee, subtotal, delay: delivery.delay } };
}

/** The columns of today's counter that the order rules use. */
type DailyCounter = { id: number; count: number; refused: number };

/**
 * Today's counter for this phone number: created at 0 the first time, then LOCKED until the end
 * of the transaction. Two orders sent at the same moment are therefore counted one after the
 * other, and a 4th order can never slip through.
 */
async function lockDailyCounter(tx: Transaction, phone: string, dayKey: string): Promise<DailyCounter> {
  const created = await tx.orm.public.OrderCounter.upsert({
    create: { phone, dayKey, count: 0, refused: 0 },
    update: {},
    conflictOn: { phone, dayKey },
  });
  const counter = await tx.orm.public.OrderCounter.where({ id: created.id }).forUpdate().first();
  if (!counter) throw new Error("Order counter row disappeared during the transaction.");
  return counter;
}

/** EF-38: one line in the journal of refused attempts + one more refusal on today's counter. */
async function logRefusal(
  tx: Transaction,
  counter: DailyCounter,
  attempt: { phone: string; customerName: string; dayKey: string; reason: RefusalReason; ipHash: string | null },
): Promise<void> {
  await tx.orm.public.OrderAttempt.create(attempt);
  await tx.orm.public.OrderCounter.where({ id: counter.id }).update({ refused: counter.refused + 1 });
}

/**
 * EF-38: an order refused BEFORE createOrder() because this connection sent too many orders
 * (per-IP limit, RATE_LIMIT) is journaled like the other refusals, with the validated phone
 * number and name. Throws ModelError("INVALID_ORDER_INPUT") for a phone that is not 8 digits.
 */
export async function recordRateLimitedOrder(input: {
  phone: string;
  customerName: string;
  ipHash: string | null;
}): Promise<void> {
  if (!/^\d{8}$/.test(input.phone) || input.customerName.trim().length === 0) throw new ModelError("INVALID_ORDER_INPUT");
  const dayKey = tunisDayKey();
  await db.transaction(async (tx) => {
    const counter = await lockDailyCounter(tx, input.phone, dayKey);
    await logRefusal(tx, counter, {
      phone: input.phone,
      customerName: input.customerName,
      dayKey,
      reason: "RATE_LIMIT",
      ipHash: input.ipHash,
    });
  });
}

/** Letters and digits that cannot be confused when read on a phone (no I, O, 0, 1). */
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** "CC-7K2P9Q": "CC-" + 6 random characters (crypto-secure random numbers). */
function generateOrderReference(): string {
  let code = "";
  for (let i = 0; i < 6; i += 1) code += REFERENCE_ALPHABET.charAt(randomInt(REFERENCE_ALPHABET.length));
  return `CC-${code}`;
}

/* --------------------------------------------------------------------------
   Input safety net
   -------------------------------------------------------------------------- */

/**
 * The Server Action validates the form with zod; this only catches programming mistakes
 * (and tampered requests) before anything is read or written.
 */
function assertWellFormed(input: CreateOrderInput): void {
  const seen = new Set<string>();
  const itemsOk =
    Array.isArray(input.items) &&
    input.items.length <= MAX_LINES &&
    input.items.every((item) => {
      const key = `${item.kind}:${item.id}`;
      const ok =
        isOneOf(ITEM_KINDS, item.kind) &&
        isPositiveInteger(item.id) &&
        isPositiveInteger(item.quantity) &&
        item.quantity <= MAX_QUANTITY &&
        !seen.has(key); // the same item twice: the cart sends one line per item
      seen.add(key);
      return ok;
    });

  const ok =
    itemsOk &&
    isOneOf(ORDER_TYPES, input.type) &&
    isOneOf(PAYMENT_METHODS, input.paymentMethod) &&
    (input.restaurantId === null || isPositiveInteger(input.restaurantId)) &&
    /^\d{8}$/.test(input.phone) &&
    input.customerName.trim().length > 0 &&
    input.governorate.trim().length > 0 &&
    input.city.trim().length > 0 &&
    input.street.trim().length > 0;

  if (!ok) throw new ModelError("INVALID_ORDER_INPUT");
}
