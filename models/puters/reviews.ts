import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import type { ReviewMutationResult } from "@/types/admin-data";

/**
 * ADMIN — moderate ratings & comments (spec EF-22: published only after moderation).
 * No auth check here: the Server Action calls requireAdmin() first, then refreshes
 * TAGS.reviews and TAGS.product(productSlug) / TAGS.restaurant(restaurantSlug)
 * (+ TAGS.products / TAGS.restaurants for the ratings shown on the cards).
 */

/** Publish (APPROVED) or refuse (REJECTED) a review. */
export async function moderateReview(id: number, status: "APPROVED" | "REJECTED"): Promise<ReviewMutationResult> {
  assertId(id);
  if (status !== "APPROVED" && status !== "REJECTED") {
    throw new ModelError("INVALID_STATUS", "Un avis peut seulement être publié ou refusé.");
  }
  const row = await db.orm.public.Review.where({ id })
    .select("id", "status", "productId", "restaurantId")
    .update({ status, moderatedAt: new Date() });
  if (!row) throw new ModelError("NOT_FOUND", "Cet avis n'existe plus.");
  return { id: row.id, status: row.status, ...(await reviewTargetSlugs(row)) };
}

/** Slugs of the product / restaurant page that shows the review (for cache refresh). */
export async function reviewTargetSlugs(review: { productId: number | null; restaurantId: number | null }) {
  const [product, restaurant] = await Promise.all([
    review.productId === null ? null : db.orm.public.Product.select("slug").first({ id: review.productId }),
    review.restaurantId === null ? null : db.orm.public.Restaurant.select("slug").first({ id: review.restaurantId }),
  ]);
  return { productSlug: product?.slug ?? null, restaurantSlug: restaurant?.slug ?? null };
}
