import { cacheLife, cacheTag } from "next/cache";

/**
 * Call this as the first line of every cached fetcher (right after "use cache"):
 *
 *   export async function getCategories(locale: Locale) {
 *     "use cache";
 *     cachePolicy([TAGS.categories]);
 *     ...
 *   }
 *
 * - keeps the result for about an hour ("hours" profile), shared by every visitor;
 * - tags it so admin changes refresh it immediately (updateTag in Server Actions).
 * Test scripts run outside Next.js set CELIACCARE_SCRIPT=1, where caching is skipped.
 */
export function cachePolicy(tags: string[], profile: "minutes" | "hours" | "days" = "hours") {
  if (process.env.CELIACCARE_SCRIPT === "1") return;
  if (profile === "minutes") cacheLife("minutes");
  else if (profile === "days") cacheLife("days");
  else cacheLife("hours");
  cacheTag(...tags);
}
