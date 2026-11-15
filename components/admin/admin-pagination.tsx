import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

import type { AdminQuery } from "./query-string";

const numberFormat = new Intl.NumberFormat("fr-TN", { numberingSystem: "latn" });

/**
 * "21–40 sur 134" + numbered page links (French labels). Hidden pages keep the filters.
 * Accepts the fields of a Paginated<T> result, so you can spread it.
 *
 * @example
 * const products = await getAdminProducts(filters); // Paginated<...>
 * <AdminPagination basePath="/admin/produits" query={query} {...products} />
 */
export function AdminPagination({
  page,
  pageCount,
  total,
  pageSize,
  basePath,
  query,
  className,
}: {
  page: number;
  pageCount: number;
  /** Total number of rows (optional: shows the "x–y sur z" summary). */
  total?: number;
  pageSize?: number;
  basePath: string;
  query?: AdminQuery;
  className?: string;
}) {
  const showSummary = total != null && pageSize != null && total > 0;
  if (!showSummary && pageCount <= 1) return null;

  const from = showSummary ? (page - 1) * pageSize + 1 : 0;
  const to = showSummary ? Math.min(total, page * pageSize) : 0;

  return (
    <div className={cn("mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between", className)}>
      {showSummary ? (
        <p className="text-sm text-ink-muted tabular">
          {numberFormat.format(from)}–{numberFormat.format(to)} sur {numberFormat.format(total)}
        </p>
      ) : (
        <span />
      )}
      <Pagination
        page={page}
        pageCount={pageCount}
        basePath={basePath}
        query={query}
        labels={{ label: "Pagination", previous: "Page précédente", next: "Page suivante" }}
      />
    </div>
  );
}
