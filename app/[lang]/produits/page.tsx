import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lang as getLang } from "next/root-params";
import { Suspense } from "react";

import { PageHero } from "@/components/page-hero";
import { catalogHref, keepKnownFilters, parseCatalogParams } from "@/components/products/catalog-params";
import { CatalogSkeleton } from "@/components/products/catalog-skeleton";
import { CatalogView } from "@/components/products/catalog-view";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { getCategories } from "@/models/fetchers/categories";
import { getIngredients } from "@/models/fetchers/ingredients";
import { getProducers } from "@/models/fetchers/producers";
import { getPriceRange, getProducts } from "@/models/fetchers/products";
import { LISTED_GUARANTEE_LEVELS, type Locale } from "@/types";

/* ==========================================================================
   /fr/produits — the product catalogue (spec EF-01, EF-02, EF-04).
   The header is static; the filters and results depend on the URL
   (?categorie=...&sans=...) so they render inside <Suspense>.
   URL parameters: see components/products/catalog-params.ts.
   ========================================================================== */

/** 12 products per page: full rows with 2, 3 or 4 columns. */
const PAGE_SIZE = 12;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  if (!isLocale(lang)) notFound();
  const { products } = getDictionary(lang);
  // Filtered and paginated views all point to the plain catalogue (canonical URL):
  // searchParams are never read here.
  return pageMetadata({
    locale: lang,
    path: "/produits",
    title: products.meta.title,
    description: products.meta.description,
  });
}

export default async function ProductsPage({ searchParams }: PageProps<"/[lang]/produits">) {
  const lang = await getLang();
  if (!isLocale(lang)) notFound();
  const { common, products } = getDictionary(lang);

  return (
    <>
      <PageHero
        lang={lang}
        breadcrumbs={[{ label: common.nav.products, href: "/produits" }]}
        eyebrow={products.hero.eyebrow}
        title={products.hero.title}
        description={products.hero.description}
      >
        {/* The guarantee levels a listed business can have: a legend that is also a shortcut to filter by level */}
        <ul aria-label={products.hero.legendLabel} className="flex flex-wrap items-center gap-2">
          {LISTED_GUARANTEE_LEVELS.map((level) => (
            <li key={level}>
              <Link
                href={catalogHref(lang, { guarantee: level })}
                className="inline-flex rounded-full transition-transform hover:-translate-y-0.5"
              >
                <GuaranteeBadge level={level} label={common.guarantee[level].label} size="md" />
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={localePath(lang, "/guide-sans-gluten")}
              className="ms-1 text-sm font-semibold text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline"
            >
              {products.hero.legendLink}
            </Link>
          </li>
        </ul>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">{common.guarantee.policy}</p>
      </PageHero>

      <Suspense fallback={<CatalogSkeleton label={common.actions.loading} />}>
        <Catalog lang={lang} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

/** Reads the filters of the URL (hence inside <Suspense>) and loads the matching products. */
async function Catalog({
  lang,
  searchParams,
}: {
  lang: Locale;
  searchParams: PageProps<"/[lang]/produits">["searchParams"];
}) {
  const requested = parseCatalogParams(await searchParams);

  // Lists used by the filters (cached, shared by every visitor).
  const [categories, ingredients, priceRange, producers] = await Promise.all([
    getCategories(lang),
    getIngredients(lang),
    getPriceRange(),
    requested.producer ? getProducers(lang) : Promise.resolve([]),
  ]);

  const filters = keepKnownFilters(requested, {
    categories: categories.map((category) => category.slug),
    ingredients: ingredients.map((ingredient) => ingredient.slug),
    producers: producers.map((producer) => producer.slug),
  });
  const result = await getProducts(lang, filters, PAGE_SIZE);

  return (
    <CatalogView
      locale={lang}
      filters={filters}
      result={result}
      categories={categories}
      ingredients={ingredients}
      priceRange={priceRange}
      producers={producers}
      dict={getDictionary(lang)}
    />
  );
}
