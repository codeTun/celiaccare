import "server-only";

import { db } from "@/lib/prisma";

/* ==========================================================================
   Protection of the admin login against password guessing.

   - Per account AND connection (e-mail + hashed IP): after 5 wrong passwords
     or 2FA codes within 15 minutes, THIS connection is refused for this
     account (until those failures are 15 minutes old). Someone who types
     wrong passwords on purpose therefore cannot lock the real admin out.
   - Per account, all connections together: 30 failures within 15 minutes
     LOCK the account for everybody for 15 minutes (AdminUser.failedAttempts /
     AdminUser.lockedUntil), a brake against guessing from many addresses.
   - While refused, even the right password gets the same generic message
     "Identifiants invalides": an attacker learns nothing.
   - 2FA codes: 5 wrong codes per password step, and at most 10 wrong codes
     per hour for the account (all connections): then codes are refused until
     the hour is over, and the admin must log in again.
   - Per visitor (hashed IP): lib/rate-limit.ts, LIMITS.login, checked by the
     login Server Actions before anything else.
   - Every attempt is written to LoginAttempt (e-mail, hashed IP, result,
     reason). The Sécurité page shows the latest ones.
   ========================================================================== */

/** Wrong passwords / codes allowed per account AND connection within the window. */
export const MAX_FAILED_LOGINS = 5;
/** Wrong passwords / codes allowed per account, all connections together, before the account is locked. */
export const MAX_FAILED_LOGINS_PER_ACCOUNT = 30;
export const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOCK_DURATION_MS = 15 * 60 * 1000;
/** Wrong 2FA codes allowed for one password step, then the user must start again. */
export const MAX_WRONG_CODES = 5;
/** Wrong 2FA codes allowed per account and per hour (all connections), then codes are refused until the hour is over. */
export const MAX_WRONG_CODES_PER_HOUR = 10;
export const WRONG_CODE_WINDOW_MS = 60 * 60 * 1000;

/** Why an attempt succeeded or failed (stored in LoginAttempt.reason). */
export const LOGIN_REASONS = {
  ok: "ok",
  codeRequested: "2fa_pending",
  badPassword: "bad_password",
  unknownEmail: "unknown_email",
  locked: "locked",
  badCode: "bad_totp",
  honeypot: "honeypot",
  invalidInput: "invalid_input",
} as const;

export type LoginReason = (typeof LOGIN_REASONS)[keyof typeof LOGIN_REASONS];

/** The failures that count towards the locks (per connection and per account). */
const LOCKING_REASONS: LoginReason[] = [LOGIN_REASONS.badPassword, LOGIN_REASONS.badCode];

/** Login attempts are kept 90 days (enough to investigate, no more: personal data). */
const ATTEMPT_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/** What we write in LoginAttempt.email: a real-looking address, never random text (it could be a password typed in the wrong box). */
export function emailForLog(typed: unknown): string {
  if (typeof typed !== "string") return "(vide)";
  const email = typed.trim().toLowerCase();
  if (!email) return "(vide)";
  return /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,63}$/.test(email) ? email : "(adresse invalide)";
}

/** Is this account locked right now? */
export function isAccountLocked(admin: { lockedUntil: Date | null }, now: Date): boolean {
  return admin.lockedUntil !== null && admin.lockedUntil.getTime() > now.getTime();
}

/** Write one line in the login journal (LoginAttempt). */
export async function recordLoginAttempt(attempt: {
  email: string;
  ipHash: string;
  success: boolean;
  reason: LoginReason;
}): Promise<void> {
  await db.orm.public.LoginAttempt.create({
    email: attempt.email.slice(0, 254),
    ipHash: attempt.ipHash,
    success: attempt.success,
    reason: attempt.reason,
  });

  // Housekeeping, now and then: forget attempts older than 90 days.
  if (Math.random() < 0.02) {
    const cutoff = new Date(Date.now() - ATTEMPT_RETENTION_MS);
    await db.orm.public.LoginAttempt.where((a) => a.createdAt.lt(cutoff)).deleteAll();
  }
}

