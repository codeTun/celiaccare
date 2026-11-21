import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { formatDinars } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TopItemDTO } from "@/types";

import { formatCount } from "./chart-theme";

/* ==========================================================================
   Server-rendered pieces around the dashboard charts: the hidden data tables
   (screen readers), legends, ranked bars, the period switch and skeletons.
   ========================================================================== */

/**
 * The numbers of a chart as a table that only screen readers see (the chart itself is aria-hidden).
 *
 * @example
 * <ChartDataTable caption="Chiffre d'affaires par jour" headers={["Jour", "Chiffre d'affaires", "Commandes"]}
 *   rows={series.map((p) => [p.label, formatDinars(p.revenue), p.orders])} />
 */
export function ChartDataTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} scope="col">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) =>
              cellIndex === 0 ? (
                <th key={cellIndex} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={cellIndex}>{cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export type LegendItem = {
  label: string;
  color: string;
  /** Already formatted main value ("1 234 DT", "42"). */
  value: string;
  /** Small text under the label ("120 commandes", "35 %"). */
  detail?: string;
  /** Makes the row a link (e.g. to the filtered list). */
  href?: string;
};

/** Legend of a donut: color dot, label, value — readable text for everyone (the donut is aria-hidden). */
export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn("divide-y divide-line", className)}>
      {items.map((item) => {
        const content = (
          <>
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{item.label}</span>
              {item.detail ? <span className="block text-xs text-ink-subtle">{item.detail}</span> : null}
            </span>
            <span className="text-sm font-semibold text-ink tabular">{item.value}</span>
          </>
        );
        return (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-brand-50/60">
                {content}
              </Link>
            ) : (
              <div className="flex items-center gap-3 py-2">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Best sellers as a ranked list: name, revenue, quantity and a bar proportional to the quantity.
 * Easier to read than a chart for 5 items, and fully accessible as text.
 */
export function RankedBars({
  items,
  tone = "brand",
  emptyText,
}: {
  items: TopItemDTO[];
  tone?: "brand" | "saffron";
  emptyText: string;
}) {
  if (items.length === 0) return <p className="py-6 text-center text-sm text-ink-muted">{emptyText}</p>;
  const maxQuantity = Math.max(1, ...items.map((item) => item.quantity));
  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li key={`${item.name}-${index}`} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
          <span
            className={cn(
              "grid size-6 place-items-center rounded-full text-xs font-bold tabular",
              index === 0 ? "bg-saffron-100 text-saffron-700" : "bg-canvas text-ink-muted ring-1 ring-line",
            )}
          >
            {index + 1}
          </span>
          <span className="truncate text-sm font-semibold text-ink" title={item.name}>
            {item.name}
          </span>
          <span className="text-sm font-semibold text-ink tabular">{formatDinars(item.revenue)}</span>
          <span aria-hidden="true" />
          <span className="h-2 overflow-hidden rounded-full bg-canvas ring-1 ring-line/60" aria-hidden="true">
            <span
              className={cn("block h-full rounded-full", tone === "saffron" ? "bg-saffron-400" : "bg-brand-500")}
              style={{ width: `${Math.max(4, Math.round((item.quantity / maxQuantity) * 100))}%` }}
            />
          </span>
          <span className="text-xs text-ink-muted tabular">
            {formatCount(item.quantity)} vendu{item.quantity > 1 ? "s" : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

export type DashboardPeriod = "30j" | "12m";

/** "30 jours | 12 mois" switch of the revenue chart (links: ?periode=12m, no JavaScript needed). */
export function PeriodToggle({ current }: { current: DashboardPeriod }) {
  const options: { value: DashboardPeriod; label: string; href: string }[] = [
    { value: "30j", label: "30 jours", href: "/admin" },
    { value: "12m", label: "12 mois", href: "/admin?periode=12m" },
  ];
  return (
    <nav aria-label="Période du graphique" className="inline-flex rounded-full bg-canvas p-1 ring-1 ring-line">
      {options.map((option) => {
        const active = option.value === current;
        return (
          <Link
            key={option.value}
            href={option.href}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              active ? "bg-white text-brand-800 shadow-sm ring-1 ring-line" : "text-ink-muted hover:text-ink",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

/* --------------------------------------------------------------------------
   Skeletons (Suspense fallbacks of the dashboard)
   -------------------------------------------------------------------------- */

export function KpiGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      <span className="sr-only" role="status">
        Chargement des chiffres…
      </span>
      {/* Same layout as the dashboard key figures: the 2nd and the last cards are 2 columns wide on xl. */}
      {Array.from({ length: 10 }, (_, index) => (
        <div
          key={index}
          className={cn(
            "rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft",
            (index === 1 || index === 9) && "xl:col-span-2",
          )}
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="size-10 rounded-xl" />
          </div>
          <Skeleton className="mt-3 h-8 w-28" />
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

/** A dashboard card with a title and a chart-sized block. */
export function ChartCardSkeleton({ className, chartClassName = "h-72" }: { className?: string; chartClassName?: string }) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-line bg-white shadow-soft", className)} aria-busy="true">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-2 h-3 w-64 max-w-full" />
      </div>
      <div className="px-5 py-5 sm:px-6">
        <Skeleton className={cn("w-full", chartClassName)} />
      </div>
    </div>
  );
}
