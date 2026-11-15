import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { lang as getLang } from "next/root-params";

import { LogoEmblem } from "@/components/logo";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { defaultLocale, isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import type { Locale } from "@/types";

/**
 * Localized "page not found" (404), shown inside the site layout when a page
 * calls notFound() or when the URL matches no page (see [...rest]/page.tsx).
 * Not-found files cannot receive params: the language comes from next/root-params.
 */

async function currentLocale(): Promise<Locale> {
  const lang = await getLang();
  return isLocale(lang) ? lang : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const { common } = getDictionary(await currentLocale());
  return { title: common.states.notFoundTitle, robots: { index: false, follow: true } };
}

export default async function NotFound() {
  const lang = await currentLocale();
  const { common } = getDictionary(lang);
  const suggestions = [
    { label: common.nav.restaurants, href: localePath(lang, "/restaurants") },
    { label: common.nav.producers, href: localePath(lang, "/artisans") },
    { label: common.nav.guide, href: localePath(lang, "/guide-sans-gluten") },
    { label: common.nav.contact, href: localePath(lang, "/contact") },
  ];

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-khatam [mask-image:radial-gradient(ellipse_at_top,#000_25%,transparent_70%)]"
      />
      <Container className="flex flex-col items-center py-16 text-center sm:py-24">
        {/* "4 [door] 4": the doorway of the logo plays the zero */}
        <div aria-hidden="true" dir="ltr" className="flex items-end justify-center gap-1 sm:gap-2">
          <span className="text-[6.5rem] leading-[0.8] font-extrabold text-brand-100 sm:text-[9rem]">4</span>
          <LogoEmblem className="size-24 sm:size-32" />
          <span className="text-[6.5rem] leading-[0.8] font-extrabold text-brand-100 sm:text-[9rem]">4</span>
        </div>

        <p className="mt-10 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal">
          {common.states.notFoundCode}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">{common.states.notFoundTitle}</h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
          {common.states.notFoundText}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={localePath(lang)} className={buttonStyles({ size: "lg" })}>
            {common.states.backHome}
          </Link>
          <Link href={localePath(lang, "/produits")} className={buttonStyles({ variant: "outline", size: "lg" })}>
            {common.nav.products}
            <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 w-full max-w-xl border-t border-line pt-8">
          <p className="text-sm font-semibold text-ink">{common.states.notFoundHint}</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {suggestions.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink-muted transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
