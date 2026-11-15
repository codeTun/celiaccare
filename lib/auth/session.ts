import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import {
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
  PENDING_2FA_TTL_MS,
  SECURE_COOKIES,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_TTL_MS,
} from "@/lib/auth/routes";
import { db } from "@/lib/prisma";
import { getIpHash, getUserAgent } from "@/lib/request";
import type { AdminDTO } from "@/types";

/* ==========================================================================
   Admin sessions — how an administrator stays logged in.

   1. After a successful login we create a RANDOM token (32 bytes, base64url)
      and give it to the browser in the cookie ADMIN_SESSION_COOKIE:
        - HttpOnly        → JavaScript in the page can never read it,
        - SameSite=Strict → the browser never sends it from another website,
        - Secure          → HTTPS only (SECURE_COOKIES, true in production),
        - Path=/, expires after SESSION_TTL_MS (8 hours, then log in again).
   2. The database (table AdminSession) only stores sha256(token) as the id.
      Someone who reads the database cannot turn those ids back into cookies.
   3. Every admin page / Server Action calls requireAdmin(): it hashes the
      cookie, loads the session and refuses it when it is expired, unused for
      SESSION_IDLE_TIMEOUT_MS (2 hours: a forgotten open computer) or still
      waiting for the 2FA code (pending2fa). Then → redirect to /admin/login.
   4. Logging out (or "Fermer" on the Sécurité page) deletes the row: a copied
      cookie becomes useless immediately.
   5. A NEW token is created at each login and at the 2FA step, and the
      browser's previous session is deleted (protection against "session
      fixation", where an attacker plants a known token before the login).
   ========================================================================== */

/** 32 random bytes in base64url = exactly 43 characters. Anything else is ignored. */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/** lastSeenAt is refreshed at most every 5 minutes (one small write, not one per page). */
const LAST_SEEN_REFRESH_MS = 5 * 60 * 1000;

/** Cookie attributes shared by "set" and "delete" (a __Host- cookie needs them on both). */
const COOKIE_ATTRIBUTES = {
  httpOnly: true,
  sameSite: "strict",
  secure: SECURE_COOKIES,
  path: "/",
} as const;

/** A new random session token (what the cookie holds). */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** sha256(token) in hexadecimal: the only thing stored in the database (AdminSession.id). */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** The token of this browser, when the cookie exists and looks like one of ours. */
async function readCookieToken(): Promise<string | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return token && TOKEN_PATTERN.test(token) ? token : null;
}

/**
 * The AdminSession row of this browser (whatever its state) with its admin.
 * React cache(): loaded once per page render even if several components ask.
 */
const loadBrowserSession = cache(async () => {
  // Only for a real visit, never while Next.js prepares a page in advance (prefetch,
  // static shell): sessions must be checked live, and the database client uses random
  // ids that Next.js refuses during that preparation. Everything an admin page loads
  // AFTER requireAdmin() therefore runs at request time too.
  await connection();
  const token = await readCookieToken();
  if (!token) return null;
  const session = await db.orm.public.AdminSession.where((s) => s.id.eq(hashSessionToken(token)))
    .include("admin", (admin) => admin.select("id", "email", "name", "totpEnabled", "lastLoginAt"))
    .first();
  // Idle timeout, checked here so the admin pages AND the login page agree: a session unused
  // for 2 hours is over (lastSeenAt is refreshed at most every 5 minutes while it is used).
  if (session && Date.now() - session.lastSeenAt.getTime() > SESSION_IDLE_TIMEOUT_MS) return null;
  return session;
});

type SessionAdmin = { id: number; email: string; name: string; totpEnabled: boolean; lastLoginAt: Date | null };

function toAdminDTO(admin: SessionAdmin): AdminDTO {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    totpEnabled: admin.totpEnabled,
    lastLoginAt: admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null,
  };
}

async function loadCurrentAdmin(): Promise<AdminDTO | null> {
  const session = await loadBrowserSession();
  if (!session?.admin || session.pending2fa) return null;

  const now = new Date(); // request time: the cookie was read above
  if (session.expiresAt.getTime() <= now.getTime()) return null;

  if (now.getTime() - session.lastSeenAt.getTime() > LAST_SEEN_REFRESH_MS) {
    try {
      await db.orm.public.AdminSession.where((s) => s.id.eq(session.id)).update({ lastSeenAt: now });
    } catch (error) {
      // Only used for display on the Sécurité page: never block the admin because of it.
      console.error("[auth] could not refresh lastSeenAt", error);
    }
  }
  return toAdminDTO(session.admin);
}

