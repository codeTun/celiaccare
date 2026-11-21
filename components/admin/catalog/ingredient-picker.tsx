"use client";

import { ExternalLink, Search, TriangleExclamationPoint, X } from "lucide-react";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { cn, normalizeSearch } from "@/lib/utils";
import type { IngredientOption } from "@/types/admin-data";

/** "3 ingrédients cochés, dont 1 allergène." */
function summaryText(count: number, allergens: number) {
  if (count === 0) return "Aucun ingrédient coché : la fiche indiquera « composition non publiée ». Ne cochez que la composition publiée par le fabricant.";
  const ingredients = `${count} ingrédient${count > 1 ? "s" : ""} coché${count > 1 ? "s" : ""}`;
  if (allergens === 0) return `${ingredients}, sans allergène.`;
  return `${ingredients}, dont ${allergens} allergène${allergens > 1 ? "s" : ""}.`;
}

/**
 * Ingredients of a product (or a dish): a searchable checkbox list in two groups,
 * allergens first (flagged in red), then the other ingredients, A → Z.
 * The ticked ones are summed up at the top as chips (click a chip to untick it).
 *
 * Sends one "ingredientIds" value per ticked box (read it with `idList` on the server).
 * The checkboxes stay uncontrolled (defaultChecked) so the form works like any HTML form;
 * the component only mirrors them for the summary. Give it a `key` when `defaultSelected`
 * can change (the catalogue forms rebuild their fields after an error).
 */
export function IngredientPicker({
  options,
  defaultSelected,
  error,
  name = "ingredientIds",
  manageHref = "/admin/ingredients",
}: {
  options: IngredientOption[];
  defaultSelected: readonly number[];
  error?: string | string[] | null;
  name?: string;
  /** Page to add a missing ingredient (opened in a new tab: the form stays as it is). */
  manageHref?: string;
}) {
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(() => new Set(defaultSelected));
  const [search, setSearch] = useState("");

  const message = Array.isArray(error) ? error[0] : error;
  const wanted = normalizeSearch(search);

  const groups = useMemo(
    () => [
      { key: "allergens", title: "Allergènes", items: options.filter((option) => option.isAllergen) },
      { key: "others", title: "Autres ingrédients", items: options.filter((option) => !option.isAllergen) },
    ],
    [options],
  );
  const searchable = useMemo(() => new Map(options.map((option) => [option.id, normalizeSearch(option.name)])), [options]);
  const chosen = options.filter((option) => selected.has(option.id));
  const visibleCount = wanted ? options.filter((option) => searchable.get(option.id)?.includes(wanted)).length : options.length;

  function mark(ingredientId: number, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(ingredientId);
      else next.delete(ingredientId);
      return next;
    });
  }

  function untick(ingredientId: number) {
    const box = listRef.current?.querySelector<HTMLInputElement>(`input[value="${ingredientId}"]`);
    if (box) box.checked = false;
    mark(ingredientId, false);
  }

  // Enter in the search box must not send the whole form.
  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") event.preventDefault();
  }

  return (
    <fieldset
      className="min-w-0"
      aria-describedby={[`${id}-summary`, message ? `${id}-error` : null].filter(Boolean).join(" ")}
      data-invalid={message ? "true" : undefined}
    >
      <legend className="text-sm font-semibold text-ink">
        Ingrédients
        <span className="ms-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      </legend>

      {/* Summary of the ticked ingredients */}
      <div className="mt-2 rounded-2xl border border-line bg-canvas/60 p-3">
        <p id={`${id}-summary`} className="text-xs font-medium text-ink-muted" aria-live="polite">
          {summaryText(chosen.length, chosen.filter((option) => option.isAllergen).length)}
        </p>
        {chosen.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {chosen.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => untick(option.id)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1 rounded-full ps-2.5 pe-1.5 text-xs font-semibold transition-colors",
                    option.isAllergen
                      ? "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                      : "bg-white text-ink ring-1 ring-line-strong hover:bg-brand-50",
                  )}
                >
                  {option.name}
                  <X className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">(retirer)</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Search */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor={`${id}-search`} className="sr-only">
            Rechercher un ingrédient
          </label>
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input
            id={`${id}-search`}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Rechercher un ingrédient (riz, lait, amande…)"
            autoComplete="off"
            className="h-10 w-full rounded-full border border-line-strong bg-white ps-9 pe-4 text-sm text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
          />
        </div>
        <a
          href={manageHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
        >
          Ajouter un ingrédient manquant
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(nouvel onglet)</span>
        </a>
      </div>

      {/* The checkboxes (all stay in the page, the search only hides them) */}
      <div ref={listRef} className="mt-3 max-h-[26rem] space-y-4 overflow-y-auto rounded-2xl border border-line p-3">
        {groups.map((group) => {
          const visible = group.items.filter((option) => !wanted || searchable.get(option.id)?.includes(wanted));
          return (
            <div key={group.key} hidden={group.items.length === 0 || visible.length === 0}>
              <p className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.08em] text-ink-subtle uppercase">
                {group.key === "allergens" ? <TriangleExclamationPoint className="size-3.5 text-red-600" aria-hidden="true" /> : null}
                {group.title}
                <span className="font-semibold tracking-normal normal-case">({group.items.length})</span>
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((option) => {
                  const hidden = Boolean(wanted) && !searchable.get(option.id)?.includes(wanted);
                  return (
                    <label
                      key={option.id}
                      hidden={hidden}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors",
                        "has-[:checked]:font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600",
                        option.isAllergen
                          ? "border-red-100 bg-red-50/40 text-ink hover:bg-red-50 has-[:checked]:border-red-300 has-[:checked]:bg-red-50"
                          : "border-line bg-white text-ink hover:bg-brand-50/50 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50",
                      )}
                    >
                      <input
                        type="checkbox"
                        name={name}
                        value={option.id}
                        defaultChecked={defaultSelected.includes(option.id)}
                        onChange={(event) => mark(option.id, event.target.checked)}
                        className="size-4 shrink-0 cursor-pointer rounded accent-brand-600 focus-visible:outline-none"
                      />
                      <span className="min-w-0 flex-1 truncate">{option.name}</span>
                      {option.isAllergen ? (
                        <span className="shrink-0 rounded-full bg-red-100 px-1.5 text-[10px] font-bold text-red-700 uppercase">
                          Allergène
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        {visibleCount === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-ink-muted">
            Aucun ingrédient ne correspond à « {search.trim()} ».
          </p>
        ) : null}
      </div>

      {message ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
