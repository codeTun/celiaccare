import "server-only";

import { and } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";
import { tunisDayKey } from "@/lib/tunisia";
import { publicProducers, publicProducts, publicRestaurants } from "@/models/fetchers/mappers";
import {
  ORDER_STATUSES,
  ORDER_TYPES,
  type CategoryRevenueDTO,
  type DashboardStatsDTO,
  type RevenuePointDTO,
  type StatusCountDTO,
  type TopItemDTO,
  type TypeRevenueDTO,
} from "@/types";
import type { AdminOrderRow, AdminSheetToReview, RevenueRange } from "@/types/admin-data";

import { reviewCutoff, toIso } from "./helpers";
import { listOrders } from "./orders";

/**
 * ADMIN — dashboard figures and charts (spec: "stats, charts, revenues"). Never cached.
 * Call requireAdmin() before using these functions.
 *
 * Rules used everywhere in this file:
 *  - CANCELLED orders are left out of every figure (revenue, order counts, averages, top lists);
 *  - "today" and "this month" follow the Tunis calendar (Africa/Tunis), like the order counters;
 *  - amounts are in millimes; item revenue is the sum of line totals (delivery fees excluded);
 *  - CeliacCare's commission = siteConfig.commissionRate × the orders' merchandise subtotal
 *    (paid by the merchants: customers pay the merchants' prices only, delivery is free).
 */

/* --------------------------------------------------------------------------
   Calendar helpers. Days are "YYYY-MM-DD" keys, months "YYYY-MM" keys, both in
   Tunis time. In SQL, `'2026-11-01'::timestamp AT TIME ZONE 'Africa/Tunis'` is
   the exact instant of midnight in Tunis that day.
   -------------------------------------------------------------------------- */

/** "2026-11-15" + 1 → "2026-11-16" */
function addDays(dayKey: string, days: number) {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** "2026-11" - 1 → "2026-10" */
function addMonths(monthKey: string, months: number) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + months, 1)).toISOString().slice(0, 7);
}

/** "2026-11-15" → "15/11" */
function dayLabel(dayKey: string) {
  const [, month, day] = dayKey.split("-");
  return `${day}/${month}`;
}

const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric", timeZone: "UTC" });

/** "2026-11" → "nov. 2026" */
function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return monthFormatter.format(new Date(Date.UTC(year, month - 1, 1)));
}

/** A limit coming from a page: a whole number between 1 and 100. */
function safeLimit(limit: number) {
  return Number.isFinite(limit) ? Math.min(100, Math.max(1, Math.trunc(limit))) : 5;
}

/* --------------------------------------------------------------------------
   Dashboard cards
   -------------------------------------------------------------------------- */

