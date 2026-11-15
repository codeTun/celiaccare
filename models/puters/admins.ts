import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";

/* ==========================================================================
   UPDATE — administrator accounts (login bookkeeping, password, 2FA).
   The callers (Server Actions) check the session and the inputs first.
   ========================================================================== */

/** Prisma 8 ignores `where({ id: undefined })`: refuse bad ids BEFORE any write. */
function assertAdminId(adminId: number) {
  if (!Number.isInteger(adminId) || adminId <= 0) throw new ModelError("INVALID_ID", "Identifiant invalide.");
}

function byId(adminId: number) {
  assertAdminId(adminId);
  return db.orm.public.AdminUser.where((u) => u.id.eq(adminId));
}

/** Successful login: remember when, forget the previous failed attempts and any lock. */
export async function recordAdminLogin(adminId: number, now: Date): Promise<void> {
  await byId(adminId).update({ lastLoginAt: now, failedAttempts: 0, lockedUntil: null });
}

/** Save a new password. `passwordHash` comes from hashPassword() (argon2id), never the password itself. */
export async function updateAdminPassword(adminId: number, passwordHash: string, now: Date): Promise<void> {
  if (!passwordHash.startsWith("$argon2")) throw new ModelError("INVALID_HASH", "Empreinte de mot de passe invalide.");
  await byId(adminId).update({ passwordHash, passwordChangedAt: now });
}

/**
 * 2FA setup, step 1: keep the new secret (already ENCRYPTED with encryptTotpSecret()).
 * 2FA stays disabled until the admin confirms a first code (enableAdminTotp).
 */
export async function saveTotpSetupSecret(adminId: number, encryptedSecret: string): Promise<void> {
  await byId(adminId).update({ totpSecret: encryptedSecret, totpEnabled: false });
}

/** 2FA setup, step 2: a valid code was typed → the code is now required at every login. */
export async function enableAdminTotp(adminId: number): Promise<void> {
  await byId(adminId).update({ totpEnabled: true });
}

/** Turn 2FA off and forget the secret (also cancels an unfinished setup). */
export async function disableAdminTotp(adminId: number): Promise<void> {
  await byId(adminId).update({ totpEnabled: false, totpSecret: null });
}
