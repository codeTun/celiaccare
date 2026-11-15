/* ==========================================================================
   Catalogue URLs: /fr/produits?categorie=pains&sans=lait,oeufs&tri=prix-croissant
   Plain functions (no React, no server code): used by the page on the server
   and by the filter forms in the browser.
   ========================================================================== */

/** Names of the catalogue URL parameters (in French), in the order they appear in links. */
export const CATALOG_PARAMS = [
  "q", // words typed in the search box
  "categorie", // category slug
  "ingredients", // ingredient slugs the product must contain, separated by commas
  "sans", // allergen slugs the product must NOT contain, separated by commas
  "garantie", // guarantee level: certifie | naturel | traces
  "prixMin", // in dinars
  "prixMax", // in dinars
  "artisan", // producer slug
  "tri", // sort order (absent = newest first)
  "page", // page number (absent = 1)
] as const;

export type CatalogParam = (typeof CATALOG_PARAMS)[number];

/** The catalogue parameters of a link, already written as URL text. */
export type CatalogQuery = Partial<Record<CatalogParam, string>>;

/**
 * Builds a catalogue link; empty parameters are left out.
 * buildCatalogHref("/fr/produits", { categorie: "pains", sans: "lait,oeufs" })
 *   -> "/fr/produits?categorie=pains&sans=lait,oeufs"
 */
export function buildCatalogHref(path: string, query: CatalogQuery): string {
  const parts: string[] = [];
  for (const name of CATALOG_PARAMS) {
    const value = query[name];
    if (!value) continue;
    // Commas separate the items of a list: keep them readable instead of "%2C".
    parts.push(`${name}=${encodeURIComponent(value).replace(/%2C/gi, ",")}`);
  }
  return parts.length > 0 ? `${path}?${parts.join("&")}` : path;
}

/**
 * Reads a filter <form> and returns its clean URL: checked boxes with the same
 * name are joined with commas, empty fields are left out, and the page number is
 * dropped (new filters always start again on page 1).
 */
export function formToCatalogHref(form: HTMLFormElement, path: string): string {
  const data = new FormData(form);
  const query: CatalogQuery = {};
  for (const name of CATALOG_PARAMS) {
    if (name === "page") continue;
    const values = data
      .getAll(name)
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
    if (values.length > 0) query[name] = values.join(",");
  }
  return buildCatalogHref(path, query);
}

/** Same as clicking a submit button of the form: runs its onSubmit (old Safari has no requestSubmit). */
export function submitForm(form: HTMLFormElement) {
  if (typeof form.requestSubmit === "function") form.requestSubmit();
  else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}
