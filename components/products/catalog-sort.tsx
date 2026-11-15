"use client";

import { ArrowUpDown } from "lucide-react";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition, type FormEvent } from "react";

import { buttonStyles } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { cn } from "@/lib/utils";

import { formToCatalogHref, submitForm, type CatalogQuery } from "./catalog-url";

/**
 * "Trier par" select of the catalogue. A small GET form that keeps the current filters
 * (hidden fields); the new order applies as soon as it is chosen (button without JavaScript).
 */
export function CatalogSort({
  action,
  query,
  value,
  options,
  label,
  submitLabel,
  className,
}: {
  /** Catalogue path, e.g. "/fr/produits" */
  action: string;
  /** Current filters (URL values), kept when the order changes */
  query: CatalogQuery;
  /** Current ?tri= value ("" = newest first) */
  value: string;
  options: { value: string; label: string }[];
  label: string;
  submitLabel: string;
  className?: string;
}) {
  const router = useRouter();
  const selectRef = useRef<HTMLSelectElement>(null);
  const [isPending, startTransition] = useTransition();

  // Back/forward buttons can change the order without this select: show the order of the URL.
  useEffect(() => {
    if (selectRef.current) selectRef.current.value = value;
  }, [value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const href = formToCatalogHref(event.currentTarget, action);
    startTransition(() => router.push(href, { scroll: false }));
  }

  return (
    <Form
      action={action}
      onSubmit={handleSubmit}
      data-pending={isPending || undefined}
      className={cn("flex items-center gap-2", className)}
    >
      {Object.entries(query).map(([name, paramValue]) =>
        name === "tri" || name === "page" ? null : <input key={name} type="hidden" name={name} value={paramValue} />,
      )}
      <label htmlFor="catalog-sort" className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink-muted">
        <ArrowUpDown className="size-4" aria-hidden="true" />
        <span className="max-sm:sr-only">{label}</span>
      </label>
      <Select
        ref={selectRef}
        id="catalog-sort"
        name="tri"
        defaultValue={value}
        onChange={(event) => {
          if (event.currentTarget.form) submitForm(event.currentTarget.form);
        }}
        className="h-10 w-auto min-w-0 py-0 text-sm font-semibold"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <button type="submit" className={buttonStyles({ variant: "outline", size: "sm", className: "hidden noscript:inline-flex" })}>
        {submitLabel}
      </button>
    </Form>
  );
}
