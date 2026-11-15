import type { MetadataRoute } from "next";
import { unstable_rethrow } from "next/navigation";

import { localePath, locales } from "@/i18n/config";
import { absoluteUrl } from "@/lib/utils";
import { getSitemapEntries, type SitemapEntries } from "@/models/fetchers/sitemap";

/**
 * /sitemap.xml — every public page, in French AND in Arabic, so Google finds
 * them all. Each URL also lists its other language (hreflang).
 * Filtered lists (/fr/produits?categorie=...) are not real pages: not listed.
 */

type SitemapEntry = MetadataRoute.Sitemap[number];
type Frequency = NonNullable<SitemapEntry["changeFrequency"]>;

/** Pages that always exist (path without the language). */
const STATIC_PAGES: { path: string; changeFrequency: Frequency; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/produits", changeFrequency: "daily", priority: 0.9 },
  { path: "/restaurants", changeFrequency: "daily", priority: 0.9 },
  { path: "/artisans", changeFrequency: "weekly", priority: 0.8 },
  { path: "/guide-sans-gluten", changeFrequency: "monthly", priority: 0.7 },
  { path: "/a-propos", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/mentions-legales", changeFrequency: "yearly", priority: 0.2 },
  { path: "/confidentialite", changeFrequency: "yearly", priority: 0.2 },
  { path: "/conditions", changeFrequency: "yearly", priority: 0.2 },
];

/** One sitemap entry per language for the same page, each pointing to both versions. */
function inBothLanguages(path: string, details: Omit<SitemapEntry, "url" | "alternates">): SitemapEntry[] {
  const languages = {
    "fr-TN": absoluteUrl(localePath("fr", path)),
    "ar-TN": absoluteUrl(localePath("ar", path)),
    "x-default": absoluteUrl(localePath("fr", path)),
  };
  return locales.map((locale) => ({ url: absoluteUrl(localePath(locale, path)), alternates: { languages }, ...details }));
}

/**
 * Products, artisans and restaurants from the database. If they cannot be
 * loaded, the sitemap still works with the fixed pages only.
 */
async function loadEntries(): Promise<SitemapEntries | null> {
  try {
    return await getSitemapEntries();
  } catch (error) {
    // Next.js uses errors internally (e.g. while pre-rendering): let those through.
    unstable_rethrow(error);
    console.warn(
      "[sitemap] Products, artisans and restaurants could not be loaded; only the fixed pages are listed.",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixedPages = STATIC_PAGES.flatMap(({ path, changeFrequency, priority }) =>
    inBothLanguages(path, { changeFrequency, priority }),
  );

  const entries = await loadEntries();
  if (!entries) return fixedPages;

  return [
    ...fixedPages,
    ...entries.products.flatMap((product) =>
      inBothLanguages(`/produits/${encodeURIComponent(product.slug)}`, {
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    ),
    ...entries.restaurants.flatMap((restaurant) =>
      inBothLanguages(`/restaurants/${encodeURIComponent(restaurant.slug)}`, {
        lastModified: restaurant.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    ),
    ...entries.producers.flatMap((producer) =>
      inBothLanguages(`/artisans/${encodeURIComponent(producer.slug)}`, {
        lastModified: producer.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
  ];
}
