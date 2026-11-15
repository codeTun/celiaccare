import { Badge, type BadgeTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MessageStatus, OrderStatus, PhoneRuleType, RefusalReason, ReportStatus, ReviewStatus } from "@/types";

/* ==========================================================================
   Statuses → French label + color (DESIGN-SYSTEM.md, "Admin panel"):
   pending = amber, confirmed / preparing = sky, out for delivery = violet,
   delivered / resolved / approved = green, cancelled / rejected / blocked = red,
   archived = neutral.
   The *_LABELS maps are also handy for <select> options and FilterTabs.
   ========================================================================== */

type StatusStyle = { label: string; tone: BadgeTone };

export const ORDER_STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  PENDING: { label: "En attente", tone: "amber" },
  CONFIRMED: { label: "Confirmée", tone: "blue" },
  PREPARING: { label: "En préparation", tone: "blue" },
  OUT_FOR_DELIVERY: { label: "En livraison", tone: "violet" },
  DELIVERED: { label: "Livrée", tone: "brand" },
  CANCELLED: { label: "Annulée", tone: "red" },
};

export const MESSAGE_STATUS_STYLES: Record<MessageStatus, StatusStyle> = {
  NEW: { label: "Nouveau", tone: "amber" },
  IN_PROGRESS: { label: "En cours", tone: "blue" },
  RESOLVED: { label: "Traité", tone: "brand" },
  ARCHIVED: { label: "Archivé", tone: "neutral" },
};

export const REPORT_STATUS_STYLES: Record<ReportStatus, StatusStyle> = {
  OPEN: { label: "À traiter", tone: "amber" },
  IN_REVIEW: { label: "En vérification", tone: "blue" },
  RESOLVED: { label: "Corrigé", tone: "brand" },
  REJECTED: { label: "Rejeté", tone: "red" },
};

export const REVIEW_STATUS_STYLES: Record<ReviewStatus, StatusStyle> = {
  PENDING: { label: "À modérer", tone: "amber" },
  APPROVED: { label: "Publié", tone: "brand" },
  REJECTED: { label: "Refusé", tone: "red" },
};

export const PHONE_RULE_STYLES: Record<PhoneRuleType, StatusStyle> = {
  BLOCKED: { label: "Bloqué", tone: "red" },
  EXCEPTION: { label: "Exception", tone: "blue" },
};

/** Why an order attempt was refused (EF-38). */
export const REFUSAL_REASON_STYLES: Record<RefusalReason, StatusStyle> = {
  DAILY_LIMIT: { label: "Limite de 3 commandes / jour", tone: "amber" },
  BLOCKED: { label: "Numéro bloqué", tone: "red" },
  RATE_LIMIT: { label: "Trop de tentatives", tone: "amber" },
};

function labelsOf<T extends string>(styles: Record<T, StatusStyle>): Record<T, string> {
  return Object.fromEntries(Object.entries<StatusStyle>(styles).map(([key, style]) => [key, style.label])) as Record<T, string>;
}

/** French labels only, e.g. ORDER_STATUS_LABELS.PENDING → "En attente". */
export const ORDER_STATUS_LABELS = labelsOf(ORDER_STATUS_STYLES);
export const MESSAGE_STATUS_LABELS = labelsOf(MESSAGE_STATUS_STYLES);
export const REPORT_STATUS_LABELS = labelsOf(REPORT_STATUS_STYLES);
export const REVIEW_STATUS_LABELS = labelsOf(REVIEW_STATUS_STYLES);
export const PHONE_RULE_LABELS = labelsOf(PHONE_RULE_STYLES);
export const REFUSAL_REASON_LABELS = labelsOf(REFUSAL_REASON_STYLES);

export type StatusBadgeProps = (
  | { kind: "order"; status: OrderStatus }
  | { kind: "message"; status: MessageStatus }
  | { kind: "report"; status: ReportStatus }
  | { kind: "review"; status: ReviewStatus }
  | { kind: "phoneRule"; status: PhoneRuleType }
  | { kind: "refusal"; status: RefusalReason }
) & { className?: string };

function styleFor(props: StatusBadgeProps): StatusStyle | undefined {
  switch (props.kind) {
    case "order":
      return ORDER_STATUS_STYLES[props.status];
    case "message":
      return MESSAGE_STATUS_STYLES[props.status];
    case "report":
      return REPORT_STATUS_STYLES[props.status];
    case "review":
      return REVIEW_STATUS_STYLES[props.status];
    case "phoneRule":
      return PHONE_RULE_STYLES[props.status];
    case "refusal":
      return REFUSAL_REASON_STYLES[props.status];
  }
}

/**
 * Colored status pill with its French label.
 *
 * @example
 * <StatusBadge kind="order" status={order.status} />
 * <StatusBadge kind="review" status="PENDING" />
 * <StatusBadge kind="phoneRule" status={rule.type} />
 */
export function StatusBadge(props: StatusBadgeProps) {
  // Unknown value (data newer than this code): show it as is, in grey.
  const style = styleFor(props) ?? { label: String(props.status), tone: "neutral" as const };
  return (
    <Badge tone={style.tone} className={cn("gap-1.5", props.className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {style.label}
    </Badge>
  );
}
