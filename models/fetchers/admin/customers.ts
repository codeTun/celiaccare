import "server-only";

import { db } from "@/lib/prisma";
import type { Paginated } from "@/types";
import { ANONYMIZED_PHONE, type AdminCustomerFilters, type AdminCustomerRow } from "@/types/admin-data";

import { containsPattern, pageWindow, paginated, toIso } from "./helpers";

/**
 * ADMIN — customers. There are no customer accounts: one customer = one phone
 * number, built from the orders (spec EF-36). Never cached (personal data).
 * Call requireAdmin() before using these functions.
 */

/**
 * Customers grouped by phone number, most recent order first, 20 per page:
 * latest name used, number of orders, total spent (non-cancelled orders),
 * last order date and the BLOCKED / EXCEPTION rule of the number (if any, not expired).
 * `q` matches the phone number (digits) or any name used by that number.
 */
export async function listCustomers(filters: AdminCustomerFilters = {}): Promise<Paginated<AdminCustomerRow>> {
  const { page, pageSize, offset } = pageWindow(filters);
  const search = filters.q?.trim() ?? "";
  const digits = search.replace(/\D/g, "");
  const namePattern = containsPattern(search);
  const phonePattern = containsPattern(digits); // only used when digits were typed

  // The same HAVING clause is written in both queries: one counts, the other reads the page.
  const [countRows, rows] = await Promise.all([
    db.query(
      db.raw.sql`
        SELECT COUNT(*) AS "total"
        FROM (
          SELECT o."phone"
          FROM "Order" o
          WHERE o."phone" <> ${ANONYMIZED_PHONE}
          GROUP BY o."phone"
          HAVING ${search} = ''
              OR (${digits} <> '' AND o."phone" LIKE ${phonePattern})
              OR bool_or(o."customerName" ILIKE ${namePattern})
        ) AS customers
      `
        .returnsRow({ total: "pg/int8number@1" })
        .build(),
    ),
    db.query(
      db.raw.sql`
        SELECT
          o."phone" AS "phone",
          (array_agg(o."customerName" ORDER BY o."createdAt" DESC))[1] AS "name",
          COUNT(*) AS "orderCount",
          COALESCE(SUM(o."total") FILTER (WHERE o."status" <> 'CANCELLED'), 0) AS "totalSpent",
          MAX(o."createdAt") AS "lastOrderAt",
          MAX(r."type") AS "ruleType"
        FROM "Order" o
        LEFT JOIN "PhoneRule" r
          ON r."phone" = o."phone" AND (r."expiresAt" IS NULL OR r."expiresAt" > now())
        WHERE o."phone" <> ${ANONYMIZED_PHONE}
        GROUP BY o."phone"
        HAVING ${search} = ''
            OR (${digits} <> '' AND o."phone" LIKE ${phonePattern})
            OR bool_or(o."customerName" ILIKE ${namePattern})
        ORDER BY MAX(o."createdAt") DESC, o."phone" ASC
        LIMIT ${pageSize} OFFSET ${offset}
      `
        .returnsRow({
          phone: "pg/text@1",
          name: "pg/text@1",
          orderCount: "pg/int8number@1",
          totalSpent: "pg/int8number@1",
          lastOrderAt: "pg/timestamptz-date@1",
          ruleType: { codecId: "pg/text@1", nullable: true },
        })
        .build(),
    ),
  ]);

  const items: AdminCustomerRow[] = rows.map((row) => ({
    phone: row.phone,
    name: row.name,
    orderCount: row.orderCount,
    totalSpent: row.totalSpent,
    lastOrderAt: toIso(row.lastOrderAt),
    ruleType: row.ruleType === "BLOCKED" || row.ruleType === "EXCEPTION" ? row.ruleType : null,
  }));

  return paginated(items, countRows[0]?.total ?? 0, page, pageSize);
}
