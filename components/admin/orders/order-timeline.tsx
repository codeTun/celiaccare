import { Check, X } from "lucide-react";

import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import type { AdminOrderDetail } from "@/types/admin-data";

type StepState = "done" | "current" | "upcoming" | "cancelled";
type Step = { key: string; label: string; date: string | null; state: StepState; note?: string };

/** The normal life cycle of an order. */
const LIFE_CYCLE: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Commande reçue" },
  { status: "CONFIRMED", label: "Confirmée" },
  { status: "PREPARING", label: "En préparation" },
  { status: "OUT_FOR_DELIVERY", label: "En livraison" },
  { status: "DELIVERED", label: "Livrée" },
];

/** Date of a step when the order keeps it (preparation and departure have no date of their own). */
function stepDate(order: AdminOrderDetail, status: OrderStatus): string | null {
  if (status === "PENDING") return order.createdAt;
  if (status === "CONFIRMED") return order.confirmedAt;
  if (status === "DELIVERED") return order.deliveredAt;
  return null;
}

function buildSteps(order: AdminOrderDetail): Step[] {
  if (order.status === "CANCELLED") {
    const steps: Step[] = [{ key: "PENDING", label: "Commande reçue", date: order.createdAt, state: "done" }];
    if (order.confirmedAt) steps.push({ key: "CONFIRMED", label: "Confirmée", date: order.confirmedAt, state: "done" });
    steps.push({ key: "CANCELLED", label: "Annulée", date: order.cancelledAt, state: "cancelled" });
    return steps;
  }

  const currentIndex = LIFE_CYCLE.findIndex((step) => step.status === order.status);
  return LIFE_CYCLE.map((step, index) => {
    let state: StepState = "upcoming";
    if (index < currentIndex) state = "done";
    else if (index === currentIndex) state = order.status === "DELIVERED" ? "done" : "current";
    const date = stepDate(order, step.status);
    // The current step without its own date: the last change of the order is the best clue.
    const note = state === "current" && !date && index > 0 ? `Depuis le ${formatDateTime(order.updatedAt)}` : undefined;
    return { key: step.status, label: step.label, date, state, note };
  });
}

const dotStyles: Record<StepState, string> = {
  done: "bg-brand-600 text-white",
  current: "bg-white text-brand-700 ring-2 ring-brand-600",
  upcoming: "bg-white text-ink-subtle ring-1 ring-line-strong",
  cancelled: "bg-red-600 text-white",
};

/**
 * Vertical timeline of the order statuses with their dates (createdAt, confirmedAt,
 * deliveredAt or cancelledAt). Done steps are green, the current one is outlined.
 */
export function OrderTimeline({ order }: { order: AdminOrderDetail }) {
  const steps = buildSteps(order);
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
            {isLast ? null : (
              <span
                className={cn(
                  "absolute start-[0.6875rem] top-6 h-[calc(100%-1.25rem)] w-0.5 rounded-full",
                  step.state === "done" ? "bg-brand-200" : "bg-line",
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn("relative grid size-6 shrink-0 place-items-center rounded-full", dotStyles[step.state])}
              aria-hidden="true"
            >
              {step.state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : null}
              {step.state === "cancelled" ? <X className="size-3.5" strokeWidth={3} /> : null}
              {step.state === "current" ? <span className="size-2 rounded-full bg-brand-600" /> : null}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm font-semibold",
                  step.state === "upcoming" ? "text-ink-subtle" : "text-ink",
                  step.state === "cancelled" && "text-red-700",
                )}
              >
                {step.label}
                {step.state === "current" ? <span className="sr-only"> (étape actuelle)</span> : null}
                {step.state === "upcoming" ? <span className="sr-only"> (à venir)</span> : null}
              </p>
              {step.date ? (
                <p className="text-xs text-ink-muted tabular">{formatDateTime(step.date)}</p>
              ) : step.note ? (
                <p className="text-xs text-ink-muted">{step.note}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
