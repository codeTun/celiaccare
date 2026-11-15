/**
 * A small "random" number generator that always gives the same sequence
 * for the same seed (algorithm: mulberry32).
 *
 * Why not Math.random()? Because we want every run of the seed to build the
 * same demo data (same customers, same baskets...). Only the dates change,
 * because they are computed from the current date.
 */

export type Random = {
  /** A number between 0 (included) and 1 (excluded). */
  next(): number;
  /** A whole number between min and max (both included). */
  int(min: number, max: number): number;
  /** true with the given probability (0.3 = 30 % of the time). */
  chance(probability: number): boolean;
  /** One element of the list. */
  pick<T>(items: readonly T[]): T;
  /** One element of the list; elements with a bigger weight come up more often. */
  weighted<T>(items: readonly T[], weight: (item: T) => number): T;
};

export function createRandom(seed: number): Random {
  let state = seed >>> 0;

  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(min: number, max: number) {
    return min + Math.floor(next() * (max - min + 1));
  }

  function pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error("random.pick() needs a non-empty list");
    return items[Math.floor(next() * items.length)];
  }

  function weighted<T>(items: readonly T[], weight: (item: T) => number): T {
    const total = items.reduce((sum, item) => sum + Math.max(0, weight(item)), 0);
    if (total <= 0) return pick(items);
    let ticket = next() * total;
    for (const item of items) {
      ticket -= Math.max(0, weight(item));
      if (ticket < 0) return item;
    }
    return items[items.length - 1];
  }

  return { next, int, chance: (probability) => next() < probability, pick, weighted };
}
