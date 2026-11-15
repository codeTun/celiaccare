import { LayoutGrid } from "lucide-react";
import Link from "next/link";

import { hrefWithParams } from "@/components/directory/search-params";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { ProducersDict } from "@/i18n/resources/fr/producers";
import { cn } from "@/lib/utils";
import { PRODUCER_TYPES, type Locale, type ProducerType } from "@/types";

import { PRODUCER_TYPE_ICONS } from "./producer-type-icons";

/**
 * The 5 kinds of small businesses (spec 5.1) as a row of chips:
 * pâtisseries & boulangeries, épiceries, boutiques spécialisées, fait maison, coopératives.
 * Each chip is a link that keeps the other filters (search, governorate, guarantee).
 */
export function ProducerTypeChips({
  locale,
  current,
  otherFilters,
  common,
  dict,
}: {
  locale: Locale;
  /** The chosen type ("" = all) */
  current: ProducerType | "";
  /** The other filters of the URL, kept in every link */
  otherFilters: Record<string, string>;
  common: CommonDict;
  dict: ProducersDict;
}) {
  const listPath = localePath(locale, "/artisans");
  const chips: { value: ProducerType | ""; label: string; Icon: typeof LayoutGrid }[] = [
    { value: "", label: dict.types.all, Icon: LayoutGrid },
    ...PRODUCER_TYPES.map((type) => ({ value: type, label: common.producerTypes[type], Icon: PRODUCER_TYPE_ICONS[type] })),
  ];

  return (
    <nav aria-label={dict.types.label} className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
        {chips.map(({ value, label, Icon }) => {
          const active = value === current;
          return (
            <li key={value || "all"}>
              <Link
                href={hrefWithParams(listPath, { ...otherFilters, type: value })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                    : "border-line-strong bg-white text-ink-muted hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
