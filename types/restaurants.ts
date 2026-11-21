import type { IngredientDTO, ReviewDTO } from "./catalog";
import type { DishCourse, GuaranteeLevel } from "./enums";

export type RestaurantCardDTO = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  cuisine: string | null;
  city: string;
  governorate: string;
  imageUrl: string | null;
  guaranteeLevel: GuaranteeLevel;
  priceRange: number; // 1..3
  isPartner: boolean; // convention signed -> online ordering available (delivery is free)
  deliveryTime: string;
  minOrder: number; // millimes
  /** Dishes on the online menu (0 = the business does not publish its prices online) */
  dishCount: number;
  ratingAvg: number | null;
  ratingCount: number;
};

export type DishDTO = {
  id: number;
  name: string;
  description: string | null;
  price: number; // millimes
  imageUrl: string | null;
  course: DishCourse;
  isAvailable: boolean;
  ingredients: IngredientDTO[];
};

export type MenuSectionDTO = {
  course: DishCourse;
  dishes: DishDTO[];
};

/**
 * A restaurant page. It never carries the restaurant's own contacts (phone, WhatsApp, e-mail,
 * website, social networks): every order goes through CeliacCare, so they stay in the admin DTOs.
 */
export type RestaurantDetailDTO = RestaurantCardDTO & {
  address: string;
  latitude: number | null;
  longitude: number | null;
  openingHours: string | null;
  dedicatedKitchen: boolean;
  dedicatedUtensils: boolean;
  trainedStaff: boolean;
  verificationSource: string;
  verifiedAt: string;
  needsReview: boolean;
  menu: MenuSectionDTO[];
  reviews: ReviewDTO[];
};

export type RestaurantFilters = {
  q?: string;
  governorate?: string;
  guarantee?: GuaranteeLevel;
  partnerOnly?: boolean;
};
