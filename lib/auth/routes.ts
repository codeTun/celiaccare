/**
 * Admin auth constants shared by proxy.ts (runs before every request)
 * and the server code in lib/auth. No secrets here.
 */
export const ADMIN_HOME = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";

/** HTTPS sites get the hardened "__Host-" cookie (Secure, Path=/, no Domain). */
const isHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

export const ADMIN_SESSION_COOKIE = isHttps ? "__Host-cc_admin" : "cc_admin";
export const SECURE_COOKIES = isHttps;

/** Session lifetime: an admin must log in again after 8 hours. */
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
/** Idle timeout: a session left unused for 2 hours is over, even before its 8 hours. */
export const SESSION_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;
/** A half-logged-in session (password OK, 2FA code pending) expires after 5 minutes. */
export const PENDING_2FA_TTL_MS = 5 * 60 * 1000;
