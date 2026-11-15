import "./globals.css";

import type { Metadata } from "next";
import Link from "next/link";

import { Logo, LogoEmblem } from "@/components/logo";
import { buttonStyles } from "@/components/ui/button";
import { getDictionary } from "@/i18n/server";
import { fontVariables } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Safety-net 404 page, used by Next.js when a URL matches NO route at all
 * (required by experimental.globalNotFound, because the site has two root layouts).
 * In practice most unknown URLs (/fr/xyz, /page.php...) are caught by app/[lang]
 * and get the localized app/[lang]/not-found.tsx inside the normal site frame.
 *
 * Next.js shows this page WITHOUT any layout, so it is a complete HTML document
 * with its own styles and fonts. The language is unknown here: French and Arabic
 * are shown side by side.
 */

const fr = getDictionary("fr").common;
const ar = getDictionary("ar").common;

export const metadata: Metadata = {
  title: `${fr.states.notFoundTitle} · ${siteConfig.name}`,
  description: fr.states.notFoundText,
};

export default function GlobalNotFound() {
  return (
    <html lang="fr-TN" dir="ltr" className={fontVariables} data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col">
        <header className="border-b border-line">
          <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
            <Link href="/fr" aria-label={fr.nav.homeLink} className="rounded-xl">
              <Logo />
            </Link>
          </div>
        </header>

        <main className="relative isolate flex flex-1 flex-col items-center px-4 py-14 sm:px-6 sm:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-khatam [mask-image:radial-gradient(ellipse_at_top,#000_25%,transparent_70%)]"
          />

          {/* "4 [door] 4": the doorway of the logo plays the zero */}
          <div aria-hidden="true" className="flex items-end justify-center gap-1 sm:gap-2">
            <span className="text-[6.5rem] leading-[0.8] font-extrabold text-brand-100 sm:text-[9rem]">4</span>
            <LogoEmblem className="size-24 sm:size-32" />
            <span className="text-[6.5rem] leading-[0.8] font-extrabold text-brand-100 sm:text-[9rem]">4</span>
          </div>

          <div className="mt-12 grid w-full max-w-4xl gap-5 md:grid-cols-2">
            <LanguageCard
              lang="fr"
              code={fr.states.notFoundCode}
              title={fr.states.notFoundTitle}
              text={fr.states.notFoundText}
              cta={fr.states.goToSite}
              href="/fr"
              asPageTitle
            />
            <LanguageCard
              lang="ar"
              code={ar.states.notFoundCode}
              title={ar.states.notFoundTitle}
              text={ar.states.notFoundText}
              cta={ar.states.goToSite}
              href="/ar"
            />
          </div>
        </main>
      </body>
    </html>
  );
}

/** The 404 message in one language, with a link to that version of the website. */
function LanguageCard({
  lang,
  code,
  title,
  text,
  cta,
  href,
  asPageTitle = false,
}: {
  lang: "fr" | "ar";
  code: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  /** The French title is the page's single <h1>; the Arabic one is a <h2>. */
  asPageTitle?: boolean;
}) {
  const Heading = asPageTitle ? "h1" : "h2";
  const isArabic = lang === "ar";

  return (
    <section
      lang={isArabic ? "ar-TN" : "fr-TN"}
      dir={isArabic ? "rtl" : "ltr"}
      className={cn(
        "flex flex-col items-start rounded-[var(--radius-card)] border border-line bg-white/90 p-6 text-start shadow-soft sm:p-8",
        // Arabic text uses the Arabic font first (this page's <html> is in French)
        isArabic && "[font-family:var(--font-arabic),var(--font-latin),system-ui,sans-serif]",
      )}
    >
      <p className="text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal">{code}</p>
      <Heading className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl rtl:tracking-normal">{title}</Heading>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-muted">{text}</p>
      <Link href={href} hrefLang={isArabic ? "ar-TN" : "fr-TN"} className={buttonStyles({ className: "mt-6" })}>
        {cta}
      </Link>
    </section>
  );
}
