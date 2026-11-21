import "server-only";

import { localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { cachePolicy } from "@/lib/cache";
import { TAGS } from "@/lib/cache-tags";
import { siteConfig } from "@/lib/site-config";
import { compareNames, publicProducers, publicRestaurants } from "@/models/fetchers/mappers";
import type { BrandDTO, Locale } from "@/types";

/**
 * The brand band at the bottom of the home page: every ACTIVE producer (artisan, manufacturer...)
 * and every ACTIVE restaurant, mixed and sorted by name in the page language.
 * Once the band is titled "Nos partenaires" (siteConfig.partnersSigned), only the restaurants that
 * signed the agreement (isPartner) are listed: a directory-only restaurant is not a partner.
 * Cached: the admin actions of producers (TAGS.producers) and restaurants (TAGS.restaurants)
 * refresh it as soon as a sheet, its logo or its visibility changes.
 */
export async function getBrandShowcase(locale: Locale): Promise<BrandDTO[]> {
  "use cache";
  cachePolicy([TAGS.producers, TAGS.restaurants]);

  // (siteConfig is a constant of the code: it never needs to be part of the cache key)
  const restaurantQuery = siteConfig.partnersSigned ? publicRestaurants().where({ isPartner: true }) : publicRestaurants();
  const [producers, restaurants] = await Promise.all([
    publicProducers().select("slug", "name", "type", "city", "logoUrl").all(),
    restaurantQuery.select("slug", "name", "city", "logoUrl").all(),
  ]);

  const { common, home } = getDictionary(locale);
  const brands: BrandDTO[] = [
    ...producers.map((row) => ({
      kind: "producer" as const,
      slug: row.slug,
      name: row.name,
      href: localePath(locale, `/artisans/${row.slug}`),
      typeLabel: common.producerTypesShort[row.type],
      city: row.city,
      logoUrl: row.logoUrl,
    })),
    ...restaurants.map((row) => ({
      kind: "restaurant" as const,
      slug: row.slug,
      name: row.name,
      href: localePath(locale, `/restaurants/${row.slug}`),
      typeLabel: home.brands.restaurantType,
      city: row.city,
      logoUrl: row.logoUrl,
    })),
  ];

  // Alphabetical order of the page language (accents and case ignored); the slug and the kind
  // only break ties, so the order never changes from one render to the next.
  return brands.sort(
    (a, b) =>
      compareNames(a.name, b.name, locale) || compareNames(a.slug, b.slug, locale) || a.kind.localeCompare(b.kind),
  );
}
