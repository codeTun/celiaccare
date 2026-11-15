"use client";

import { useActionState, type ReactNode } from "react";

import type { ButtonSize, ButtonVariant } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";
import { idleState, type ActionState } from "@/lib/validators";

/**
 * A one-click action without confirmation (publish a review, hide a restaurant, mark a
 * dish as sold out...). The Server Action is BOUND on the server (Server Component) and
 * passed here; it refreshes the page itself. An error message is shown under the button.
 *
 * @example
 * // in a Server Component
 * <QuickActionButton action={setRestaurantActiveAction.bind(null, restaurant.id, false)}
 *   label="Masquer" pendingLabel="Masquage…" icon={<EyeOff aria-hidden="true" />} />
 */
export function QuickActionButton({
  action,
  label,
  pendingLabel,
  icon,
  variant = "outline",
  size = "sm",
  iconOnly = false,
  className,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
  pendingLabel?: string;
  /** Icon ELEMENT, e.g. <Eye aria-hidden="true" /> */
  icon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show only the icon (table rows): `label` stays readable by screen readers and as a tooltip. */
  iconOnly?: boolean;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, idleState);
  let buttonSize: ButtonSize = size;
  if (iconOnly) buttonSize = size === "sm" ? "icon-sm" : "icon";

  return (
    <form action={formAction} className={cn("inline-flex flex-col items-center gap-1", className)}>
      <SubmitButton
        variant={variant}
        size={buttonSize}
        title={iconOnly ? label : undefined}
        pendingLabel={iconOnly ? <span className="sr-only">{pendingLabel ?? label}</span> : pendingLabel}
      >
        {icon}
        {iconOnly ? <span className="sr-only">{label}</span> : label}
      </SubmitButton>
      {state.status === "error" && state.message ? (
        <p role="alert" className="max-w-48 text-center text-xs font-medium text-red-600">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
