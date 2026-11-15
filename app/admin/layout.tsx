import "../globals.css";

import type { Metadata, Viewport } from "next";

import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Root layout #2: the ADMIN panel (/admin/...), French only.
 * The public website has its own root layout (app/[lang]/layout.tsx), so going
 * from one to the other is a full page load.
 *
 * Security: this layout does NOT check the session (the login page lives under it).
 * The protected area is app/admin/(dashboard): its layout, every page and every
 * Server Action call requireAdmin() (lib/auth/session.ts).
 *
 * Cache Components: nothing here reads cookies or the database, so the outer shell
 * can be prerendered; request-time parts sit inside <Suspense> boundaries
 * (dashboard layout, loading.tsx, login page).
 */

export const metadata: Metadata = {
  // "Produits" → "Produits · Admin CeliacCare"
  title: { default: `Administration · ${siteConfig.name}`, template: `%s · Admin ${siteConfig.name}` },
  // The admin panel must never appear in search engines (spec EF-13).
  // next.config.ts also sends "X-Robots-Tag: noindex, nofollow" for /admin.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#04261a", // brand-950, the color of the sidebar
  colorScheme: "light",
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html
      lang="fr"
      dir="ltr"
      data-scroll-behavior="smooth"
      // the page behind an open menu or dialog must not scroll
      className={cn(fontVariables, "[&:has(dialog:modal)]:overflow-hidden")}
    >
      <body className="min-h-dvh bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
