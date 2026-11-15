import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shows a 0–5 rating with stars. `label` is read by screen readers (e.g. "4,5 sur 5").
 * Empty and filled outlines keep a 3:1 contrast on light backgrounds (WCAG 1.4.11).
 */
export function RatingStars({
  value,
  label,
  size = "sm",
  className,
}: {
  value: number;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "sm" ? "size-3.5" : "size-5";
  return (
    <span role="img" aria-label={label} className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className={cn("relative inline-block", iconSize)} aria-hidden="true">
            <Star className={cn("absolute inset-0 text-ink-subtle", iconSize)} strokeWidth={1.5} />
            {fill > 0 ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn("fill-saffron-400 text-saffron-700", iconSize)} strokeWidth={1.5} />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