/** The numbers shown on the dashboard cards. `now` can be changed for tests. */
export async function getDashboardStats(now: Date = new Date()): Promise<DashboardStatsDTO> {
  const today = tunisDayKey(now); // "2026-11-15"
  const tomorrow = addDays(today, 1); // "2026-11-16"
  const thisMonth = today.slice(0, 7); // "2026-11"
  const lastMonthStart = addMonths(thisMonth, -1) + "-01"; // "2026-10-01"
  const thisMonthStart = thisMonth + "-01"; // "2026-11-01"
  const nextMonthStart = addMonths(thisMonth, 1) + "-01"; // "2026-12-01"
  const cutoff = reviewCutoff(now);

  // Revenue and order counts of last month, this month and today, in one query.
  const revenueQuery = db.query(
    db.raw.sql`
      SELECT
        COALESCE(SUM(o."total") FILTER (WHERE o."createdAt" >= b."thisMonth"), 0) AS "revenueThisMonth",
        COALESCE(SUM(o."total") FILTER (WHERE o."createdAt" < b."thisMonth"), 0) AS "revenueLastMonth",
        COUNT(o."id") FILTER (WHERE o."createdAt" >= b."thisMonth") AS "ordersThisMonth",
        COUNT(o."id") FILTER (WHERE o."createdAt" >= b."today" AND o."createdAt" < b."tomorrow") AS "ordersToday"
      FROM (
        SELECT
          (${lastMonthStart}::timestamp AT TIME ZONE 'Africa/Tunis') AS "lastMonth",
          (${thisMonthStart}::timestamp AT TIME ZONE 'Africa/Tunis') AS "thisMonth",
          (${nextMonthStart}::timestamp AT TIME ZONE 'Africa/Tunis') AS "nextMonth",
          (${today}::timestamp AT TIME ZONE 'Africa/Tunis') AS "today",
          (${tomorrow}::timestamp AT TIME ZONE 'Africa/Tunis') AS "tomorrow"
      ) AS b
      LEFT JOIN "Order" o
        ON o."status" <> 'CANCELLED' AND o."createdAt" >= b."lastMonth" AND o."createdAt" < b."nextMonth"
    `
      .returnsRow({
        revenueThisMonth: "pg/int8number@1",
        revenueLastMonth: "pg/int8number@1",
        ordersThisMonth: "pg/int8number@1",
        ordersToday: "pg/int8number@1",
      })
      .build(),
  );

  const [
    [revenue],
    pendingOrders,
    newMessages,
    openReports,
    pendingReviews,
    refusedAttemptsToday,
    activeProducts,
    activeRestaurants,
    activeProducers,
    productsToReview,
    producersToReview,
    restaurantsToReview,
  ] = await Promise.all([
    revenueQuery,
    db.orm.public.Order.where({ status: "PENDING" }).aggregate((a) => ({ n: a.count() })),
    db.orm.public.ContactMessage.where({ status: "NEW" }).aggregate((a) => ({ n: a.count() })),
    db.orm.public.Report.where((r) => r.status.in(["OPEN", "IN_REVIEW"])).aggregate((a) => ({ n: a.count() })),
    db.orm.public.Review.where({ status: "PENDING" }).aggregate((a) => ({ n: a.count() })),
    db.orm.public.OrderAttempt.where({ dayKey: today }).aggregate((a) => ({ n: a.count() })),
    db.orm.public.Product.where({ isActive: true }).aggregate((a) => ({ n: a.count() })),
    db.orm.public.Restaurant.where({ isActive: true }).aggregate((a) => ({ n: a.count() })),
    db.orm.public.Producer.where({ isActive: true }).aggregate((a) => ({ n: a.count() })),
    db.orm.public.Product.where((p) => and(p.isActive.eq(true), p.verifiedAt.lt(cutoff))).aggregate((a) => ({ n: a.count() })),
    db.orm.public.Producer.where((p) => and(p.isActive.eq(true), p.verifiedAt.lt(cutoff))).aggregate((a) => ({ n: a.count() })),
    db.orm.public.Restaurant.where((r) => and(r.isActive.eq(true), r.verifiedAt.lt(cutoff))).aggregate((a) => ({ n: a.count() })),
  ]);

  const revenueThisMonth = revenue?.revenueThisMonth ?? 0;
  const ordersThisMonth = revenue?.ordersThisMonth ?? 0;
  return {
    revenueThisMonth,
    revenueLastMonth: revenue?.revenueLastMonth ?? 0,
    ordersToday: revenue?.ordersToday ?? 0,
    ordersThisMonth,
    averageBasket: ordersThisMonth > 0 ? Math.round(revenueThisMonth / ordersThisMonth) : 0,
    pendingOrders: pendingOrders.n,
    newMessages: newMessages.n,
    openReports: openReports.n,
    pendingReviews: pendingReviews.n,
    refusedAttemptsToday: refusedAttemptsToday.n,
    activeProducts: activeProducts.n,
    activeRestaurants: activeRestaurants.n,
    activeProducers: activeProducers.n,
    sheetsToReview: productsToReview.n + producersToReview.n + restaurantsToReview.n,
  };
}

/** Spec §2 success criterion: "90 % des fiches vérifiées depuis moins de 6 mois". */
export type SheetFreshness = {
  /** Sheets shown on the website: public products, active small businesses and active restaurants. */
  published: number;
  /** Those verified less than 6 months ago. */
  fresh: number;
};

/** 6 months, with the same average month as getSheetsToReview(). */
const SIX_MONTHS_MS = 6 * 30.4375 * 24 * 60 * 60 * 1000;

/** How many published sheets were verified less than 6 months ago (target: 90 %, spec §2). */
export async function getSheetFreshness(now: Date = new Date()): Promise<SheetFreshness> {
  const since = new Date(now.getTime() - SIX_MONTHS_MS);
  const [products, producers, restaurants, freshProducts, freshProducers, freshRestaurants] = await Promise.all([
    publicProducts().aggregate((a) => ({ n: a.count() })),
    publicProducers().aggregate((a) => ({ n: a.count() })),
    publicRestaurants().aggregate((a) => ({ n: a.count() })),
    publicProducts().where((p) => p.verifiedAt.gte(since)).aggregate((a) => ({ n: a.count() })),
    publicProducers().where((p) => p.verifiedAt.gte(since)).aggregate((a) => ({ n: a.count() })),
    publicRestaurants().where((r) => r.verifiedAt.gte(since)).aggregate((a) => ({ n: a.count() })),
  ]);
  return {
    published: products.n + producers.n + restaurants.n,
    fresh: freshProducts.n + freshProducers.n + freshRestaurants.n,
  };
}

