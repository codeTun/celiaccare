import { hash, verify, type Options } from "@node-rs/argon2";

/**
 * Password hashing with argon2id (winner of the Password Hashing Competition,
 * recommended by OWASP). We never store passwords, only their hash.
 * Parameters: OWASP recommendation (19 MiB memory, 2 iterations, 1 thread).
 */
// algorithm 2 = Argon2id (the library's `Algorithm` enum cannot be imported with isolatedModules)
const OPTIONS = {
  algorithm: 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} satisfies Options;

export const MIN_PASSWORD_LENGTH = 12;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/**
 * A real hash of a random password, used when the e-mail does not exist so that
 * "unknown e-mail" and "wrong password" take the same time (no user enumeration).
 */
let dummyHash: Promise<string> | null = null;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(`dummy-${Math.random()}-${Date.now()}`);
  return dummyHash;
}

/** Basic strength rules for admin passwords. Returns an error message or null. */
export function checkPasswordStrength(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Au moins ${MIN_PASSWORD_LENGTH} caractères.`;
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) return "Mélangez des lettres et des chiffres.";
  return null;
}
