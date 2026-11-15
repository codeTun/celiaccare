"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { MAX_QUANTITY } from "./cart-provider";

export type QuantityStepperLabels = {
  /** Name of the group read by screen readers, e.g. "Quantité – Bsissa au sorgho" */
  group: string;
  decrease: string;
  increase: string;
};

/**
 * "−  2  +" buttons to change a quantity (1 to 20 by default).
 * Each button is 44 px high (easy to tap on a phone).
 */
export function QuantityStepper({
  value,
  onChange,
  labels,
  min = 1,
  max = MAX_QUANTITY,
  className,
}: {
  value: number;
  onChange: (quantity: number) => void;
  labels: QuantityStepperLabels;
  min?: number;
  max?: number;
  className?: string;
}) {
  const buttonStyles =
    "grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-brand-50 hover:text-brand-800 disabled:pointer-events-none disabled:opacity-35";

  return (
    <div
      role="group"
      aria-label={labels.group}
      className={cn("inline-flex items-center rounded-full border border-line-strong bg-white", className)}
    >
      <button
        type="button"
        className={buttonStyles}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={labels.decrease}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <output aria-live="polite" className="tabular min-w-7 text-center text-[15px] font-bold text-ink">
        {value}
      </output>
      <button
        type="button"
        className={buttonStyles}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={labels.increase}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
