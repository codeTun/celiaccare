import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Low-level controls                                                         */
/* -------------------------------------------------------------------------- */

export const controlStyles =
  "w-full rounded-xl border border-line-strong bg-white px-3.5 text-[15px] text-ink shadow-xs transition placeholder:text-ink-subtle focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-canvas aria-invalid:border-red-500 aria-invalid:focus:ring-red-100";

export function Input({ className, dir, ...props }: ComponentProps<"input">) {
  // Phone numbers, e-mails and URLs are always written left-to-right, even on Arabic pages.
  const ltr = props.type === "tel" || props.type === "email" || props.type === "url";
  return (
    <input
      dir={dir ?? (ltr ? "ltr" : undefined)}
      className={cn(controlStyles, "h-11", ltr && "rtl:text-right", className)}
      {...props}
    />
  );
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(controlStyles, "min-h-24 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        controlStyles,
        // select-chevron (app/globals.css) draws the arrow, on the right — or on the left in Arabic
        "select-chevron h-11 cursor-pointer appearance-none pe-10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-[18px] shrink-0 cursor-pointer rounded-[5px] border-line-strong accent-brand-600 focus-visible:outline-2",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-semibold text-ink", className)} {...props} />;
}

/* -------------------------------------------------------------------------- */
/*  Field = label + control + hint + error, with the right accessibility ids   */
/* -------------------------------------------------------------------------- */

type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | string[] | null;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/** Ids to put on the control so screen readers read the hint and the error. */
export function fieldA11y(id: string, error?: string | string[] | null, hint?: ReactNode) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  } as const;
}

export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="ms-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}
      {message ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}

type CommonFieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | string[] | null;
  wrapperClassName?: string;
};

export function TextField({
  id,
  name,
  label,
  hint,
  error,
  required,
  wrapperClassName,
  ...props
}: CommonFieldProps & ComponentProps<"input"> & { name: string }) {
  const fieldId = id ?? `field-${name}`;
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <Input name={name} required={required} {...fieldA11y(fieldId, error, hint)} {...props} />
    </Field>
  );
}

export function TextareaField({
  id,
  name,
  label,
  hint,
  error,
  required,
  wrapperClassName,
  ...props
}: CommonFieldProps & ComponentProps<"textarea"> & { name: string }) {
  const fieldId = id ?? `field-${name}`;
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <Textarea name={name} required={required} {...fieldA11y(fieldId, error, hint)} {...props} />
    </Field>
  );
}

export function SelectField({
  id,
  name,
  label,
  hint,
  error,
  required,
  wrapperClassName,
  children,
  ...props
}: CommonFieldProps & ComponentProps<"select"> & { name: string }) {
  const fieldId = id ?? `field-${name}`;
  return (
    <Field id={fieldId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <Select name={name} required={required} {...fieldA11y(fieldId, error, hint)} {...props}>
        {children}
      </Select>
    </Field>
  );
}

export function CheckboxField({
  id,
  name,
  label,
  hint,
  error,
  wrapperClassName,
  ...props
}: CommonFieldProps & Omit<ComponentProps<"input">, "type"> & { name: string }) {
  const fieldId = id ?? `field-${name}`;
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1", wrapperClassName)}>
      <div className="flex items-start gap-2.5">
        <Checkbox name={name} {...fieldA11y(fieldId, error, hint)} className="mt-0.5" {...props} />
        <label htmlFor={fieldId} className="text-sm leading-snug text-ink-muted">
          {label}
        </label>
      </div>
      {hint ? (
        <p id={`${fieldId}-hint`} className="ps-7 text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}
      {message ? (
        <p id={`${fieldId}-error`} className="ps-7 text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}

/** Invisible field that real people never fill. Bots often do: we reject those submissions. */
export function HoneypotField({ name = "website" }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
      <label>
        Ne pas remplir
        <input type="text" name={name} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
