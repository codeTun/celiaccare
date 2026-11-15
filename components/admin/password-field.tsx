"use client";

import { Eye, EyeOff } from "lucide-react";
import { useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";

import { Field, fieldA11y, Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type PasswordFieldProps = Omit<ComponentProps<"input">, "type" | "defaultValue" | "value"> & {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | string[] | null;
  /** "current-password" (login, confirm with the old password) or "new-password" (new password). */
  autoComplete: "current-password" | "new-password";
  wrapperClassName?: string;
};

/**
 * Password input with a "show / hide" button (eye icon).
 * For safety the typed value is erased when the page is hidden: Next.js keeps visited
 * pages mounted in the background, and a password must never wait there.
 *
 * @example
 * <PasswordField name="password" label="Mot de passe" autoComplete="current-password" required />
 * <PasswordField name="newPassword" label="Nouveau mot de passe" autoComplete="new-password"
 *   hint="12 caractères minimum, lettres et chiffres." error={state.fieldErrors?.newPassword} />
 */
export function PasswordField({
  id,
  name,
  label,
  hint,
  error,
  required,
  autoComplete,
  wrapperClassName,
  className,
  ...props
}: PasswordFieldProps) {
  const fieldId = id ?? `field-${name}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);

  // This cleanup runs when the page is hidden (Next.js keeps visited pages mounted with
  // display: none) or left: clear the field and mask it again. The check waits one frame and
  // only clears a field that is really hidden — in development React also runs this cleanup
  // once at start-up, and must not erase a password filled in by a password manager.
  useLayoutEffect(() => {
    const input = inputRef.current;
    return () => {
      setVisible(false);
      requestAnimationFrame(() => {
        if (input && (!input.isConnected || input.getClientRects().length === 0)) input.value = "";
      });
    };
  }, []);

  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <div className="relative">
        <Input
          ref={inputRef}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required={required}
          maxLength={256}
          className={cn("pe-12", className)}
          {...fieldA11y(fieldId, error, hint)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-pressed={visible}
          aria-controls={fieldId}
          className="absolute inset-y-0 end-0 grid w-11 place-items-center rounded-e-xl text-ink-subtle transition-colors hover:text-brand-700"
        >
          {visible ? <EyeOff className="size-[18px]" aria-hidden="true" /> : <Eye className="size-[18px]" aria-hidden="true" />}
          {/* One fixed label + aria-pressed: screen readers announce "Afficher le mot de passe, activé". */}
          <span className="sr-only">Afficher le mot de passe</span>
        </button>
      </div>
    </Field>
  );
}
