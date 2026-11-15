"use client";

import { Search, TriangleExclamationPoint } from "lucide-react";
import { useId, useState } from "react";

import { cn, normalizeSearch } from "@/lib/utils";
import type { IngredientOption } from "@/types/admin-data";

/**
 * Checkboxes of the ingredients of a dish: allergens first (highlighted), then the others,
 * with a filter box for long lists. Every ticked box is sent as `name` (several values):
 * read it on the server with formDataToObject(formData, ["ingredientIds"]) + idList.
 * Filtering only hides boxes: ticked ingredients are always sent.
 */
export function IngredientChecklist({
  options,
  defaultSelected,
  name = "ingredientIds",
  error,
}: {
  options: IngredientOption[];
  defaultSelected: number[];
  name?: string;
  error?: string | string[];
}) {
  const id = useId();
  const [selected, setSelected] = useState(() => new Set(defaultSelected));
  const [filter, setFilter] = useState("");
  const query = normalizeSearch(filter);
  const message = Array.isArray(error) ? error[0] : error;

  const allergens = options.filter((option) => option.isAllergen);
  const others = options.filter((option) => !option.isAllergen);
  const matches = (option: IngredientOption) => !query || normalizeSearch(option.name).includes(query);
  const visibleCount = options.filter(matches).length;
  const selectedAllergens = allergens.filter((option) => selected.has(option.id));

  function toggle(optionId: number, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(optionId);
      else next.delete(optionId);
      return next;
    });
  }

  function group(title: string, items: IngredientOption[], allergen: boolean) {
    if (items.length === 0) return null;
    const hidden = !items.some(matches);
    return (
      <div className={cn(hidden && "hidden")}>
        <p
          className={cn(
            "mb-2 flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] uppercase",
            allergen ? "text-amber-800" : "text-ink-subtle",
          )}
        >
          {allergen ? <TriangleExclamationPoint className="size-3.5" aria-hidden="true" /> : null}
          {title}
        </p>
        <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((option) => {
            const checked = selected.has(option.id);
            return (
              <li key={option.id} className={cn(!matches(option) && "hidden")}>
                <label
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors",
                    checked
                      ? allergen
                        ? "border-amber-300 bg-amber-50 font-semibold text-amber-900"
                        : "border-brand-300 bg-brand-50/70 font-semibold text-brand-900"
                      : "border-line bg-white text-ink-muted hover:border-brand-200",
                  )}
                >
                  <input
                    type="checkbox"
                    name={name}
                    value={option.id}
                    checked={checked}
                    onChange={(event) => toggle(option.id, event.currentTarget.checked)}
                    className="size-[18px] shrink-0 cursor-pointer rounded-[5px] accent-brand-600"
                  />
                  <span className="min-w-0 truncate">{option.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <fieldset aria-describedby={`${id}-summary${message ? ` ${id}-error` : ""}`} className="space-y-4">
      <legend className="sr-only">Ingrédients du plat</legend>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <label htmlFor={`${id}-filter`} className="sr-only">
            Filtrer les ingrédients
          </label>
          <input
            id={`${id}-filter`}
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault(); // never submit the dish form from here
            }}
            placeholder="Filtrer les ingrédients…"
            autoComplete="off"
            className="h-10 w-full rounded-full border border-line-strong bg-white ps-9 pe-4 text-sm text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
          />
        </div>
        <p id={`${id}-summary`} className="text-sm text-ink-muted" aria-live="polite">
          <span className="font-semibold text-ink tabular">{selected.size}</span> ingrédient{selected.size > 1 ? "s" : ""} coché
          {selected.size > 1 ? "s" : ""}
          {selectedAllergens.length > 0 ? (
            <span className="text-amber-800">
              {" "}
              · allergène{selectedAllergens.length > 1 ? "s" : ""} : {selectedAllergens.map((option) => option.name).join(", ")}
            </span>
          ) : null}
        </p>
      </div>

      {options.length === 0 ? (
        <p className="rounded-2xl bg-canvas px-4 py-3 text-sm text-ink-muted">
          Aucun ingrédient enregistré. Ajoutez-les d&apos;abord dans la section « Ingrédients » de l&apos;administration.
        </p>
      ) : (
        <>
          {group("Allergènes", allergens, true)}
          {group("Autres ingrédients", others, false)}
          {visibleCount === 0 ? <p className="text-sm text-ink-subtle">Aucun ingrédient ne correspond à « {filter} ».</p> : null}
        </>
      )}

      {message ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
