import { NextResponse, type NextRequest } from "next/server";

import { LOCALE_COOKIE } from "@/i18n/config";
import { ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE } from "@/lib/auth/routes";

/**
 * Next.js 16 "proxy" (formerly middleware.ts). It runs before every page request.
 * 1. Public pages always live under /fr/... or /ar/...: "/" or "/produits" are
 *    redirected to the visitor's language.
 * 2. /admin/* without a session cookie is redirected to the login page.
 *    This is only a FAST FIRST GATE: every admin page and Server Action
 *    re-checks the session in the database (lib/auth/session.ts → requireAdmin).
 */

const LOCALES = ["fr", "ar"] as const;
type Locale = (typeof LOCALES)[number];

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved === "fr" || saved === "ar") return saved;

  // "ar-TN,ar;q=0.9,fr;q=0.8" -> the best language we support
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().slice(0, 2), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  const match = ranked.find((r) => r.lang === "fr" || r.lang === "ar");
  return (match?.lang as Locale | undefined) ?? "fr";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin area -----------------------------------------------------------
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isLoginPage = pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`);
    if (!isLoginPage && !request.cookies.has(ADMIN_SESSION_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      // Come back to the requested page after login (validated as an internal /admin path by the login action).
      url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // --- Public website: make sure the URL starts with a language ------------
  const hasLocale = LOCALES.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API routes, Next.js internals, metadata files and anything with a file extension.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|icon|apple-icon|opengraph-image|brand|.*\\..*).*)",
  ],
};
