import { ChevronRight, House } from "lucide-react";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { Locale } from "@/types";

/** One step of the breadcrumb trail. */
export type BreadcrumbItem = {
  /** Visible text, e.g. "Produits" (already translated) */
  label: string;
  /** Path WITHOUT the language, e.g. "/produits" — the current language is added automatically */
  href: string;
};

export type BreadcrumbsProps = {
  /** Language of the page */
  lang: Locale;
  /**
   * The steps AFTER the home page, in order. The last one is the current page:
   * it is shown as plain text (not a link) but its `href` is used by Google.
   * Example: [{ label: "Produits", href: "/produits" }, { label: "Couscous", href: "/produits/couscous" }]
   */
  items: BreadcrumbItem[];
  className?: string;
};

/**
 * Breadcrumb trail "Accueil › Produits › Couscous de maïs" (the home step is added
 * automatically), with its BreadcrumbList structured data for Google.
 * Server Component. Already included in <PageHero breadcrumbs={...}>.
 */
export function Breadcrumbs({ lang, items, className }: BreadcrumbsProps) {
  const { common } = getDictionary(lang);
  const trail: BreadcrumbItem[] = [{ label: common.nav.home, href: "/" }, ...items];

  return (
    <>
      <nav aria-label={common.nav.breadcrumb} className={className}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
          {trail.map((item, index) => {
            const isHome = index === 0;
            const isCurrentPage = index === trail.length - 1;
            return (
              <li key={`${index}-${item.href}`} className="flex min-w-0 items-center gap-1.5">
                {isHome ? null : (
                  <ChevronRight className="size-3.5 shrink-0 text-ink-subtle rtl:rotate-180" aria-hidden="true" />
                )}
                {isCurrentPage ? (
                  <span aria-current="page" className="max-w-[16rem] truncate font-semibold text-ink sm:max-w-md">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={localePath(lang, item.href)}
                    className="inline-flex items-center gap-1.5 rounded-md text-ink-muted underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
                  >
                    {isHome ? <House className="size-3.5 shrink-0" aria-hidden="true" /> : null}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={breadcrumbJsonLd(trail.map((item) => ({ name: item.label, path: localePath(lang, item.href) })))}
      />
    </>
  );
}
