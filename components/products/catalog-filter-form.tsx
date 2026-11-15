"use client";

import { ArrowRight, Ban, Check, Search } from "lucide-react";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";

import { buttonStyles } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/form";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import type { ProductsDict } from "@/i18n/resources/fr/products";
import { cn, normalizeSearch } from "@/lib/utils";
import type { GuaranteeLevel } from "@/types";

import { formToCatalogHref, submitForm } from "./catalog-url";

/** One choice of a filter (a category, an allergen, an ingredient). `value` is what goes in the URL. */
export type FilterChoice = { value: string; label: string; count?: number; icon?: ReactNode };

/** A guarantee level and its URL value ("certifie", "naturel", "traces"). */
export type GuaranteeChoice = { value: string; label: string; level: GuaranteeLevel };

/** The current filters, written as in the URL. They pre-fill the form. */
export type CatalogFilterValues = {
  q: string;
  categorie: string;
  ingredients: string[];
  sans: string[];
  garantie: string;
  prixMin: string;
  prixMax: string;
  artisan: string;
  tri: string;
};

/** Everything the visitor can choose from. */
export type CatalogFilterOptions = {
  categories: FilterChoice[];
  guarantees: GuaranteeChoice[];
  allergens: FilterChoice[];
  ingredients: FilterChoice[];
  /** Cheapest and most expensive product, in dinars ("" when the catalogue is empty) */
  priceRange: { min: string; max: string };
};

export type CatalogFilterFormProps = {
  /** id of the <form>. Also prefixes the field ids: the form is on the page twice (sidebar + mobile sheet). */
  id: string;
  /** Catalogue path, e.g. "/fr/produits" */
  action: string;
  values: CatalogFilterValues;
  options: CatalogFilterOptions;
  labels: ProductsDict["filters"];
  /** Sidebar: checkboxes and radio buttons apply at once. Mobile sheet: they wait for its button. */
  autoSubmit?: boolean;
  /** Called when the new results start loading (the mobile sheet closes itself) */
  onNavigate?: () => void;
  className?: string;
};

const sectionTitle = "mb-2.5 text-sm font-bold text-ink";
const hintText = "-mt-1 mb-3 text-xs leading-relaxed text-ink-subtle";

/**
 * Catalogue filters: search, category, guarantee level, allergens to avoid, price and ingredients.
 * It is a normal GET form (it works without JavaScript); with JavaScript it builds a clean URL
 * (/fr/produits?sans=lait,oeufs) and loads the results without reloading the page.
 */
