import type { OrderStatus, OrderType } from "./enums";

/** The logged-in administrator, as seen by pages and actions. */
export type AdminDTO = {
  id: number;
  email: string;
  name: string;
  totpEnabled: boolean;
  lastLoginAt: string | null;
};

export type DashboardStatsDTO = {
  revenueThisMonth: number; // millimes, delivered + in-progress orders (not cancelled)
  revenueLastMonth: number;
  ordersToday: number;
  ordersThisMonth: number;
  averageBasket: number; // millimes
  pendingOrders: number;
  newMessages: number;
  openReports: number;
  pendingReviews: number;
  refusedAttemptsToday: number;
  activeProducts: number;
  activeRestaurants: number;
  activeProducers: number;
  sheetsToReview: number; // product/producer/restaurant sheets verified > 12 months ago
};

export type RevenuePointDTO = { label: string; revenue: number; orders: number };
export type StatusCountDTO = { status: OrderStatus; count: number };
export type TypeRevenueDTO = { type: OrderType; revenue: number; orders: number };
export type TopItemDTO = { name: string; quantity: number; revenue: number };
export type CategoryRevenueDTO = { name: string; revenue: number };
