import "server-only";

import { db } from "@/lib/prisma";
import { isPositiveInteger, publicProducers, publicProducts, publicRestaurants } from "@/models/fetchers/mappers";
import type { ReportReason, ReportTarget } from "@/types";

export type CreateReportInput = {
  /** What the report is about: a product, a producer or a restaurant sheet. */
  targetType: ReportTarget;
  targetId: number;
  reason: ReportReason;
  message: string;
  /** Optional e-mail or phone to answer the visitor. */
  contact: string | null;
  /** Hashed IP of the visitor (getIpHash()), never the IP itself. */
  ipHash: string | null;
};

/**
 * "Signaler une erreur" (EF-20 / EF-23): saves a report with status OPEN for the admin queue.
 * The name and slug of the sheet are copied, so the report stays readable even if the sheet
 * changes or is deleted later. Returns null when the sheet does not exist or is not public
 * (hidden sheets cannot be reported, like reviews).
 */
export async function createReport(input: CreateReportInput): Promise<{ id: number } | null> {
  const target = await findTarget(input.targetType, input.targetId);
  if (!target) return null;

  const row = await db.orm.public.Report.select("id").create({
    targetType: input.targetType,
    targetId: input.targetId,
    targetName: target.name,
    targetSlug: target.slug,
    reason: input.reason,
    message: input.message,
    contact: input.contact,
    status: "OPEN",
    ipHash: input.ipHash,
  });
  return { id: row.id };
}

/**
 * Name and slug of the reported sheet, or null when it does not exist or is not shown on the
 * website (same "public" rules as the pages: a hidden sheet cannot be reported, and the answer
 * does not reveal which hidden ids exist).
 */
async function findTarget(type: ReportTarget, id: number): Promise<{ name: string; slug: string } | null> {
  // Never query with an invalid id (Prisma 8 would silently ignore `id: undefined`).
  if (!isPositiveInteger(id)) return null;
  switch (type) {
    case "PRODUCT":
      return publicProducts().where((p) => p.id.eq(id)).select("name", "slug").first();
    case "PRODUCER":
      return publicProducers().where((p) => p.id.eq(id)).select("name", "slug").first();
    case "RESTAURANT":
      return publicRestaurants().where((r) => r.id.eq(id)).select("name", "slug").first();
    default:
      return null;
  }
}
