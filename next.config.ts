import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const isHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

/**
 * Content-Security-Policy: the browser only loads scripts, styles, images and
 * frames from the sources listed here. It blocks most XSS / clickjacking attacks.
 * ('unsafe-inline' scripts are required by Next.js pages that are pre-rendered
 * as static HTML; everything else stays strict.)
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.tile.openstreetmap.org",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-src https://www.openstreetmap.org",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isHttps ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  // Cache Components: pages are pre-rendered as a static shell; data marked
  // 'use cache' is cached and refreshed with cacheTag()/updateTag().
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,

  images: {
    // Images are stored on Cloudinary, which resizes and converts them (WebP/AVIF).
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    qualities: [60, 75, 85],
  },

  experimental: {
    // Admin image uploads go through Server Actions (default limit: 1 MB).
    serverActions: { bodySizeLimit: "6mb" },
    // One 404 page for URLs that match no route (we have two root layouts).
    globalNotFound: true,
  },

  headers() {
    return Promise.resolve([
      { source: "/:path*", headers: securityHeaders },
      // The admin panel must never appear in search engines (spec EF-13).
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ]);
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
