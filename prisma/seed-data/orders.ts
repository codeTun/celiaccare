/**
 * Demo orders. This file only BUILDS the orders as plain objects; prisma/seed.ts saves them.
 *
 * What the generated history shows in the admin panel:
 * - about 220 orders over the last 180 days, more and more each month (the platform grows),
 *   busier on Fridays and Saturdays, about 70 % shop orders and 30 % restaurant orders;
 * - finished orders are mostly DELIVERED, about 8 % are CANCELLED;
 * - live orders (today / yesterday) in every status: PENDING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY;
 * - the "3 orders per day" rule (spec EF-35 → EF-39): a customer refused a 4th order today,
 *   another one three days ago, a blocked number that sent fake orders, and a crèche that is
 *   allowed up to 6 orders a day.
 *
 * Every order follows the rules of the real checkout (models/posters/orders.ts): current prices,
 * free delivery (delivery fee 0, total = subtotal), restaurant minimum order,
 * restaurants deliver in their own governorate only, at most 3 orders per phone number per day.
 * All amounts are in millimes. Dates are computed from `now`, so the history always ends today.
 */
import { tunisDayKey } from "../../lib/tunisia";
import type { DishCourse, OrderStatus, OrderType, PaymentMethod } from "../../types/enums";
import { BLOCKED_NUMBER, CRECHE, CUSTOMERS, type SeedCustomer } from "./people";
import type { Random } from "./random";

// =============================================================================
// Settings (change them to get more or fewer orders)
// =============================================================================

export const ORDER_SETTINGS = {
  /** The history starts this many days before today. */
  historyDays: 180,
  /** About how many orders in total (special stories included). */
  totalOrders: 220,
  /** Share of restaurant orders among the random orders (the crèche orders are all shop orders). */
  restaurantShare: 0.33,
  /** Share of finished orders that were cancelled. */
  cancelledShare: 0.08,
  /** Share of orders paid by card on delivery (the others: cash on delivery). */
  cardShare: 0.25,
  /** Share of orders with a note for the delivery person. */
  noteShare: 0.25,
  /** Activity of each weekday, Sunday first: Friday and Saturday are the busiest days. */
  weekdayActivity: [1, 0.75, 0.8, 0.9, 1, 1.4, 1.5],
  /** Activity at the start of the history compared with today (0.35 = about 3 times fewer orders). */
  startActivity: 0.35,
};

/** The usual limit of the checkout (EF-35) and the one of the crèche's EXCEPTION rule. */
const MAX_ORDERS_PER_DAY = 3;
const CRECHE_MAX_ORDERS_PER_DAY = 6;

/** Story: Salma (people.ts) places 3 orders today, then her 4th attempt is refused. */
const DAILY_LIMIT_TODAY_PHONE = "55219874";
/** Story: Karim (people.ts) did the same three days ago. */
const DAILY_LIMIT_EARLIER = { phone: "97106428", daysAgo: 3 };
/** Story: the blocked number sent 3 fake orders that day; after the block, 2 refused attempts. */
const FAKE_ORDERS_DAYS_AGO = 21;
const BLOCKED_ATTEMPTS_DAYS_AGO = [6, 4];
/** Story: the crèche orders every other Monday for the last 12 weeks, and much more on two busy days. */
const CRECHE_FIRST_ORDER_DAYS_AGO = 84;
const CRECHE_ORDER_EVERY_DAYS = 14;
const CRECHE_BUSY_DAYS = [
  { daysAgo: 40, orders: 5 },
  { daysAgo: 12, orders: 4 },
];
const CRECHE_PRODUCTS = [
  "la-seine-madeleine-marbree",
  "lorizo-biscuit-long-vanille",
  "glutella-cookies-sarrasin",
  "glutella-bsissa",
  "ibn-hayyan-couscous-traditionnel",
  "ecopasta-couscous-mais",
];
/** Orders of the last hours, with their status, so the admin sees work in progress. */
const LIVE_ORDERS: { minutesAgo: number; type: OrderType; status: OrderStatus; zoneDelay?: string }[] = [
  { minutesAgo: 8, type: "RESTAURANT", status: "PENDING" },
  { minutesAgo: 21, type: "RESTAURANT", status: "PREPARING" },
  { minutesAgo: 150, type: "SHOP", status: "CONFIRMED" },
  { minutesAgo: 16 * 60, type: "SHOP", status: "OUT_FOR_DELIVERY", zoneDelay: "24 h" },
  { minutesAgo: 20 * 60, type: "SHOP", status: "PREPARING", zoneDelay: "24–48 h" },
];
/** Restaurants open at lunch or in the evening only, and closing days (0 = Sunday … 6 = Saturday), from their opening hours. */
const DINNER_ONLY_RESTAURANTS: string[] = [];
const LUNCH_ONLY_RESTAURANTS = ["inward"];
const RESTAURANT_CLOSED_DAYS: Record<string, number[]> = {
  inward: [0, 1, 6], // open Tuesday to Friday
};
/** Shop orders are delivered this many days after the order (min, max), between 10:00 and 19:00, never on Sunday. */
const SHOP_DELIVERY_DAYS: Record<string, [number, number]> = {
  "24 h": [1, 1],
  "24–48 h": [1, 2],
  "48 h": [2, 2],
  "48–72 h": [2, 3],
};

