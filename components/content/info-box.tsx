import { Info, Lightbulb, ListChecks, TriangleExclamationPoint, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { CalloutTone } from "./types";

const tones: Record<CalloutTone, { box: string; badge: string; icon: LucideIcon }> = {
  // "À retenir": the key points of a section
  takeaway: { box: "border-brand-200 bg-brand-50/70", badge: "bg-brand-600 text-white", icon: ListChecks },
  // a practical tip
  tip: { box: "border-line bg-canvas", badge: "bg-white text-saffron-700 ring-1 ring-saffron-100", icon: Lightbulb },
  // neutral information
  info: { box: "border-sky-200 bg-sky-50/70", badge: "bg-white text-sky-700 ring-1 ring-sky-200", icon: Info },
  // health warning, risk of gluten
  warning: {
    box: "border-saffron-100 bg-saffron-50/80",
    badge: "bg-white text-saffron-700 ring-1 ring-saffron-100",
    icon: TriangleExclamationPoint,
  },
};

/**
 * Highlighted box inside an article: key takeaways, tips, information or warnings.
 * @example <InfoBox tone="warning" title="Attention">Le malt contient du gluten.</InfoBox>
 */
export function InfoBox({
  tone = "info",
  title,
  icon,
  children,
  className,
}: {
  tone?: CalloutTone;
  title?: ReactNode;
  /** Replaces the icon of the tone (e.g. a stethoscope for the medical disclaimer) */
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
}) {
  const style = tones[tone];
  const Icon = icon ?? style.icon;

  return (
    <div role="note" className={cn("rounded-2xl border p-5 sm:p-6", style.box, className)}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", style.badge)}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 pt-1.5">
          {title ? <p className="font-bold leading-snug text-ink">{title}</p> : null}
          {children ? <div className={cn("text-[15px] leading-relaxed text-ink-muted", title && "mt-2")}>{children}</div> : null}
        </div>
      </div>
    </div>
  );
}
