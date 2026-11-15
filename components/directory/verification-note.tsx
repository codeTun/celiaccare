import { ShieldCheck, TriangleExclamationPoint } from "lucide-react";

import { interpolate } from "@/i18n/interpolate";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

/**
 * "Source : Visite sur place · Vérifié le 12 nov. 2026" (spec 6.1: no sheet without
 * a source and a date) + a notice when the sheet is more than 12 months old.
 */
export function VerificationNote({
  source,
  verifiedAt,
  needsReview,
  locale,
  common,
  className,
}: {
  source: string;
  /** ISO date of the last verification */
  verifiedAt: string;
  /** true when verified more than 12 months ago */
  needsReview: boolean;
  locale: Locale;
  common: CommonDict;
  className?: string;
}) {
  return (
    <div className={cn("text-xs leading-relaxed text-ink-muted", className)}>
      <p className="flex items-start gap-2">
        <ShieldCheck className="mt-px size-4 shrink-0 text-brand-600" aria-hidden="true" />
        <span>
          {interpolate(common.verification.source, { source })}
          <span aria-hidden="true"> · </span>
          <time dateTime={verifiedAt}>
            {interpolate(common.verification.verifiedOn, { date: formatDate(verifiedAt, locale) })}
          </time>
        </span>
      </p>
      {needsReview ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-900 ring-1 ring-amber-200">
          <TriangleExclamationPoint className="mt-px size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">{common.verification.underReview}</p>
            <p className="mt-0.5">{common.verification.underReviewText}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
