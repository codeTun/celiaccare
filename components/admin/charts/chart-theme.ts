import type { OrderStatus, OrderType } from "@/types";

/* ==========================================================================
   Colors and number formats of the dashboard charts (DESIGN-SYSTEM.md:
   brand greens + a saffron accent, gridlines in the "line" color, statuses
   in the same colors as their badges). recharts needs plain color strings,
   so the Tailwind tokens of app/globals.css are copied here.
   ========================================================================== */

export const CHART_COLORS = {
  brand: "#128552", // brand-600
  brandDark: "#0b5536", // brand-800
  brandMid: "#3dbb7e", // brand-400
  brandSoft: "#b4e4ca", // brand-200
  brandWash: "#effaf4", // brand-50
  saffron: "#f2b93b", // saffron-400
  grid: "#e3eae6", // line
  axis: "#7a8c83", // ink-subtle
  ink: "#0f1f17", // ink
  empty: "#e3eae6", // an empty ring / bar
} as const;

/** Same family as the order status badges (amber, sky, violet, green, red). */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "#f59e0b", // amber-500
  CONFIRMED: "#38bdf8", // sky-400
  PREPARING: "#0284c7", // sky-600
  OUT_FOR_DELIVERY: "#8b5cf6", // violet-500
  DELIVERED: CHART_COLORS.brand,
  CANCELLED: "#ef4444", // red-500
};

/** Grocery orders in green, restaurant orders in saffron. */
export const ORDER_TYPE_COLORS: Record<OrderType, string> = {
  SHOP: CHART_COLORS.brand,
  RESTAURANT: CHART_COLORS.saffron,
};

const countFormat = new Intl.NumberFormat("fr-TN", { numberingSystem: "latn" });
const compactFormat = new Intl.NumberFormat("fr-TN", {
  notation: "compact",
  maximumFractionDigits: 1,
  numberingSystem: "latn",
});
const percentFormat = new Intl.NumberFormat("fr-TN", { maximumFractionDigits: 0, numberingSystem: "latn" });

/** 1234 → "1 234" */
export function formatCount(value: number) {
  return countFormat.format(value);
}

/** Axis ticks, from millimes: 1534000 → "1,5 k DT", 12000 → "12 DT". */
export function formatAxisDinars(millimes: number) {
  return `${compactFormat.format(millimes / 1000)} DT`;
}

/** Share of a total: (13, 20) → "65 %" (0 when the total is 0). */
export function formatShare(part: number, total: number) {
  return `${percentFormat.format(total > 0 ? (part / total) * 100 : 0)} %`;
}
