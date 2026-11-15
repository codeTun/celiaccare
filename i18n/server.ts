import "server-only";

import type { Locale } from "@/types";

import * as ar from "./resources/ar";
import * as fr from "./resources/fr";

/**
 * All the texts of the public website, by language.
 * Server Components call getDictionary(lang) and pass the parts they need
 * to child components as props.
 */
export type Dictionary = typeof fr;

const dictionaries: Record<Locale, Dictionary> = { fr, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
