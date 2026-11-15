import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

/**
 * /robots.txt — tells search engines what they may visit.
 * The admin panel and the JSON API must never appear in Google.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
