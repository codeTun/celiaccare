import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { isPositiveInteger, publicProducts, publicRestaurants } from "@/models/fetchers/mappers";

export type CreateReviewInput = {
  /** Exactly ONE of productId / restaurantId must be set. */
  productId: number | null;
  restaurantId: number | null;
  authorName: string;
  /** Whole number from 1 to 5. */
  rating: number;
  comment: string;
  /** Hashed IP of the visitor (getIpHash()), never the IP itself. */
  ipHash: string | null;
};

/**
 * Saves a rating + comment with status PENDING: it is published only after moderation (EF-22).
 * Returns null when the target is missing, ambiguous (both ids or none), unknown or not public.
 * Throws ModelError("INVALID_RATING") when the rating is not a whole number from 1 to 5.
 */
export async function createReview(input: CreateReviewInput): Promise<{ id: number } | null> {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new ModelError("INVALID_RATING");
  }

  const { productId, restaurantId } = input;
  if ((productId === null) === (restaurantId === null)) return null; // exactly one target

  if (productId !== null) {
    if (!isPositiveInteger(productId)) return null;
    const product = await publicProducts()
      .where((p) => p.id.eq(productId))
      .select("id")
      .first();
    if (!product) return null;
  } else if (restaurantId !== null) {
    if (!isPositiveInteger(restaurantId)) return null;
    const restaurant = await publicRestaurants()
      .where((r) => r.id.eq(restaurantId))
      .select("id")
      .first();
    if (!restaurant) return null;
  }

  const row = await db.orm.public.Review.select("id").create({
    productId,
    restaurantId,
    authorName: input.authorName,
    rating: input.rating,
    comment: input.comment,
    status: "PENDING",
    ipHash: input.ipHash,
  });
  return { id: row.id };
}
