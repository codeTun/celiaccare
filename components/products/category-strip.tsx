import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type CategoryStripItem = {
  href: string;
  label: string;
  /** Number of products in the category */
  count?: number;
  icon: ReactNode;
  active: boolean;
};

/**
 * Quick navigation between the categories, at the top of the catalogue: one row of chips
 * that scrolls sideways on phones and wraps on large screens. Server Component.
 */
export function CategoryStrip({ items, label, className }: { items: CategoryStripItem[]; label: string; className?: string }) {
  if (items.length <= 1) return null;
  return (
    <nav aria-label={label} className={cn("-mx-4 sm:-mx-6 lg:mx-0", className)}>
      <ul className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-1 sm:px-6 lg:flex-wrap lg:overflow-visible lg:px-0">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              scroll={false}
              aria-current={item.active ? "true" : undefined}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border ps-2 pe-4 text-sm font-semibold whitespace-nowrap transition-colors",
                item.active
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                  : "border-line bg-white text-ink-muted hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800",
              )}
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full [&_svg]:size-4",
                  item.active ? "bg-white/15 text-white" : "bg-brand-50 text-brand-700",
                )}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              {item.label}
              {item.count !== undefined ? (
                <span className={cn("tabular text-xs font-medium", item.active ? "text-brand-100" : "text-ink-subtle")}>
                  {item.count}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
