import Link from "next/link";

import { cn } from "@/lib/utils";

import { adminHref, firstParam, type AdminQuery } from "./query-string";

export type FilterTab = {
  /** Value of the search param; "" = no filter ("Toutes"). */
  value: string;
  label: string;
  /** Optional number shown in a small pill. */
  count?: number;
};

/**
 * Row of pill links that filter a list through the URL (?status=PENDING...).
 * Other params are kept, the page goes back to 1. Scrolls horizontally on phones.
 *
 * @example
 * <FilterTabs
 *   basePath="/admin/commandes"
 *   query={query}
 *   tabs={[
 *     { value: "", label: "Toutes" },
 *     ...ORDER_STATUSES.map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status], count: counts[status] })),
 *   ]}
 * />
 */
export function FilterTabs({
  basePath,
  query,
  tabs,
  param = "status",
  label = "Filtrer la liste",
  className,
}: {
  basePath: string;
  query?: AdminQuery;
  tabs: FilterTab[];
  /** Name of the search param (default "status"). */
  param?: string;
  /** Accessible name of the group of links. */
  label?: string;
  className?: string;
}) {
  const current = firstParam(query?.[param]) ?? "";

  return (
    <nav aria-label={label} className={cn("-mx-1 overflow-x-auto scrollbar-none", className)}>
      <ul className="flex w-max gap-1.5 px-1 py-1">
        {tabs.map((tab) => {
          const active = tab.value === current;
          return (
            <li key={tab.value || "__all"}>
              <Link
                href={adminHref(basePath, query, { [param]: tab.value || null })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-white text-ink-muted ring-1 ring-line hover:bg-brand-50 hover:text-brand-800",
                )}
              >
                {tab.label}
                {tab.count != null ? (
                  <span
                    className={cn(
                      "min-w-6 rounded-full px-1.5 text-center text-xs tabular",
                      active ? "bg-white/20 text-white" : "bg-canvas text-ink-subtle",
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
