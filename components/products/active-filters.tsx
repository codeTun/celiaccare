import { X } from "lucide-react";
import Link from "next/link";

import { interpolate } from "@/i18n/interpolate";
import type { ProductsDict } from "@/i18n/resources/fr/products";
import { cn } from "@/lib/utils";
import type { GuaranteeLevel, Locale, ProductFilters } from "@/types";

import { catalogHref } from "./catalog-params";

export type ActiveFilterChip = {
  key: string;
  label: string;
  /** The catalogue without this filter */
  href: string;
  tone?: "brand" | "red";
};

/**
 * The filters in use, as removable chips, and a "Tout effacer" link.
 * Server Component: each chip is a plain link (works without JavaScript).
 */
export function ActiveFilters({
  chips,
  clearHref,
  labels,
  className,
}: {
  chips: ActiveFilterChip[];
  clearHref: string;
  labels: Pick<ProductsDict["filters"], "activeTitle" | "remove" | "clearAll">;
  className?: string;
}) {
  if (chips.length === 0) return null;
  return (
    <div className={className}>
      <p className="sr-only">{labels.activeTitle}</p>
      <ul className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <li key={chip.key}>
            <Link
              href={chip.href}
              scroll={false}
              aria-label={interpolate(labels.remove, { label: chip.label })}
              className={cn(
                "inline-flex min-h-8 items-center gap-1.5 rounded-full ps-3 pe-2 text-sm font-medium ring-1 transition-colors",
                chip.tone === "red"
                  ? "bg-red-50 text-red-700 ring-red-200 hover:bg-red-100"
                  : "bg-brand-50 text-brand-900 ring-brand-200 hover:bg-brand-100",
              )}
            >
              {chip.label}
              <X className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={clearHref}
            scroll={false}
            className="ms-1 text-sm font-semibold text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline"
          >
            {labels.clearAll}
          </Link>
        </li>
      </ul>
    </div>
  );
}

/** Builds the chips of the active filters (with the names of categories, ingredients and artisan). */
export function activeFilterChips({
  locale,
  filters,
  names,
  labels,
  guaranteeLabels,
}: {
  locale: Locale;
  filters: ProductFilters;
  names: { categories: Map<string, string>; ingredients: Map<string, string>; producers: Map<string, string> };
  labels: ProductsDict["filters"];
  guaranteeLabels: Record<GuaranteeLevel, string>;
}): ActiveFilterChip[] {
  // The catalogue with one filter changed, back on page 1.
  const hrefWith = (changes: Partial<ProductFilters>) => catalogHref(locale, { ...filters, ...changes, page: undefined });
  const ingredientName = (slug: string) => names.ingredients.get(slug) ?? slug;
  const chips: ActiveFilterChip[] = [];

  if (filters.q) {
    chips.push({ key: "q", label: interpolate(labels.chipSearch, { value: filters.q }), href: hrefWith({ q: undefined }) });
  }
  if (filters.category) {
    chips.push({
      key: "categorie",
      label: names.categories.get(filters.category) ?? filters.category,
      href: hrefWith({ category: undefined }),
    });
  }
  for (const slug of filters.ingredients ?? []) {
    chips.push({
      key: `ingredient-${slug}`,
      label: interpolate(labels.chipContains, { name: ingredientName(slug) }),
      href: hrefWith({ ingredients: filters.ingredients?.filter((other) => other !== slug) }),
    });
  }
  for (const slug of filters.exclude ?? []) {
    chips.push({
      key: `sans-${slug}`,
      tone: "red",
      label: interpolate(labels.chipExclude, { name: lowerFirstLetter(ingredientName(slug), locale) }),
      href: hrefWith({ exclude: filters.exclude?.filter((other) => other !== slug) }),
    });
  }
  if (filters.guarantee) {
    chips.push({ key: "garantie", label: guaranteeLabels[filters.guarantee], href: hrefWith({ guarantee: undefined }) });
  }
  if (filters.minPrice || filters.maxPrice) {
    const amount = new Intl.NumberFormat(locale === "ar" ? "ar-TN" : "fr-TN", {
      maximumFractionDigits: 3,
      numberingSystem: "latn",
    });
    const min = filters.minPrice ? amount.format(filters.minPrice / 1000) : null;
    const max = filters.maxPrice ? amount.format(filters.maxPrice / 1000) : null;
    const label =
      min && max
        ? interpolate(labels.chipPriceRange, { min, max })
        : min
          ? interpolate(labels.chipPriceMin, { min })
          : interpolate(labels.chipPriceMax, { max: max ?? "" });
    chips.push({ key: "prix", label, href: hrefWith({ minPrice: undefined, maxPrice: undefined }) });
  }
  if (filters.producer) {
    chips.push({
      key: "artisan",
      label: interpolate(labels.chipProducer, { name: names.producers.get(filters.producer) ?? filters.producer }),
      href: hrefWith({ producer: undefined }),
    });
  }
  return chips;
}

/** "Œufs" -> "œufs", for "Sans œufs" (Arabic has no capital letters: unchanged). */
function lowerFirstLetter(text: string, locale: Locale) {
  return text.charAt(0).toLocaleLowerCase(locale) + text.slice(1);
}