/** Wrong passwords / codes typed for this e-mail since `since` (only from this hashed IP when `ipHash` is given). */
export async function countLockingFailures(email: string, since: Date, ipHash?: string): Promise<number> {
  let attempts = db.orm.public.LoginAttempt.where((a) => a.email.eq(email))
    .where((a) => a.success.eq(false))
    .where((a) => a.reason.in(LOCKING_REASONS))
    .where((a) => a.createdAt.gte(since));
  if (ipHash !== undefined) attempts = attempts.where((a) => a.ipHash.eq(ipHash));
  const { failures } = await attempts.aggregate((a) => ({ failures: a.count() }));
  return failures;
}

/** Start of the window (15 minutes by default), but never before the last successful login. */
export function failureWindowStart(lastLoginAt: Date | null, now: Date, windowMs = FAILED_LOGIN_WINDOW_MS): Date {
  return new Date(Math.max(now.getTime() - windowMs, lastLoginAt?.getTime() ?? 0));
}

/** What the lock checks need to know about an account (an unknown e-mail uses lockedUntil/lastLoginAt = null). */
type ThrottledAccount = { email: string; lockedUntil: Date | null; lastLoginAt: Date | null };

/** Failures of the 15-minute window: from this connection, and from all connections. */
export async function countRecentFailures(account: ThrottledAccount, ipHash: string, now: Date) {
  const since = failureWindowStart(account.lastLoginAt, now);
  const [fromThisConnection, fromEverywhere] = await Promise.all([
    countLockingFailures(account.email, since, ipHash),
    countLockingFailures(account.email, since),
  ]);
  return { fromThisConnection, fromEverywhere };
}

/**
 * Is a login refused right now, whatever the password or code? True when the account is locked
 * for everybody (30 failures from all connections), or when THIS connection made 5 mistakes for
 * this account in the last 15 minutes. Always runs one query (same timing for every account).
 */
export async function isLoginBlocked(account: ThrottledAccount, ipHash: string, now: Date): Promise<boolean> {
  const fromThisConnection = await countLockingFailures(account.email, failureWindowStart(account.lastLoginAt, now), ipHash);
  return isAccountLocked(account, now) || fromThisConnection >= MAX_FAILED_LOGINS;
}

/**
 * Call it AFTER recordLoginAttempt() for a wrong password or code of an EXISTING account:
 * counts the failures of the window and locks the WHOLE account at the 30th one (all connections).
 * Returns true when this connection is now refused (its 5th failure, or the account is locked).
 */
export async function registerLoginFailure(
  admin: { id: number; email: string; lockedUntil: Date | null; lastLoginAt: Date | null },
  ipHash: string,
  now: Date,
): Promise<boolean> {
  const { fromThisConnection, fromEverywhere } = await countRecentFailures(admin, ipHash, now);
  const lockAccount = fromEverywhere >= MAX_FAILED_LOGINS_PER_ACCOUNT;
  await db.orm.public.AdminUser.where((u) => u.id.eq(admin.id)).update({
    failedAttempts: fromEverywhere,
    ...(lockAccount ? { lockedUntil: new Date(now.getTime() + LOCK_DURATION_MS) } : {}),
  });
  return lockAccount || fromThisConnection >= MAX_FAILED_LOGINS;
}

/** Wrong 2FA codes typed for this e-mail since `since` (start of the password step, or of the hourly window). */
export async function countWrongCodes(email: string, since: Date): Promise<number> {
  const { wrong } = await db.orm.public.LoginAttempt.where((a) => a.email.eq(email))
    .where((a) => a.reason.eq(LOGIN_REASONS.badCode))
    .where((a) => a.createdAt.gte(since))
    .aggregate((a) => ({ wrong: a.count() }));
  return wrong;
}
