import { LayoutGrid, SearchX, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/cards/product-card";
import { Container } from "@/components/ui/container";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { Dictionary } from "@/i18n/server";
import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  GUARANTEE_LEVELS,
  type CategoryDTO,
  type IngredientDTO,
  type Locale,
  type Paginated,
  type ProductCardDTO,
  type ProductFilters,
  type ProductSort,
} from "@/types";

import { ActiveFilters, activeFilterChips } from "./active-filters";
import { CatalogFilterForm, type CatalogFilterOptions, type CatalogFilterValues } from "./catalog-filter-form";
import { catalogHref, catalogQuery, countActiveFilters, GUARANTEE_PARAM, millimesToDinars, SORT_PARAM } from "./catalog-params";
import { CatalogSort } from "./catalog-sort";
import { CategoryStrip, type CategoryStripItem } from "./category-strip";
import { MobileFilters } from "./mobile-filters";
import { pluralize } from "./plural";

export type CatalogViewProps = {
  locale: Locale;
  /** Filters of the URL, already checked (unknown categories, ingredients... removed) */
  filters: ProductFilters;
  /** The products of the current page */
  result: Paginated<ProductCardDTO>;
  categories: CategoryDTO[];
  ingredients: IngredientDTO[];
  /** Cheapest and most expensive product, in millimes ({ 0, 0 } when the catalogue is empty) */
  priceRange: { min: number; max: number };
  /** Names of the artisans (only needed when the URL has ?artisan=) */
  producers: { slug: string; name: string }[];
  dict: Pick<Dictionary, "common" | "products">;
};

/**
 * The catalogue under the page header: category chips, filters (sidebar on large screens,
 * bottom sheet on phones), result count, sort, active filters, product grid and pagination.
 * Server Component; the data comes from the page.
 */
