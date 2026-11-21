/* ==========================================================================
   Monogram and short name of a business that has no official logo yet (brand
   band of the home page, brand-marquee.tsx). Pure functions: the same names and
   slugs always give the same letters and colours, on the server and in tests.
   ========================================================================== */

import type { BrandDTO } from "@/types";

/** Words that say nothing about the brand itself (articles, "sans gluten", trade names, legal forms). */
const SKIPPED_WORDS = new Set([
  "a",
  "al",
  "au",
  "aux",
  "boulangerie",
  "cafe",
  "chez",
  "d",
  "de",
  "des",
  "du",
  "el",
  "et",
  "free",
  "gluten",
  "l",
  "la",
  "le",
  "les",
  "patisserie",
  "restaurant",
  "sans",
  "sa",
  "sarl",
  "suarl",
  "the",
]);

/** What separates two words of a business name. */
const WORD_SEPARATORS = /[\s\-–—_/&+.,·:;|()«»"]+/;

/** "l'ATMC" → "ATMC", "d'Or" → "Or" (French elisions). */
const ELISION = /^(?:[cdjlmnst]|qu)['’]/i;

/** The Latin letters and digits of a word, accents removed: "Pâtisserie" → "Patisserie", "InwaЯd" → "Inwad". */
function latinOnly(word: string) {
  return word
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]/g, "");
}

/** The words of a text that have Latin letters, elisions and accents removed: "de l'ATMC –" → ["de", "ATMC"]. */
function latinWords(text: string) {
  return text
    .split(WORD_SEPARATORS)
    .map((word) => latinOnly(word.replace(ELISION, "")))
    .filter((word) => /[A-Za-z]/.test(word));
}

/**
 * 1 or 2 Latin initials of a business name, or its all-caps acronym (4 letters at most):
 *   "Glutella" → "G", "Ibn Hayyan" → "IH", "LilyDelights" → "LD", "La Seine" → "S",
 *   "InwaЯd" → "In" (a lone I or J is a mere stroke), "Boulangerie sans gluten de l'ATMC – Djerba" → "ATMC".
 * "" when the name has no Latin letter (e.g. written only in Arabic): the monogram then shows its mark only.
 */
export function brandInitials(name: string): string {
  const words = latinWords(name);
  const meaningful = words.filter((word) => !SKIPPED_WORDS.has(word.toLowerCase()));

  // An acronym is the strongest identity: "ATMC", "CTC"... (unless the whole name is written in capitals)
  const allCaps = meaningful.length > 1 && meaningful.every((word) => word === word.toUpperCase());
  const acronym = allCaps ? undefined : meaningful.find((word) => /^[A-Z][A-Z0-9]{1,4}$/.test(word));
  if (acronym) return acronym.slice(0, 4);

  // Only generic words ("Boulangerie sans gluten"): the first one gives the initial.
  const [first, second] = meaningful.length > 0 ? meaningful : words.slice(0, 1);
  if (!first) return "";
  const initial = (word: string) => word.match(/[A-Za-z]/)?.[0].toUpperCase() ?? "";
  if (second) return initial(first) + initial(second);
  // One word written in CamelCase: "LilyDelights" → "LD" (not "GLUTELLA" → "GL").
  const inner = /[a-z]/.test(first) ? first.slice(1).match(/[A-Z]/)?.[0] : undefined;
  if (inner) return initial(first) + inner;
  // A lone "I" or "J" reads as "|" or "1" in a sans-serif: keep its next letter, as a wordmark ("In").
  const [head, next] = first.match(/[A-Za-z]/g) ?? [];
  if (head && next && /^[IJ]$/i.test(head)) return head.toUpperCase() + next.toLowerCase();
  return initial(first);
}

/**
 * The name written on a tile: the full name, unless only generic words (articles, "Boulangerie sans
 * gluten"...) come before its acronym, which is then the real brand:
 *   "Boulangerie sans gluten de l'ATMC – Djerba" → "ATMC – Djerba" (all the other current names stay whole).
 * Without it, the two ATMC bakeries would both read "Boulangerie sans gluten de l'…". The tile keeps the
 * full name in its tooltip.
 */
export function brandShortName(name: string): string {
  const acronym = brandInitials(name);
  const at = /^[A-Z][A-Z0-9]+$/.test(acronym) ? name.indexOf(acronym) : -1;
  if (at <= 0) return name;
  const onlyGenericWords = latinWords(name.slice(0, at)).every((word) => SKIPPED_WORDS.has(word.toLowerCase()));
  return onlyGenericWords ? name.slice(at).trim() : name;
}

