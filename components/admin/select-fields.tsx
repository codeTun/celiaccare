import type { ComponentProps, ReactNode } from "react";

import { SelectField } from "@/components/ui/form";
import { GOVERNORATES } from "@/lib/tunisia";

/* ==========================================================================
   <select> helpers for the admin forms (built on SelectField of components/ui/form).
   ========================================================================== */

/**
 * <option> elements from a { value: label } map (e.g. ORDER_STATUS_LABELS) or a list.
 *
 * @example
 * <select name="status"><SelectOptions options={ORDER_STATUS_LABELS} placeholder="Tous les statuts" /></select>
 */
export function SelectOptions({
  options,
  placeholder,
}: {
  options: Record<string, string> | { value: string; label: string }[];
  /** First option with an empty value ("Choisir…", "Tous"...). */
  placeholder?: string;
}) {
  const list = Array.isArray(options) ? options : Object.entries(options).map(([value, label]) => ({ value, label }));
  return (
    <>
      {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
      {list.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}

type SelectFieldProps = Omit<ComponentProps<"select">, "children"> & {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | string[] | null;
  wrapperClassName?: string;
  placeholder?: string;
};

/**
 * Select for a fixed list of values (an enum) with French labels.
 *
 * @example
 * <EnumSelectField name="guaranteeLevel" label="Niveau de garantie" required
 *   options={{ CERTIFIED: "Certifié sans gluten", NATURALLY_GF: "Naturellement sans gluten", TRACES_RISK: "Risque de traces" }}
 *   defaultValue={product.guaranteeLevel} placeholder="Choisir…" />
 */
export function EnumSelectField({
  options,
  placeholder,
  ...props
}: SelectFieldProps & { options: Record<string, string> | { value: string; label: string }[] }) {
  return (
    <SelectField {...props}>
      <SelectOptions options={options} placeholder={placeholder} />
    </SelectField>
  );
}

/**
 * The 24 Tunisian governorates (values match lib/validators.ts `governorate`).
 *
 * @example
 * <GovernorateSelectField name="governorate" label="Gouvernorat" required defaultValue={producer.governorate} />
 */
export function GovernorateSelectField({ placeholder = "Choisir un gouvernorat…", ...props }: SelectFieldProps) {
  return (
    <SelectField {...props}>
      <SelectOptions options={GOVERNORATES.map((g) => ({ value: g.value, label: g.value }))} placeholder={placeholder} />
    </SelectField>
  );
}
