/**
 * Data shapes for the ADMIN panel: table rows, detail pages, edit forms and
 * what the admin data functions accept and return.
 *
 *   models/fetchers/admin/*      return the Admin...Row / Admin...Detail / Admin...Form types
 *   models/posters|puters|deleters  accept the ...Input types and return the ...Result types
 *
 * Same rules as the public DTOs (types/catalog.ts): plain JSON values only,
 * dates are ISO strings ("2026-11-15T13:45:00.000Z"), money is an integer
 * number of MILLIMES (1 DT = 1000). Exceptions, clearly marked below: the
 * edit-form types give dates as "YYYY-MM-DD" (ready for <input type="date">)
 * and the ...Input types take real `Date` objects (what zod's dateInput returns).
 *
 * ⚠ Admin data contains personal data (customer names, phones, addresses).
 *   Never send these shapes to public pages or to the public API.
 */
import type {
  DishCourse,
  GuaranteeLevel,
  ItemKind,
  MessageStatus,
  MessageTopic,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PhoneRuleType,
  ProducerType,
  RefusalReason,
  ReportReason,
  ReportStatus,
  ReportTarget,
  ReviewStatus,
  VehicleType,
} from "./index";

/* ==========================================================================
   Shared constants and building blocks
   ========================================================================== */

/** Rows per page in admin tables (Paginated<T> from types/catalog.ts). */
export const ADMIN_PAGE_SIZE = 20;

/** Page request for paginated admin lists (page is 1-based). */
export type PageQuery = {
  page?: number;
  pageSize?: number;
};

/**
 * The status changes an administrator may make on an order.
 * Anything else (going backwards, leaving DELIVERED or CANCELLED...) is refused.
 */
export const ORDER_STATUS_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

/** Orders that are accepted but not delivered yet (shown on the "Livraisons" page). */
export const ACTIVE_ORDER_STATUSES = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"] as const satisfies readonly OrderStatus[];

/** Values written in place of personal data when an old order is anonymised (spec 6.4). */
export const ANONYMIZED_CUSTOMER_NAME = "Client anonymisé";
export const ANONYMIZED_PHONE = "00000000";
export const ANONYMIZED_STREET = "—";

/** Target time to handle an error report (spec EF-23 "statut et délai"). Older open reports are "overdue". */
export const REPORT_SLA_HOURS = 72;

/** A photo that the Server Action already uploaded to Cloudinary (lib/cloudinary.ts uploadImage). */
export type UploadedImageRef = {
  url: string;
  publicId: string;
};

/**
 * What to do with the photo when a form is saved:
 *  - undefined          → keep the current photo
 *  - null               → remove the photo
 *  - { url, publicId }  → use this newly uploaded photo
 */
export type ImageChange = UploadedImageRef | null | undefined;

/**
 * Returned by every create / update of a sheet that has a slug (URL name).
 * The Server Action uses it to refresh the cache tags (old AND new slug) and
 * to delete Cloudinary photos that are no longer used (deleteImage).
 */
export type SlugMutationResult = {
  id: number;
  slug: string;
  /** The slug before this change, only when it changed (its old page must be refreshed too). */
  previousSlug: string | null;
  /** Cloudinary publicIds that are not used any more: call deleteImage() on each. */
  imagesToDelete: string[];
};

/** Returned by the delete functions of sheets that have a slug. */
export type SlugDeleteResult = {
  id: number;
  slug: string;
  /** Cloudinary publicIds of the deleted photos: call deleteImage() on each. */
  imagesToDelete: string[];
};

/* ==========================================================================
   1) Dashboard (models/fetchers/admin/stats.ts)
   DashboardStatsDTO, RevenuePointDTO, StatusCountDTO, TypeRevenueDTO,
   TopItemDTO and CategoryRevenueDTO live in types/admin.ts.
   ========================================================================== */

/** "30d" = one point per day for the last 30 days, "12m" = one point per month for the last 12 months. */
export type RevenueRange = "30d" | "12m";