/** Month-to-date revenue compared with the same period of last month (cancelled orders excluded). */
export type MonthToDateComparison = {
  /** From the 1st of this month (Tunis) to now, millimes. */
  revenue: number;
  orders: number;
  /** CeliacCare's commission on the merchandise subtotal of these orders, millimes. */
  commission: number;
  /** From the 1st of last month to the same day and hour of last month, millimes. */
  previousRevenue: number;
  previousOrders: number;
  previousCommission: number;
};

/** CeliacCare's commission on a merchandise subtotal (millimes, rounded to the millime). */
function commissionOn(merchandise: number) {
  return Math.round(merchandise * siteConfig.commissionRate);
}

/**
 * Compare like with like: on the 15th at 14:00, this month's revenue so far is compared with
 * last month's revenue from the 1st to the 15th at 14:00 (not with the whole of last month,
 * which would always look better in the middle of a month). When last month is shorter
 * (e.g. on March 31st), the comparison stops at the end of last month.
 */
export async function getMonthToDateComparison(now: Date = new Date()): Promise<MonthToDateComparison> {
  const thisMonth = tunisDayKey(now).slice(0, 7); // "2026-11"
  const thisMonthStart = thisMonth + "-01"; // "2026-11-01"
  const lastMonthStart = addMonths(thisMonth, -1) + "-01"; // "2026-10-01"
  const nowIso = now.toISOString();

  const [row] = await db.query(
    db.raw.sql`
      SELECT
        COALESCE(SUM(o."total") FILTER (WHERE o."createdAt" >= b."thisMonth"), 0) AS "revenue",
        COALESCE(SUM(o."subtotal") FILTER (WHERE o."createdAt" >= b."thisMonth"), 0) AS "merchandise",
        COUNT(o."id") FILTER (WHERE o."createdAt" >= b."thisMonth") AS "orders",
        COALESCE(SUM(o."total") FILTER (WHERE o."createdAt" < b."lastMonthCut"), 0) AS "previousRevenue",
        COALESCE(SUM(o."subtotal") FILTER (WHERE o."createdAt" < b."lastMonthCut"), 0) AS "previousMerchandise",
        COUNT(o."id") FILTER (WHERE o."createdAt" < b."lastMonthCut") AS "previousOrders"
      FROM (
        SELECT
          m."lastMonth",
          m."thisMonth",
          LEAST(m."lastMonth" + (${nowIso}::timestamptz - m."thisMonth"), m."thisMonth") AS "lastMonthCut",
          ${nowIso}::timestamptz AS "now"
        FROM (
          SELECT
            (${lastMonthStart}::timestamp AT TIME ZONE 'Africa/Tunis') AS "lastMonth",
            (${thisMonthStart}::timestamp AT TIME ZONE 'Africa/Tunis') AS "thisMonth"
        ) AS m
      ) AS b
      LEFT JOIN "Order" o
        ON o."status" <> 'CANCELLED' AND o."createdAt" >= b."lastMonth" AND o."createdAt" < b."now"
    `
      .returnsRow({
        revenue: "pg/int8number@1",
        merchandise: "pg/int8number@1",
        orders: "pg/int8number@1",
        previousRevenue: "pg/int8number@1",
        previousMerchandise: "pg/int8number@1",
        previousOrders: "pg/int8number@1",
      })
      .build(),
  );

  return {
    revenue: row?.revenue ?? 0,
    orders: row?.orders ?? 0,
    commission: commissionOn(row?.merchandise ?? 0),
    previousRevenue: row?.previousRevenue ?? 0,
    previousOrders: row?.previousOrders ?? 0,
    previousCommission: commissionOn(row?.previousMerchandise ?? 0),
  };
}

/* --------------------------------------------------------------------------
   Charts
   -------------------------------------------------------------------------- */

/**
 * Revenue and number of orders per day ("30d": the last 30 days, labels "15/11")
 * or per month ("12m": the last 12 months, labels "nov. 2026"), oldest first.
 * Days / months without orders are included with 0, so the chart has no holes.
 */
