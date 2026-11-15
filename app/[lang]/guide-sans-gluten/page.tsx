import {
  ArrowRight,
  CalendarCheck,
  Clock,
  ShoppingBasket,
  Stethoscope,
  Store,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleLayout, ArticleSections, readingMinutes, tocFromSections } from "@/components/content/article";
import { HelpCta } from "@/components/content/help-cta";
import { InfoBox } from "@/components/content/info-box";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/container";
import { guide, GUIDE_UPDATED_AT } from "@/data/guide";
import { htmlLang, isLocale, localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { getDictionary } from "@/i18n/server";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl } from "@/lib/utils";
import type { Locale } from "@/types";

/**
 * Gluten-free guide (spec §5.7): coeliac disease, foods to avoid, Tunisian dishes,
 * cross-contamination, labels, eating out and our guarantee levels.
 * Content: data/guide.ts. Information only, never medical advice.
 */

const PATH = "/guide-sans-gluten";

export async function generateMetadata({ params }: PageProps<"/[lang]/guide-sans-gluten">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { content } = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: PATH,
    title: content.guide.metaTitle,
    description: content.guide.metaDescription,
    type: "article",
  });
}

export default async function GuidePage({ params }: PageProps<"/[lang]/guide-sans-gluten">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { common, content } = getDictionary(lang);
  const sections = guide[lang];

  // Where to go after reading: products, restaurants and artisans.
  const nextSteps: { href: string; icon: LucideIcon; texts: { title: string; text: string; cta: string } }[] = [
    { href: "/produits", icon: ShoppingBasket, texts: content.guide.next.products },
    { href: "/restaurants", icon: UtensilsCrossed, texts: content.guide.next.restaurants },
    { href: "/artisans", icon: Store, texts: content.guide.next.producers },
  ];

  return (
    <>
      <PageHero
        lang={lang}
        breadcrumbs={[{ label: common.nav.guide, href: PATH }]}
        eyebrow={content.guide.eyebrow}
        title={content.guide.title}
        description={content.guide.description}
      >
        <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <CalendarCheck className="size-4 text-brand-600" aria-hidden="true" />
            {interpolate(content.shared.updatedOn, { date: formatDate(GUIDE_UPDATED_AT, lang) })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-brand-600" aria-hidden="true" />
            {interpolate(content.shared.readingTime, { minutes: readingMinutes(sections) })}
          </span>
        </p>
      </PageHero>

      <Container className="py-12 sm:py-16">
        <ArticleLayout tocTitle={content.shared.onThisPage} toc={tocFromSections(sections)}>
          <article>
            {/* Medical disclaimer, before anything else */}
            <InfoBox tone="warning" icon={Stethoscope} title={content.guide.disclaimerTitle} className="mb-12 max-w-3xl">
              {content.guide.disclaimerText}
            </InfoBox>

            <ArticleSections sections={sections} lang={lang} />
          </article>

          <section aria-labelledby="guide-next-title" className="mt-16 max-w-3xl border-t border-line pt-12">
            <h2 id="guide-next-title" className="text-2xl font-extrabold text-ink sm:text-[1.75rem]">
              {content.guide.nextTitle}
            </h2>
            <p className="mt-2 text-base text-ink-muted">{content.guide.nextText}</p>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {nextSteps.map(({ href, icon: Icon, texts }) => (
                <li key={href}>
                  <Link
                    href={localePath(lang, href)}
                    className="group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="mt-4 font-bold text-ink group-hover:text-brand-800">{texts.title}</span>
                    <span className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted">{texts.text}</span>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                      {texts.cta}
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </ArticleLayout>

        <HelpCta lang={lang} className="mt-16 sm:mt-20" />
      </Container>

      <JsonLd data={articleJsonLd(lang, content.guide.title, content.guide.metaDescription, sections.map((s) => s.title))} />
    </>
  );
}

/** schema.org Article: helps Google show the guide as an article (title, date, publisher). */
function articleJsonLd(lang: Locale, title: string, description: string, sectionTitles: string[]) {
  const url = absoluteUrl(localePath(lang, PATH));
  const organization = {
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo-emblem.svg") },
  };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    image: [absoluteUrl(`${localePath(lang)}/opengraph-image`)],
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: htmlLang[lang],
    datePublished: GUIDE_UPDATED_AT,
    dateModified: GUIDE_UPDATED_AT,
    articleSection: sectionTitles,
    author: organization,
    publisher: organization,
  };
}
