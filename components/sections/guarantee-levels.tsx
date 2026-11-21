import { ArrowRight, BadgeCheck, Info, WheatOff, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { HomeDict } from "@/i18n/resources/fr/home";
import { cn } from "@/lib/utils";
import { LISTED_GUARANTEE_LEVELS, type ListedGuaranteeLevel } from "@/types";

/** Colors of each level, matching the GuaranteeBadge shown on the product sheets. */
const LEVEL_STYLES: Record<ListedGuaranteeLevel, { icon: LucideIcon; bar: string; arch: string }> = {
  CERTIFIED: { icon: BadgeCheck, bar: "bg-brand-600", arch: "bg-brand-600 text-white" },
  DEDICATED: { icon: WheatOff, bar: "bg-brand-400", arch: "bg-brand-100 text-brand-900 ring-1 ring-inset ring-brand-600" },
};

/**
 * The gluten-free guarantee levels a listed business can have (policy "100 % sans gluten only":
 * Certified and 100 % gluten-free), explained in two cards — name, meaning, what CeliacCare checks,
 * the badge exactly as it appears on the sheets — followed by the listing policy sentence.
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
      <ul className="mx-auto grid max-w-4xl gap-4 sm:gap-6 md:grid-cols-2">
        {LISTED_GUARANTEE_LEVELS.map((level) => {
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
      <p className="mx-auto mt-6 flex max-w-4xl items-start gap-2.5 rounded-xl bg-brand-50 p-4 text-sm leading-relaxed font-medium text-brand-900 ring-1 ring-brand-200">
        <Info className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
        {common.guarantee.policy}
      </p>
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