export async function getRevenueSeries(range: RevenueRange, now: Date = new Date()): Promise<RevenuePointDTO[]> {
  const today = tunisDayKey(now);
  const byMonth = range === "12m";
  // One key per point, oldest first: "2026-10-17" … "2026-11-15", or "2025-12" … "2026-11".
  const keys = byMonth
    ? Array.from({ length: 12 }, (_, i) => addMonths(today.slice(0, 7), i - 11))
    : Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));
  // Orders counted: from the first day of the first point (included) to the day after the last one (excluded).
  const from = byMonth ? `${keys[0]}-01` : keys[0];
  const to = byMonth ? `${addMonths(today.slice(0, 7), 1)}-01` : addDays(today, 1);
  const keyFormat = byMonth ? "YYYY-MM" : "YYYY-MM-DD";

  const rows = await db.query(
    db.raw.sql`
      SELECT
        to_char(o."createdAt" AT TIME ZONE 'Africa/Tunis', ${keyFormat}) AS "key",
        COUNT(*) AS "orders",
        COALESCE(SUM(o."total"), 0) AS "revenue"
      FROM "Order" o
      WHERE o."status" <> 'CANCELLED'
        AND o."createdAt" >= (${from}::timestamp AT TIME ZONE 'Africa/Tunis')
        AND o."createdAt" < (${to}::timestamp AT TIME ZONE 'Africa/Tunis')
      GROUP BY 1
    `
      .returnsRow({ key: "pg/text@1", orders: "pg/int8number@1", revenue: "pg/int8number@1" })
      .build(),
  );

  const byKey = new Map(rows.map((row) => [row.key, row]));
  return keys.map((key) => ({
    label: byMonth ? monthLabel(key) : dayLabel(key),
    revenue: byKey.get(key)?.revenue ?? 0,
    orders: byKey.get(key)?.orders ?? 0,
  }));
}

/** Number of orders in each status (all time), in the order of the order life cycle. */
export async function getOrdersByStatus(): Promise<StatusCountDTO[]> {
  const groups = await db.orm.public.Order.groupBy("status").aggregate((a) => ({ n: a.count() }));
  return ORDER_STATUSES.map((status) => ({
    status,
    count: groups.find((group) => group.status === status)?.n ?? 0,
  }));
}

/** Revenue and orders of the shop (products) vs the partner restaurants (all time, cancelled excluded). */
export async function getRevenueByType(): Promise<TypeRevenueDTO[]> {
  const groups = await db.orm.public.Order.where((o) => o.status.neq("CANCELLED"))
    .groupBy("type")
    .aggregate((a) => ({ orders: a.count(), revenue: a.sum("total") }));
  return ORDER_TYPES.map((type) => {
    const group = groups.find((g) => g.type === type);
    return { type, revenue: group?.revenue ?? 0, orders: group?.orders ?? 0 };
  });
}

/**
 * Best-selling products by quantity (all time, cancelled orders excluded).
 * A product deleted since keeps the name it had in the orders.
 */
export async function getTopProducts(limit = 5): Promise<TopItemDTO[]> {
  const rows = await db.query(
    db.raw.sql`
      SELECT
        COALESCE(MAX(p."name"), MAX(oi."name")) AS "name",
        SUM(oi."quantity") AS "quantity",
        SUM(oi."lineTotal") AS "revenue"
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId"
      LEFT JOIN "Product" p ON p."id" = oi."productId"
      WHERE oi."kind" = 'PRODUCT' AND o."status" <> 'CANCELLED'
      GROUP BY COALESCE(oi."productId"::text, 'deleted:' || oi."name")
      ORDER BY "quantity" DESC, "revenue" DESC, "name" ASC
      LIMIT ${safeLimit(limit)}
    `
      .returnsRow({ name: "pg/text@1", quantity: "pg/int8number@1", revenue: "pg/int8number@1" })
      .build(),
  );
  return rows.map((row) => ({ name: row.name, quantity: row.quantity, revenue: row.revenue }));
}

/**
 * Best-selling dishes by quantity (all time, cancelled orders excluded).
 * The name is "Dish — Restaurant", because two restaurants may serve a dish with the same name.
 */
export async function getTopDishes(limit = 5): Promise<TopItemDTO[]> {
  const rows = await db.query(
    db.raw.sql`
      SELECT
        COALESCE(MAX(d."name"), MAX(oi."name")) || ' — ' || COALESCE(MAX(r."name"), MAX(oi."merchantName")) AS "name",
        SUM(oi."quantity") AS "quantity",
        SUM(oi."lineTotal") AS "revenue"
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId"
      LEFT JOIN "Dish" d ON d."id" = oi."dishId"
      LEFT JOIN "Restaurant" r ON r."id" = d."restaurantId"
      WHERE oi."kind" = 'DISH' AND o."status" <> 'CANCELLED'
      GROUP BY COALESCE(oi."dishId"::text, 'deleted:' || oi."merchantName" || ':' || oi."name")
      ORDER BY "quantity" DESC, "revenue" DESC, "name" ASC
      LIMIT ${safeLimit(limit)}
    `
      .returnsRow({ name: "pg/text@1", quantity: "pg/int8number@1", revenue: "pg/int8number@1" })
      .build(),
  );
  return rows.map((row) => ({ name: row.name, quantity: row.quantity, revenue: row.revenue }));
}

