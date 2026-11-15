import { Clock, TriangleExclamationPoint } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ReportStatus } from "@/types";

import { formatHours, REPORT_DELAY } from "./labels";

const { warningHours: WARNING_HOURS, overdueHours: OVERDUE_HOURS } = REPORT_DELAY;

/**
 * Delay of a report (spec EF-23 "statut et délai"):
 *  - waiting: under 24 h green, under 72 h amber, 72 h or more red "Délai dépassé";
 *  - handled: how long it took ("Traité en 5 h"), in grey.
 */
export function ReportDelayBadge({ status, ageHours }: { status: ReportStatus; ageHours: number }) {
  const age = ageHours < 1 ? "< 1 h" : formatHours(ageHours);

  if (status === "RESOLVED" || status === "REJECTED") {
    return <Badge tone="neutral">Traité en {age}</Badge>;
  }
  if (ageHours >= OVERDUE_HOURS) {
    return (
      <Badge tone="red" title={`En attente depuis ${age} (plus de ${OVERDUE_HOURS} h)`}>
        <TriangleExclamationPoint aria-hidden="true" />
        Délai dépassé · {age}
      </Badge>
    );
  }
  if (ageHours >= WARNING_HOURS) {
    return (
      <Badge tone="amber" title={`En attente depuis ${age}`}>
        <Clock aria-hidden="true" />
        {age}
      </Badge>
    );
  }
  return (
    <Badge tone="brand" title={`En attente depuis ${age}`}>
      <Clock aria-hidden="true" />
      {age}
    </Badge>
  );
}
