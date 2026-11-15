import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "solid" | "saffron" | "amber" | "red" | "blue" | "violet" | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-canvas text-ink-muted ring-1 ring-line",
  brand: "bg-brand-50 text-brand-800 ring-1 ring-brand-200",
  solid: "bg-brand-600 text-white",
  saffron: "bg-saffron-50 text-saffron-700 ring-1 ring-saffron-100",
  amber: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-1 ring-red-200",
  blue: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  violet: "bg-violet-50 text-violet-800 ring-1 ring-violet-200",
  outline: "bg-white text-ink ring-1 ring-line-strong",
};

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
