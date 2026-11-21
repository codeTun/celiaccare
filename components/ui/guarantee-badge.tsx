import { BadgeCheck, Leaf, TriangleExclamationPoint, WheatOff } from "lucide-react";

import { cn } from "@/lib/utils";
import type { GuaranteeLevel } from "@/types";

const styles: Record<GuaranteeLevel, string> = {
  CERTIFIED: "bg-brand-600 text-white",
  // strong green too, but outlined instead of filled: never confused with an official certificate
  DEDICATED: "bg-brand-100 text-brand-900 ring-1 ring-inset ring-brand-600",
  NATURALLY_GF: "bg-brand-50 text-brand-800 ring-1 ring-brand-200",
  TRACES_RISK: "bg-saffron-50 text-saffron-700 ring-1 ring-saffron-100",
};

const icons = { CERTIFIED: BadgeCheck, DEDICATED: WheatOff, NATURALLY_GF: Leaf, TRACES_RISK: TriangleExclamationPoint };

/**
 * Gluten-free guarantee level (spec §5.2): Certified / 100 % gluten-free (dedicated, no certificate)
 * and, for older rows only, Naturally GF / Risk of traces.
 * `label` comes from the dictionary: dict.common.guarantee[level].short or .label
 */
export function GuaranteeBadge({
  level,
  label,
  size = "sm",
  className,
}: {
  level: GuaranteeLevel;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const Icon = icons[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap",
        size === "sm" ? "px-2.5 py-0.5 text-xs [&_svg]:size-3.5" : "px-3 py-1 text-sm [&_svg]:size-4",
        styles[level],
        className,
      )}
    >
      <Icon aria-hidden="true" />
      {label}
    </span>
  );
}
