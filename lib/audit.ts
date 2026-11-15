import "server-only";

import { db } from "@/lib/prisma";
import type { AdminDTO } from "@/types";

/**
 * Keep a trace of what administrators do (who changed what, and when).
 * Shown on the admin "Sécurité" page.
 */
export async function logAdminAction(
  admin: Pick<AdminDTO, "id" | "email"> | null,
  action: string,
  entity: string,
  entityId?: string | number | null,
  details?: string | null,
  ipHash?: string | null,
) {
  try {
    await db.orm.public.AuditLog.create({
      adminId: admin?.id ?? null,
      adminEmail: admin?.email ?? "system",
      action,
      entity,
      entityId: entityId == null ? null : String(entityId),
      details: details ? details.slice(0, 500) : null,
      ipHash: ipHash ?? null,
    });
  } catch (error) {
    // The audit log must never break the real action.
    console.error("[audit] could not write log", error);
  }
}
