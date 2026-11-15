import "server-only";

import {
  countRecentFailures,
  countWrongCodes,
  emailForLog,
  failureWindowStart,
  isLoginBlocked,
  LOGIN_REASONS,
  MAX_WRONG_CODES,
  MAX_WRONG_CODES_PER_HOUR,
  recordLoginAttempt,
  registerLoginFailure,
  WRONG_CODE_WINDOW_MS,
} from "@/lib/auth/login-throttle";
import { getDummyHash, verifyPassword } from "@/lib/auth/password";
import type { PendingLogin } from "@/lib/auth/session";
import { decryptTotpSecret, verifyTotpCode } from "@/lib/auth/totp";
import { rateLimit } from "@/lib/rate-limit";
import { getAdminAuthByEmail, getAdminAuthById, type AdminAuthRecord } from "@/models/fetchers/admin/security";
import { recordAdminLogin } from "@/models/puters/admins";

/* ==========================================================================
   The two checks of the admin login, without cookies or redirects
   (actions.ts does that part). Kept separate so they can be tested from a
   script and read in one place.

   Step 1 — e-mail + password
   Step 2 — 6-digit code, only for admins who turned 2FA on
   ========================================================================== */

export type PasswordCheck =
  /** Password OK and no 2FA: the admin is logged in. */
  | { status: "logged_in"; admin: AdminAuthRecord }
  /** Password OK, the 6-digit code is now required. */
  | { status: "code_required"; admin: AdminAuthRecord }
  /** Unknown e-mail, wrong password, or login refused for now (too many mistakes): the visitor only sees "Identifiants invalides". */
  | { status: "refused" };

export async function checkPassword({
  email,
  password,
  ipHash,
  now,
}: {
  email: string;
  password: string;
  ipHash: string;
  now: Date;
}): Promise<PasswordCheck> {
  // ALWAYS run the slow password check, even when the e-mail is unknown (against a dummy hash):
  // the answer then takes the same time, so it does not reveal which e-mails have an account.
  // (The dummy hash is prepared first, whatever the e-mail: the very first attempt after a
  // server start pays for it in every case.)
  const dummyHash = await getDummyHash();
  const admin = await getAdminAuthByEmail(email);
  const passwordOk = await verifyPassword(admin?.passwordHash ?? dummyHash, password);

  // The journal always uses the account's own e-mail (whatever the letter case typed): that is
  // the e-mail the locks count. An unknown e-mail is logged in lower case, never as random text.
  const account = admin ?? { email: emailForLog(email), lockedUntil: null, lastLoginAt: null };
  // Too many mistakes from this connection (or the whole account is locked)? Same query for a
  // known or an unknown e-mail (same timing).
  const blocked = await isLoginBlocked(account, ipHash, now);

  if (!admin || blocked) {
    const reason = admin ? LOGIN_REASONS.locked : LOGIN_REASONS.unknownEmail;
    await recordLoginAttempt({ email: account.email, ipHash, success: false, reason });
    // Same database work as a wrong password on a real account (same timing).
    await countRecentFailures(account, ipHash, now);
    return { status: "refused" };
  }

  if (!passwordOk) {
    await recordLoginAttempt({ email: admin.email, ipHash, success: false, reason: LOGIN_REASONS.badPassword });
    await registerLoginFailure(admin, ipHash, now);
    return { status: "refused" };
  }

  if (admin.totpEnabled && admin.totpSecret) {
    // Not logged in yet: success stays false until the code is checked.
    await recordLoginAttempt({ email: admin.email, ipHash, success: false, reason: LOGIN_REASONS.codeRequested });
    return { status: "code_required", admin };
  }

  await recordLoginAttempt({ email: admin.email, ipHash, success: true, reason: LOGIN_REASONS.ok });
  await recordAdminLogin(admin.id, now);
  return { status: "logged_in", admin };
}

export type CodeCheck =
  | { status: "logged_in"; admin: AdminAuthRecord }
  | { status: "wrong_code"; attemptsLeft: number }
  /**
   * Too many wrong codes, login refused for now or 2FA turned off meanwhile: back to step 1.
   * `suspended`: the account reached its hourly budget of wrong codes, codes are refused for up to an hour.
   */
  | { status: "restart"; suspended?: boolean };

/** How long a used code is remembered (it is only valid ~90 seconds anyway). */
const USED_CODE_MEMORY_MS = 5 * 60 * 1000;

export async function checkCode({
  pending,
  code,
  ipHash,
  now,
}: {
  pending: PendingLogin;
  code: string;
  ipHash: string;
  now: Date;
}): Promise<CodeCheck> {
  const admin = await getAdminAuthById(pending.adminId);
  if (!admin || !admin.totpEnabled || !admin.totpSecret) return { status: "restart" };

  if (await isLoginBlocked(admin, ipHash, now)) {
    await recordLoginAttempt({ email: admin.email, ipHash, success: false, reason: LOGIN_REASONS.locked });
    return { status: "restart" };
  }

  // Budget of wrong codes for the account, all connections and password steps together: once it is
  // used up, even the right code is refused until the hour is over (a successful login resets it).
  const wrongCodesThisHour = await countWrongCodes(admin.email, failureWindowStart(admin.lastLoginAt, now, WRONG_CODE_WINDOW_MS));
  if (wrongCodesThisHour >= MAX_WRONG_CODES_PER_HOUR) {
    await recordLoginAttempt({ email: admin.email, ipHash, success: false, reason: LOGIN_REASONS.locked });
    return { status: "restart", suspended: true };
  }

  const secret = decryptTotpSecret(admin.totpSecret);
  if (!secret) {
    console.error(`[auth] the 2FA secret of admin #${admin.id} cannot be decrypted (was AUTH_SECRET changed?)`);
  }
  const timeStep = secret ? verifyTotpCode(secret, code, now.getTime()) : null;

  // A code works only ONCE: we remember its 30-second time step for a few minutes,
  // so a code seen over someone's shoulder cannot be replayed.
  const firstUse =
    timeStep !== null &&
    (await rateLimit(`totp-used:${admin.id}:${timeStep}`, { limit: 1, windowMs: USED_CODE_MEMORY_MS })).ok;

  if (!firstUse) {
    await recordLoginAttempt({ email: admin.email, ipHash, success: false, reason: LOGIN_REASONS.badCode });
    const blocked = await registerLoginFailure(admin, ipHash, now);
    const wrongCodes = await countWrongCodes(admin.email, pending.startedAt);
    const leftThisHour = MAX_WRONG_CODES_PER_HOUR - (wrongCodesThisHour + 1);
    if (leftThisHour <= 0) return { status: "restart", suspended: true };
    if (blocked || wrongCodes >= MAX_WRONG_CODES) return { status: "restart" };
    return { status: "wrong_code", attemptsLeft: Math.min(MAX_WRONG_CODES - wrongCodes, leftThisHour) };
  }

  await recordLoginAttempt({ email: admin.email, ipHash, success: true, reason: LOGIN_REASONS.ok });
  await recordAdminLogin(admin.id, now);
  return { status: "logged_in", admin };
}