/**
 * Colour pairs of the monograms, all taken from the design tokens (app/globals.css):
 * `box` = background + letters, `pattern` = the zellige "khatam" star that suits the background,
 * `mark` = the tiny wheat-off sign in the corner.
 */
export const MONOGRAM_TONES = [
  // deep brand green, white letters
  { box: "bg-brand-700 text-white", pattern: "bg-khatam-light", mark: "text-white/60" },
  // soft mint
  { box: "bg-brand-100 text-brand-800", pattern: "bg-khatam", mark: "text-brand-700/60" },
  // night green (the footer) with saffron letters
  { box: "bg-brand-950 text-saffron-300", pattern: "bg-khatam-light", mark: "text-saffron-300/70" },
  // saffron sand
  { box: "bg-saffron-100 text-saffron-700", pattern: "bg-khatam", mark: "text-saffron-700/60" },
  // fresh green, ink letters
  { box: "bg-brand-400 text-brand-950", pattern: "bg-khatam-light", mark: "text-brand-950/50" },
  // white "paper" with a hairline, ink letters
  { box: "bg-white text-ink ring-1 ring-inset ring-line-strong", pattern: "bg-khatam", mark: "text-brand-600/70" },
] as const;

export type MonogramTone = (typeof MONOGRAM_TONES)[number];

/** The colour pair of a slug (its position in MONOGRAM_TONES): always the same one (djb2 hash of the slug). */
function toneIndex(slug: string) {
  let hash = 5381;
  for (let index = 0; index < slug.length; index++) {
    hash = (Math.imul(hash, 33) + slug.charCodeAt(index)) | 0;
  }
  return (hash >>> 0) % MONOGRAM_TONES.length;
}

/**
 * The colour pair of every tile of a row, in the same order. Each business gets the pair of its slug,
 * moved to the next pair when the monogram right before it already has it, and, for the last tile,
 * when the first one has it (they meet where the loop starts again): two neighbours never look alike.
 * The same list always gives the same colours; a colour may change when a neighbour comes or goes.
 * A tile with an official logo has no monogram, so it separates its neighbours.
 */
export function monogramTones(brands: readonly Pick<BrandDTO, "slug" | "logoUrl">[]): MonogramTone[] {
  const indexes = brands.map((brand) => (brand.logoUrl ? null : toneIndex(brand.slug)));
  const last = indexes.length - 1;
  for (let position = 0; position < indexes.length; position++) {
    let index = indexes[position];
    if (index === null) continue;
    const before = position > 0 ? indexes[position - 1] : null;
    const after = position === last && last > 0 ? indexes[0] : null;
    while (index === before || index === after) index = (index + 1) % MONOGRAM_TONES.length;
    indexes[position] = index;
  }
  return indexes.map((index, position) => MONOGRAM_TONES[index ?? toneIndex(brands[position].slug)]);
}

/* --------------------------------------------------------------------------
   Lockup styles of the brand wall: four ways of drawing a business that has no official
   logo yet (emblem shape + name typography), so the wall reads as a set of real brands.
   -------------------------------------------------------------------------- */
export const LOGO_VARIANTS = ["badge", "tile", "arch", "seal"] as const;
export type LogoVariant = (typeof LOGO_VARIANTS)[number];

/** The style of a slug: always the same one (a second hash, independent from the colour). */
function variantIndex(slug: string) {
  let hash = 7;
  for (let index = 0; index < slug.length; index++) {
    hash = (Math.imul(hash, 31) + slug.charCodeAt(index)) | 0;
  }
  return (hash >>> 0) % LOGO_VARIANTS.length;
}

/**
 * The style of every logo of a row, in the same order: each business keeps the style of its slug,
 * moved to the next one when its neighbour (or, for the last logo, the first one: they meet where
 * the loop starts again) already has it. Two neighbours never share a style.
 */
export function logoVariants(brands: readonly Pick<BrandDTO, "slug">[]): LogoVariant[] {
  const indexes = brands.map((brand) => variantIndex(brand.slug));
  const last = indexes.length - 1;
  for (let position = 1; position < indexes.length; position++) {
    let index = indexes[position];
    const after = position === last && last > 1 ? indexes[0] : null;
    while (index === indexes[position - 1] || index === after) index = (index + 1) % LOGO_VARIANTS.length;
    indexes[position] = index;
  }
  return indexes.map((index) => LOGO_VARIANTS[index]);
}
