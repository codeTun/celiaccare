/**
 * Enumerations shared by the whole app.
 * They mirror the enums of prisma/contract.prisma.
 */

export const LOCALES = ["fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const GUARANTEE_LEVELS = ["CERTIFIED", "NATURALLY_GF", "TRACES_RISK"] as const;
export type GuaranteeLevel = (typeof GUARANTEE_LEVELS)[number];

export const PRODUCER_TYPES = ["BAKERY", "SPECIALTY_SHOP", "GROCERY", "HOME_SELLER", "COOPERATIVE"] as const;
export type ProducerType = (typeof PRODUCER_TYPES)[number];

export const DISH_COURSES = ["STARTER", "MAIN", "DESSERT", "DRINK"] as const;
export type DishCourse = (typeof DISH_COURSES)[number];

export const ORDER_TYPES = ["SHOP", "RESTAURANT"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["CASH_ON_DELIVERY", "CARD_ON_DELIVERY"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ITEM_KINDS = ["PRODUCT", "DISH"] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

export const VEHICLE_TYPES = ["MOTO", "CAR", "BIKE"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const MESSAGE_TOPICS = ["GENERAL", "PARTNERSHIP", "ORDER", "SUGGESTION", "OTHER"] as const;
export type MessageTopic = (typeof MESSAGE_TOPICS)[number];

export const MESSAGE_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export const REPORT_TARGETS = ["PRODUCT", "PRODUCER", "RESTAURANT"] as const;
export type ReportTarget = (typeof REPORT_TARGETS)[number];

export const REPORT_REASONS = ["WRONG_INFO", "GLUTEN_CONCERN", "CLOSED", "PRICE", "OTHER"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const PHONE_RULE_TYPES = ["BLOCKED", "EXCEPTION"] as const;
export type PhoneRuleType = (typeof PHONE_RULE_TYPES)[number];

export const REFUSAL_REASONS = ["DAILY_LIMIT", "BLOCKED", "RATE_LIMIT"] as const;
export type RefusalReason = (typeof REFUSAL_REASONS)[number];
