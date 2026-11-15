import "server-only";

import { db } from "@/lib/prisma";

/**
 * Simple database rate limiter (works on any host, no Redis needed).
 *   const { ok } = await rateLimit(`contact:${ipHash}`, { limit: 5, windowMs: 60 * 60 * 1000 });
 * Every allowed call is recorded; when `limit` calls already happened in the
 * last `windowMs`, the call is refused.
 */
export async function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }) {
  const since = new Date(Date.now() - windowMs);
  const { hits } = await db.orm.public.RateLimitHit.where((r) => r.key.eq(key))
    .where((r) => r.createdAt.gte(since))
    .aggregate((a) => ({ hits: a.count() }));

  if (hits >= limit) return { ok: false as const, remaining: 0 };

  await db.orm.public.RateLimitHit.create({ key });

  // Housekeeping: now and then, forget hits older than 2 days.
  if (Math.random() < 0.02) {
    const old = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await db.orm.public.RateLimitHit.where((r) => r.createdAt.lt(old)).deleteAll();
  }

  return { ok: true as const, remaining: limit - hits - 1 };
}

/** Common limits */
export const LIMITS = {
  contact: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 messages / hour
  review: { limit: 5, windowMs: 60 * 60 * 1000 },
  report: { limit: 10, windowMs: 60 * 60 * 1000 },
  // Per IP, a brake against robots only. The real rule is 3 orders/day per phone (EF-35): high
  // enough that a family, an office or a classroom sharing one connection always gets the EF-37 message.
  order: { limit: 30, windowMs: 60 * 60 * 1000 },
  tracking: { limit: 30, windowMs: 60 * 60 * 1000 },
  login: { limit: 20, windowMs: 15 * 60 * 1000 }, // per IP
} as const;
