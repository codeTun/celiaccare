import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageCount: number;
  /** Path of the list page, e.g. "/fr/produits" */
  basePath: string;
  /** The current filters, kept in the links (page is replaced). */
  query?: Record<string, string | string[] | undefined>;
  labels: { label: string; previous: string; next: string };
  className?: string;
};

function hrefFor(basePath: string, query: PaginationProps["query"], page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (key === "page" || value == null || value === "") continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Numbered pagination links (works without JavaScript, good for SEO). */
export function Pagination({ page, pageCount, basePath, query, labels, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );
  const item = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold transition-colors";
  return (
    <nav aria-label={labels.label} className={cn("flex items-center justify-center gap-1.5", className)}>
      {page > 1 ? (
        <Link href={hrefFor(basePath, query, page - 1)} rel="prev" className={cn(item, "text-ink-muted hover:bg-brand-50")}>
          <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          <span className="sr-only">{labels.previous}</span>
        </Link>
      ) : null}
      {pages.map((p, index) => (
        <span key={p} className="flex items-center gap-1.5">
          {index > 0 && p - pages[index - 1] > 1 ? <span className="px-1 text-ink-subtle">…</span> : null}
          <Link
            href={hrefFor(basePath, query, p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(item, p === page ? "bg-brand-600 text-white" : "text-ink-muted hover:bg-brand-50")}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pageCount ? (
        <Link href={hrefFor(basePath, query, page + 1)} rel="next" className={cn(item, "text-ink-muted hover:bg-brand-50")}>
          <span className="sr-only">{labels.next}</span>
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
