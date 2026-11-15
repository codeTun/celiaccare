import { ChefHat, Package, Store, Truck, type LucideIcon } from "lucide-react";

import type { HomeDict } from "@/i18n/resources/fr/home";
import { cn, formatCount } from "@/lib/utils";
import type { Locale, SiteStatsDTO } from "@/types";

/** True when at least one key figure is above 0 (false while the catalogue is empty). */
export function hasSiteStats(stats: SiteStatsDTO) {
  return stats.products + stats.producers + stats.partnerRestaurants + stats.cities > 0;
}

/**
 * Key figures of CeliacCare (from getSiteStats): products, artisans, partner restaurants
 * and governorates we deliver to. Figures equal to 0 are left out, and nothing is shown at all
 * while the catalogue is empty.
 * - tone "light": white cards (on white or canvas backgrounds)
 * - tone "dark": white text, for dark green blocks
 */
export function SiteStats({
  stats,
  labels,
  locale,
  tone = "light",
  className,
}: {
  stats: SiteStatsDTO;
  labels: HomeDict["stats"];
  locale: Locale;
  tone?: "light" | "dark";
  className?: string;
}) {
  const figures: { value: number; label: string; icon: LucideIcon }[] = [
    { value: stats.products, label: labels.products, icon: Package },
    { value: stats.producers, label: labels.producers, icon: Store },
    { value: stats.partnerRestaurants, label: labels.partnerRestaurants, icon: ChefHat },
    { value: stats.cities, label: labels.governorates, icon: Truck },
  ].filter((figure) => figure.value > 0);

  if (figures.length === 0) return null;

  const dark = tone === "dark";
  return (
    <dl className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4", className)}>
      {figures.map(({ value, label, icon: Icon }) => (
        // dt (label) comes before dd (number) in the HTML; flex-col-reverse shows the number on top
        <div
          key={label}
          className={cn(
            "relative flex flex-col-reverse justify-center rounded-2xl py-4 ps-[4.25rem] pe-3 sm:py-5 sm:ps-[4.75rem] sm:pe-4",
            dark ? "bg-white/[0.07] ring-1 ring-white/10" : "border border-line bg-white shadow-soft",
          )}
        >
          <dt className={cn("text-xs leading-snug sm:text-sm", dark ? "text-brand-100" : "text-ink-muted")}>
            <span
              aria-hidden="true"
              className={cn(
                "absolute start-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full sm:start-5 sm:size-11",
                dark ? "bg-white/10 text-brand-200" : "bg-brand-50 text-brand-700",
              )}
            >
              <Icon className="size-5" />
            </span>
            {label}
          </dt>
          <dd className={cn("tabular text-2xl leading-tight font-extrabold sm:text-3xl", dark ? "text-white" : "text-ink")}>
            {formatCount(locale, value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
