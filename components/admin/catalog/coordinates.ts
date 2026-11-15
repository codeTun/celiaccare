/* ==========================================================================
   GPS coordinates of an artisan (latitude / longitude in decimal degrees).
   Google Maps copies both at once ("36.80649, 10.18153", right click on the
   map): splitCoordinates() separates them, in the form (paste) and again on
   the server (when the pair was typed in the latitude field).
   ========================================================================== */

const NUMBER = String.raw`-?\d{1,3}(?:[.,]\d+)?`;
/** Two numbers separated by ", " (comma + space), ";" or spaces. "36,8065" alone is ONE number (French comma). */
const PAIR = new RegExp(String.raw`^\s*(${NUMBER})\s*(?:,\s+|;\s*|\s+)(${NUMBER})\s*$`);

/** "36.80649, 10.18153" → ["36.80649", "10.18153"]; null when the text is not a pair. */
export function splitCoordinates(text: string): [string, string] | null {
  const match = PAIR.exec(text);
  return match ? [match[1].replace(",", "."), match[2].replace(",", ".")] : null;
}

/** Rough limits of Tunisia, to catch swapped or mistyped coordinates. */
export const TUNISIA_BOUNDS = { latMin: 30, latMax: 38, lngMin: 7, lngMax: 12 } as const;

/** "36,8065" or "36.8065" → 36.8065; null when empty or not a number. */
export function parseCoordinate(text: string | null | undefined): number | null {
  const cleaned = (text ?? "").trim().replace(",", ".");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
