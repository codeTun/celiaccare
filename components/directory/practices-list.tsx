import { CircleCheck, CircleMinus } from "lucide-react";

import { cn } from "@/lib/utils";

/** One preparation practice and whether the place declared it. */
export type PracticeItem = { label: string; ok: boolean };

/**
 * Preparation practices of a sheet (spec 5.2: separate spaces or utensils, trained staff).
 * A green check = declared and verified; a grey dash = not declared.
 */
export function PracticesList({
  title,
  items,
  yesLabel,
  noLabel,
  noneText,
  className,
}: {
  title: string;
  items: PracticeItem[];
  /** Read by screen readers after a declared practice, e.g. "oui" */
  yesLabel: string;
  /** Read by screen readers after a practice that is not declared, e.g. "non déclaré" */
  noLabel: string;
  /** Shown when no practice at all is declared */
  noneText: string;
  className?: string;
}) {
  const anyDeclared = items.some((item) => item.ok);

  return (
    <div className={className}>
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li
            key={item.label}
            className={cn("flex items-start gap-2.5 text-sm leading-snug", item.ok ? "text-ink" : "text-ink-subtle")}
          >
            {item.ok ? (
              <CircleCheck className="mt-px size-[18px] shrink-0 text-brand-600" aria-hidden="true" />
            ) : (
              <CircleMinus className="mt-px size-[18px] shrink-0 text-line-strong" aria-hidden="true" />
            )}
            <span>
              {item.label}
              <span className="sr-only"> ({item.ok ? yesLabel : noLabel})</span>
            </span>
          </li>
        ))}
      </ul>
      {anyDeclared ? null : <p className="mt-3 text-xs leading-relaxed text-ink-subtle">{noneText}</p>}
    </div>
  );
}
