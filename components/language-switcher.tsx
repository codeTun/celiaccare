"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { htmlLang, LOCALE_COOKIE, localeNames, locales } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

/** Short names shown in the navbar pill (each language is written in its own language). */
const SHORT_NAMES: Record<Locale, string> = { fr: "FR", ar: "عربي" };

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

type LanguageSwitcherProps = {
  /** Language of the current page */
  lang: Locale;
  /** Name of the control for screen readers, e.g. common.nav.language */
  label: string;
  /** Tooltip of the link to the other language, e.g. common.nav.switchTo */
  title?: string;
  /** "compact" = small "FR | عربي" pill (navbar), "full" = wide "Français | العربية" (mobile menu) */
  variant?: "compact" | "full";
  /** Called after a click on the other language (used to close the mobile menu) */
  onNavigate?: () => void;
  className?: string;
};

/**
 * "FR | عربي" switch. It links to the SAME page in the other language
 * (/fr/produits?q=pain <-> /ar/produits?q=pain) and remembers the choice in the
 * NEXT_LOCALE cookie, which proxy.ts reads when a URL has no language.
 *
 * The current URL is only known in the browser for some pages, so the switch is
 * rendered in steps: first a link to the other home page, then the same page,
 * then the same page with its query string (React Suspense fallbacks).
 */
export function LanguageSwitcher(props: LanguageSwitcherProps) {
  return (
    <Suspense fallback={<LanguageLinks {...props} path="" query="" />}>
      <WithCurrentPath {...props} />
    </Suspense>
  );
}

function WithCurrentPath(props: LanguageSwitcherProps) {
  const path = withoutLocale(usePathname());
  return (
    <Suspense fallback={<LanguageLinks {...props} path={path} query="" />}>
      <WithCurrentQuery {...props} path={path} />
    </Suspense>
  );
}

function WithCurrentQuery(props: LanguageSwitcherProps & { path: string }) {
  const query = useSearchParams().toString();
  return <LanguageLinks {...props} query={query} />;
}

/** "/fr/produits/pain" -> "/produits/pain", "/ar" -> "" */
function withoutLocale(pathname: string) {
  return pathname.replace(/^\/(fr|ar)(?=\/|$)/, "");
}

/** Remember the chosen language for one year. */
function rememberLocale(locale: Locale) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax${secure}`;
}

function LanguageLinks({
  lang,
  label,
  title,
  variant = "compact",
  onNavigate,
  className,
  path,
  query,
}: LanguageSwitcherProps & { path: string; query: string }) {
  const isFull = variant === "full";
  const queryString = query ? `?${query}` : "";
  const itemStyles = cn(
    "inline-flex items-center justify-center rounded-full font-bold transition-colors",
    // big enough to tap: 44px wide, and 44px tall with the pill's padding
    isFull ? "h-11 flex-1 px-4 text-[15px]" : "h-9 min-w-11 px-2.5 text-[13px]",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "items-center gap-0.5 rounded-full border border-line bg-white p-1",
        isFull ? "flex w-full" : "inline-flex",
        className,
      )}
    >
      {locales.map((locale) => {
        const text = isFull ? localeNames[locale] : SHORT_NAMES[locale];

        if (locale === lang) {
          return (
            <span key={locale} lang={locale} aria-current="true" className={cn(itemStyles, "bg-brand-600 text-white shadow-sm")}>
              {text}
            </span>
          );
        }

        return (
          <Link
            key={locale}
            href={`/${locale}${path}${queryString}`}
            hrefLang={htmlLang[locale]}
            title={title}
            onClick={() => {
              rememberLocale(locale);
              onNavigate?.();
            }}
            className={cn(itemStyles, "text-ink-muted hover:bg-brand-50 hover:text-brand-800")}
          >
            {/* lang: screen readers pronounce "عربي" with an Arabic voice */}
            <span lang={locale}>{text}</span>
          </Link>
        );
      })}
    </div>
  );
}
