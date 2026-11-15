import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AccordionItem = {
  /** Anchor of the item: /faq#paiement scrolls to it; <OpenDetailsFromHash>, rendered once by the page, opens it */
  id: string;
  title: ReactNode;
  content: ReactNode;
};

/**
 * List of questions that open and close (FAQ). Built on the native
 * <details>/<summary> elements: keyboard and screen-reader friendly, no JavaScript.
 */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  return (
    <div
      className={cn(
        "divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-soft",
        className,
      )}
    >
      {items.map((item) => (
        <details key={item.id} id={item.id} className="group scroll-mt-24 lg:scroll-mt-28">
          <summary
            className={cn(
              "flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-start text-[15px] font-semibold text-ink transition-colors select-none sm:px-6 sm:py-5 sm:text-base",
              "hover:bg-canvas/70 group-open:text-brand-800 [&::-webkit-details-marker]:hidden",
              "focus-visible:-outline-offset-2",
            )}
          >
            <span className="leading-snug">{item.title}</span>
            <span
              aria-hidden="true"
              className="mt-px grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform duration-200 group-open:rotate-180 group-open:bg-brand-600 group-open:text-white motion-reduce:transition-none"
            >
              <ChevronDown className="size-4" />
            </span>
          </summary>
          <div className="space-y-3 px-5 pb-5 text-[15px] leading-relaxed text-ink-muted sm:px-6 sm:pb-6">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