/** A product / producer / restaurant sheet verified more than 12 months ago (spec 6.1). */
export type AdminSheetToReview = {
  type: ReportTarget; // "PRODUCT" | "PRODUCER" | "RESTAURANT"
  id: number;
  name: string;
  slug: string;
  verifiedAt: string;
  /** How the information was checked (products have no source field: null). */
  verificationSource: string | null;
  /** Whole months since the last verification (12, 13...). */
  monthsSinceVerified: number;
};

/* ==========================================================================
   2) Orders (models/fetchers/admin/orders.ts, models/puters/orders.ts)
   ========================================================================== */

export type AdminOrderFilters = PageQuery & {
  status?: OrderStatus;
  type?: OrderType;
  /** Matches the reference ("CC-7K2P9Q"), the phone number or the customer name. */
  q?: string;
};

/** One line of the orders table. */
export type AdminOrderRow = {
  id: number;
  reference: string;
  type: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  phone: string;
  governorate: string;
  city: string;
  total: number; // millimes
  /** Number of articles (sum of the quantities). */
  itemCount: number;
  restaurantName: string | null;
  delivererName: string | null;
  createdAt: string;
};

export type AdminOrderItem = {
  id: number;
  kind: ItemKind;
  productId: number | null; // null when the product was deleted since
  dishId: number | null; // null when the dish was deleted since
  /** Current product slug, for a link to its sheet (null if deleted). */
  productSlug: string | null;
  name: string; // name at order time
  merchantName: string; // producer or restaurant name at order time
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

/** Everything about one order (order detail page). */
export type AdminOrderDetail = {
  id: number;
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
  /** Order day in Tunis time, "2026-11-15" (used by the 3-orders-per-day rule). */
  dayKey: string;
  subtotal: number;
  /** 0 since delivery became free; older orders keep the fee they were charged (historical truth). */
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  restaurant: { id: number; name: string; slug: string; phone: string } | null;
  zone: { id: number; governorate: string; delay: string } | null;
  deliverer: { id: number; name: string; phone: string; vehicle: VehicleType; isActive: boolean } | null;
  items: AdminOrderItem[];
  /** Statuses the admin may move this order to (buttons to show), see ORDER_STATUS_TRANSITIONS. */
  nextStatuses: OrderStatus[];
  /** true when the personal data was already removed (retention rule, spec 6.4). */
  isAnonymized: boolean;
};

/** Result of updateOrderStatus(). */
export type OrderStatusChange = {
  id: number;
  reference: string;
  from: OrderStatus;
  to: OrderStatus;
};

/** Result of assignDeliverer(). */
export type DelivererAssignment = {
  orderId: number;
  reference: string;
  delivererId: number | null;
  delivererName: string | null;
};

/** An accepted order on its way (CONFIRMED, PREPARING or OUT_FOR_DELIVERY). */
export type AdminActiveDelivery = {
  id: number;
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
  total: number;
  createdAt: string;
  confirmedAt: string | null;
  restaurantName: string | null;
  zone: { governorate: string; delay: string } | null;
  deliverer: { id: number; name: string; phone: string; vehicle: VehicleType } | null;
};

/* ==========================================================================
   3) Catalogue
   ========================================================================== */

/* ---------- Categories ---------- */

export type AdminCategoryRow = {
  id: number;
  slug: string;
  name: string;
  nameAr: string | null;
  icon: string;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
  activeProductCount: number;
  updatedAt: string;
};

/** Values to pre-fill the category edit form. */
export type AdminCategoryForm = {
  id: number;
  slug: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  icon: string;
  imageUrl: string | null;
  sortOrder: number;
};

export type CategoryInput = {
  /** Empty or null → built from the name. */
  slug: string | null;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  icon: string; // key of lib/icons.ts
  sortOrder: number;
  image?: ImageChange;
};

/* ---------- Ingredients ---------- */

export type AdminIngredientRow = {
  id: number;
  slug: string;
  name: string;
  nameAr: string | null;
  isAllergen: boolean;
  productCount: number;
  dishCount: number;
};

export type AdminIngredientForm = {
  id: number;
  slug: string;
  name: string;
  nameAr: string | null;
  isAllergen: boolean;
};

/** Short ingredient entry for the checkboxes of the product and dish forms. */
export type IngredientOption = {
  id: number;
  name: string;
  isAllergen: boolean;
};

export type IngredientInput = {
  slug: string | null; // empty or null → built from the name
  name: string;
  nameAr: string | null;
  isAllergen: boolean;
};

export type IngredientMutationResult = {
  id: number;
  slug: string;
  previousSlug: string | null;
};

export type IngredientDeleteResult = {
  id: number;
  slug: string;
  /** How many product / dish sheets contained it (their ingredient list changed). */
  productCount: number;
  dishCount: number;
};

/* ---------- Producers (small businesses / artisans) ---------- */

export type AdminProducerFilters = {
  /** Matches the name, the city or the slug. */
  q?: string;
  type?: ProducerType;
  governorate?: string;
  /** true = only active, false = only inactive, undefined = all. */
  active?: boolean;
};

export type AdminProducerRow = {
  id: number;
  slug: string;
  name: string;
  type: ProducerType;
  city: string;
  governorate: string;
  guaranteeLevel: GuaranteeLevel;
  phone: string | null;
  imageUrl: string | null;
  isActive: boolean;
  verificationSource: string;
  verifiedAt: string;
  /** Verified more than 12 months ago (spec 6.1). */
  needsReview: boolean;
  productCount: number;
  updatedAt: string;
};

/** Values to pre-fill the producer edit form. */
export type AdminProducerForm = {
  id: number;
  slug: string;
  name: string;
  type: ProducerType;
  description: string | null;
  descriptionAr: string | null;
  city: string;
  governorate: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  openingHours: string | null;
  guaranteeLevel: GuaranteeLevel;
  dedicatedSpace: boolean;
  dedicatedUtensils: boolean;
  trainedStaff: boolean;
  verificationSource: string;
  /** "YYYY-MM-DD", ready for <input type="date">. */
  verifiedAt: string;
  imageUrl: string | null;
  /** Official logo (home page brand band), uploaded only with the business's agreement. */
  logoUrl: string | null;
  isActive: boolean;
};

export type ProducerInput = {
  slug: string | null; // empty or null → built from the name
  name: string;
  type: ProducerType;
  description: string | null;
  descriptionAr: string | null;
  city: string;
  governorate: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  openingHours: string | null;
  guaranteeLevel: GuaranteeLevel;
  dedicatedSpace: boolean;
  dedicatedUtensils: boolean;
  trainedStaff: boolean;
  /** Required (spec 6.1: no sheet without a source and a date), e.g. "Visite sur place". */
  verificationSource: string;
  verifiedAt: Date;
  isActive: boolean;
  image?: ImageChange;
  /** Official logo, same rules as `image` (Cloudinary folder "celiaccare/logos"). */
  logo?: ImageChange;
};

/* ---------- Products ---------- */

/** Quick filter of the products table. */
export type AdminProductStatusFilter = "active" | "inactive" | "featured" | "unavailable";

export type AdminProductFilters = PageQuery & {
  /** Matches the name, the category, the producer, the ingredients (search text) or the slug. */
  q?: string;
  categoryId?: number;
  producerId?: number;
  status?: AdminProductStatusFilter;
};

export type AdminProductRow = {
  id: number;
  slug: string;
  name: string;
  price: number; // millimes
  unit: string | null;
  imageUrl: string | null;
  guaranteeLevel: GuaranteeLevel;
  isActive: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  categoryId: number;
  categoryName: string;
  producerId: number;
  producerName: string;
  producerSlug: string;
  verifiedAt: string;
  needsReview: boolean;
  updatedAt: string;
};

/** Values to pre-fill the product edit form. */
export type AdminProductForm = {
  id: number;
  slug: string;
  name: string;
  nameAr: string | null;
  description: string;
  descriptionAr: string | null;
  price: number; // millimes — use millimesToInput() from lib/format.ts
  unit: string | null;
  imageUrl: string | null;
  categoryId: number;
  producerId: number;
  guaranteeLevel: GuaranteeLevel;
  certification: string | null;
  mayContain: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isActive: boolean;
  /** "YYYY-MM-DD", ready for <input type="date">. */
  verifiedAt: string;
  ingredientIds: number[];
};

/** Choices for the selects and checkboxes of the product form. */
export type ProductFormOptions = {
  categories: { id: number; name: string }[];
  producers: { id: number; name: string; city: string; isActive: boolean }[];
  ingredients: IngredientOption[];
};

export type ProductInput = {
  slug: string | null; // empty or null → built from the name ("-2", "-3"... added if taken)
  name: string;
  nameAr: string | null;
  description: string;
  descriptionAr: string | null;
  price: number; // millimes
  unit: string | null;
  categoryId: number;
  producerId: number;
  guaranteeLevel: GuaranteeLevel;
  certification: string | null;
  mayContain: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isActive: boolean;
  /** Required (spec 6.1). Products have no "source" field: the producer sheet carries it. */
  verifiedAt: Date;
  ingredientIds: number[];
  image?: ImageChange;
};

export type ProductMutationResult = SlugMutationResult & {
  /** Producer page(s) showing this product: the current one and, if it changed, the old one. */
  producerSlugs: string[];
};

/** Result of the quick toggles (setProductActive / setProductFeatured / setProductAvailable). */
export type ProductToggleResult = {
  id: number;
  slug: string;
  producerSlug: string;
};

export type ProductDeleteResult = SlugDeleteResult & {
  producerSlug: string;
};

/* ---------- Restaurants (partner restaurants, "conventionnés") ---------- */

export type AdminRestaurantFilters = {
  /** Matches the name, the city, the cuisine or the slug. */
  q?: string;
  governorate?: string;
  /** true = only partners (online ordering), false = only non-partners. */
  partner?: boolean;
  /** true = only active, false = only inactive. */
  active?: boolean;
};

export type AdminRestaurantRow = {
  id: number;
  slug: string;
  name: string;
  cuisine: string | null;
  city: string;
  governorate: string;
  guaranteeLevel: GuaranteeLevel;
  phone: string;
  imageUrl: string | null;
  isPartner: boolean;
  isActive: boolean;
  verificationSource: string;
  verifiedAt: string;
  needsReview: boolean;
  dishCount: number;
  availableDishCount: number;
  updatedAt: string;
};

/** Values to pre-fill the restaurant edit form. */
export type AdminRestaurantForm = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  descriptionAr: string | null;
  cuisine: string | null;
  city: string;
  governorate: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  openingHours: string | null;
  guaranteeLevel: GuaranteeLevel;
  dedicatedKitchen: boolean;
  dedicatedUtensils: boolean;
  trainedStaff: boolean;
  verificationSource: string;
  /** "YYYY-MM-DD", ready for <input type="date">. */
  verifiedAt: string;
  imageUrl: string | null;
  /** Official logo (home page brand band), uploaded only with the business's agreement. */
  logoUrl: string | null;
  priceRange: number; // 1..3
  isPartner: boolean;
  /** "YYYY-MM-DD" or null. */
  partnerSince: string | null;
  deliveryTime: string;
  minOrder: number; // millimes
  isActive: boolean;
};

