import type { MetadataRoute } from "next";

import { getDictionary } from "@/i18n/server";
import { siteConfig } from "@/lib/site-config";

/**
 * /manifest.webmanifest — lets phones "install" the website on the home screen
 * (name, colors and icons). The app opens on the French home page.
 */
export default function manifest(): MetadataRoute.Manifest {
  const { common } = getDictionary("fr");
  return {
    name: `${siteConfig.name} · ${common.brand.tagline}`,
    short_name: siteConfig.shortName,
    description: common.brand.description,
    lang: "fr-TN",
    dir: "ltr",
    start_url: "/fr",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#128552",
    categories: ["food", "shopping", "health"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
