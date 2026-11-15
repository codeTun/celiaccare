"use client";

import { CircleCheck, CookingPot, LoaderCircle, PackageCheck, Truck, type LucideIcon } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { idleState, type ActionState } from "@/lib/validators";

import { ORDER_STATUS_ACTIONS, type OrderTargetStatus } from "./order-labels";

/** Every status an order can move forward to (cancelling has its own confirmation dialog). */
export type ForwardStatus = Exclude<OrderTargetStatus, "CANCELLED">;

const STATUS_ICONS: Record<ForwardStatus, LucideIcon> = {
  CONFIRMED: CircleCheck,
  PREPARING: CookingPot,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: PackageCheck,
};

const GENERIC_ERRORS: Record<string, string> = {
  invalid: "Action impossible : rechargez la page puis réessayez.",
  error: "Le changement n'a pas pu être enregistré. Réessayez dans un instant.",
};

/**
 * The "move forward" buttons of an order (Confirmer, Mettre en préparation, Expédier,
 * Marquer livrée) in ONE form: the clicked button sends `status`. The error message stays
 * visible even when the page refresh changes the buttons (e.g. another admin already
 * confirmed the order). The action is bound on the server:
 *
 * @example
 * <OrderStatusActions action={updateOrderStatusAction.bind(null, order.id, "detail")} statuses={["CONFIRMED"]} />
 */
export function OrderStatusActions({
  action,
  statuses,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  statuses: ForwardStatus[];
}) {
  const [state, formAction] = useActionState(action, idleState);
  let error: string | null = null;
  if (state.status === "error") {
    const message = state.message ?? "error";
    error = Object.hasOwn(GENERIC_ERRORS, message) ? GENERIC_ERRORS[message] : message;
  }

  return (
    <>
      {statuses.length > 0 ? (
        <form action={formAction} className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <StatusButton key={status} status={status} />
          ))}
        </form>
      ) : null}
      {error ? (
        // order-last: below every button of the row (the cancel button sits next to this form).
        <Alert tone="error" className="order-last w-full basis-full">
          {error}
        </Alert>
      ) : null}
    </>
  );
}

/** Submit button of one status; only the clicked one shows the spinner. */
function StatusButton({ status }: { status: ForwardStatus }) {
  const { pending, data } = useFormStatus();
  const isMine = pending && data?.get("status") === status;
  const Icon = STATUS_ICONS[status];
  const action = ORDER_STATUS_ACTIONS[status];
  return (
    <Button type="submit" name="status" value={status} disabled={pending} aria-busy={isMine || undefined}>
      {isMine ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Icon aria-hidden="true" />}
      {isMine ? action.pendingLabel : action.label}
    </Button>
  );
}
