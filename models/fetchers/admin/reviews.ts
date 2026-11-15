import "server-only";

import { all, and, or, type Condition } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { REVIEW_STATUSES, type Paginated, type ReviewStatus } from "@/types";
import type { AdminReviewFilters, AdminReviewRow, AdminReviewTarget } from "@/types/admin-data";

import { containsPattern, pageWindow, paginated, toIso } from "./helpers";

/**
 * ADMIN — ratings & comments waiting for moderation (spec EF-22). Never cached.
 * Call requireAdmin() before using these functions.
 */

/** The moderation filter + a free search (author name or comment). */
export type AdminReviewListFilters = AdminReviewFilters & {
  q?: string;
};

/** A review of the moderation page: its target also says whether the sheet is public. */
export type AdminReviewListRow = Omit<AdminReviewRow, "target"> & {
  target: (AdminReviewTarget & { isActive: boolean }) | null;
};

/** Number of reviews per status (+ the total), for the moderation tabs. */
export type AdminReviewCounts = Record<ReviewStatus, number> & { total: number };

/**
 * Reviews matching the filter, 20 per page, with the product or restaurant they are about.
 * PENDING reviews are listed oldest first, like a queue; any other list shows the newest first.
 */
export async function listReviews(filters: AdminReviewListFilters = {}): Promise<Paginated<AdminReviewListRow>> {
  const { page, pageSize, offset } = pageWindow(filters);
  const status = filters.status;
  const q = filters.q?.trim();
  const filtered = db.orm.public.Review.where((r) => {
    const conditions: Condition[] = [];
    if (status) conditions.push(r.status.eq(status));
    if (q) {
      const pattern = containsPattern(q);
      conditions.push(or(r.authorName.ilike(pattern), r.comment.ilike(pattern)));
    }
    return conditions.length > 0 ? and(...conditions) : all();
  });
  const oldestFirst = status === "PENDING";

  const [rows, count] = await Promise.all([
    filtered
      .select("id", "authorName", "rating", "comment", "status", "createdAt", "moderatedAt")
      .include("product", (product) => product.select("id", "name", "slug", "isActive"))
      .include("restaurant", (restaurant) => restaurant.select("id", "name", "slug", "isActive"))
      .orderBy(
        oldestFirst
          ? [(r) => r.createdAt.asc(), (r) => r.id.asc()]
          : [(r) => r.createdAt.desc(), (r) => r.id.desc()],
      )
      .limit(pageSize)
      .offset(offset)
      .all(),
    filtered.aggregate((a) => ({ total: a.count() })),
  ]);

  const items = rows.map((row) => {
    let target: AdminReviewListRow["target"] = null;
    if (row.product) target = { type: "PRODUCT", ...row.product };
    else if (row.restaurant) target = { type: "RESTAURANT", ...row.restaurant };
    return {
      id: row.id,
      authorName: row.authorName,
      rating: row.rating,
      comment: row.comment,
      status: row.status,
      createdAt: toIso(row.createdAt),
      moderatedAt: toIso(row.moderatedAt),
      target,
    };
  });
  return paginated(items, count.total, page, pageSize);
}

/** How many reviews are PENDING, APPROVED and REJECTED. */
export async function countReviewsByStatus(): Promise<AdminReviewCounts> {
  const rows = await db.orm.public.Review.groupBy("status").aggregate((a) => ({ n: a.count() }));
  const counts: AdminReviewCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0, total: 0 };
  for (const row of rows) {
    if (REVIEW_STATUSES.includes(row.status)) counts[row.status] = row.n;
    counts.total += row.n;
  }
  return counts;
}
