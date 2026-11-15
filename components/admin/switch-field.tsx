import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * On / off switch for a yes-no field (a real checkbox underneath, styled as a switch).
 * Sends "on" when checked and nothing when not: validate it with `checkbox` (lib/validators.ts).
 *
 * @example
 * <SwitchField name="isActive" label="Visible sur le site" description="Décochez pour masquer la fiche."
 *   defaultChecked={product.isActive} />
 */
export function SwitchField({
  id,
  name,
  label,
  description,
  error,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type" | "role"> & {
  name: string;
  label: ReactNode;
  description?: ReactNode;
  error?: string | string[] | null;
}) {
  const fieldId = id ?? `switch-${name}`;
  const message = Array.isArray(error) ? error[0] : error;
  const describedBy = [description ? `${fieldId}-description` : null, message ? `${fieldId}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={fieldId}
        className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-line bg-white px-4 py-3 transition-colors hover:border-brand-200"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{label}</span>
          {description ? (
            <span id={`${fieldId}-description`} className="mt-0.5 block text-xs leading-relaxed text-ink-subtle">
              {description}
            </span>
          ) : null}
        </span>
        <span className="relative mt-0.5 inline-flex shrink-0">
          <input
            id={fieldId}
            name={name}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            aria-describedby={describedBy || undefined}
            aria-invalid={message ? true : undefined}
            {...props}
          />
          <span
            className="h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100 peer-disabled:opacity-50"
            aria-hidden="true"
          />
          <span
            className="absolute start-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5"
            aria-hidden="true"
          />
        </span>
      </label>
      {message ? (
        <p id={`${fieldId}-error`} className="text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