const SHOP_NOTES = [
  "Merci d'appeler en arrivant, l'interphone ne marche pas.",
  "Livrer après 18 h, s'il vous plaît.",
  "Laisser le colis au gardien de la résidence.",
  "Mon fils est cœliaque : merci de garder les sachets bien fermés.",
  "Sonner deux fois.",
  "C'est un cadeau : pas de ticket dans le sac, merci.",
  "Prévoir la monnaie sur 50 DT.",
];
const RESTAURANT_NOTES = [
  "Sans couverts en plastique, merci.",
  "Bien chaud, s'il vous plaît !",
  "Harissa à part, merci.",
  "Allergie aux arachides à la maison.",
  "Appeler en arrivant, merci.",
];
const CRECHE_NOTE = "Livraison avant 10 h : la crèche ferme ses portes ensuite.";
const FAKE_ORDER_NOTES = ["Urgent, livrer ce soir !!!", "Appeler sur un autre numéro", "Urgent"];

/**
 * Same format as the checkout (generateOrderReference in models/posters/orders.ts): "CC-" + 6 characters,
 * no I, O, 0 or 1 (easy to read on a phone). Keep the prefix in step with the app, or order tracking
 * (normalizeOrderReference in models/fetchers/orders.ts) will not find the demo orders.
 */
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// =============================================================================
// Types
// =============================================================================

/** What the generator needs to know about the catalogue (read from the database by seed.ts). */
export type CatalogForOrders = {
  /** Active and available products of active producers. */
  products: { id: number; slug: string; name: string; price: number; merchantName: string; isFeatured: boolean; createdAt: Date }[];
  /** Active partner restaurants with their available dishes. */
  restaurants: {
    id: number;
    slug: string;
    name: string;
    governorate: string;
    minOrder: number;
    partnerSince: Date;
    dishes: { id: number; name: string; price: number; course: DishCourse }[];
  }[];
  zones: { id: number; governorate: string; delay: string }[];
  /** Active delivery people and the governorates they cover. */
  deliverers: { id: number; covers: string[] }[];
};

type CatalogProduct = CatalogForOrders["products"][number];
type CatalogRestaurant = CatalogForOrders["restaurants"][number];