export function CatalogFilterForm({
  id,
  action,
  values,
  options,
  labels,
  autoSubmit = false,
  onNavigate,
  className,
}: CatalogFilterFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [ingredientQuery, setIngredientQuery] = useState("");

  // Links such as "Tout effacer" or a category chip change the URL without touching this form:
  // put the fields back to the values of the new URL (the field in use keeps the focus).
  const valuesKey = JSON.stringify(values);
  useEffect(() => {
    if (formRef.current) restoreDefaultValues(formRef.current);
  }, [valuesKey]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const href = formToCatalogHref(event.currentTarget, action);
    startTransition(() => router.push(href, { scroll: false }));
    onNavigate?.();
  }

  function handleChange(event: FormEvent<HTMLFormElement>) {
    const field = event.target;
    const isChoice = field instanceof HTMLInputElement && (field.type === "checkbox" || field.type === "radio");
    // Text fields (search, prices) wait for "Enter" or their button.
    if (autoSubmit && isChoice && field.name) submitForm(event.currentTarget);
  }

  const searchWords = normalizeSearch(ingredientQuery);
  const isVisibleIngredient = (choice: FilterChoice) => !searchWords || normalizeSearch(choice.label).includes(searchWords);
  const hasVisibleIngredient = options.ingredients.some(isVisibleIngredient);

  return (
    <Form
      ref={formRef}
      id={id}
      action={action}
      onSubmit={handleSubmit}
      onChange={handleChange}
      // read by the results list, which fades while the new results load
      data-pending={isPending || undefined}
      aria-busy={isPending || undefined}
      className={cn("flex flex-col gap-7", className)}
    >
      {/* Kept as they are when the filters change */}
      {values.artisan ? <input type="hidden" name="artisan" value={values.artisan} /> : null}
      {values.tri ? <input type="hidden" name="tri" value={values.tri} /> : null}

      {/* Search */}
      <div>
        <label htmlFor={`${id}-q`} className={cn(sectionTitle, "block")}>
          {labels.searchLabel}
        </label>
        <div className="relative">
          <Input
            id={`${id}-q`}
            type="search"
            name="q"
            defaultValue={values.q}
            placeholder={labels.searchPlaceholder}
            maxLength={100}
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 pe-11 [&::-webkit-search-cancel-button]:appearance-none"
          />
          <button
            type="submit"
            className="absolute end-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-800"
          >
            <Search className="size-[18px]" aria-hidden="true" />
            <span className="sr-only">{labels.apply}</span>
          </button>
        </div>
      </div>

      {/* Category (one choice) */}
      {options.categories.length > 0 ? (
        <fieldset className="min-w-0">
          <legend className={sectionTitle}>{labels.category}</legend>
          <div className="flex flex-col gap-0.5">
            <ChoiceRow
              name="categorie"
              value=""
              label={labels.allCategories}
              defaultChecked={!values.categorie}
            />
            {options.categories.map((category) => (
              <ChoiceRow
                key={category.value}
                name="categorie"
                value={category.value}
                label={category.label}
                icon={category.icon}
                count={category.count}
                defaultChecked={values.categorie === category.value}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* Guarantee level (one choice) */}
      <fieldset className="min-w-0">
        <legend className={sectionTitle}>{labels.guarantee}</legend>
        <div className="flex flex-col gap-0.5">
          <ChoiceRow name="garantie" value="" label={labels.allGuarantees} defaultChecked={!values.garantie} />
          {options.guarantees.map((guarantee) => (
            <ChoiceRow
              key={guarantee.value}
              name="garantie"
              value={guarantee.value}
              label={guarantee.label}
              badge={<GuaranteeBadge level={guarantee.level} label={guarantee.label} />}
              defaultChecked={values.garantie === guarantee.value}
            />
          ))}
        </div>
      </fieldset>

      {/* Allergens to avoid (several choices) */}
      {options.allergens.length > 0 ? (
        <fieldset className="min-w-0">
          <legend className={sectionTitle}>{labels.exclude}</legend>
          <p className={hintText}>{labels.excludeHint}</p>
          <div className="flex flex-wrap gap-2">
            {options.allergens.map((allergen) => (
              <label
                key={allergen.value}
                className={cn(
                  "group inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-medium text-ink-muted ring-1 ring-line-strong transition-colors select-none hover:ring-brand-300",
                  "has-checked:bg-red-50 has-checked:text-red-700 has-checked:ring-red-200",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-600",
                )}
              >
                <input
                  type="checkbox"
                  name="sans"
                  value={allergen.value}
                  defaultChecked={values.sans.includes(allergen.value)}
                  className="sr-only"
                />
                <Ban className="hidden size-3.5 group-has-checked:block" aria-hidden="true" />
                {allergen.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* Price, in dinars */}
      <fieldset className="min-w-0">
        <legend className={sectionTitle}>{labels.price}</legend>
        <div className="flex items-center gap-2">
          <label htmlFor={`${id}-min`} className="sr-only">
            {labels.priceMin}
          </label>
          <Input
            id={`${id}-min`}
            type="number"
            name="prixMin"
            inputMode="decimal"
            min={0}
            step="any"
            defaultValue={values.prixMin}
            placeholder={options.priceRange.min ? `${labels.priceFrom} ${options.priceRange.min}` : labels.priceFrom}
            className="h-10 min-w-0 px-3"
          />
          <span className="text-ink-subtle" aria-hidden="true">
            –
          </span>
          <label htmlFor={`${id}-max`} className="sr-only">
            {labels.priceMax}
          </label>
          <Input
            id={`${id}-max`}
            type="number"
            name="prixMax"
            inputMode="decimal"
            min={0}
            step="any"
            defaultValue={values.prixMax}
            placeholder={options.priceRange.max ? `${labels.priceTo} ${options.priceRange.max}` : labels.priceTo}
            className="h-10 min-w-0 px-3"
          />
          <button type="submit" className={buttonStyles({ variant: "secondary", size: "icon-sm", className: "shrink-0" })}>
            <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
            <span className="sr-only">{labels.apply}</span>
          </button>
        </div>
      </fieldset>

      {/* Ingredients the product must contain (several choices, searchable list) */}
      {options.ingredients.length > 0 ? (
        <fieldset className="min-w-0">
          <legend className={sectionTitle}>{labels.contains}</legend>
          <p className={hintText}>{labels.containsHint}</p>
          <div className="relative mb-2">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
              aria-hidden="true"
            />
            {/* No `name`: this box only filters the list below, it is not sent with the form. */}
            <Input
              type="search"
              value={ingredientQuery}
              onChange={(event) => setIngredientQuery(event.target.value)}
              aria-label={labels.ingredientSearch}
              aria-controls={`${id}-ingredients`}
              placeholder={labels.ingredientSearch}
              autoComplete="off"
              className="h-10 ps-9 text-sm"
            />
          </div>
          <div
            id={`${id}-ingredients`}
            className="max-h-64 overflow-y-auto overscroll-contain rounded-xl bg-white p-1.5 ring-1 ring-line"
          >
            {options.ingredients.map((ingredient) => (
              <label
                key={ingredient.value}
                hidden={!isVisibleIngredient(ingredient)}
                className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink-muted transition-colors hover:bg-canvas has-checked:font-semibold has-checked:text-ink"
              >
                <Checkbox
                  name="ingredients"
                  value={ingredient.value}
                  defaultChecked={values.ingredients.includes(ingredient.value)}
                />
                <span className="min-w-0">{ingredient.label}</span>
              </label>
            ))}
            {hasVisibleIngredient ? null : (
              <p className="px-2 py-3 text-sm text-ink-subtle" role="status">
                {labels.noIngredientFound}
              </p>
            )}
          </div>
        </fieldset>
      ) : null}

      {/* Checkboxes apply by themselves with JavaScript: this button is only needed without it. */}
      {autoSubmit ? (
        <button type="submit" className={buttonStyles({ className: "hidden w-full noscript:inline-flex" })}>
          {labels.apply}
        </button>
      ) : null}
    </Form>
  );
}

/** A radio button shown as a row of a single-choice list (category, guarantee level). */
function ChoiceRow({
  name,
  value,
  label,
  icon,
  badge,
  count,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  icon?: ReactNode;
  /** Shown instead of the label (the label stays for screen readers) */
  badge?: ReactNode;
  count?: number;
  defaultChecked: boolean;
}) {
  return (
    <label
      className={cn(
        "group flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-2.5 py-1.5 text-sm text-ink-muted transition-colors select-none hover:bg-canvas",
        "has-checked:bg-brand-50 has-checked:font-semibold has-checked:text-brand-900",
        "has-focus-visible:outline-2 has-focus-visible:outline-brand-600",
      )}
    >
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="sr-only" />
      {icon ? (
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-brand-700 ring-1 ring-line group-has-checked:ring-brand-200 [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      {badge ? (
        <span className="min-w-0 flex-1">{badge}</span>
      ) : (
        <span className="min-w-0 flex-1 truncate">{label}</span>
      )}
      {count !== undefined ? <span className="tabular text-xs font-medium text-ink-subtle">{count}</span> : null}
      <Check className="hidden size-4 shrink-0 text-brand-600 group-has-checked:block" aria-hidden="true" />
    </label>
  );
}

/** Puts every sent field back to its default value, i.e. the value written in the HTML for the current URL. */
function restoreDefaultValues(form: HTMLFormElement) {
  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement) || !element.name || element.type === "hidden") continue;
    if (element.type === "checkbox" || element.type === "radio") element.checked = element.defaultChecked;
    else element.value = element.defaultValue;
  }
}