export function CatalogView({ locale, filters, result, categories, ingredients, priceRange, producers, dict }: CatalogViewProps) {
  const { common, products } = dict;
  const action = localePath(locale, "/produits");
  const query = catalogQuery(filters);
  const activeCount = countActiveFilters(filters);
  // "Tout effacer" keeps the chosen order.
  const resetHref = catalogHref(locale, { sort: filters.sort });

  // Categories with products (and the chosen one, even if it became empty).
  const shownCategories = categories.filter((category) => category.productCount > 0 || category.slug === filters.category);

  const values: CatalogFilterValues = {
    q: filters.q ?? "",
    categorie: filters.category ?? "",
    ingredients: filters.ingredients ?? [],
    sans: filters.exclude ?? [],
    garantie: filters.guarantee ? GUARANTEE_PARAM[filters.guarantee] : "",
    prixMin: filters.minPrice ? millimesToDinars(filters.minPrice) : "",
    prixMax: filters.maxPrice ? millimesToDinars(filters.maxPrice) : "",
    artisan: filters.producer ?? "",
    tri: query.tri ?? "",
  };

  const options: CatalogFilterOptions = {
    categories: shownCategories.map((category) => {
      const Icon = getCategoryIcon(category.icon);
      return { value: category.slug, label: category.name, count: category.productCount, icon: <Icon aria-hidden="true" /> };
    }),
    guarantees: GUARANTEE_LEVELS.map((level) => ({ value: GUARANTEE_PARAM[level], label: common.guarantee[level].label, level })),
    allergens: ingredients
      .filter((ingredient) => ingredient.isAllergen)
      .map((ingredient) => ({ value: ingredient.slug, label: ingredient.name })),
    // the ingredients already chosen come first
    ingredients: [...ingredients]
      .sort((a, b) => Number(values.ingredients.includes(b.slug)) - Number(values.ingredients.includes(a.slug)))
      .map((ingredient) => ({ value: ingredient.slug, label: ingredient.name })),
    priceRange: {
      min: priceRange.max > 0 ? String(Math.floor(priceRange.min / 1000)) : "",
      max: priceRange.max > 0 ? String(Math.ceil(priceRange.max / 1000)) : "",
    },
  };

  const stripItems: CategoryStripItem[] = [
    {
      href: catalogHref(locale, { ...filters, category: undefined, page: undefined }),
      label: products.catalog.allProducts,
      icon: <LayoutGrid aria-hidden="true" />,
      active: !filters.category,
    },
    ...shownCategories.map((category) => {
      const Icon = getCategoryIcon(category.icon);
      return {
        href: catalogHref(locale, { ...filters, category: category.slug, page: undefined }),
        label: category.name,
        count: category.productCount,
        icon: <Icon aria-hidden="true" />,
        active: filters.category === category.slug,
      };
    }),
  ];

  const chips = activeFilterChips({
    locale,
    filters,
    names: {
      categories: new Map(categories.map((category) => [category.slug, category.name])),
      ingredients: new Map(ingredients.map((ingredient) => [ingredient.slug, ingredient.name])),
      producers: new Map(producers.map((producer) => [producer.slug, producer.name])),
    },
    labels: products.filters,
    guaranteeLabels: {
      CERTIFIED: common.guarantee.CERTIFIED.label,
      NATURALLY_GF: common.guarantee.NATURALLY_GF.label,
      TRACES_RISK: common.guarantee.TRACES_RISK.label,
    },
  });

  const sortOptions = (Object.keys(SORT_PARAM) as ProductSort[]).map((sort) => ({
    value: sort === "new" ? "" : SORT_PARAM[sort],
    label: products.catalog.sorts[sort],
  }));

  const countText = pluralize(locale, result.total, products.catalog.count);
  const pageText =
    result.pageCount > 1 ? interpolate(products.catalog.pageOf, { page: result.page, count: result.pageCount }) : null;

  return (
    <Container className="py-8 sm:py-10">
      <CategoryStrip items={stripItems} label={products.catalog.categoriesLabel} />

      {/* "group/catalog": the results fade while a filter form loads new results (data-pending) */}
      <div className="group/catalog mt-6 lg:mt-8 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-start lg:gap-10 xl:gap-12">
        <aside
          aria-labelledby="catalog-filters-title"
          className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pe-3 lg:pb-6"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 id="catalog-filters-title" className="flex items-center gap-2 text-base font-bold text-ink">
              <SlidersHorizontal className="size-4 text-brand-600" aria-hidden="true" />
              {products.filters.title}
            </h2>
            {activeCount > 0 ? (
              <Link
                href={resetHref}
                scroll={false}
                className="text-sm font-semibold text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline"
              >
                {products.filters.clearAll}
              </Link>
            ) : null}
          </div>
          <CatalogFilterForm
            id="catalog-filters"
            action={action}
            values={values}
            options={options}
            labels={products.filters}
            autoSubmit
          />
        </aside>

        <section id="catalog-results" aria-labelledby="catalog-results-title" className="min-w-0 scroll-mt-24">
          <h2 id="catalog-results-title" className="sr-only">
            {products.catalog.resultsTitle}
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MobileFilters
                action={action}
                values={values}
                options={options}
                labels={products.filters}
                activeCount={activeCount}
                resetHref={resetHref}
              />
              <p className="text-sm text-ink-muted" role="status">
                <strong className="font-bold text-ink">{countText}</strong>
                {pageText ? <span className="max-sm:hidden"> · {pageText}</span> : null}
              </p>
            </div>
            {result.total > 1 ? (
              <CatalogSort
                action={action}
                query={query}
                value={values.tri}
                options={sortOptions}
                label={products.catalog.sortLabel}
                submitLabel={products.catalog.sortSubmit}
              />
            ) : null}
          </div>

          <ActiveFilters chips={chips} clearHref={resetHref} labels={products.filters} className="mt-4" />
          {filters.q && result.items.length > 0 ? (
            <SearchElsewhere locale={locale} q={filters.q} labels={products.catalog} className="mt-3" />
          ) : null}

          <div className="mt-6 transition-opacity duration-200 group-has-[form[data-pending]]/catalog:opacity-50">
            {result.items.length > 0 ? (
              <ul role="list" className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {result.items.map((product, index) => (
                  <li key={product.id} className="flex">
                    <ProductCard product={product} locale={locale} common={common} preloadImage={index < 2} className="w-full" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<SearchX aria-hidden="true" />}
                title={activeCount > 0 ? products.catalog.noResultsTitle : products.catalog.emptyTitle}
                description={activeCount > 0 ? products.catalog.noResultsText : products.catalog.emptyText}
                action={
                  <div className="flex flex-col items-center gap-5">
                    <div className="flex flex-wrap justify-center gap-3">
                      {activeCount > 0 ? (
                        <Link href={resetHref} className={buttonStyles()}>
                          {products.catalog.clearFilters}
                        </Link>
                      ) : null}
                      <Link
                        href={localePath(locale, "/contact?sujet=SUGGESTION")}
                        className={buttonStyles({ variant: activeCount > 0 ? "outline" : "primary" })}
                      >
                        {products.catalog.suggest}
                      </Link>
                    </div>
                    {filters.q ? (
                      <SearchElsewhere locale={locale} q={filters.q} labels={products.catalog} className="justify-center" />
                    ) : null}
                  </div>
                }
              />
            )}

            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              basePath={action}
              query={query}
              labels={{ label: common.pagination.label, previous: common.actions.previous, next: common.actions.next }}
              className="mt-10"
            />
          </div>
        </section>
      </div>
    </Container>
  );
}

/**
 * The search box only searches products: these links run the same search in the restaurants
 * and artisans directories (they match names, towns and governorates, in French or Arabic).
 */
function SearchElsewhere({
  locale,
  q,
  labels,
  className,
}: {
  locale: Locale;
  q: string;
  labels: Dictionary["products"]["catalog"];
  className?: string;
}) {
  const links = [
    { path: "/restaurants", label: labels.searchRestaurants },
    { path: "/artisans", label: labels.searchProducers },
  ];
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-ink-muted", className)}>
      <span>{labels.searchElsewhere}</span>
      {links.map(({ path, label }) => (
        <Link
          key={path}
          href={`${localePath(locale, path)}?q=${encodeURIComponent(q)}`}
          className="font-semibold text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline"
        >
          {interpolate(label, { q })}
        </Link>
      ))}
    </p>
  );
}
