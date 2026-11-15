/**
 * The search params of an admin page, as received by the page (`await props.searchParams`).
 */
export type AdminQuery = Record<string, string | string[] | undefined>;

/** First value of a search param: ?status=A&status=B → "A". */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** All the non-empty values of a search param, as a list. */
export function paramValues(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

/**
 * Link to the same list with some params changed. `null` or "" removes a param.
 * The page number is reset (a new filter starts on page 1) unless `page` is given.
 *
 * @example
 * adminHref("/admin/commandes", query, { status: "PENDING" }) // "/admin/commandes?q=sfax&status=PENDING"
 * adminHref("/admin/commandes", query, { q: null })           // remove the search
 */
export function adminHref(basePath: string, query: AdminQuery | undefined, changes: Record<string, string | null>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (key === "page" || key === "ok" || key in changes || value == null) continue;
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== "") params.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value != null && value !== "") params.set(key, value);
  }
  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}
