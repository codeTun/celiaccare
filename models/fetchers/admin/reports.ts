import "server-only";

import { all, and, or, type Condition } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { tunisDayKey } from "@/lib/tunisia";
import type { Paginated, ReportReason, ReportStatus, ReportTarget } from "@/types";
import { REPORT_SLA_HOURS, type AdminReportFilters, type AdminReportRow, type PageQuery } from "@/types/admin-data";

import { containsPattern, isValidId, pageWindow, paginated, toIso } from "./helpers";

/**
 * ADMIN — "Signaler une erreur" queue (spec EF-20 / EF-23: status and delay). Never cached.
 * Call requireAdmin() before using these functions.
 */

const HOUR_MS = 60 * 60 * 1000;

/** Reports still waiting for an answer, and reports already handled. */
const WAITING_STATUSES: ReportStatus[] = ["OPEN", "IN_REVIEW"];
const HANDLED_STATUSES: ReportStatus[] = ["RESOLVED", "REJECTED"];

/**
 * A waiting report is "overdue" from this age (spec EF-23). Single source: REPORT_SLA_HOURS,
 * also used by the admin labels (REPORT_DELAY) and promised to visitors ("sous 72 h").
 */
const DEFAULT_OVERDUE_HOURS = REPORT_SLA_HOURS;

/**
 * Reports matching the filter, 20 per page, with their age in hours for the SLA view.
 * Waiting reports (OPEN / IN_REVIEW filter) are listed oldest first, like a queue;
 * any other list shows the newest first.
 */
