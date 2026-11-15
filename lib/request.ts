import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";

/**
 * Information about the visitor's request (Server Actions / Route Handlers only).
 * We never store raw IP addresses (personal data, law n° 2004-63): only a
 * keyed hash, enough to detect abuse (rate limiting) without identifying anyone.
 */

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is missing. Generate one with: openssl rand -base64 32");
  }
  return value ?? "dev-only-secret-change-me";
}

export function hashIp(ip: string) {
  return createHmac("sha256", secret()).update(`ip:${ip}`).digest("hex").slice(0, 32);
}

/**
 * The visitor's IP, used ONLY (hashed) for rate limiting.
 * A visitor can write anything at the START of X-Forwarded-For, so we take the
 * LAST entry: the one added by the closest proxy (Vercel, nginx...).
 * Behind a proxy that sets another header, name it in TRUSTED_IP_HEADER
 * (e.g. "x-real-ip" or "cf-connecting-ip").
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const trustedHeader = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase();
  if (trustedHeader) {
    const value = h.get(trustedHeader)?.split(",")[0]?.trim();
    if (value) return value;
  }
  const hops = h.get("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean) ?? [];
  return hops.at(-1) || h.get("x-real-ip")?.trim() || "0.0.0.0";
}

/** Hashed IP of the current visitor. */
export async function getIpHash(): Promise<string> {
  return hashIp(await getClientIp());
}

export async function getUserAgent(): Promise<string | null> {
  const h = await headers();
  return h.get("user-agent")?.slice(0, 300) ?? null;
}
