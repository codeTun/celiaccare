import type { ComponentProps, ReactNode } from "react";

import { Field, fieldA11y, Input } from "@/components/ui/form";
import { millimesToInput } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Amount in dinars with a "DT" suffix ("12,500" or "12.5"). The database stores MILLIMES:
 * pre-fill with `defaultMillimes`, and read it on the server with `priceInDinars` /
 * `optionalPriceInDinars` (lib/validators.ts), which give millimes back.
 *
 * @example
 * <MoneyField name="price" label="Prix" required defaultMillimes={product.price}
 *   defaultValue={state.values?.price} error={state.fieldErrors?.price} />
 */
export function MoneyField({
  id,
  name,
  label,
  hint,
  error,
  required,
  defaultMillimes,
  defaultValue,
  wrapperClassName,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type" | "defaultValue"> & {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | string[] | null;
  /** Saved amount in millimes (12500 → "12.500"). */
  defaultMillimes?: number | null;
  /** Raw text sent back after a validation error (wins over defaultMillimes). */
  defaultValue?: string;
  wrapperClassName?: string;
}) {
  const fieldId = id ?? `field-${name}`;
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <div className="relative">
        <Input
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.000"
          required={required}
          defaultValue={defaultValue ?? millimesToInput(defaultMillimes)}
          className={cn("pe-12 tabular", className)}
          {...fieldA11y(fieldId, error, hint)}
          {...props}
        />
        <span
          className="pointer-events-none absolute inset-y-0 end-0 grid w-12 place-items-center text-sm font-semibold text-ink-subtle"
          aria-hidden="true"
        >
          DT
        </span>
      </div>
    </Field>
  );
}
