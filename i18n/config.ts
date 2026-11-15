import { LOCALES, type Locale } from "@/types";

/** Languages of the public website. French is the default. */
export const locales = LOCALES;
export const defaultLocale: Locale = "fr";

/** Cookie remembering the language chosen with the language switcher (read by proxy.ts). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "ar";
}

/** Arabic is written right-to-left. */
export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Value of the <html lang> attribute and of hreflang links. */
export const htmlLang: Record<Locale, string> = { fr: "fr-TN", ar: "ar-TN" };

/** Names shown in the language switcher (always in their own language). */
export const localeNames: Record<Locale, string> = { fr: "Français", ar: "العربية" };

/** Prefix an internal path with the locale: localePath("ar", "/produits") -> "/ar/produits" */
export function localePath(locale: Locale, path = "/") {
  if (path === "/" || path === "") return `/${locale}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}
