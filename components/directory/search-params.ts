/* ==========================================================================
   Small helpers to read the filters of the directory pages from the URL
   (?q=...&gouvernorat=...) and to build links that keep them.
   ========================================================================== */

/** What Next.js gives a page in `searchParams` (after `await`). */
export type SearchParamsRecord = Record<string, string | string[] | undefined>;

/** First value of a URL parameter, trimmed and shortened ("" when it is missing). */
export function readParam(params: SearchParamsRecord, key: string, maxLength = 100): string {
  const value = params[key];
  const first = Array.isArray(value) ? value[0] : value;
  return (first ?? "").trim().slice(0, maxLength);
}

/**
 * A link to `path` with these URL parameters; empty values are left out.
 * hrefWithParams("/fr/artisans", { type: "BAKERY", q: "" }) -> "/fr/artisans?type=BAKERY"
 */
export function hrefWithParams(path: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}