/**
 * Product revenue per category (all time, cancelled orders excluded), highest first.
 * Only categories that sold something are listed; sales of deleted products are grouped
 * under "Produits supprimés".
 */
export async function getRevenueByCategory(): Promise<CategoryRevenueDTO[]> {
  const rows = await db.query(
    db.raw.sql`
      SELECT
        COALESCE(MAX(c."name"), 'Produits supprimés') AS "name",
        SUM(oi."lineTotal") AS "revenue"
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId"
      LEFT JOIN "Product" p ON p."id" = oi."productId"
      LEFT JOIN "Category" c ON c."id" = p."categoryId"
      WHERE oi."kind" = 'PRODUCT' AND o."status" <> 'CANCELLED'
      GROUP BY c."id"
      ORDER BY "revenue" DESC, "name" ASC
    `
      .returnsRow({ name: "pg/text@1", revenue: "pg/int8number@1" })
      .build(),
  );
  return rows.map((row) => ({ name: row.name, revenue: row.revenue }));
}

/* --------------------------------------------------------------------------
   Lists shown on the dashboard
   -------------------------------------------------------------------------- */

/** The latest orders (all statuses), newest first. */
export async function getRecentOrders(limit = 8): Promise<AdminOrderRow[]> {
  const { items } = await listOrders({ page: 1, pageSize: safeLimit(limit) });
  return items;
}

/**
 * Active sheets (products, producers, restaurants) verified more than 12 months
 * ago, the oldest verification first (spec 6.1: they must be checked again).
 */
export async function getSheetsToReview(limit = 20, now: Date = new Date()): Promise<AdminSheetToReview[]> {
  const take = safeLimit(limit);
  const cutoff = reviewCutoff(now);

  const [products, producers, restaurants] = await Promise.all([
    db.orm.public.Product.select("id", "name", "slug", "verifiedAt")
      .where((p) => and(p.isActive.eq(true), p.verifiedAt.lt(cutoff)))
      .orderBy([(p) => p.verifiedAt.asc(), (p) => p.id.asc()])
      .limit(take)
      .all(),
    db.orm.public.Producer.select("id", "name", "slug", "verifiedAt", "verificationSource")
      .where((p) => and(p.isActive.eq(true), p.verifiedAt.lt(cutoff)))
      .orderBy([(p) => p.verifiedAt.asc(), (p) => p.id.asc()])
      .limit(take)
      .all(),
    db.orm.public.Restaurant.select("id", "name", "slug", "verifiedAt", "verificationSource")
      .where((r) => and(r.isActive.eq(true), r.verifiedAt.lt(cutoff)))
      .orderBy([(r) => r.verifiedAt.asc(), (r) => r.id.asc()])
      .limit(take)
      .all(),
  ]);

  const averageMonthMs = 30.4375 * 24 * 60 * 60 * 1000;
  const monthsSince = (date: Date) => Math.floor((now.getTime() - date.getTime()) / averageMonthMs);

  const sheets: AdminSheetToReview[] = [
    ...products.map((p) => ({
      type: "PRODUCT" as const,
      id: p.id,
      name: p.name,
      slug: p.slug,
      verifiedAt: toIso(p.verifiedAt),
      verificationSource: null,
      monthsSinceVerified: monthsSince(p.verifiedAt),
    })),
    ...producers.map((p) => ({
      type: "PRODUCER" as const,
      id: p.id,
      name: p.name,
      slug: p.slug,
      verifiedAt: toIso(p.verifiedAt),
      verificationSource: p.verificationSource,
      monthsSinceVerified: monthsSince(p.verifiedAt),
    })),
    ...restaurants.map((r) => ({
      type: "RESTAURANT" as const,
      id: r.id,
      name: r.name,
      slug: r.slug,
      verifiedAt: toIso(r.verifiedAt),
      verificationSource: r.verificationSource,
      monthsSinceVerified: monthsSince(r.verifiedAt),
    })),
  ];

  // Oldest verification first (ISO strings sort like dates), then keep the first `take`.
  sheets.sort((a, b) => a.verifiedAt.localeCompare(b.verifiedAt));
  return sheets.slice(0, take);
}
