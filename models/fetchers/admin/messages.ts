import "server-only";

import { all, and, or, type Condition } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { MESSAGE_STATUSES, type MessageStatus, type Paginated } from "@/types";
import type { AdminMessageDetail, AdminMessageFilters, AdminMessageRow } from "@/types/admin-data";

import { containsPattern, isValidId, pageWindow, paginated, toIso } from "./helpers";

/**
 * ADMIN — messages of the contact form ("Contact", "Proposer une adresse"...). Never cached.
 * Call requireAdmin() before using these functions.
 */

const EXCERPT_LENGTH = 160;

/** The filters of the inbox + a free search (name, e-mail, phone, subject, text). */
export type AdminMessageListFilters = AdminMessageFilters & {
  q?: string;
};

/** Number of messages per status (+ the total), for the inbox tabs. */
export type AdminMessageCounts = Record<MessageStatus, number> & { total: number };

/**
 * Messages matching the filters, 20 per page.
 * Waiting messages (NEW / IN_PROGRESS filter) are listed oldest first, like a queue;
 * any other list shows the newest first.
 */
export async function listMessages(filters: AdminMessageListFilters = {}): Promise<Paginated<AdminMessageRow>> {
  const { page, pageSize, offset } = pageWindow(filters);
  const q = filters.q?.trim();
  const filtered = db.orm.public.ContactMessage.where((m) => {
    const conditions: Condition[] = [];
    if (filters.status) conditions.push(m.status.eq(filters.status));
    if (filters.topic) conditions.push(m.topic.eq(filters.topic));
    if (q) {
      const pattern = containsPattern(q);
      const searches = [m.name.ilike(pattern), m.email.ilike(pattern), m.subject.ilike(pattern), m.message.ilike(pattern)];
      // Phones are stored as 8 digits: "20 123 456" must find "20123456".
      const digits = q.replace(/\D/g, "");
      if (digits.length >= 3) searches.push(m.phone.ilike(containsPattern(digits)));
      conditions.push(or(...searches));
    }
    return conditions.length > 0 ? and(...conditions) : all();
  });
  const oldestFirst = filters.status === "NEW" || filters.status === "IN_PROGRESS";

  const [rows, count] = await Promise.all([
    filtered
      .select("id", "name", "email", "phone", "topic", "subject", "message", "status", "createdAt", "handledAt")
      .orderBy(
        oldestFirst
          ? [(m) => m.createdAt.asc(), (m) => m.id.asc()]
          : [(m) => m.createdAt.desc(), (m) => m.id.desc()],
      )
      .limit(pageSize)
      .offset(offset)
      .all(),
    filtered.aggregate((a) => ({ total: a.count() })),
  ]);

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    topic: row.topic,
    subject: row.subject,
    excerpt: row.message.length > EXCERPT_LENGTH ? `${row.message.slice(0, EXCERPT_LENGTH).trimEnd()}…` : row.message,
    status: row.status,
    createdAt: toIso(row.createdAt),
    handledAt: toIso(row.handledAt),
  }));
  return paginated(items, count.total, page, pageSize);
}

/** How many messages are NEW, IN_PROGRESS, RESOLVED and ARCHIVED (all topics). */
export async function countMessagesByStatus(): Promise<AdminMessageCounts> {
  const rows = await db.orm.public.ContactMessage.groupBy("status").aggregate((a) => ({ n: a.count() }));
  const counts: AdminMessageCounts = { NEW: 0, IN_PROGRESS: 0, RESOLVED: 0, ARCHIVED: 0, total: 0 };
  for (const row of rows) {
    if (MESSAGE_STATUSES.includes(row.status)) counts[row.status] = row.n;
    counts.total += row.n;
  }
  return counts;
}

/** One message with the admin note. null when it does not exist. */
export async function getMessage(id: number): Promise<AdminMessageDetail | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.ContactMessage.first({ id });
  if (!row) return null;
  // Fields are copied one by one on purpose: ipHash never leaves the server.
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    topic: row.topic,
    subject: row.subject,
    message: row.message,
    status: row.status,
    adminNote: row.adminNote,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    handledAt: toIso(row.handledAt),
  };
}
