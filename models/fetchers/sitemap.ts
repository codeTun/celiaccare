import "server-only";

import { cachePolicy } from "@/lib/cache";
import { TAGS } from "@/lib/cache-tags";
import { publicProducers, publicProducts, publicRestaurants } from "@/models/fetchers/mappers";

/**
 * The detail pages that should appear in sitemap.xml (both languages are added by app/sitemap.ts).
 * Category filters (/produits?categorie=...) are not separate pages, so they are not listed.
 */
export type SitemapEntries = {
  products: { slug: string; updatedAt: string }[];
  producers: { slug: string; updatedAt: string }[];
  restaurants: { slug: string; updatedAt: string }[];
};

export async function getSitemapEntries(): Promise<SitemapEntries> {
  "use cache";
  cachePolicy([TAGS.products, TAGS.producers, TAGS.restaurants]);

  const [products, producers, restaurants] = await Promise.all([
    publicProducts()
      .select("slug", "updatedAt")
      .orderBy((p) => p.slug.asc())
      .all(),
    publicProducers()
      .select("slug", "updatedAt")
      .orderBy((producer) => producer.slug.asc())
      .all(),
    publicRestaurants()
      .select("slug", "updatedAt")
      .orderBy((restaurant) => restaurant.slug.asc())
      .all(),
  ]);

  const withDate = (row: { slug: string; updatedAt: Date }) => ({ slug: row.slug, updatedAt: row.updatedAt.toISOString() });
  return {
    products: products.map(withDate),
    producers: producers.map(withDate),
    restaurants: restaurants.map(withDate),
  };
}
