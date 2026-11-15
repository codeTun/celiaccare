import "server-only";

import { cachePolicy } from "@/lib/cache";
import { TAGS } from "@/lib/cache-tags";
import { governorateLabel } from "@/lib/tunisia";
import { clamp, localize, needsReview } from "@/lib/utils";
import {
  compareNames,
  isOneOf,
  matchesAllWords,
  publicRestaurants,
  roundRating,
  searchWords,
  sortByName,
  toIngredientDTO,
  toReviewDTO,
} from "@/models/fetchers/mappers";
import {
  DISH_COURSES,
  GUARANTEE_LEVELS,
  type GuaranteeLevel,
  type Locale,
  type MenuSectionDTO,
  type RestaurantCardDTO,
  type RestaurantDetailDTO,
  type RestaurantFilters,
} from "@/types";

/* --------------------------------------------------------------------------
   Restaurant cards
   -------------------------------------------------------------------------- */

type RestaurantQuery = ReturnType<typeof publicRestaurants>;

/** Reads exactly what a RestaurantCardDTO needs (ratings = approved reviews only). */
function selectRestaurantCards(query: RestaurantQuery) {
  return query
    .select(
      "id",
      "slug",
      "name",
      "description",
      "descriptionAr",
      "cuisine",
      "city",
      "governorate",
      "imageUrl",
      "guaranteeLevel",
      "priceRange",
      "isPartner",
      "deliveryFee",
      "deliveryTime",
      "minOrder",
    )
    .include("reviews", (reviews) => {
      const approved = reviews.where((review) => review.status.eq("APPROVED"));
      return approved.combine({ count: approved.count(), average: approved.avg("rating") });
    });
}

type RestaurantCardRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  descriptionAr: string | null;
  cuisine: string | null;
  city: string;
  governorate: string;
  imageUrl: string | null;
  guaranteeLevel: GuaranteeLevel;
  priceRange: number;
  isPartner: boolean;
  deliveryFee: number;
  deliveryTime: string;
  minOrder: number;
  reviews: { count: number; average: number | null };
};

function toRestaurantCardDTO(row: RestaurantCardRow, locale: Locale): RestaurantCardDTO {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: localize(locale, row.description, row.descriptionAr),
    cuisine: row.cuisine,
    city: row.city,
    governorate: row.governorate,
    imageUrl: row.imageUrl,
    guaranteeLevel: row.guaranteeLevel,
    priceRange: row.priceRange,
    isPartner: row.isPartner,
    deliveryFee: row.deliveryFee,
    deliveryTime: row.deliveryTime,
    minOrder: row.minOrder,
    ratingAvg: roundRating(row.reviews.average),
    ratingCount: row.reviews.count,
  };
}

/* --------------------------------------------------------------------------
   Lists
   -------------------------------------------------------------------------- */

/**
 * The restaurants directory: partner restaurants (online ordering) first, then by name.
 * - q: every word must appear in the name, city, governorate (French or Arabic) or cuisine
 *   (accents and case ignored);
 * - governorate, guarantee: exact filters; partnerOnly: only partner restaurants.
 */
export async function getRestaurants(locale: Locale, filters: RestaurantFilters = {}): Promise<RestaurantCardDTO[]> {
  "use cache";
  cachePolicy([TAGS.restaurants, TAGS.reviews]);

  let query = publicRestaurants();
  const { governorate, guarantee } = filters;
  if (governorate) query = query.where({ governorate });
  if (isOneOf(GUARANTEE_LEVELS, guarantee)) query = query.where({ guaranteeLevel: guarantee });
  if (filters.partnerOnly === true) query = query.where({ isPartner: true });

  const rows = await selectRestaurantCards(query).all();

  // The directory is small: the text search runs here, with accents ignored (not possible with SQL LIKE).
  const words = searchWords(filters.q);
  return rows
    .filter((row) =>
      matchesAllWords([row.name, row.city, row.governorate, governorateLabel(row.governorate, "ar"), row.cuisine], words),
    )
    .map((row) => toRestaurantCardDTO(row, locale))
    .sort((a, b) => Number(b.isPartner) - Number(a.isPartner) || compareNames(a.name, b.name, locale));
}

