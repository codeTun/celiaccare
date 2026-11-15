import { governorateLabel } from "@/lib/tunisia";
import { stripAccents } from "@/lib/utils";
import type { Locale } from "@/types";

/**
 * "La Marsa, Tunis" — or only the governorate when the city has the same name
 * ("Sousse" instead of "Sousse, Sousse"). On Arabic pages the governorate is
 * translated and the Arabic comma is used: "La Marsa، تونس".
 */
export function placeLabel(city: string, governorate: string, locale: Locale) {
  const region = governorateLabel(governorate, locale);
  const sameName = stripAccents(city).trim().toLowerCase() === stripAccents(governorate).trim().toLowerCase();
  return sameName ? region : `${city}${locale === "ar" ? "، " : ", "}${region}`;
}