export type RestaurantInput = {
  slug: string | null; // empty or null → built from the name
  name: string;
  description: string | null;
  descriptionAr: string | null;
  cuisine: string | null;
  city: string;
  governorate: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  openingHours: string | null;
  guaranteeLevel: GuaranteeLevel;
  dedicatedKitchen: boolean;
  dedicatedUtensils: boolean;
  trainedStaff: boolean;
  /** Required (spec 6.1), e.g. "Visite sur place". */
  verificationSource: string;
  verifiedAt: Date;
  priceRange: number; // 1..3
  isPartner: boolean;
  /** When the convention was signed. Left empty for a partner → today. */
  partnerSince: Date | null;
  // No delivery fee: delivery is free for the customer (the Restaurant.deliveryFee column is saved as 0).
  deliveryTime: string;
  minOrder: number; // millimes
  isActive: boolean;
  image?: ImageChange;
  /** Official logo, same rules as `image` (Cloudinary folder "celiaccare/logos"). */
  logo?: ImageChange;
};

/** Result of setProducerActive / setRestaurantActive. */
export type ActiveToggleResult = {
  id: number;
  slug: string;
  isActive: boolean;
};

/* ---------- Dishes (restaurant menus) ---------- */

export type AdminDishRow = {
  id: number;
  name: string;
  nameAr: string | null;
  price: number; // millimes
  imageUrl: string | null;
  course: DishCourse;
  isAvailable: boolean;
  sortOrder: number;
  ingredientNames: string[];
};

