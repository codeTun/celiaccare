import type { Locale } from "@/types";

/**
 * Money helpers. In the database every price is an integer number of
 * MILLIMES (1 dinar = 1000 millimes). 12,500 DT is stored as 12500.
 */

const priceFormatters: Record<Locale, Intl.NumberFormat> = {
  fr: new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", minimumFractionDigits: 3 }),
  ar: new Intl.NumberFormat("ar-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 3,
    numberingSystem: "latn",
  }),
};

/** 12500 -> "12,500 DT" (fr) */
export function formatPrice(millimes: number, locale: Locale = "fr") {
  return priceFormatters[locale].format(millimes / 1000);
}

/** Compact amount for dashboards: 1534000 -> "1 534 DT" */
export function formatDinars(millimes: number, locale: Locale = "fr") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-TN" : "fr-TN", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(Math.round(millimes / 1000)) + (locale === "ar" ? " د.ت" : " DT");
}

/** Admin form input -> millimes. Accepts "12,5", "12.500", "12". Returns null if invalid. */
export function parsePriceToMillimes(input: string | null | undefined): number | null {
  if (input == null) return null;
  const cleaned = String(input).trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,3})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 1000);
}

/** millimes -> "12.500" for pre-filling admin inputs */
export function millimesToInput(millimes: number | null | undefined) {
  if (millimes == null) return "";
  return (millimes / 1000).toFixed(3);
}

/** "15 nov. 2026" */
export function formatDate(value: string | Date, locale: Locale = "fr") {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-TN" : "fr-TN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Tunis",
    numberingSystem: "latn",
  }).format(date);
}

/** "15/11/2026 14:32" */
export function formatDateTime(value: string | Date, locale: Locale = "fr") {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-TN" : "fr-TN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Africa/Tunis",
    numberingSystem: "latn",
  }).format(date);
}

/** "il y a 3 heures" */
export function formatRelative(value: string | Date, locale: Locale = "fr", now: Date = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "fr", { numeric: "auto" });
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return rtf.format(diffSeconds, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSeconds / 86400), "day");
  if (abs < 86400 * 365) return rtf.format(Math.round(diffSeconds / (86400 * 30)), "month");
  return rtf.format(Math.round(diffSeconds / (86400 * 365)), "year");
}

/** Tunisian phone for display: "20123456" -> "20 123 456" */
export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 8) return phone;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

/** Average rating with one decimal, in the page language: 4.333 -> "4,3" (fr) / "4.3" (ar). */
export function formatRating(value: number, locale: Locale = "fr") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-TN" : "fr-TN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    numberingSystem: "latn",
  }).format(value);
}
