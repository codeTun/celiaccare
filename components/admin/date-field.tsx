import type { ComponentProps, ReactNode } from "react";

import { Field, fieldA11y, Input } from "@/components/ui/form";
import { tunisDayKey } from "@/lib/tunisia";

/** ISO string / Date / "2026-11-15" → "2026-11-15" (the calendar day in Tunis), "" when empty or invalid. */
export function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? "" : tunisDayKey(date);
}

/**
 * Date picker (<input type="date">). Accepts an ISO date from a DTO and shows the day in Tunis.
 * Read it on the server with `dateInput` (lib/validators.ts).
 *
 * @example
 * <DateField name="verifiedAt" label="Vérifié le" required defaultDate={product.verifiedAt}
 *   max={toDateInputValue(new Date())} error={state.fieldErrors?.verifiedAt} />
 */
export function DateField({
  id,
  name,
  label,
  hint,
  error,
  required,
  defaultDate,
  defaultValue,
  wrapperClassName,
  ...props
}: Omit<ComponentProps<"input">, "type" | "defaultValue"> & {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | string[] | null;
  /** Saved date (ISO string or Date). */
  defaultDate?: string | Date | null;
  /** Raw "YYYY-MM-DD" sent back after a validation error (wins over defaultDate). */
  defaultValue?: string;
  wrapperClassName?: string;
}) {
  const fieldId = id ?? `field-${name}`;
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <Input
        name={name}
        type="date"
        required={required}
        defaultValue={defaultValue ?? toDateInputValue(defaultDate)}
        className="tabular"
        {...fieldA11y(fieldId, error, hint)}
        {...props}
      />
    </Field>
  );
}
