import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";

import { siteConfig } from "@/lib/site-config";

/* ==========================================================================
   Two-factor authentication (2FA) with TOTP codes: the 6-digit codes shown by
   Google Authenticator, Microsoft Authenticator, Authy, 1Password...

   - Settings: issuer = the site name ("CeliacCare", shown in the phone app),
     6 digits, a new code every 30 seconds.
     The code of the previous / next 30 seconds is also accepted ("window 1"),
     because phone clocks are rarely perfectly on time.
   - The secret shared with the phone is ENCRYPTED in the database
     (AdminUser.totpSecret) with AES-256-GCM:
        key    = sha256(AUTH_SECRET + ":totp")
        stored = "v1:<iv>:<tag>:<ciphertext>"   (each part in base64url)
     GCM also detects any modification of the stored value.
   - ⚠ Changing AUTH_SECRET makes the stored secrets unreadable: the admins then
     have to set 2FA up again ("pnpm admin:create --reset-2fa" turns it off).
   ========================================================================== */

export const TOTP_ISSUER = siteConfig.name;
export const TOTP_DIGITS = 6;
export const TOTP_PERIOD_SECONDS = 30;
/** Number of 30-second steps accepted before / after the current one. */
const TOTP_WINDOW = 1;

const FORMAT_VERSION = "v1";
const IV_BYTES = 12; // recommended size for AES-GCM
const TAG_BYTES = 16; // full-length authentication tag

function encryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is missing. Generate one with: openssl rand -base64 32");
  }
  // Same development fallback as lib/request.ts (never used in production).
  return createHash("sha256").update(`${secret ?? "dev-only-secret-change-me"}:totp`).digest();
}

/** A new random secret (20 bytes, written in base32 like "JBSWY3DPEHPK3PXP..."). */
export function generateTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

/** Encrypt a base32 secret before saving it in AdminUser.totpSecret. */
export function encryptTotpSecret(base32: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv, { authTagLength: TAG_BYTES });
  const ciphertext = Buffer.concat([cipher.update(base32, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [FORMAT_VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(":");
}

/**
 * Decrypt a value written by encryptTotpSecret().
 * Returns null when it is malformed, was modified, or was encrypted with another AUTH_SECRET.
 */
export function decryptTotpSecret(stored: string): string | null {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) return null;
  const iv = Buffer.from(parts[1], "base64url");
  const tag = Buffer.from(parts[2], "base64url");
  const ciphertext = Buffer.from(parts[3], "base64url");
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES || ciphertext.length === 0) return null;

  try {
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv, { authTagLength: TAG_BYTES });
    decipher.setAuthTag(tag);
    const base32 = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    return /^[A-Z2-7]+=*$/.test(base32) ? base32 : null;
  } catch {
    return null; // wrong key or modified value: GCM refuses it
  }
}

function buildTotp(base32: string, label = "admin"): TOTP {
  return new TOTP({
    issuer: TOTP_ISSUER,
    label,
    algorithm: "SHA1", // what every authenticator app expects
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SECONDS,
    secret: Secret.fromBase32(base32),
  });
}

/** "123 456" or "123-456" → "123456". null when it is not exactly 6 digits. */
export function normalizeTotpCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const code = input.replace(/[\s-]/g, "");
  return /^\d{6}$/.test(code) ? code : null;
}

/**
 * Check a 6-digit code against a (decrypted) secret.
 * Returns the number of the 30-second time step the code belongs to — the caller uses it
 * to refuse the same code a second time — or null when the code is wrong.
 */
export function verifyTotpCode(base32: string, input: string, timestamp: number = Date.now()): number | null {
  const token = normalizeTotpCode(input);
  if (!token) return null;
  const totp = buildTotp(base32);
  const delta = totp.validate({ token, timestamp, window: TOTP_WINDOW });
  // ⚠ 0 is a VALID answer (the current code): only null means "wrong code".
  if (delta === null) return null;
  return totp.counter({ timestamp }) + delta;
}

/** The "otpauth://totp/..." link stored in the QR code (what the phone app reads). */
export function totpUri(base32: string, accountEmail: string): string {
  return buildTotp(base32, accountEmail).toString();
}

/**
 * QR code of the otpauth link, as an SVG string generated on the server.
 * Safe to render with dangerouslySetInnerHTML: we build it ourselves from our own data.
 */
export function totpQrCodeSvg(uri: string): Promise<string> {
  return QRCode.toString(uri, {
    type: "svg",
    margin: 1,
    width: 208,
    errorCorrectionLevel: "M",
    color: { dark: "#04261aff", light: "#ffffffff" },
  });
}

/** "JBSWY3DPEHPK3PXP" → "JBSW Y3DP EHPK 3PXP" (easier to type by hand). */
export function formatTotpSecret(base32: string): string {
  return base32.replace(/(.{4})/g, "$1 ").trim();
}