/** Values to pre-fill the dish edit form. */
export type AdminDishForm = {
  id: number;
  restaurantId: number;
  restaurantName: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  price: number; // millimes
  imageUrl: string | null;
  course: DishCourse;
  isAvailable: boolean;
  sortOrder: number;
  ingredientIds: number[];
};

/** The restaurant is chosen when the dish is created (createDish(restaurantId, input)) and never changes. */
export type DishInput = {
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  price: number; // millimes
  course: DishCourse;
  isAvailable: boolean;
  sortOrder: number;
  ingredientIds: number[];
  image?: ImageChange;
};

/** Returned by create / update / toggle / delete of a dish (refresh TAGS.restaurant(restaurantSlug)). */
export type DishMutationResult = {
  id: number;
  restaurantId: number;
  restaurantSlug: string;
  imagesToDelete: string[];
};

/* ==========================================================================
   4) Delivery (zones, deliverers)
   ========================================================================== */

/* Delivery is free for the customer everywhere: a zone only says WHERE we deliver and how fast
   (its fee / freeFrom columns are kept in the database, always saved as 0 / null). */

export type AdminDeliveryZoneRow = {
  id: number;
  governorate: string;
  delay: string;
  isActive: boolean;
  orderCount: number;
  updatedAt: string;
};

