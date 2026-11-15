import "server-only";

import { and } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { isGovernorate } from "@/lib/tunisia";
import { ModelError } from "@/models/errors";
import {
  applyImageChange,
  assertMillimes,
  assertVerification,
  chooseSlug,
  rethrowSlugConflict,
} from "@/models/fetchers/admin/helpers";
import type { RestaurantInput, SlugMutationResult } from "@/types/admin-data";

/**
 * ADMIN — create a partner restaurant. No auth check here: the Server Action calls
 * requireAdmin() first, then refreshes TAGS.restaurants, TAGS.restaurant(slug) and TAGS.stats.
 */

/** Is this slug already used by another restaurant? (`exceptId` = the restaurant being edited) */
export async function isRestaurantSlugTaken(slug: string, exceptId?: number) {
  const row = await db.orm.public.Restaurant.select("id")
    .where((r) => (exceptId === undefined ? r.slug.eq(slug) : and(r.slug.eq(slug), r.id.neq(exceptId))))
    .first();
  return row !== null;
}

/** Checks shared by create and update. */
export function assertRestaurantInput(input: RestaurantInput) {
  if (!isGovernorate(input.governorate)) {
    throw new ModelError("INVALID_GOVERNORATE", "Choisissez un gouvernorat de la liste.");
  }
  assertVerification(input.verifiedAt, input.verificationSource);
  if (!Number.isInteger(input.priceRange) || input.priceRange < 1 || input.priceRange > 3) {
    throw new ModelError("INVALID_PRICE_RANGE", "La gamme de prix doit être 1, 2 ou 3.");
  }
  assertMillimes(input.deliveryFee, "INVALID_DELIVERY_FEE");
  assertMillimes(input.minOrder, "INVALID_MIN_ORDER");
}

/**
 * "Partner since" only makes sense for a partner: kept as typed, or today when left empty
 * (or the date already saved, on update). Not a partner → null.
 */
export function partnerSinceFor(input: RestaurantInput, saved: Date | null = null): Date | null {
  if (!input.isPartner) return null;
  return input.partnerSince ?? saved ?? new Date();
}

/** The columns written by create and update (everything except slug and photo). */
export function restaurantColumns(input: RestaurantInput, partnerSince: Date | null) {
  return {
    name: input.name,
    description: input.description,
    descriptionAr: input.descriptionAr,
    cuisine: input.cuisine,
    city: input.city,
    governorate: input.governorate,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email,
    website: input.website,
    instagram: input.instagram,
    facebook: input.facebook,
    openingHours: input.openingHours,
    guaranteeLevel: input.guaranteeLevel,
    dedicatedKitchen: input.dedicatedKitchen,
    dedicatedUtensils: input.dedicatedUtensils,
    trainedStaff: input.trainedStaff,
    verificationSource: input.verificationSource.trim(),
    verifiedAt: input.verifiedAt,
    priceRange: input.priceRange,
    isPartner: input.isPartner,
    partnerSince,
    deliveryFee: input.deliveryFee,
    deliveryTime: input.deliveryTime,
    minOrder: input.minOrder,
    isActive: input.isActive,
  };
}

export async function createRestaurant(input: RestaurantInput): Promise<SlugMutationResult> {
  assertRestaurantInput(input);
  const slug = await chooseSlug({
    requested: input.slug,
    name: input.name,
    fallback: "restaurant",
    isTaken: (candidate) => isRestaurantSlugTaken(candidate),
  });
  const image = applyImageChange(input.image, null);

  try {
    const row = await db.orm.public.Restaurant.create({
      slug,
      ...restaurantColumns(input, partnerSinceFor(input)),
      ...image.fields,
    });
    return { id: row.id, slug: row.slug, previousSlug: null, imagesToDelete: [] };
  } catch (error) {
    rethrowSlugConflict(error);
  }
}
