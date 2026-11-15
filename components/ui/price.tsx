import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

/** A price in millimes, formatted for Tunisia: 12500 -> "12,500 DT". */
export function Price({ value, locale, className }: { value: number; locale: Locale; className?: string }) {
  return <span className={cn("tabular font-bold whitespace-nowrap", className)}>{formatPrice(value, locale)}</span>;
}