export type AdminDeliveryZoneForm = {
  id: number;
  governorate: string;
  delay: string;
  isActive: boolean;
};

export type DeliveryZoneInput = {
  governorate: string; // one of the 24 governorates (lib/tunisia.ts), unique
  delay: string; // "24–48 h"
  isActive: boolean;
};

export type DeliveryZoneMutationResult = {
  id: number;
  governorate: string;
};

export type AdminDelivererRow = {
  id: number;
  name: string;
  phone: string;
  vehicle: VehicleType;
  zone: string | null;
  isActive: boolean;
  notes: string | null;
  /** Orders assigned to this deliverer that are CONFIRMED, PREPARING or OUT_FOR_DELIVERY. */
  activeOrderCount: number;
  deliveredCount: number;
  updatedAt: string;
};

export type AdminDelivererForm = {
  id: number;
  name: string;
  phone: string;
  vehicle: VehicleType;
  zone: string | null;
  isActive: boolean;
  notes: string | null;
};

export type DelivererInput = {
  name: string;
  phone: string; // Tunisian number, normalised to 8 digits, unique
  vehicle: VehicleType;
  zone: string | null;
  isActive: boolean;
  notes: string | null;
};

export type DelivererMutationResult = {
  id: number;
  name: string;
};

/* ==========================================================================
   5) Customers & anti-abuse (spec EF-35 → EF-39)
   ========================================================================== */

export type AdminCustomerFilters = PageQuery & {
  /** Matches the phone number or the customer name. */
  q?: string;
};

/** One customer = one phone number (there are no customer accounts). */
export type AdminCustomerRow = {
  phone: string;
  /** Name used on the most recent order. */
  name: string;
  orderCount: number;
  /** Sum of the non-cancelled orders, millimes. */
  totalSpent: number;
  lastOrderAt: string;
  /** Current (not expired) BLOCKED / EXCEPTION rule for this number, if any. */
  ruleType: PhoneRuleType | null;
};

