import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import { assertId } from "@/models/fetchers/admin/helpers";
import { reviewTargetSlugs } from "@/models/puters/reviews";
import type { ReviewMutationResult } from "@/types/admin-data";

/**
 * ADMIN — delete a review. No auth check here: the Server Action calls requireAdmin() first,
 * then refreshes TAGS.reviews and the page of the product / restaurant (returned slugs).
 */

export async function deleteReview(id: number): Promise<ReviewMutationResult> {
  assertId(id);
  const row = await db.orm.public.Review.where({ id }).select("id", "status", "productId", "restaurantId").delete();
  if (!row) throw new ModelError("NOT_FOUND", "Cet avis n'existe plus.");
  return { id: row.id, status: row.status, ...(await reviewTargetSlugs(row)) };
}
