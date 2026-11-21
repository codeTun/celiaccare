/**
 * Data shapes (DTO = Data Transfer Object) for the public catalogue.
 * Fetchers in models/fetchers return these shapes; components receive them as props.
 * Rules: only plain JSON values (string, number, boolean, null, arrays, objects).
 * Dates are ISO strings. Prices are integers in millimes (1 DT = 1000).
 * Public DTOs are already translated for the requested locale (name, description...).
 */
import type { GuaranteeLevel, ProducerType } from "./enums";

export type CategoryDTO = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  imageUrl: string | null;
  productCount: number;
};

export type IngredientDTO = {
  id: number;
  slug: string;
  name: string;
  isAllergen: boolean;
};

export type ProductCardDTO = {
  id: number;
  slug: string;
  name: string;
  price: number;
  unit: string | null;
  imageUrl: string | null;
  guaranteeLevel: GuaranteeLevel;
  isAvailable: boolean;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  producerId: number;
  producerSlug: string;
  producerName: string;
  producerCity: string;
  ratingAvg: number | null;
  ratingCount: number;
};

export type ReviewDTO = {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

/**
 * The artisan shown on a product sheet. Like every public DTO, it never carries the business's
 * own contacts (phone, WhatsApp, e-mail, website, social networks): every purchase goes through
 * CeliacCare, so these stay in the admin DTOs only (types/admin-data.ts).
 */
export type ProducerSummaryDTO = {
  id: number;
  slug: string;
  name: string;
  type: ProducerType;
  city: string;
  governorate: string;
  imageUrl: string | null;
  guaranteeLevel: GuaranteeLevel;
  /** How the artisan was verified, e.g. "Visite sur place" (French only, plain text: never a link) */
  verificationSource: string;
};

export type ProductDetailDTO = ProductCardDTO & {
  description: string;
  certification: string | null;
  /** "Peut contenir des traces de : ..." detail, French only (no Arabic column yet) */
  mayContain: string | null;
  verifiedAt: string;
  /** true when the sheet was verified more than 12 months ago (spec 6.1) */
  needsReview: boolean;
  updatedAt: string;
  ingredients: IngredientDTO[];
  producer: ProducerSummaryDTO;
  reviews: ReviewDTO[];
};

export type ProductSort = "new" | "price-asc" | "price-desc" | "name" | "rating";

export type ProductFilters = {
  q?: string;
  category?: string; // category slug
  ingredients?: string[]; // ingredient slugs the product must contain (all of them)
  exclude?: string[]; // allergen ingredient slugs the product must NOT contain
  guarantee?: GuaranteeLevel;
  minPrice?: number; // millimes
  maxPrice?: number; // millimes
  producer?: string; // producer slug
  sort?: ProductSort;
  page?: number; // 1-based
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type ProducerCardDTO = {
  id: number;
  slug: string;
  name: string;
  type: ProducerType;
  description: string | null;
  city: string;
  governorate: string;
  imageUrl: string | null;
  guaranteeLevel: GuaranteeLevel;
  productCount: number;
};

/** An artisan page. No contacts of the business (see ProducerSummaryDTO): visitors order through CeliacCare. */
export type ProducerDetailDTO = ProducerCardDTO & {
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  openingHours: string | null;
  dedicatedSpace: boolean;
  dedicatedUtensils: boolean;
  trainedStaff: boolean;
  verificationSource: string;
  verifiedAt: string;
  needsReview: boolean;
  products: ProductCardDTO[];
};

export type ProducerFilters = {
  q?: string;
  type?: ProducerType;
  governorate?: string;
  guarantee?: GuaranteeLevel;
};

/** Numbers shown on the home and about pages. */
export type SiteStatsDTO = {
  products: number;
  producers: number;
  restaurants: number;
  partnerRestaurants: number;
  cities: number;
};
