import { Check } from "lucide-react";

import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { cn } from "@/lib/utils";

export type CheckoutStep = "details" | "review" | "done";

const STEPS: CheckoutStep[] = ["details", "review", "done"];

/** "1 Livraison — 2 Récapitulatif — 3 Confirmation" at the top of the checkout. */
export function CheckoutSteps({
  current,
  texts,
  className,
}: {
  current: CheckoutStep;
  texts: CheckoutDict["steps"];
  className?: string;
}) {
  const currentIndex = STEPS.indexOf(current);

  return (
    <ol aria-label={texts.label} className={cn("flex items-center gap-2 sm:gap-3", className)}>
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex || current === "done";
        const isCurrent = step === current;
        return (
          <li
            key={step}
            aria-current={isCurrent ? "step" : undefined}
            className="flex min-w-0 items-center gap-2 sm:gap-3"
          >
            <span
              aria-hidden="true"
              className={cn(
                "tabular grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors",
                isDone && "bg-brand-600 text-white",
                isCurrent && !isDone && "bg-white text-brand-700 ring-2 ring-brand-600",
                !isDone && !isCurrent && "bg-canvas text-ink-subtle ring-1 ring-line-strong",
              )}
            >
              {isDone ? <Check className="size-4" strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={cn(
                "truncate text-sm font-semibold",
                isCurrent ? "text-ink" : "text-ink-subtle",
                // On small phones only the current step shows its name (the others stay readable by screen readers).
                !isCurrent && "sr-only sm:not-sr-only",
              )}
            >
              {texts[step]}
            </span>
            {index < STEPS.length - 1 ? (
              <span aria-hidden="true" className={cn("h-px w-6 shrink-0 sm:w-12", isDone ? "bg-brand-400" : "bg-line-strong")} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