/** Partner restaurants for the home page, in alphabetical order. */
export async function getPartnerRestaurants(locale: Locale, limit = 6): Promise<RestaurantCardDTO[]> {
  "use cache";
  cachePolicy([TAGS.restaurants, TAGS.reviews]);

  const rows = await selectRestaurantCards(publicRestaurants().where({ isPartner: true }))
    .orderBy([(restaurant) => restaurant.name.asc(), (restaurant) => restaurant.id.asc()])
    .limit(clamp(Math.trunc(limit) || 6, 1, 48))
    .all();
  return rows.map((row) => toRestaurantCardDTO(row, locale));
}

/* --------------------------------------------------------------------------
   Restaurant page
   -------------------------------------------------------------------------- */

/**
 * A restaurant page: card data + contacts, practices, verification, the menu grouped by course
 * (STARTER, MAIN, DESSERT, DRINK; empty courses are left out; dishes by sortOrder then name,
 * unavailable dishes included with isAvailable = false) and the 20 latest approved reviews.
 * Null when the restaurant does not exist or is hidden.
 */
export async function getRestaurantBySlug(locale: Locale, slug: string): Promise<RestaurantDetailDTO | null> {
  "use cache";
  cachePolicy([TAGS.restaurants, TAGS.restaurant(slug), TAGS.reviews, TAGS.ingredients]);

  const row = await publicRestaurants()
    .where((restaurant) => restaurant.slug.eq(slug))
    .select(
      "id",
      "slug",
      "name",
      "description",
      "descriptionAr",
      "cuisine",
      "city",
      "governorate",
      "address",
      "latitude",
      "longitude",
      "phone",
      "whatsapp",
      "email",
      "website",
      "instagram",
      "facebook",
      "openingHours",
      "imageUrl",
      "guaranteeLevel",
      "priceRange",
      "isPartner",
      "deliveryFee",
      "deliveryTime",
      "minOrder",
      "dedicatedKitchen",
      "dedicatedUtensils",
      "trainedStaff",
      "verificationSource",
      "verifiedAt",
    )
    .include("dishes", (dishes) =>
      dishes
        .select("id", "name", "nameAr", "description", "descriptionAr", "price", "imageUrl", "course", "isAvailable")
        .orderBy([(dish) => dish.sortOrder.asc(), (dish) => dish.name.asc(), (dish) => dish.id.asc()])
        .include("ingredients", (ingredients) => ingredients.select("id", "slug", "name", "nameAr", "isAllergen")),
    )
    .include("reviews", (reviews) => {
      const approved = reviews.where((review) => review.status.eq("APPROVED"));
      return approved.combine({
        count: approved.count(),
        average: approved.avg("rating"),
        latest: approved
          .select("id", "authorName", "rating", "comment", "createdAt")
          .orderBy([(review) => review.createdAt.desc(), (review) => review.id.desc()])
          .limit(20),
      });
    })
    .first();
  if (!row) return null;

  const dishes = row.dishes.map((dish) => ({
    id: dish.id,
    name: localize(locale, dish.name, dish.nameAr),
    description: localize(locale, dish.description, dish.descriptionAr),
    price: dish.price,
    imageUrl: dish.imageUrl,
    course: dish.course,
    isAvailable: dish.isAvailable,
    ingredients: sortByName(
      dish.ingredients.map((ingredient) => toIngredientDTO(ingredient, locale)),
      locale,
    ),
  }));

  // One section per course, in menu order; a course without dishes is left out.
  const menu: MenuSectionDTO[] = DISH_COURSES.map((course) => ({
    course,
    dishes: dishes.filter((dish) => dish.course === course),
  })).filter((section) => section.dishes.length > 0);

  return {
    ...toRestaurantCardDTO(row, locale),
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    website: row.website,
    instagram: row.instagram,
    facebook: row.facebook,
    openingHours: row.openingHours,
    dedicatedKitchen: row.dedicatedKitchen,
    dedicatedUtensils: row.dedicatedUtensils,
    trainedStaff: row.trainedStaff,
    verificationSource: row.verificationSource,
    verifiedAt: row.verifiedAt.toISOString(),
    needsReview: needsReview(row.verifiedAt),
    menu,
    reviews: row.reviews.latest.map(toReviewDTO),
  };
}

/** Slugs of every public restaurant (generateStaticParams of the restaurant page). */
export async function getRestaurantSlugs(): Promise<string[]> {
  "use cache";
  cachePolicy([TAGS.restaurants]);

  const rows = await publicRestaurants()
    .select("slug")
    .orderBy((restaurant) => restaurant.slug.asc())
    .all();
  return rows.map((row) => row.slug);
}