export type DemoOrderItem = {
  kind: "PRODUCT" | "DISH";
  productId: number | null;
  dishId: number | null;
  name: string;
  merchantName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type DemoOrder = {
  reference: string;
  type: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
  addressDetails: string | null;
  note: string | null;
  restaurantId: number | null;
  zoneId: number | null;
  delivererId: number | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  dayKey: string;
  confirmedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: DemoOrderItem[];
};

export type DemoAttempt = {
  phone: string;
  customerName: string;
  dayKey: string;
  reason: "DAILY_LIMIT" | "BLOCKED";
  createdAt: Date;
};

export type DemoCounter = { phone: string; dayKey: string; count: number; refused: number };

/** Status and dates of an order. */
type Lifecycle = {
  status: OrderStatus;
  confirmedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  /** When the status last changed. */
  updatedAt: Date;
};

/** Everything needed to build one order. */
type OrderPlan = {
  createdAt: Date;
  type: OrderType;
  customer: SeedCustomer;
  /** RESTAURANT orders only. */
  restaurant?: CatalogRestaurant;
  /** Name / street typed in the form, when different from the customer's usual ones. */
  customerName?: string;
  street?: string;
  /** Lines chosen by the story; otherwise picked at random. */
  items?: DemoOrderItem[];
  /** Status chosen by the story; otherwise it follows from the age of the order. */
  status?: OrderStatus;
  note?: string;
};

// =============================================================================
// Dates (Tunisia uses UTC+1 all year round: no daylight saving time)
// =============================================================================

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** The instant of hour:minute, Tunis time, on the day "YYYY-MM-DD". */
function tunisTime(dayKey: string, hour: number, minute = 0): Date {
  return new Date(Date.parse(`${dayKey}T00:00:00.000Z`) - HOUR + hour * HOUR + minute * MINUTE);
}

/** "2026-11-15" + 2 → "2026-11-17" */
function addDays(dayKey: string, days: number): string {
  return new Date(Date.parse(`${dayKey}T12:00:00.000Z`) + days * DAY).toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday */
function weekday(dayKey: string): number {
  return new Date(`${dayKey}T12:00:00.000Z`).getUTCDay();
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MINUTE);
}

function earliest(a: Date, b: Date): Date {
  return a.getTime() <= b.getTime() ? a : b;
}

// =============================================================================
// The generator
// =============================================================================

export function buildDemoOrders(
  catalog: CatalogForOrders,
  now: Date,
  random: Random,
): { orders: DemoOrder[]; attempts: DemoAttempt[]; counters: DemoCounter[] } {
  const settings = ORDER_SETTINGS;
  const todayKey = tunisDayKey(now);
  const orders: DemoOrder[] = [];
  const attempts: DemoAttempt[] = [];
  const usedReferences = new Set<string>();
  const ordersPerPhoneAndDay = new Map<string, number>();
  const zoneByGovernorate = new Map(catalog.zones.map((zone) => [zone.governorate, zone]));
  const productBySlug = new Map(catalog.products.map((product) => [product.slug, product]));

  /** A value from [value, weight] pairs. */
  function pickWeighted<T>(choices: [T, number][]): T {
    return random.weighted(choices, ([, weight]) => weight)[0];
  }

  // --- The daily limit ----------------------------------------------------------------------

  function ordersOn(phone: string, dayKey: string) {
    return ordersPerPhoneAndDay.get(`${phone}|${dayKey}`) ?? 0;
  }

  function canOrder(phone: string, dayKey: string) {
    const limit = phone === CRECHE.phone ? CRECHE_MAX_ORDERS_PER_DAY : MAX_ORDERS_PER_DAY;
    return ordersOn(phone, dayKey) < limit;
  }

  /** A customer for a shop order, regular customers more often; null if nobody can order that day. */
  function pickShopCustomer(dayKey: string, extraFilter: (customer: SeedCustomer) => boolean = () => true) {
    const candidates = CUSTOMERS.filter((customer) => canOrder(customer.phone, dayKey) && extraFilter(customer));
    if (candidates.length === 0) return null;
    return random.weighted(candidates, (customer) => customer.ordersOften * customer.ordersOften);
  }

  /** Partner restaurants that took orders on that day (partner already, open that weekday, dishes to sell). */
  function restaurantsTakingOrders(dayKey: string, partnerBefore: Date) {
    return catalog.restaurants.filter(
      (restaurant) =>
        restaurant.partnerSince.getTime() <= partnerBefore.getTime() &&
        restaurant.dishes.length > 0 &&
        !(RESTAURANT_CLOSED_DAYS[restaurant.slug] ?? []).includes(weekday(dayKey)),
    );
  }

  /** A customer + one of the partner restaurants of their governorate; null if none. */
  function pickRestaurantCustomer(dayKey: string, partnerBefore: Date) {
    const open = restaurantsTakingOrders(dayKey, partnerBefore);
    const customer = pickShopCustomer(dayKey, (candidate) => open.some((r) => r.governorate === candidate.governorate));
    if (!customer) return null;
    const restaurant = random.pick(open.filter((r) => r.governorate === customer.governorate));
    return { customer, restaurant };
  }

  // --- Basket -------------------------------------------------------------------------------

  function productLine(product: CatalogProduct, quantity: number): DemoOrderItem {
    return {
      kind: "PRODUCT",
      productId: product.id,
      dishId: null,
      name: product.name,
      merchantName: product.merchantName,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
    };
  }

  /** 1 to 4 different products (featured ones are chosen more often). */
  function pickShopItems(at: Date, pool: CatalogProduct[] = catalog.products, bigQuantities = false) {
    const available = pool.filter((product) => product.createdAt.getTime() <= at.getTime());
    const lineCount = Math.min(available.length, pickWeighted<number>([[1, 35], [2, 35], [3, 20], [4, 10]]));
    const chosen: CatalogProduct[] = [];
    while (chosen.length < lineCount) {
      const left = available.filter((product) => !chosen.includes(product));
      chosen.push(random.weighted(left, (product) => (product.isFeatured ? 3 : 1)));
    }
    return chosen.map((product) =>
      productLine(product, bigQuantities ? random.int(2, 6) : pickWeighted<number>([[1, 65], [2, 25], [3, 10]])),
    );
  }

  /** A meal for 1 to 4 people: mains, maybe a starter, a dessert and drinks (4 lines at most). */
  function pickDishes(restaurant: CatalogRestaurant): DemoOrderItem[] {
    const ofCourse = (course: DishCourse) => restaurant.dishes.filter((dish) => dish.course === course);
    const lines = new Map<number, { dish: CatalogRestaurant["dishes"][number]; quantity: number }>();
    const add = (dish: CatalogRestaurant["dishes"][number], quantity: number) => {
      const line = lines.get(dish.id);
      if (line) line.quantity += quantity;
      else lines.set(dish.id, { dish, quantity });
    };

    const people = pickWeighted<number>([[1, 25], [2, 35], [3, 25], [4, 15]]);
    const mains = ofCourse("MAIN").length > 0 ? ofCourse("MAIN") : restaurant.dishes;
    const firstMain = random.pick(mains);
    if (people >= 2 && mains.length > 1 && random.chance(0.55)) {
      const secondMain = random.pick(mains.filter((dish) => dish.id !== firstMain.id));
      const split = random.int(1, people - 1);
      add(firstMain, split);
      add(secondMain, people - split);
    } else {
      add(firstMain, people);
    }
    const starters = ofCourse("STARTER");
    if (starters.length > 0 && lines.size < 4 && random.chance(0.45)) add(random.pick(starters), Math.ceil(people / 2));
    const desserts = ofCourse("DESSERT");
    if (desserts.length > 0 && lines.size < 4 && random.chance(0.35)) add(random.pick(desserts), random.int(1, people));
    const drinks = ofCourse("DRINK");
    if (drinks.length > 0 && lines.size < 4 && random.chance(0.55)) add(random.pick(drinks), people);

    // The checkout refuses an order below the restaurant's minimum: add one more main until it is reached.
    const subtotal = () => [...lines.values()].reduce((sum, line) => sum + line.dish.price * line.quantity, 0);
    while (subtotal() < restaurant.minOrder) add(firstMain, 1);

    return [...lines.values()].map(({ dish, quantity }) => ({
      kind: "DISH",
      productId: null,
      dishId: dish.id,
      name: dish.name,
      merchantName: restaurant.name,
      unitPrice: dish.price,
      quantity,
      lineTotal: dish.price * quantity,
    }));
  }

  // --- Status and dates ----------------------------------------------------------------------

  /** Restaurant orders: confirmed within minutes, delivered 35 to 60 minutes after the order. */
  function restaurantLifecycle(createdAt: Date): Lifecycle {
    const ageMinutes = (now.getTime() - createdAt.getTime()) / MINUTE;
    if (ageMinutes > 3 * 60 && random.chance(settings.cancelledShare)) {
      const wasConfirmed = random.chance(0.4);
      const cancelledAt = addMinutes(createdAt, random.int(8, 25));
      return {
        status: "CANCELLED",
        confirmedAt: wasConfirmed ? addMinutes(createdAt, random.int(2, 6)) : null,
        deliveredAt: null,
        cancelledAt,
        updatedAt: cancelledAt,
      };
    }
    const confirmedAt = addMinutes(createdAt, random.int(2, 6));
    if (ageMinutes < 10) return { status: "PENDING", confirmedAt: null, deliveredAt: null, cancelledAt: null, updatedAt: createdAt };
    if (ageMinutes < 15) return { status: "CONFIRMED", confirmedAt, deliveredAt: null, cancelledAt: null, updatedAt: confirmedAt };
    if (ageMinutes < 25) {
      return { status: "PREPARING", confirmedAt, deliveredAt: null, cancelledAt: null, updatedAt: addMinutes(createdAt, 12) };
    }
    if (ageMinutes < 45) {
      return { status: "OUT_FOR_DELIVERY", confirmedAt, deliveredAt: null, cancelledAt: null, updatedAt: addMinutes(createdAt, 25) };
    }
    const deliveredAt = earliest(addMinutes(createdAt, random.int(35, 60)), addMinutes(now, -1));
    return { status: "DELIVERED", confirmedAt, deliveredAt, cancelledAt: null, updatedAt: deliveredAt };
  }

  /** Shop orders: delivered 1 to 3 days later depending on the zone (never on Sunday). */
  function shopLifecycle(createdAt: Date, zoneDelay: string): Lifecycle {
    const ageMinutes = (now.getTime() - createdAt.getTime()) / MINUTE;
    if (ageMinutes > 6 * 60 && random.chance(settings.cancelledShare)) {
      const wasConfirmed = random.chance(0.5);
      const cancelledAt = earliest(addMinutes(createdAt, random.int(60, 300)), addMinutes(now, -1));
      return {
        status: "CANCELLED",
        confirmedAt: wasConfirmed ? addMinutes(createdAt, random.int(10, 40)) : null,
        deliveredAt: null,
        cancelledAt,
        updatedAt: cancelledAt,
      };
    }
    const [minDays, maxDays] = SHOP_DELIVERY_DAYS[zoneDelay] ?? [2, 3];
    let deliveryDay = addDays(tunisDayKey(createdAt), random.int(minDays, maxDays));
    if (weekday(deliveryDay) === 0) deliveryDay = addDays(deliveryDay, 1); // no delivery on Sunday
    const deliveredAt = tunisTime(deliveryDay, random.int(10, 18), random.int(0, 59));
    const leftForDelivery = addMinutes(tunisTime(deliveryDay, 8, 30), random.int(0, 60));
    const confirmedAt = addMinutes(createdAt, random.int(10, 50));

    if (deliveredAt.getTime() <= now.getTime()) {
      return { status: "DELIVERED", confirmedAt, deliveredAt, cancelledAt: null, updatedAt: deliveredAt };
    }
    if (leftForDelivery.getTime() <= now.getTime()) {
      return { status: "OUT_FOR_DELIVERY", confirmedAt, deliveredAt: null, cancelledAt: null, updatedAt: leftForDelivery };
    }
    if (ageMinutes >= 4 * 60) {
      return {
        status: "PREPARING",
        confirmedAt,
        deliveredAt: null,
        cancelledAt: null,
        updatedAt: addMinutes(createdAt, random.int(120, 180)),
      };
    }
    if (ageMinutes >= 60) return { status: "CONFIRMED", confirmedAt, deliveredAt: null, cancelledAt: null, updatedAt: confirmedAt };
    return { status: "PENDING", confirmedAt: null, deliveredAt: null, cancelledAt: null, updatedAt: createdAt };
  }

  /** Dates for a status chosen by a story (live orders, fake orders). */
  function forcedLifecycle(status: OrderStatus, createdAt: Date): Lifecycle {
    const ageMinutes = Math.max(0, (now.getTime() - createdAt.getTime()) / MINUTE);
    const confirmedAt = addMinutes(createdAt, Math.min(ageMinutes / 4, 30));
    switch (status) {
      case "PENDING":
        return { status, confirmedAt: null, deliveredAt: null, cancelledAt: null, updatedAt: createdAt };
      case "CONFIRMED":
        return { status, confirmedAt, deliveredAt: null, cancelledAt: null, updatedAt: confirmedAt };
      case "PREPARING":
        return { status, confirmedAt, deliveredAt: null, cancelledAt: null, updatedAt: addMinutes(createdAt, ageMinutes / 2) };
      case "OUT_FOR_DELIVERY":
        return { status, confirmedAt, deliveredAt: null, cancelledAt: null, updatedAt: addMinutes(now, -Math.min(ageMinutes / 4, 90)) };
      case "DELIVERED":
        return { status, confirmedAt, deliveredAt: addMinutes(now, -1), cancelledAt: null, updatedAt: addMinutes(now, -1) };
      case "CANCELLED": {
        // Cancelled by the admin the next morning, after calling the number.
        const cancelledAt = earliest(addMinutes(createdAt, 10.5 * 60), addMinutes(now, -1));
        return { status, confirmedAt: null, deliveredAt: null, cancelledAt, updatedAt: cancelledAt };
      }
    }
  }

  // --- One order ------------------------------------------------------------------------------

  function newReference(): string {
    for (;;) {
      let code = "";
      for (let i = 0; i < 6; i += 1) code += REFERENCE_ALPHABET.charAt(random.int(0, REFERENCE_ALPHABET.length - 1));
      const reference = `CC-${code}`;
      if (!usedReferences.has(reference)) {
        usedReferences.add(reference);
        return reference;
      }
    }
  }

  function pickDeliverer(governorate: string): number | null {
    const covering = catalog.deliverers.filter((deliverer) => deliverer.covers.includes(governorate));
    if (covering.length > 0) return random.pick(covering).id;
    // Nobody covers this governorate: the long-distance driver (the one covering most places) goes.
    const longDistance = [...catalog.deliverers].sort((a, b) => b.covers.length - a.covers.length)[0];
    return longDistance?.id ?? null;
  }

  function buildOrder(plan: OrderPlan): DemoOrder {
    const { customer, createdAt, type, restaurant } = plan;
    const zone = zoneByGovernorate.get(customer.governorate);
    if (!zone) throw new Error(`No delivery zone for ${customer.governorate} (customer ${customer.phone}).`);
    if (type === "RESTAURANT" && !restaurant) throw new Error("A restaurant order needs a restaurant.");

    const items =
      plan.items ?? (type === "RESTAURANT" && restaurant ? pickDishes(restaurant) : pickShopItems(createdAt));
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const deliveryFee = 0; // delivery is free for the customer (like createOrder())

    const life = plan.status
      ? forcedLifecycle(plan.status, createdAt)
      : type === "RESTAURANT"
        ? restaurantLifecycle(createdAt)
        : shopLifecycle(createdAt, zone.delay);
    const isOnTheRoad = life.status === "DELIVERED" || life.status === "OUT_FOR_DELIVERY";

    const dayKey = tunisDayKey(createdAt);
    ordersPerPhoneAndDay.set(`${customer.phone}|${dayKey}`, ordersOn(customer.phone, dayKey) + 1);

    const notes = type === "RESTAURANT" ? RESTAURANT_NOTES : SHOP_NOTES;
    return {
      reference: newReference(),
      type,
      status: life.status,
      paymentMethod: random.chance(settings.cardShare) ? "CARD_ON_DELIVERY" : "CASH_ON_DELIVERY",
      customerName: plan.customerName ?? `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone,
      governorate: customer.governorate,
      city: customer.city,
      street: plan.street ?? customer.street,
      addressDetails: plan.street ? null : customer.addressDetails,
      note: plan.note ?? (random.chance(settings.noteShare) ? random.pick(notes) : null),
      restaurantId: restaurant?.id ?? null,
      zoneId: zone.id,
      delivererId: isOnTheRoad ? pickDeliverer(customer.governorate) : null,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      dayKey,
      confirmedAt: life.confirmedAt,
      deliveredAt: life.deliveredAt,
      cancelledAt: life.cancelledAt,
      createdAt,
      updatedAt: life.updatedAt,
      items,
    };
  }

  /** An order for this customer: at a partner restaurant of their governorate, or a shop order when none takes orders that day. */
  function orderFor(customer: SeedCustomer, createdAt: Date, type: OrderType): DemoOrder {
    if (type === "RESTAURANT") {
      const options = restaurantsTakingOrders(tunisDayKey(createdAt), createdAt).filter(
        (restaurant) => restaurant.governorate === customer.governorate,
      );
      if (options.length > 0) return buildOrder({ createdAt, type, customer, restaurant: random.pick(options) });
    }
    return buildOrder({ createdAt, type: "SHOP", customer });
  }

  function findCustomer(phone: string): SeedCustomer {
    const customer = CUSTOMERS.find((candidate) => candidate.phone === phone);
    if (!customer) throw new Error(`orders.ts: no customer with phone ${phone} in people.ts.`);
    return customer;
  }

  const fullName = (customer: SeedCustomer) => `${customer.firstName} ${customer.lastName}`;

  // ===========================================================================================
  // 1. Stories (placed first, so the random orders respect their daily counts)
  // ===========================================================================================

  // a) Today: Salma reaches 3 orders, then her 4th attempt is refused (EF-37 / EF-38).
  {
    const salma = findCustomer(DAILY_LIMIT_TODAY_PHONE);
    const morning = tunisTime(todayKey, 7, 30);
    const start = now.getTime() - morning.getTime() >= 2 * HOUR ? morning : tunisTime(todayKey, 0);
    const at = (fraction: number) => new Date(start.getTime() + (now.getTime() - start.getTime()) * fraction);
    orders.push(orderFor(salma, at(0.25), "SHOP"));
    orders.push(orderFor(salma, at(0.55), "RESTAURANT"));
    orders.push(orderFor(salma, at(0.8), "SHOP"));
    attempts.push({ phone: salma.phone, customerName: fullName(salma), dayKey: todayKey, reason: "DAILY_LIMIT", createdAt: at(0.9) });
  }

  // b) Three days ago: Karim, same story.
  {
    const karim = findCustomer(DAILY_LIMIT_EARLIER.phone);
    const day = addDays(todayKey, -DAILY_LIMIT_EARLIER.daysAgo);
    orders.push(orderFor(karim, tunisTime(day, 11, 40), "SHOP"));
    orders.push(orderFor(karim, tunisTime(day, 13, 10), "RESTAURANT"));
    orders.push(orderFor(karim, tunisTime(day, 17, 45), "SHOP"));
    attempts.push({ phone: karim.phone, customerName: fullName(karim), dayKey: day, reason: "DAILY_LIMIT", createdAt: tunisTime(day, 18, 20) });
  }

  // c) The blocked number: 3 fake orders late at night (cancelled by the admin), then refused attempts.
  {
    const day = addDays(todayKey, -FAKE_ORDERS_DAYS_AGO);
    const fakeCustomer: SeedCustomer = {
      firstName: BLOCKED_NUMBER.names[0],
      lastName: "",
      phone: BLOCKED_NUMBER.phone,
      governorate: BLOCKED_NUMBER.governorate,
      city: BLOCKED_NUMBER.city,
      street: BLOCKED_NUMBER.streets[0],
      addressDetails: null,
      ordersOften: 1,
    };
    const expensive = [...catalog.products].sort((a, b) => b.price - a.price).slice(0, 6);
    [41, 47, 55].forEach((minute, index) => {
      orders.push(
        buildOrder({
          createdAt: tunisTime(day, 22, minute),
          type: "SHOP",
          customer: fakeCustomer,
          customerName: BLOCKED_NUMBER.names[index % BLOCKED_NUMBER.names.length],
          street: BLOCKED_NUMBER.streets[index % BLOCKED_NUMBER.streets.length],
          items: pickShopItems(tunisTime(day, 22, minute), expensive, true),
          status: "CANCELLED",
          note: FAKE_ORDER_NOTES[index % FAKE_ORDER_NOTES.length],
        }),
      );
    });
    BLOCKED_ATTEMPTS_DAYS_AGO.forEach((daysAgo, index) => {
      const attemptDay = addDays(todayKey, -daysAgo);
      attempts.push({
        phone: BLOCKED_NUMBER.phone,
        customerName: BLOCKED_NUMBER.names[(index + 1) % BLOCKED_NUMBER.names.length],
        dayKey: attemptDay,
        reason: "BLOCKED",
        createdAt: tunisTime(attemptDay, 22 + index, 35 - index * 20),
      });
    });
  }

  // d) The crèche: every other Monday morning, plus two busy days (allowed by its EXCEPTION rule).
  {
    const crecheProducts = CRECHE_PRODUCTS.map((slug) => productBySlug.get(slug)).filter(
      (product): product is CatalogProduct => product !== undefined,
    );
    if (crecheProducts.length > 0) {
      const crecheOrder = (createdAt: Date) =>
        buildOrder({
          createdAt,
          type: "SHOP",
          customer: CRECHE,
          items: pickShopItems(createdAt, crecheProducts, true),
          note: CRECHE_NOTE,
        });
      let monday = addDays(todayKey, -CRECHE_FIRST_ORDER_DAYS_AGO);
      while (weekday(monday) !== 1) monday = addDays(monday, 1);
      for (; monday < todayKey; monday = addDays(monday, CRECHE_ORDER_EVERY_DAYS)) {
        orders.push(crecheOrder(tunisTime(monday, 8, random.int(0, 50))));
      }
      for (const busy of CRECHE_BUSY_DAYS) {
        const day = addDays(todayKey, -busy.daysAgo);
        for (let i = 0; i < busy.orders && canOrder(CRECHE.phone, day); i += 1) {
          orders.push(crecheOrder(tunisTime(day, 9 + i, random.int(0, 45))));
        }
      }
    }
  }

  // ===========================================================================================
  // 2. Live orders of the last hours (every status of the order life cycle)
  // ===========================================================================================
  for (const live of LIVE_ORDERS) {
    const createdAt = addMinutes(now, -live.minutesAgo);
    const dayKey = tunisDayKey(createdAt);
    if (live.type === "RESTAURANT") {
      const pick = pickRestaurantCustomer(dayKey, createdAt);
      if (pick) {
        orders.push(buildOrder({ createdAt, type: "RESTAURANT", customer: pick.customer, restaurant: pick.restaurant, status: live.status }));
        continue;
      }
    }
    const customer = pickShopCustomer(dayKey, (candidate) => !live.zoneDelay || zoneByGovernorate.get(candidate.governorate)?.delay === live.zoneDelay);
    if (customer) orders.push(buildOrder({ createdAt, type: "SHOP", customer, status: live.status }));
  }

  // ===========================================================================================
  // 3. Random orders: from 180 days ago to yesterday, growing over time, busier at the weekend
  // ===========================================================================================
  const days: string[] = [];
  for (let daysAgo = settings.historyDays; daysAgo >= 1; daysAgo -= 1) days.push(addDays(todayKey, -daysAgo));
  const activity = days.map((day, index) => {
    const growth = settings.startActivity + (1 - settings.startActivity) * (index / (days.length - 1));
    const noise = 0.8 + 0.4 * random.next();
    return growth * settings.weekdayActivity[weekday(day)] * noise;
  });
  const randomOrderCount = Math.max(0, settings.totalOrders - orders.length);
  const ordersPerDay = spreadOver(randomOrderCount, activity);

  days.forEach((day, index) => {
    for (let i = 0; i < ordersPerDay[index]; i += 1) {
      const wantsRestaurant = random.chance(settings.restaurantShare);
      const pick = wantsRestaurant ? pickRestaurantCustomer(day, tunisTime(day, 0)) : null;
      if (pick) {
        const dinner =
          !LUNCH_ONLY_RESTAURANTS.includes(pick.restaurant.slug) &&
          (DINNER_ONLY_RESTAURANTS.includes(pick.restaurant.slug) || random.chance(0.55));
        // Lunch 12:00–14:30 or dinner 19:00–20:59, inside each partner's opening hours.
        const createdAt = dinner
          ? tunisTime(day, random.int(19, 20), random.int(0, 59))
          : tunisTime(day, random.int(12, 14), random.int(0, 30));
        orders.push(buildOrder({ createdAt, type: "RESTAURANT", customer: pick.customer, restaurant: pick.restaurant }));
        continue;
      }
      const customer = pickShopCustomer(day);
      if (!customer) continue;
      const hour = pickWeighted<number>([
        [8, 1], [9, 2], [10, 3], [11, 3], [12, 3], [13, 3], [14, 2], [15, 2],
        [16, 2], [17, 3], [18, 3], [19, 4], [20, 4], [21, 3], [22, 2],
      ]);
      orders.push(buildOrder({ createdAt: tunisTime(day, hour, random.int(0, 59)), type: "SHOP", customer }));
    }
  });

  orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  attempts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // ===========================================================================================
  // 4. Daily counters of today and yesterday (EF-36), consistent with the orders and refusals
  // ===========================================================================================
  const counterDays = [todayKey, addDays(todayKey, -1)];
  const counters = new Map<string, DemoCounter>();
  const counterFor = (phone: string, dayKey: string) => {
    const key = `${phone}|${dayKey}`;
    let counter = counters.get(key);
    if (!counter) {
      counter = { phone, dayKey, count: 0, refused: 0 };
      counters.set(key, counter);
    }
    return counter;
  };
  for (const order of orders) if (counterDays.includes(order.dayKey)) counterFor(order.phone, order.dayKey).count += 1;
  for (const attempt of attempts) if (counterDays.includes(attempt.dayKey)) counterFor(attempt.phone, attempt.dayKey).refused += 1;

  return { orders, attempts, counters: [...counters.values()] };
}

/**
 * Share `total` whole orders between days in proportion to their `weights`
 * (the rounding errors are carried over, so the sum is exactly `total`).
 */
function spreadOver(total: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  let cumulative = 0;
  let given = 0;
  return weights.map((weight) => {
    cumulative += (weight / sum) * total;
    const upToHere = Math.round(cumulative);
    const count = upToHere - given;
    given = upToHere;
    return count;
  });
}
