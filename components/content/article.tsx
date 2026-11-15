import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

import { ContentBlocks } from "./content-blocks";
import { Toc, type TocItem } from "./toc";
import type { ContentSection } from "./types";

/**
 * Two-column layout of long pages (guide, legal pages): the table of contents
 * on the side (sticky) on large screens, above the text on phones.
 */
export function ArticleLayout({
  tocTitle,
  toc,
  children,
}: {
  /** "Sur cette page" */
  tocTitle: string;
  toc: TocItem[];
  children: ReactNode;
}) {
  return (
    <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-20">
      <div className="hidden lg:block">
        <Toc
          variant="sidebar"
          title={tocTitle}
          items={toc}
          className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pb-6"
        />
      </div>
      <div className="min-w-0">
        <Toc variant="inline" title={tocTitle} items={toc} className="mb-10 lg:hidden" />
        {children}
      </div>
    </div>
  );
}

/** Table of contents entries for a list of sections. */
export function tocFromSections(sections: ContentSection[]): TocItem[] {
  return sections.map((section) => ({ id: section.id, label: section.title }));
}

/**
 * The sections of a long page: a numbered <h2> (anchor = section id) and its blocks,
 * with comfortable reading typography.
 */
export function ArticleSections({
  sections,
  lang,
  className,
}: {
  sections: ContentSection[];
  lang: Locale;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl space-y-14 text-[15px] leading-[1.8] text-ink-muted sm:text-base", className)}>
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-title`}
          className="scroll-mt-24 lg:scroll-mt-28"
        >
          <h2
            id={`${section.id}-title`}
            className="flex items-start gap-3.5 text-2xl leading-tight font-extrabold text-ink sm:text-[1.75rem]"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 grid h-8 min-w-8 shrink-0 place-items-center rounded-lg bg-brand-50 px-1.5 text-sm font-bold text-brand-700 ring-1 ring-brand-100 tabular sm:mt-1"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{section.title}</span>
          </h2>
          <div className="mt-6">
            <ContentBlocks blocks={section.blocks} lang={lang} />
          </div>
        </section>
      ))}
    </div>
  );
}

/** Approximate reading time of some sections, in minutes (all their texts, about 200 words per minute). */
export function readingMinutes(sections: ContentSection[]) {
  const words = JSON.stringify(sections).split(/\s+/).length; // rough count: every space-separated piece of text
  return Math.max(1, Math.round(words / 200));
}
