"use client";

import { UserCheck } from "lucide-react";
import { useActionState, useId } from "react";

import { Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";
import { idleState, type ActionState } from "@/lib/validators";

/** One choice of the deliverer select (label already built on the server, e.g. "Sami · Moto · 2 en cours"). */
export type DelivererOption = { id: number; label: string; disabled?: boolean };

/**
 * Give an order to a delivery person, or take it back ("— Aucun livreur —").
 * Sends `delivererId` ("" = none) to the bound Server Action (assignDelivererAction).
 * Put a `key` on it that changes with the current deliverer, so the select is reset after a change.
 *
 * @example
 * <AssignDelivererForm key={order.deliverer?.id ?? "none"}
 *   action={assignDelivererAction.bind(null, order.id, "detail")}
 *   options={options} currentId={order.deliverer?.id ?? null} />
 */
export function AssignDelivererForm({
  action,
  options,
  currentId,
  compact = false,
  className,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  options: DelivererOption[];
  currentId: number | null;
  /** Smaller, label read by screen readers only (delivery board cards). */
  compact?: boolean;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, idleState);
  const selectId = useId();
  const errorId = `${selectId}-error`;
  const error = state.status === "error" ? (state.fieldErrors?.delivererId?.[0] ?? state.message) : null;

  return (
    <form action={formAction} className={cn("space-y-1.5", className)}>
      <label htmlFor={selectId} className={compact ? "sr-only" : "text-sm font-semibold text-ink"}>
        Livreur
      </label>
      <div className="flex items-center gap-2">
        <Select
          id={selectId}
          name="delivererId"
          defaultValue={currentId ? String(currentId) : ""}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn("min-w-0 flex-1 text-sm", compact ? "h-9" : "h-10")}
        >
          <option value="">— Aucun livreur —</option>
          {options.map((option) => (
            <option key={option.id} value={option.id} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </Select>
        <SubmitButton variant="secondary" size="sm" pendingLabel="…" className="shrink-0">
          <UserCheck aria-hidden="true" />
          {compact ? <span className="sr-only">Enregistrer le livreur</span> : "Enregistrer"}
        </SubmitButton>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
          {error === "invalid" || error === "error" ? "Le livreur n'a pas pu être enregistré. Réessayez." : error}
        </p>
      ) : null}
    </form>
  );
}
