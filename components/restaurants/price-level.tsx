import type { CommonDict } from "@/i18n/resources/fr/common";
import { clamp, cn } from "@/lib/utils";

/** Price range of a restaurant (1 to 3): three little dots + "Prix moyens". */
export function PriceLevel({
  level,
  common,
  className,
}: {
  level: number;
  common: CommonDict;
  className?: string;
}) {
  const value = clamp(Math.round(level) || 2, 1, 3);
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="inline-flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((dot) => (
          <span key={dot} className={cn("size-2 rounded-full", dot <= value ? "bg-brand-600" : "bg-line-strong")} />
        ))}
      </span>
      {common.priceLevels[value - 1]}
    </span>
  );
}
