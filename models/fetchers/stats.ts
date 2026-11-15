import "server-only";

import { cachePolicy } from "@/lib/cache";
import { TAGS } from "@/lib/cache-tags";
import { db } from "@/lib/prisma";
import { publicProducers, publicProducts, publicRestaurants } from "@/models/fetchers/mappers";
import type { SiteStatsDTO } from "@/types";

/**
 * Numbers shown on the home and about pages.
 * `cities` = how many different governorates we cover (public producers, public restaurants
 * and active delivery zones together).
 */
export async function getSiteStats(): Promise<SiteStatsDTO> {
  "use cache";
  cachePolicy([TAGS.stats, TAGS.products, TAGS.producers, TAGS.restaurants, TAGS.zones]);

  const [products, producers, restaurants, partners, producerPlaces, restaurantPlaces, zones] = await Promise.all([
    publicProducts().aggregate((a) => ({ count: a.count() })),
    publicProducers().aggregate((a) => ({ count: a.count() })),
    publicRestaurants().aggregate((a) => ({ count: a.count() })),
    publicRestaurants()
      .where({ isPartner: true })
      .aggregate((a) => ({ count: a.count() })),
    publicProducers().select("governorate").all(),
    publicRestaurants().select("governorate").all(),
    db.orm.public.DeliveryZone.where((zone) => zone.isActive.eq(true))
      .select("governorate")
      .all(),
  ]);

  const governorates = new Set([...producerPlaces, ...restaurantPlaces, ...zones].map((row) => row.governorate));

  return {
    products: products.count,
    producers: producers.count,
    restaurants: restaurants.count,
    partnerRestaurants: partners.count,
    cities: governorates.size,
  };
}

/**
 * Health check used by GET /api/health: a trivial query that proves the database answers.
 * Never cached. Throws when the database is unreachable.
 */
export async function pingDatabase(): Promise<void> {
  await db.query(db.raw.sql`SELECT 1 AS "ok"`.returnsRow({ ok: "pg/int4@1" }).build());
}