export type AdminPhoneRuleRow = {
  id: number;
  phone: string;
  type: PhoneRuleType;
  /** Daily limit allowed by an EXCEPTION (null for BLOCKED). */
  maxPerDay: number | null;
  reason: string | null;
  expiresAt: string | null;
  /** true when expiresAt is in the past: the rule no longer applies. */
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PhoneRuleInput = {
  phone: string; // any Tunisian format, normalised to 8 digits
  type: PhoneRuleType;
  /** Required for EXCEPTION (orders allowed per day), ignored for BLOCKED. */
  maxPerDay: number | null;
  reason: string | null;
  /** null = never expires. */
  expiresAt: Date | null;
};

export type PhoneRuleMutationResult = {
  id: number;
  phone: string;
  type: PhoneRuleType;
  /** true = a new rule, false = the existing rule of this number was replaced. */
  created: boolean;
};

/** EF-38: an order refused by the anti-abuse rules. */
export type AdminRefusedAttemptRow = {
  id: number;
  phone: string;
  customerName: string | null;
  dayKey: string;
  reason: RefusalReason;
  createdAt: string;
};

/** EF-36: today's order counter of one phone number. */
export type AdminOrderCounterRow = {
  id: number;
  phone: string;
  dayKey: string;
  /** Orders accepted today. */
  count: number;
  /** Orders refused today. */
  refused: number;
  ruleType: PhoneRuleType | null;
  /** Daily limit for this number: 3 by default, more with an EXCEPTION, 0 when BLOCKED. */
  dailyLimit: number;
};

/** Result of purgeOldAntiAbuseData() (personal data retention, spec 6.4). */
export type AntiAbusePurgeResult = {
  attempts: number;
  counters: number;
};

/* ==========================================================================
   6) Community moderation (contact messages, error reports, reviews)
   ========================================================================== */

export type AdminMessageFilters = PageQuery & {
  status?: MessageStatus;
  topic?: MessageTopic;
};

export type AdminMessageRow = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  topic: MessageTopic;
  subject: string;
  /** First characters of the message. */
  excerpt: string;
  status: MessageStatus;
  createdAt: string;
  handledAt: string | null;
};

export type AdminMessageDetail = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  topic: MessageTopic;
  subject: string;
  message: string;
  status: MessageStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  handledAt: string | null;
};

export type MessageUpdateInput = {
  status: MessageStatus;
  adminNote: string | null;
};

export type MessageUpdateResult = {
  id: number;
  status: MessageStatus;
  handledAt: string | null;
};

export type AdminReportFilters = PageQuery & {
  status?: ReportStatus;
};

export type AdminReportRow = {
  id: number;
  targetType: ReportTarget;
  targetId: number;
  targetName: string;
  targetSlug: string | null;
  reason: ReportReason;
  message: string;
  contact: string | null;
  status: ReportStatus;
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  /** Hours the report waited: until now while open, until resolvedAt once handled. */
  ageHours: number;
  /** Still OPEN / IN_REVIEW after REPORT_SLA_HOURS. */
  isOverdue: boolean;
};

export type ReportUpdateInput = {
  status: ReportStatus;
  adminNote: string | null;
};

export type ReportUpdateResult = {
  id: number;
  status: ReportStatus;
  resolvedAt: string | null;
};

export type AdminReviewFilters = PageQuery & {
  status?: ReviewStatus;
};

/** The product or restaurant a review is about. */
export type AdminReviewTarget = {
  type: "PRODUCT" | "RESTAURANT";
  id: number;
  name: string;
  slug: string;
};

export type AdminReviewRow = {
  id: number;
  authorName: string;
  rating: number; // 1..5
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  moderatedAt: string | null;
  target: AdminReviewTarget | null;
};

/**
 * Returned by moderateReview() and deleteReview(): the pages to refresh
 * (TAGS.reviews + TAGS.product(productSlug) or TAGS.restaurant(restaurantSlug)).
 */
export type ReviewMutationResult = {
  id: number;
  status: ReviewStatus;
  productSlug: string | null;
  restaurantSlug: string | null;
};
