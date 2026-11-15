import { cacheLife } from "next/cache";

/**
 * The current year, for the copyright line of the footer ("© 2026 ...").
 *
 * Pages are pre-rendered in advance, and Next.js forbids `new Date()` while
 * pre-rendering (the date would be frozen in the HTML forever). Inside a
 * "use cache" function it is allowed: the value is recomputed once a day.
 */
async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  // The year in Tunisia (the server clock may be set to another time zone).
  const year = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "Africa/Tunis" }).format(new Date());
  return Number(year);
}

/** Renders the current year, e.g. 2026. Server Component only. */
export async function CurrentYear() {
  const year = await getCurrentYear();
  return <>{year}</>;
}
