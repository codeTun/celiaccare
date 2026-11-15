import "../globals.css";

import type { Metadata, Viewport } from "next";
import { lang as getLang } from "next/root-params";

import { CartProvider } from "@/components/cart/cart-provider";
import { CookieNotice } from "@/components/cookie-notice";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { defaultLocale, getDirection, htmlLang, isLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { fontVariables } from "@/lib/fonts";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { cn, siteUrl } from "@/lib/utils";

/**
 * Root layout of the PUBLIC website (/fr/... and /ar/...).
 * The admin panel has its own root layout (app/admin/layout.tsx).
 */

// Both languages are pre-rendered at build time (required by Cache Components).
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#128552", // brand-600: colors the browser bar on phones
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const locale = isLocale(lang) ? lang : defaultLocale;
  const { common } = getDictionary(locale);
  const defaultTitle = `${siteConfig.name} · ${common.brand.tagline}`;

  return {
    metadataBase: new URL(siteUrl()),
    // Pages set `title: "Produits"` → "Produits · CeliacCare"
    title: { default: defaultTitle, template: `%s · ${siteConfig.name}` },
    description: common.brand.description,
    applicationName: siteConfig.name,
    // Base for social networks. Each page adds its own url, title and canonical
    // with pageMetadata() (lib/seo.ts). No `alternates` here: children would
    // inherit a wrong canonical URL.
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: defaultTitle,
      description: common.brand.description,
      locale: locale === "ar" ? "ar_AR" : "fr_FR",
      alternateLocale: locale === "ar" ? ["fr_FR"] : ["ar_AR"],
    },
    twitter: { card: "summary_large_image" },
    // We write the tel:/mailto: links ourselves: no automatic detection by iOS.
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function PublicLayout({ children }: LayoutProps<"/[lang]">) {
  // proxy.ts only adds a missing language: a URL like /xx.php still reaches this layout
  // with lang = "xx.php". The frame is then drawn in French and the PAGE inside answers
  // 404 (every page checks the language, see [...rest]/page.tsx), which shows our
  // localized not-found.tsx. Calling notFound() here would show Next's bare English 404:
  // nothing above a root layout can catch it.
  const lang = await getLang();
  const locale = isLocale(lang) ? lang : defaultLocale;

  const { common, content } = getDictionary(locale);

  return (
    <html
      lang={htmlLang[locale]}
      dir={getDirection(locale)}
      // smooth scrolling for anchors, but not during page changes (Next.js reads this attribute)
      data-scroll-behavior="smooth"
      // the page behind an open menu or dialog must not scroll
      className={cn(fontVariables, "[&:has(dialog:modal)]:overflow-hidden")}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lift focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-50"
        >
          {common.nav.skipToContent}
        </a>
        <CartProvider>
          <Navbar lang={locale} labels={common.nav} cartLabels={common.cartButton} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer lang={locale} common={common} />
        </CartProvider>
        {/* Spec 6.4: essential cookies only, said on screen until the visitor closes it */}
        <CookieNotice
          label={content.cookies.label}
          text={content.cookies.text}
          moreLabel={content.cookies.more}
          moreHref={`${localePath(locale, "/confidentialite")}#cookies`}
          dismissLabel={content.cookies.dismiss}
        />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd(locale)]} />
      </body>
    </html>
  );
}
