import type { MessageTopic, ReportReason, ReportTarget } from "@/types";
import { REPORT_SLA_HOURS } from "@/types/admin-data";

/* ==========================================================================
   French texts of the community pages (messages, reports, reviews) and the
   links to the sheets they are about.
   ========================================================================== */

/** Topic chosen in the contact form. */
export const MESSAGE_TOPIC_LABELS: Record<MessageTopic, string> = {
  GENERAL: "Question",
  PARTNERSHIP: "Partenariat",
  ORDER: "Commande",
  SUGGESTION: "Proposition d'adresse",
  OTHER: "Autre",
};

/** Reason chosen in "Signaler une erreur". */
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  WRONG_INFO: "Information erronée",
  GLUTEN_CONCERN: "Problème lié au gluten",
  CLOSED: "Commerce fermé / déménagé",
  PRICE: "Prix incorrect",
  OTHER: "Autre",
};

/**
 * Delay of a report (spec EF-23 "statut et délai"): waiting under 24 h = on time (green),
 * under REPORT_SLA_HOURS (72 h) = to handle soon (amber), from then on = "Délai dépassé" (red).
 * Same constant as the data layer (models/fetchers/admin/reports.ts) and the visitors' promise.
 * Used by ReportDelayBadge and by the figures of the Signalements page.
 */
export const REPORT_DELAY = { warningHours: 24, overdueHours: REPORT_SLA_HOURS } as const;

/** Kind of sheet a report or a review is about. */
export const SHEET_TYPE_LABELS: Record<ReportTarget, string> = {
  PRODUCT: "Produit",
  PRODUCER: "Artisan",
  RESTAURANT: "Restaurant",
};

const PUBLIC_SECTIONS: Record<ReportTarget, string> = {
  PRODUCT: "produits",
  PRODUCER: "artisans",
  RESTAURANT: "restaurants",
};

/** The sheet on the public site (French version), e.g. "/fr/restaurants/dar-el-ward". */
export function publicSheetPath(type: ReportTarget, slug: string) {
  return `/fr/${PUBLIC_SECTIONS[type]}/${encodeURIComponent(slug)}`;
}

const ADMIN_SECTIONS: Record<ReportTarget, string> = {
  PRODUCT: "/admin/produits",
  PRODUCER: "/admin/artisans",
  RESTAURANT: "/admin/restaurants",
};

/** The edit page of the sheet in the admin panel, e.g. "/admin/restaurants/3". */
export function adminSheetPath(type: ReportTarget, id: number) {
  return `${ADMIN_SECTIONS[type]}/${id}`;
}

/** "45 min", "5 h", "3 j 4 h": a duration given in hours, for delays. */
export function formatHours(hours: number) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${Math.round(hours)} h`;
  const days = Math.floor(hours / 24);
  const rest = Math.round(hours - days * 24);
  return rest > 0 ? `${days} j ${rest} h` : `${days} j`;
}
