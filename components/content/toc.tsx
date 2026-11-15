import { ChevronDown, ListOrdered } from "lucide-react";

import { TocLinks, type TocItem } from "./toc-links";

export type { TocItem };

/**
 * Table of contents of a long page ("Sur cette page").
 * - variant "sidebar": the list shown beside the article on large screens (highlights the current section);
 * - variant "inline": a box that opens and closes, shown above the article on phones and tablets.
 */
export function Toc({
  title,
  items,
  variant,
  className,
}: {
  title: string;
  items: TocItem[];
  variant: "sidebar" | "inline";
  className?: string;
}) {
  if (variant === "sidebar") {
    return (
      <nav aria-label={title} className={className}>
        <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-ink uppercase rtl:tracking-normal">
          <ListOrdered className="size-4 text-brand-600" aria-hidden="true" />
          {title}
        </p>
        <TocLinks items={items} />
      </nav>
    );
  }

  return (
    <nav aria-label={title} className={className}>
      <details className="group rounded-2xl border border-line bg-white shadow-soft">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-ink select-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2.5">
            <ListOrdered className="size-[18px] text-brand-600" aria-hidden="true" />
            {title}
          </span>
          <ChevronDown
            className="size-4 text-ink-subtle transition-transform group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </summary>
        <ol className="space-y-1 border-t border-line px-5 py-4">
          {items.map((item, index) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="flex gap-3 rounded-lg py-1.5 text-[15px] leading-snug text-ink-muted transition-colors hover:text-brand-700"
              >
                <span className="w-5 shrink-0 text-sm font-bold text-brand-600 tabular">{index + 1}.</span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