export async function listReports(filters: AdminReportFilters = {}, now: Date = new Date()): Promise<Paginated<AdminReportRow>> {
  const { page, pageSize, offset } = pageWindow(filters);
  const status = filters.status;
  const filtered = status ? db.orm.public.Report.where({ status }) : db.orm.public.Report;
  const oldestFirst = status === "OPEN" || status === "IN_REVIEW";

  const [rows, count] = await Promise.all([
    filtered
      .select(
        "id",
        "targetType",
        "targetId",
        "targetName",
        "targetSlug",
        "reason",
        "message",
        "contact",
        "status",
        "adminNote",
        "createdAt",
        "resolvedAt",
      )
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

  return paginated(
    rows.map((row) => toReportRow(row, now)),
    count.total,
    page,
    pageSize,
  );
}

/* --------------------------------------------------------------------------
   The processing queue of the Signalements page
   -------------------------------------------------------------------------- */

/** "waiting" = OPEN + IN_REVIEW (default), one status, or "all" (waiting first, then handled). */
export type AdminReportView = "waiting" | "all" | ReportStatus;

export type AdminReportQueueFilters = PageQuery & {
  view?: AdminReportView;
  /** Matches the name of the sheet, the message or the contact. */
  q?: string;
};

export type AdminReportQueueRow = AdminReportRow & {
  /** The reported sheet still exists (it may have been deleted since the report). */
  targetExists: boolean;
  /** Its CURRENT slug (the slug copied in the report may be outdated), for the link to the public page. */
  currentSlug: string | null;
  /** The sheet is visible on the public site. */
  targetIsActive: boolean;
};

type ReportFields = {
  id: number;
  targetType: ReportTarget;
  targetId: number;
  targetName: string;
  targetSlug: string | null;
  reason: ReportReason;
  message: string;
  contact: string | null;
  status: ReportStatus;
  adminNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
};

function toReportRow(row: ReportFields, now: Date): AdminReportRow {
  const isWaiting = WAITING_STATUSES.includes(row.status);
  // Waiting: time waited until now. Handled: time it took to handle it.
  const end = isWaiting ? now : (row.resolvedAt ?? now);
  const ageHours = Math.max(0, Math.floor((end.getTime() - row.createdAt.getTime()) / HOUR_MS));
  return {
    id: row.id,
    targetType: row.targetType,
    targetId: row.targetId,
    targetName: row.targetName,
    targetSlug: row.targetSlug,
    reason: row.reason,
    message: row.message,
    contact: row.contact,
    status: row.status,
    adminNote: row.adminNote,
    createdAt: toIso(row.createdAt),
    resolvedAt: toIso(row.resolvedAt),
    ageHours,
    isOverdue: isWaiting && ageHours >= DEFAULT_OVERDUE_HOURS,
  };
}

/** Reports having one of `statuses` (null = any) and matching the search. */
function filteredReports(statuses: ReportStatus[] | null, q: string | undefined) {
  return db.orm.public.Report.where((r) => {
    const conditions: Condition[] = [];
    if (statuses) conditions.push(r.status.in(statuses));
    if (q) {
      const pattern = containsPattern(q);
      conditions.push(or(r.targetName.ilike(pattern), r.message.ilike(pattern), r.contact.ilike(pattern)));
    }
    return conditions.length > 0 ? and(...conditions) : all();
  });
}

/** One slice of reports, oldest first ("asc") or newest first ("desc"). */
function reportSlice(statuses: ReportStatus[] | null, q: string | undefined, order: "asc" | "desc", limit: number, offset: number) {
  return filteredReports(statuses, q)
    .select(
      "id",
      "targetType",
      "targetId",
      "targetName",
      "targetSlug",
      "reason",
      "message",
      "contact",
      "status",
      "adminNote",
      "createdAt",
      "resolvedAt",
    )
    .orderBy(
      order === "asc" ? [(r) => r.createdAt.asc(), (r) => r.id.asc()] : [(r) => r.createdAt.desc(), (r) => r.id.desc()],
    )
    .limit(limit)
    .offset(offset)
    .all();
}

async function countReports(statuses: ReportStatus[] | null, q: string | undefined) {
  const result = await filteredReports(statuses, q).aggregate((a) => ({ n: a.count() }));
  return result.n;
}

/**
 * The queue of the Signalements page, 20 per page:
 *  - "waiting" (default) and OPEN / IN_REVIEW: oldest first — the one waiting the longest comes first;
 *  - RESOLVED / REJECTED: newest first;
 *  - "all": the waiting ones first (oldest first), then the handled ones (newest first).
 * Each row says whether the reported sheet still exists, with its current slug.
 */
export async function listReportQueue(
  filters: AdminReportQueueFilters = {},
  now: Date = new Date(),
): Promise<Paginated<AdminReportQueueRow>> {
  const { page, pageSize, offset } = pageWindow(filters);
  const view = filters.view ?? "waiting";
  const q = filters.q?.trim() || undefined;

  let rows: ReportFields[];
  let total: number;
  if (view === "all") {
    // Two consecutive lists: the page may take the end of the first and the start of the second.
    const [waitingTotal, handledTotal] = await Promise.all([
      countReports(WAITING_STATUSES, q),
      countReports(HANDLED_STATUSES, q),
    ]);
    total = waitingTotal + handledTotal;
    const waitingLimit = Math.max(0, Math.min(pageSize, waitingTotal - offset));
    const handledOffset = Math.max(0, offset - waitingTotal);
    const handledLimit = pageSize - waitingLimit;
    const [waiting, handled] = await Promise.all([
      waitingLimit > 0 ? reportSlice(WAITING_STATUSES, q, "asc", waitingLimit, offset) : [],
      handledLimit > 0 && handledOffset < handledTotal
        ? reportSlice(HANDLED_STATUSES, q, "desc", handledLimit, handledOffset)
        : [],
    ]);
    rows = [...waiting, ...handled];
  } else {
    const statuses = view === "waiting" ? WAITING_STATUSES : [view];
    const order = statuses.every((status) => WAITING_STATUSES.includes(status)) ? "asc" : "desc";
    [rows, total] = await Promise.all([reportSlice(statuses, q, order, pageSize, offset), countReports(statuses, q)]);
  }

  const targets = await findReportTargets(rows);
  const items = rows.map((row) => {
    const target = targets.get(targetKey(row.targetType, row.targetId));
    return {
      ...toReportRow(row, now),
      targetExists: Boolean(target),
      currentSlug: target?.slug ?? null,
      targetIsActive: target?.isActive ?? false,
    };
  });
  return paginated(items, total, page, pageSize);
}

function targetKey(type: ReportTarget, id: number) {
  return `${type}:${id}`;
}

/** Current slug and visibility of the reported sheets (one query per kind of sheet). */
async function findReportTargets(rows: { targetType: ReportTarget; targetId: number }[]) {
  const idsOf = (type: ReportTarget) =>
    Array.from(new Set(rows.filter((row) => row.targetType === type).map((row) => row.targetId))).filter(isValidId);
  const productIds = idsOf("PRODUCT");
  const producerIds = idsOf("PRODUCER");
  const restaurantIds = idsOf("RESTAURANT");

  const [products, producers, restaurants] = await Promise.all([
    productIds.length > 0
      ? db.orm.public.Product.select("id", "slug", "isActive").where((p) => p.id.in(productIds)).all()
      : [],
    producerIds.length > 0
      ? db.orm.public.Producer.select("id", "slug", "isActive").where((p) => p.id.in(producerIds)).all()
      : [],
    restaurantIds.length > 0
      ? db.orm.public.Restaurant.select("id", "slug", "isActive").where((r) => r.id.in(restaurantIds)).all()
      : [],
  ]);

  const targets = new Map<string, { slug: string; isActive: boolean }>();
  for (const row of products) targets.set(targetKey("PRODUCT", row.id), row);
  for (const row of producers) targets.set(targetKey("PRODUCER", row.id), row);
  for (const row of restaurants) targets.set(targetKey("RESTAURANT", row.id), row);
  return targets;
}

/* --------------------------------------------------------------------------
   Figures of the Signalements page
   -------------------------------------------------------------------------- */

export type AdminReportStats = {
  /** OPEN + IN_REVIEW. */
  waiting: number;
  /** Waiting for `overdueHours` (REPORT_SLA_HOURS by default) or more. */
  overdue: number;
  byStatus: Record<ReportStatus, number>;
  /** Reports handled (RESOLVED or REJECTED) since the 1st of the month, Tunis time. */
  handledThisMonth: number;
  /** Average time between a report and its handling, for those reports, in hours (null when none). */
  averageHandlingHours: number | null;
};

/**
 * Counters of the queue and the average handling time of this month.
 * `overdueHours`: a waiting report is overdue from this age. `now` can be changed for tests.
 */
export async function getReportStats(
  now: Date = new Date(),
  overdueHours: number = DEFAULT_OVERDUE_HOURS,
): Promise<AdminReportStats> {
  const monthStart = `${tunisDayKey(now).slice(0, 7)}-01`; // "2026-11-01", midnight in Tunis
  const overdueBefore = new Date(now.getTime() - overdueHours * HOUR_MS).toISOString();

  const [row] = await db.query(
    db.raw.sql`
      SELECT
        COUNT(r."id") FILTER (WHERE r."status" = 'OPEN') AS "open",
        COUNT(r."id") FILTER (WHERE r."status" = 'IN_REVIEW') AS "inReview",
        COUNT(r."id") FILTER (WHERE r."status" = 'RESOLVED') AS "resolved",
        COUNT(r."id") FILTER (WHERE r."status" = 'REJECTED') AS "rejected",
        COUNT(r."id") FILTER (
          WHERE r."status" IN ('OPEN', 'IN_REVIEW') AND r."createdAt" <= ${overdueBefore}::timestamptz
        ) AS "overdue",
        COUNT(r."id") FILTER (
          WHERE r."status" IN ('RESOLVED', 'REJECTED') AND r."resolvedAt" >= b."monthStart"
        ) AS "handledThisMonth",
        ROUND(AVG(EXTRACT(EPOCH FROM (r."resolvedAt" - r."createdAt"))) FILTER (
          WHERE r."status" IN ('RESOLVED', 'REJECTED') AND r."resolvedAt" >= b."monthStart"
        ))::int AS "averageSeconds"
      FROM (SELECT (${monthStart}::timestamp AT TIME ZONE 'Africa/Tunis') AS "monthStart") AS b
      LEFT JOIN "Report" r ON TRUE
    `
      .returnsRow({
        open: "pg/int8number@1",
        inReview: "pg/int8number@1",
        resolved: "pg/int8number@1",
        rejected: "pg/int8number@1",
        overdue: "pg/int8number@1",
        handledThisMonth: "pg/int8number@1",
        averageSeconds: { codecId: "pg/int4@1", nullable: true },
      })
      .build(),
  );

  const byStatus = {
    OPEN: row?.open ?? 0,
    IN_REVIEW: row?.inReview ?? 0,
    RESOLVED: row?.resolved ?? 0,
    REJECTED: row?.rejected ?? 0,
  };
  const averageSeconds = row?.averageSeconds ?? null;
  return {
    waiting: byStatus.OPEN + byStatus.IN_REVIEW,
    overdue: row?.overdue ?? 0,
    byStatus,
    handledThisMonth: row?.handledThisMonth ?? 0,
    averageHandlingHours: averageSeconds === null ? null : Math.max(0, averageSeconds) / 3600,
  };
}