/**
 * The logged-in admin, or null.
 * Reads the session cookie and checks it in the database; deduplicated per request (React cache).
 */
export const getCurrentAdmin: () => Promise<AdminDTO | null> = cache(loadCurrentAdmin);

/**
 * Use at the top of EVERY admin page data function, admin fetcher and admin Server Action.
 * Redirects to /admin/login when there is no valid session.
 * (A layout check alone is not enough: layouts do not protect the pages below them.)
 */
export async function requireAdmin(): Promise<AdminDTO> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(ADMIN_LOGIN_PATH);
  return admin;
}

/**
 * Id (sha256 of the token) of this browser's session, without any database check.
 * Used to mark "Cet appareil" in the session list and to keep it when closing the others.
 */
export async function getCurrentSessionId(): Promise<string | null> {
  const token = await readCookieToken();
  return token ? hashSessionToken(token) : null;
}

/** A login that passed the password step and waits for the 6-digit 2FA code. */
export type PendingLogin = {
  sessionId: string;
  adminId: number;
  email: string;
  startedAt: Date;
  expiresAt: Date;
};

/** Where this browser stands in the login flow (used by the login page). */
export type LoginStage =
  | { stage: "anonymous" }
  | { stage: "pending2fa"; pending: PendingLogin }
  | { stage: "authenticated"; admin: AdminDTO };

export async function getLoginStage(): Promise<LoginStage> {
  const session = await loadBrowserSession();
  if (!session?.admin) return { stage: "anonymous" };
  if (session.expiresAt.getTime() <= Date.now()) return { stage: "anonymous" };
  if (session.pending2fa) {
    return {
      stage: "pending2fa",
      pending: {
        sessionId: session.id,
        adminId: session.admin.id,
        email: session.admin.email,
        startedAt: session.createdAt,
        expiresAt: session.expiresAt,
      },
    };
  }
  return { stage: "authenticated", admin: toAdminDTO(session.admin) };
}

/** The pending (password OK, code not typed yet) login of this browser, or null. */
export async function getPendingLogin(): Promise<PendingLogin | null> {
  const state = await getLoginStage();
  return state.stage === "pending2fa" ? state.pending : null;
}

/**
 * Open a session for this browser (Server Actions only: it sets a cookie).
 * - pending2fa: true  → half-logged-in session, valid PENDING_2FA_TTL_MS (5 min), only for the code step;
 * - pending2fa: false → real session, valid SESSION_TTL_MS (8 h).
 * The previous session of this browser (if any) is deleted first: a new token every time.
 */
export async function startAdminSession(adminId: number, { pending2fa }: { pending2fa: boolean }): Promise<void> {
  const jar = await cookies();
  const now = new Date();

  const previousToken = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (previousToken && TOKEN_PATTERN.test(previousToken)) {
    await db.orm.public.AdminSession.where((s) => s.id.eq(hashSessionToken(previousToken))).deleteAll();
  }
  // Housekeeping: forget sessions that expired (nobody can use them anymore).
  await db.orm.public.AdminSession.where((s) => s.expiresAt.lt(now)).deleteAll();

  const token = generateSessionToken();
  const expiresAt = new Date(now.getTime() + (pending2fa ? PENDING_2FA_TTL_MS : SESSION_TTL_MS));
  await db.orm.public.AdminSession.create({
    id: hashSessionToken(token),
    adminId,
    pending2fa,
    expiresAt,
    lastSeenAt: now,
    ipHash: await getIpHash(),
    userAgent: await getUserAgent(),
  });

  jar.set(ADMIN_SESSION_COOKIE, token, { ...COOKIE_ATTRIBUTES, expires: expiresAt });
}

/** Log this browser out (Server Actions only): deletes the session row and the cookie. */
export async function endCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (token && TOKEN_PATTERN.test(token)) {
    await db.orm.public.AdminSession.where((s) => s.id.eq(hashSessionToken(token))).deleteAll();
  }
  jar.delete({ name: ADMIN_SESSION_COOKIE, ...COOKIE_ATTRIBUTES });
}
