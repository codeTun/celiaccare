import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { interpolate } from "@/i18n/interpolate";
import type { Locale } from "@/types";

/** Merge Tailwind class names (later classes win). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Pick the Arabic text when the page is in Arabic and a translation exists. */
export function localize(locale: Locale, fr: string, ar: string | null | undefined): string;
export function localize(locale: Locale, fr: string | null, ar: string | null | undefined): string | null;
export function localize(locale: Locale, fr: string | null, ar: string | null | undefined) {
  if (locale === "ar" && ar && ar.trim()) return ar;
  return fr;
}

/** Remove accents: "Pâtes à l'épeautre" -> "Pates a l'epeautre". */
export function stripAccents(text: string) {
  return text
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "AE")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Text used by the search box: lower case, no accents, single spaces. */
export function normalizeSearch(text: string) {
  return stripAccents(text).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/** "Couscous de maïs bio" -> "couscous-de-mais-bio" */
export function slugify(text: string) {
  return stripAccents(text)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** A sheet verified more than 12 months ago must be reviewed (spec §6.1). */
export function needsReview(verifiedAt: Date | string, now: Date = new Date()) {
  const verified = typeof verifiedAt === "string" ? new Date(verifiedAt) : verifiedAt;
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  return now.getTime() - verified.getTime() > oneYearMs;
}

/**
 * A counted text in every plural form, written in the dictionaries. French only needs
 * "zero", "one" and "other" (fill the six keys anyway); Arabic has six forms:
 * 0, 1, 2, 3–10, 11–99 and the rest.
 */
export type PluralForms = { zero: string; one: string; two: string; few: string; many: string; other: string };

const pluralRules: Record<Locale, Intl.PluralRules> = {
  fr: new Intl.PluralRules("fr"),
  ar: new Intl.PluralRules("ar"),
};

/** A number with Latin digits and the local thousands separator: 1234 -> "1 234". */
export function formatCount(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-TN" : "fr-TN", { numberingSystem: "latn" }).format(value);
}

/** The right form for `count`, number filled in: pluralize("fr", 3, forms) -> "3 produits", ("ar", 2) -> "منتجان". */
export function pluralize(locale: Locale, count: number, forms: PluralForms): string {
  const form = count === 0 ? "zero" : (pluralRules[locale].select(count) as keyof PluralForms);
  return interpolate(forms[form] ?? forms.other, { count: formatCount(locale, count) });
}

let missingSiteUrlWarned = false;

/** Public site URL without trailing slash, e.g. "https://celiaccare.tn". */
export function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url && process.env.NODE_ENV === "production" && !missingSiteUrlWarned) {
    // NEXT_PUBLIC_ values are inlined at build time: without it, every canonical, hreflang,
    // Open Graph URL, sitemap entry and JSON-LD of the build points to localhost.
    missingSiteUrlWarned = true;
    console.warn(
      "[CeliacCare] NEXT_PUBLIC_SITE_URL is not set: SEO URLs fall back to http://localhost:3000. Set it (e.g. https://celiaccare.tn) and rebuild.",
    );
  }
  return (url || "http://localhost:3000").replace(/\/+$/, "");
}

/** Build an absolute URL for SEO tags: absoluteUrl("/fr/produits"). */
export function absoluteUrl(path: string) {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
