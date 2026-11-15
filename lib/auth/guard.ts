import { ADMIN_HOME, ADMIN_LOGIN_PATH } from "@/lib/auth/routes";

/* ==========================================================================
   Small, pure helpers for the admin auth (no database, no cookies).
   Safe to import anywhere, including scripts/create-admin.ts.
   ========================================================================== */

/**
 * Longest password accepted anywhere (login, password change, create-admin script).
 * Long passphrases are welcome; this only stops absurd inputs sent to the slow hash function.
 */
export const MAX_PASSWORD_LENGTH = 256;

/**
 * The "?next=" page to open after the login, ONLY when it is a page of our admin area:
 *   "/admin", "/admin/commandes?status=PENDING"            → accepted
 *   "https://evil.tn", "//evil.tn", "/\\evil.tn", "/fr", "/admin/../fr" → refused (null)
 * This prevents "open redirects" (our login page sending people to another website).
 */
export function safeAdminPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 500) return null;
  if (!/^\/admin(?:[/?#]|$)/.test(value)) return null;
  // No backslashes, no "//", no spaces or invisible control characters.
  if (value.includes("\\") || value.includes("//")) return null;
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 0x20 || code === 0x7f) return null;
  }

  // Let the URL parser resolve "." / ".." and check we are still on our site, in /admin.
  const base = "http://admin.invalid"; // fake origin, only used to resolve the path
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return null;
  }
  if (url.origin !== base) return null;
  if (url.pathname !== ADMIN_HOME && !url.pathname.startsWith(`${ADMIN_HOME}/`)) return null;
  // Going back to the login page itself makes no sense.
  if (url.pathname === ADMIN_LOGIN_PATH || url.pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)) return null;
  return `${url.pathname}${url.search}`;
}

/** Where to go after a successful login: the safe "?next=" page, otherwise the dashboard. */
export function afterLoginPath(next: unknown): string {
  return safeAdminPath(next) ?? ADMIN_HOME;
}

/** /admin/login, keeping the safe "?next=" page and an optional message code (?info=...). */
export function loginPageUrl(next: unknown, info?: string): string {
  const params = new URLSearchParams();
  const safeNext = safeAdminPath(next);
  if (safeNext) params.set("next", safeNext);
  if (info) params.set("info", info);
  const query = params.toString();
  return query ? `${ADMIN_LOGIN_PATH}?${query}` : ADMIN_LOGIN_PATH;
}
