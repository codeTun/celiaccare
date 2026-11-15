import { ArrowRight, BadgeCheck, Leaf, TriangleExclamationPoint, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { HomeDict } from "@/i18n/resources/fr/home";
import { cn } from "@/lib/utils";
import { GUARANTEE_LEVELS, type GuaranteeLevel } from "@/types";

/** Colors of each level, matching the GuaranteeBadge shown on the product sheets. */
const LEVEL_STYLES: Record<GuaranteeLevel, { icon: LucideIcon; bar: string; arch: string }> = {
  CERTIFIED: { icon: BadgeCheck, bar: "bg-brand-600", arch: "bg-brand-600 text-white" },
  NATURALLY_GF: { icon: Leaf, bar: "bg-brand-300", arch: "bg-brand-50 text-brand-700 ring-1 ring-brand-200" },
  TRACES_RISK: {
    icon: TriangleExclamationPoint,
    bar: "bg-saffron-400",
    arch: "bg-saffron-50 text-saffron-700 ring-1 ring-saffron-100",
  },
};

/**
 * The 3 gluten-free guarantee levels (spec §5.2) explained in three cards:
 * name, meaning, what CeliacCare checks, and the badge exactly as it appears on the sheets.
 * Used by the home page and the about page. Card titles are <h3>: put it under an <h2>.
 */
export function GuaranteeLevels({
  common,
  texts,
  learnMoreHref,
  className,
}: {
  common: CommonDict;
  /** dict.home.guarantees */
  texts: HomeDict["guarantees"];
  /** Link to the gluten-free guide (shown under the cards when set) */
  learnMoreHref?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ul className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {GUARANTEE_LEVELS.map((level) => {
          const { icon: Icon, bar, arch } = LEVEL_STYLES[level];
          return (
            <li
              key={level}
              className="relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-soft sm:p-7"
            >
              <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1.5", bar)} />
              <span aria-hidden="true" className={cn("arch grid h-16 w-13 place-items-center", arch)}>
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">{common.guarantee[level].label}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{common.guarantee[level].description}</p>
              <div className="mt-auto space-y-4 pt-5">
                <p className="rounded-xl bg-canvas p-3.5 text-sm leading-relaxed text-ink-muted">
                  <span className="font-semibold text-ink">{texts.checkedLabel}</span> {texts.checks[level]}
                </p>
                <p className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink-subtle">
                  {texts.onSheets}
                  <GuaranteeBadge level={level} label={common.guarantee[level].short} />
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      {learnMoreHref ? (
        <p className="mt-8 text-center">
          <Link
            href={learnMoreHref}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            {texts.learnMore}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </p>
      ) : null}
    </div>
  );
}
