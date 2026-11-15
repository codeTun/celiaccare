import { Store, Truck, TriangleExclamationPoint } from "lucide-react";
import Link from "next/link";

import { AssignDelivererForm, type DelivererOption } from "@/components/admin/orders/assign-deliverer-form";
import { OrderTypeBadge, PhoneNumber } from "@/components/admin/orders/order-badges";
import { ORDER_STATUS_ACTIONS, type OrderTargetStatus } from "@/components/admin/orders/order-labels";
import { QuickActionButton } from "@/components/admin/orders/quick-action-button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatPrice, formatRelative } from "@/lib/format";
import type { ActionState } from "@/lib/validators";
import type { AdminActiveDelivery } from "@/types/admin-data";

import { VEHICLE_LABELS } from "./delivery-labels";

type BoundAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * One order on the delivery board (Livraisons → En cours): who, where, how much, since when,
 * its deliverer (with a quick assignment) and the button to the next status.
 * The Server Actions are bound by the page (Server Component) and passed as props.
 */
export function ActiveDeliveryCard({
  delivery,
  now,
  nextStatus,
  statusAction,
  assignAction,
  delivererOptions,
}: {
  delivery: AdminActiveDelivery;
  /** Request time, for "il y a 2 heures". */
  now: Date;
  nextStatus: OrderTargetStatus | null;
  /** updateOrderStatusAction bound to (order id, "board"); the button sends `status`. */
  statusAction: BoundAction;
  /** assignDelivererAction bound to (order id, "board"). */
  assignAction: BoundAction;
  delivererOptions: DelivererOption[];
}) {
  const deliverer = delivery.deliverer;
  const isOnTheRoad = delivery.status === "OUT_FOR_DELIVERY";

  return (
    <article
      aria-labelledby={`delivery-${delivery.id}`}
      className="rounded-2xl border border-line bg-white p-4 shadow-soft transition-colors hover:border-brand-200"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 id={`delivery-${delivery.id}`}>
          <Link
            href={`/admin/commandes/${delivery.id}`}
            className="font-mono text-sm font-bold text-brand-700 hover:underline"
          >
            {delivery.reference}
          </Link>
        </h3>
        <OrderTypeBadge type={delivery.type} />
      </div>

      <p className="mt-1.5 truncate text-sm font-semibold text-ink" title={delivery.customerName}>
        {delivery.customerName}
      </p>
      <p className="truncate text-xs text-ink-muted" title={`${delivery.street}, ${delivery.city}`}>
        {delivery.city}, {delivery.governorate}
        {delivery.zone ? ` · ${delivery.zone.delay}` : ""}
      </p>
      {delivery.restaurantName ? (
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-ink-muted">
          <Store className="size-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
          {delivery.restaurantName}
        </p>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className="text-ink-subtle" title={formatDateTime(delivery.createdAt)}>
          Commandée {formatRelative(delivery.createdAt, "fr", now)}
        </span>
        <span className="font-bold text-ink tabular">{formatPrice(delivery.total)}</span>
      </div>

      <div className="mt-3 space-y-3 border-t border-line pt-3">
        {deliverer ? (
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Truck className="size-3.5 shrink-0 text-brand-600" aria-hidden="true" />
            <span className="truncate font-semibold text-ink">{deliverer.name}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{VEHICLE_LABELS[deliverer.vehicle] ?? deliverer.vehicle}</span>
            <span aria-hidden="true">·</span>
            <PhoneNumber phone={deliverer.phone} className="shrink-0" />
          </p>
        ) : (
          <Badge tone="amber">
            <TriangleExclamationPoint aria-hidden="true" />
            Sans livreur
          </Badge>
        )}

        {/* Once the order has left, its deliverer is shown but no longer changed from the board. */}
        {isOnTheRoad ? null : (
          <AssignDelivererForm
            key={deliverer?.id ?? "none"}
            action={assignAction}
            options={delivererOptions}
            currentId={deliverer?.id ?? null}
            compact
          />
        )}

        {nextStatus ? (
          <QuickActionButton
            action={statusAction}
            name="status"
            value={nextStatus}
            variant={isOnTheRoad ? "primary" : "secondary"}
            pendingLabel={ORDER_STATUS_ACTIONS[nextStatus].pendingLabel}
            className="w-full"
            buttonClassName="w-full"
          >
            {ORDER_STATUS_ACTIONS[nextStatus].label}
          </QuickActionButton>
        ) : null}
      </div>
    </article>
  );
}
