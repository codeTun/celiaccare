"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { getIpHash } from "@/lib/request";
import { idSchema, type ActionState } from "@/lib/validators";
import { deleteReview } from "@/models/deleters/reviews";
import { ModelError } from "@/models/errors";
import { moderateReview } from "@/models/puters/reviews";
import type { ReviewMutationResult } from "@/types/admin-data";

/* ==========================================================================
   Server Actions of the Avis page (spec EF-22: nothing is published before
   moderation). Each one starts with requireAdmin(), validates its input with
   zod, writes an audit log and refreshes the public pages showing the review.
   ========================================================================== */

const decisionSchema = z.enum(["APPROVED", "REJECTED"]);

const UNKNOWN_REVIEW: ActionState = { status: "error", message: "Cet avis n'existe pas (ou plus)." };

/** Answer the form AND refresh the page data (same as the Sécurité page). */
function answer(state: ActionState): ActionState {
  refresh();
  return state;
}

/** A ModelError (e.g. NOT_FOUND: deleted by another admin) → its French message; anything else → generic. */
function errorState(error: unknown): ActionState {
  if (error instanceof ModelError) return { status: "error", message: error.message };
  console.error("[admin] review action failed", error);
  return { status: "error", message: "L'opération a échoué. Réessayez dans un instant." };
}

/**
 * lib/cache-tags.ts: review (moderated) → reviews, products, product(slug), restaurants,
 * restaurant(slug): the review list of the sheet and the ratings shown on the cards.
 */
function refreshReviewCaches(result: ReviewMutationResult) {
  updateTag(TAGS.reviews);
  updateTag(TAGS.products);
  if (result.productSlug) updateTag(TAGS.product(result.productSlug));
  updateTag(TAGS.restaurants);
  if (result.restaurantSlug) updateTag(TAGS.restaurant(result.restaurantSlug));
}

/**
 * Publish (APPROVED) or refuse (REJECTED) a review.
 * Bound on the server: moderateReviewAction.bind(null, review.id, "APPROVED").
 */
export async function moderateReviewAction(reviewId: number, decision: "APPROVED" | "REJECTED"): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(reviewId);
  const status = decisionSchema.safeParse(decision);
  if (!id.success || !status.success) return answer(UNKNOWN_REVIEW);

  let result: ReviewMutationResult;
  try {
    result = await moderateReview(id.data, status.data);
  } catch (error) {
    return answer(errorState(error));
  }

  const published = result.status === "APPROVED";
  await logAdminAction(admin, "status", "review", result.id, published ? "Avis publié" : "Avis refusé", await getIpHash());
  refreshReviewCaches(result);
  return answer({ status: "success", message: published ? "Avis publié." : "Avis refusé." });
}

/**
 * Delete a review (ConfirmDeleteButton). From the list (hidden field stay=1) the page is
 * refreshed; otherwise back to the list with a confirmation.
 */
export async function deleteReviewAction(reviewId: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(reviewId);
  if (!id.success) return answer(UNKNOWN_REVIEW);

  let result: ReviewMutationResult;
  try {
    result = await deleteReview(id.data);
  } catch (error) {
    return answer(errorState(error));
  }

  await logAdminAction(admin, "delete", "review", result.id, null, await getIpHash());
  refreshReviewCaches(result);
  if (formData.get("stay") === "1") return answer({ status: "success", message: "Avis supprimé." });
  redirect("/admin/avis?ok=deleted");
}
