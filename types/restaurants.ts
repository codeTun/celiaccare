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
  isPartner: boolean; // convention signed -> online ordering available
  deliveryFee: number; // millimes
  deliveryTime: string;
  minOrder: number; // millimes
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

export type RestaurantDetailDTO = RestaurantCardDTO & {
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
