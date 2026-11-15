/**
 * Names of the cache "tags" used by models/fetchers ('use cache' + cacheTag)
 * and invalidated by Server Actions after a change (updateTag).
 * Rule: when you change data in an action, invalidate every tag listed for it below.
 */
export const TAGS = {
  categories: "categories",
  ingredients: "ingredients",
  products: "products",
  product: (slug: string) => `product:${slug}`,
  producers: "producers",
  producer: (slug: string) => `producer:${slug}`,
  restaurants: "restaurants",
  restaurant: (slug: string) => `restaurant:${slug}`,
  zones: "zones",
  reviews: "reviews",
  stats: "site-stats",
} as const;

/**
 * What to invalidate after each kind of change (used by admin actions):
 * - category        -> categories, products
 * - ingredient      -> ingredients, products, restaurants
 * - product         -> products, product(slug) (old AND new slug), categories, producers, producer(slug), stats
 * - producer        -> producers, producer(slug), products, stats
 * - restaurant      -> restaurants, restaurant(slug), stats
 * - dish            -> restaurants, restaurant(slug)
 * - delivery zone   -> zones
 * - review (moderated) -> reviews, products, product(slug), restaurants, restaurant(slug)
 */
