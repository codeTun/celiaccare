"use client";

import { LoaderCircle, Trash } from "lucide-react";
import { useActionState, useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { idleState, type ActionState } from "@/lib/validators";

/**
 * A button that asks for confirmation (native <dialog>) before running a Server Action.
 * Made for deletions, but the texts can be changed for any risky action.
 *
 * The action follows the project signature `(prevState, formData) => Promise<ActionState>`,
 * with the id bound on the server. It may:
 *   - redirect() (e.g. back to the list with ?ok=deleted) → the page changes;
 *   - return { status: "success" } → the dialog closes;
 *   - return { status: "error", message } → the message is shown in the dialog.
 *
 * @example
 * // app/admin/(dashboard)/produits/actions.ts
 * export async function deleteProductAction(id: number, _prev: ActionState, _form: FormData): Promise<ActionState> { ... }
 * // in a Server Component
 * <ConfirmDeleteButton
 *   action={deleteProductAction.bind(null, product.id)}
 *   title={`Supprimer « ${product.name} » ?`}
 *   description="La fiche disparaît du site. Cette action est définitive."
 *   iconOnly
 * />
 */
export function ConfirmDeleteButton({
  action,
  title,
  description = "Cette action est définitive.",
  label = "Supprimer",
  confirmLabel = "Supprimer définitivement",
  pendingLabel = "Suppression…",
  cancelLabel = "Annuler",
  variant = "outline",
  size = "sm",
  iconOnly = false,
  icon,
  hiddenFields,
  className,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  title: ReactNode;
  description?: ReactNode;
  /** Text of the button that opens the dialog (also its accessible name when iconOnly). */
  label?: string;
  confirmLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show only the icon (e.g. in a table row); `label` stays readable by screen readers. */
  iconOnly?: boolean;
  /** Icon element of the trigger and confirm buttons (default: trash can). */
  icon?: ReactNode;
  /** Extra values sent with the form, e.g. { redirectTo: "/admin/produits" }. */
  hiddenFields?: Record<string, string>;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const iconNode = icon ?? <Trash aria-hidden="true" />;
  let triggerSize: ButtonSize = size;
  if (iconOnly) triggerSize = size === "sm" ? "icon-sm" : "icon";

  // Success → close the dialog (the page is refreshed by the action).
  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state]);

  // Next.js keeps visited pages mounted but hidden: never leave the dialog open behind.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => dialog?.close();
  }, []);

  return (
    <>
      <Button
        variant={variant}
        size={triggerSize}
        className={cn(iconOnly && "text-red-600 hover:bg-red-50 hover:text-red-700", className)}
        aria-haspopup="dialog"
        title={iconOnly ? label : undefined}
        onClick={() => dialogRef.current?.showModal()}
      >
        {iconNode}
        {iconOnly ? <span className="sr-only">{label}</span> : label}
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onCancel={(event) => {
          if (pending) event.preventDefault(); // Escape does nothing while the action runs
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-line bg-white p-0 text-ink shadow-lift backdrop:bg-brand-950/40 backdrop:backdrop-blur-[2px]"
      >
        <form action={formAction} className="p-6 sm:p-7">
          {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100 [&_svg]:size-5">
              {iconNode}
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-bold text-ink">
                {title}
              </h2>
              <div id={descriptionId} className="mt-1 text-sm leading-relaxed text-ink-muted">
                {description}
              </div>
            </div>
          </div>

          {state.status === "error" && state.message ? (
            <Alert tone="error" className="mt-5">
              {state.message}
            </Alert>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" disabled={pending} onClick={() => dialogRef.current?.close()}>
              {cancelLabel}
            </Button>
            <Button type="submit" variant="danger" disabled={pending} aria-busy={pending || undefined}>
              {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : iconNode}
              {pending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
