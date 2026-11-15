import { CalendarCheck, ChevronRight, FileText, LockKeyhole, Scale, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/container";
import { LEGAL_UPDATED_AT, legalNotice, privacyPolicy, termsOfUse } from "@/data/legal";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { getDictionary } from "@/i18n/server";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/types";

import { ArticleLayout, ArticleSections, tocFromSections } from "./article";
import { HelpCta } from "./help-cta";
import type { ContentSection } from "./types";

export type LegalPageKey = "notice" | "privacy" | "terms";

/** The three legal pages: their URL, their icon and their content (data/legal.ts). */
const legalPages: Record<LegalPageKey, { path: string; icon: LucideIcon; sections: Record<Locale, ContentSection[]> }> = {
  notice: { path: "/mentions-legales", icon: FileText, sections: legalNotice },
  privacy: { path: "/confidentialite", icon: LockKeyhole, sections: privacyPolicy },
  terms: { path: "/conditions", icon: Scale, sections: termsOfUse },
};

/** Metadata (title, description, canonical, hreflang) of a legal page. */
export function legalPageMetadata(lang: Locale, page: LegalPageKey) {
  const texts = getDictionary(lang).content.legal[page];
  return pageMetadata({
    locale: lang,
    path: legalPages[page].path,
    title: texts.title,
    description: texts.metaDescription,
  });
}

/**
 * A complete legal page: header, table of contents, numbered sections,
 * links to the two other legal pages and the contact band.
 * Used by /mentions-legales, /confidentialite and /conditions.
 */
export function LegalPage({ lang, page }: { lang: Locale; page: LegalPageKey }) {
  const { content } = getDictionary(lang);
  const texts = content.legal[page];
  const sections = legalPages[page].sections[lang];
  const otherPages = (Object.keys(legalPages) as LegalPageKey[]).filter((key) => key !== page);

  return (
    <>
      <PageHero
        lang={lang}
        align="center"
        breadcrumbs={[{ label: texts.title, href: legalPages[page].path }]}
        eyebrow={content.legal.eyebrow}
        title={texts.title}
        description={texts.description}
      >
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-ink-muted shadow-soft ring-1 ring-line">
          <CalendarCheck className="size-4 text-brand-600" aria-hidden="true" />
          {interpolate(content.shared.updatedOn, { date: formatDate(LEGAL_UPDATED_AT, lang) })}
        </p>
      </PageHero>

      <Container className="py-12 sm:py-16">
        <ArticleLayout tocTitle={content.shared.onThisPage} toc={tocFromSections(sections)}>
          <ArticleSections sections={sections} lang={lang} />

          {/* The two other legal pages */}
          <nav aria-labelledby="other-legal-pages" className="mt-16 max-w-3xl border-t border-line pt-10">
            <h2 id="other-legal-pages" className="text-lg font-bold text-ink">
              {content.legal.otherPages}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherPages.map((key) => {
                const Icon = legalPages[key].icon;
                return (
                  <li key={key}>
                    <Link
                      href={localePath(lang, legalPages[key].path)}
                      className="group flex h-full items-center gap-3.5 rounded-2xl border border-line bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink group-hover:text-brand-800">
                          {content.legal[key].title}
                        </span>
                        <span className="mt-0.5 block text-sm leading-snug text-ink-muted">
                          {content.legal[key].description}
                        </span>
                      </span>
                      <ChevronRight
                        className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </ArticleLayout>

        <HelpCta lang={lang} className="mt-16 sm:mt-20" />
      </Container>
    </>
  );
}
