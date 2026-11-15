import Link from "next/link";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { localePath } from "@/i18n/config";
import type { HomeDict } from "@/i18n/resources/fr/home";
import { getCategoryIcon } from "@/lib/icons";
import { pluralize } from "@/lib/utils";
import type { CategoryDTO, Locale } from "@/types";

/**
 * Category tiles (one distinct icon per category, spec §6.3) linking to the filtered catalogue.
 * Only categories that contain products are shown; the section disappears when there are none.
 * Phones: a row that scrolls sideways. Larger screens: a grid.
 */
export function CategoriesSection({
  lang,
  home,
  categories,
}: {
  lang: Locale;
  home: HomeDict;
  categories: CategoryDTO[];
}) {
  const visible = categories.filter((category) => category.productCount > 0);
  if (visible.length === 0) return null;

  const productsHref = localePath(lang, "/produits");

  return (
    <section>
      <Container>
        <SectionHeading
          eyebrow={home.categories.eyebrow}
          title={home.categories.title}
          description={home.categories.description}
          action={{ href: productsHref, label: home.categories.seeAll }}
        />
        <ul className="-mx-4 mt-8 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 py-1 scrollbar-none sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-6">
          {visible.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            return (
              <li key={category.id} className="w-36 shrink-0 snap-start sm:w-auto">
                <Link
                  href={`${productsHref}?categorie=${encodeURIComponent(category.slug)}`}
                  className="group flex h-full flex-col items-center rounded-[var(--radius-card)] border border-line bg-white px-3 py-5 text-center transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift sm:px-4"
                >
                  <span
                    aria-hidden="true"
                    className="arch grid h-16 w-13 place-items-center bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600"
                  >
                    <Icon className="size-6" strokeWidth={1.7} />
                  </span>
                  <span className="mt-3 text-sm leading-snug font-bold text-ink">{category.name}</span>
                  <span className="mt-1 text-xs text-ink-subtle">
                    {pluralize(lang, category.productCount, home.categories.productCount)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
