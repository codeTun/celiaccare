import { ReportButton } from "@/components/community/report-button";
import type { CommunityDict } from "@/i18n/resources/fr/community";
import type { Locale, ReportTarget } from "@/types";

import type { SheetLabels } from "./labels";

/**
 * Bottom of a sheet: "Une information a changé ?" + the "Signaler une erreur" button (EF-20).
 * Pass it to <InfoSheet footer={...}>.
 */
export function SheetReport({
  locale,
  target,
  labels,
  community,
  closeLabel,
}: {
  locale: Locale;
  target: { type: ReportTarget; id: number; name: string };
  labels: SheetLabels;
  /** dict.community */
  community: CommunityDict;
  /** common.actions.close */
  closeLabel: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-bold text-ink">{labels.reportTitle}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{labels.reportText}</p>
      </div>
      <ReportButton locale={locale} target={target} dict={community} closeLabel={closeLabel} className="-ms-3" />
    </div>
  );
}
