"use client";

import { useActionState, type ReactNode } from "react";

import type { ButtonSize, ButtonVariant } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";
import { idleState, type ActionState } from "@/lib/validators";

const GENERIC_ERRORS: Record<string, string> = {
  invalid: "Action impossible : rechargez la page puis réessayez.",
  error: "L'action a échoué. Réessayez dans un instant.",
};

/**
 * A one-click action without confirmation (e.g. "Confirmer", "Activer"): a small form whose
 * button shows a spinner while the Server Action runs. The action is bound ON THE SERVER and
 * passed as a prop (never call .bind() in a Client Component, see KNOWN-ISSUES):
 *
 * @example
 * // Server Component
 * <QuickActionButton action={toggleDelivererAction.bind(null, deliverer.id, !deliverer.isActive)}
 *   pendingLabel="Mise à jour…" variant="outline">
 *   <Power aria-hidden="true" /> Activer
 * </QuickActionButton>
 *
 * The action usually redirects on success; when it returns an error, the message appears under the button.
 * For risky actions (delete, cancel...), use ConfirmDeleteButton instead.
 */
export function QuickActionButton({
  action,
  children,
  pendingLabel,
  variant = "outline",
  size = "sm",
  title,
  name,
  value,
  className,
  buttonClassName,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  /** Shown with the spinner while the action runs (for an icon-only button: an sr-only text). */
  pendingLabel?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Tooltip, also useful for icon-only buttons (add an sr-only text in children too). */
  title?: string;
  /** Sent with the form by the button, e.g. name="status" value="PREPARING". */
  name?: string;
  value?: string;
  className?: string;
  buttonClassName?: string;
}) {
  const [state, formAction] = useActionState(action, idleState);
  let error: string | null = null;
  if (state.status === "error") {
    const message = state.message ?? "error";
    error = Object.hasOwn(GENERIC_ERRORS, message) ? GENERIC_ERRORS[message] : message;
  }

  return (
    <form action={formAction} className={cn("flex flex-col items-start gap-1", className)}>
      <SubmitButton
        variant={variant}
        size={size}
        pendingLabel={pendingLabel}
        title={title}
        name={name}
        value={value}
        className={buttonClassName}
      >
        {children}
      </SubmitButton>
      {error ? (
        <p role="alert" className="max-w-xs text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}
