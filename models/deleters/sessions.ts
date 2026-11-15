import "server-only";

import { and } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";

/* ==========================================================================
   DELETE — admin sessions ("Fermer" / "Déconnecter les autres appareils"
   on the Sécurité page). Deleting the row is enough: the cookie that goes
   with it is refused from now on.
   The admin id is ALWAYS part of the filter, so an admin can only close
   their own sessions, whatever id the browser sends.
   ========================================================================== */

/** A session id is sha256(token) in hexadecimal: 64 characters 0-9 a-f. */
export function isSessionId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

function assertAdminId(adminId: number) {
  if (!Number.isInteger(adminId) || adminId <= 0) throw new Error("Invalid admin id.");
}

/** Close one session of this admin. Returns false when it did not exist (already closed / expired). */
export async function deleteAdminSession(adminId: number, sessionId: string): Promise<boolean> {
  assertAdminId(adminId);
  if (!isSessionId(sessionId)) return false;
  const deleted = await db.orm.public.AdminSession.where((s) => and(s.adminId.eq(adminId), s.id.eq(sessionId))).deleteAndCount();
  return deleted > 0;
}

/** Close every session of this admin except `keepSessionId` (this browser). Returns how many were closed. */
export async function deleteOtherAdminSessions(adminId: number, keepSessionId: string | null): Promise<number> {
  assertAdminId(adminId);
  if (keepSessionId !== null && !isSessionId(keepSessionId)) return 0;
  const sessions = db.orm.public.AdminSession.where((s) => s.adminId.eq(adminId));
  return keepSessionId
    ? sessions.where((s) => s.id.neq(keepSessionId)).deleteAndCount()
    : sessions.deleteAndCount();
}
