"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { adminHref, paramValues, type AdminQuery } from "@/components/admin/query-string";
import { SelectOptions } from "@/components/admin/select-fields";
import { Select } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export type FilterSelect = {
  /** Search param, e.g. "category". */
  name: string;
  /** Accessible name of the select ("Catégorie"). */
  label: string;
  /** First option, meaning "no filter" ("Toutes les catégories"). */
  placeholder: string;
  options: { value: string; label: string }[];
};

/**
 * Drop-down filters of an admin list (category, artisan, governorate…), kept in the URL.
 * Choosing an option opens the filtered list right away (page 1, the other params kept).
 * Without JavaScript it is a normal GET form with a "Filtrer" button.
 * "Réinitialiser" removes every filter and the search.
 *
 * @example
 * <FilterBar basePath="/admin/produits" query={query}
 *   selects={[{ name: "category", label: "Catégorie", placeholder: "Toutes les catégories", options }]} />
 */
export function FilterBar({
  basePath,
  query,
  selects,
  className,
}: {
  basePath: string;
  query: AdminQuery;
  selects: FilterSelect[];
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const selectNames = new Set(selects.map((select) => select.name));
  // Other params (search, status tab…) travel with the GET form.
  const kept = Object.entries(query).filter(([key]) => !selectNames.has(key) && key !== "page" && key !== "ok");
  const hasFilters = Object.entries(query).some(([key, value]) => key !== "page" && key !== "ok" && paramValues(value).length > 0);

  function choose(name: string, value: string) {
    startTransition(() => router.push(adminHref(basePath, query, { [name]: value || null }), { scroll: false }));
  }

  return (
    <form
      action={basePath}
      method="get"
      aria-busy={pending || undefined}
      className={cn("flex flex-wrap items-center gap-2 transition-opacity", pending && "opacity-60", className)}
    >
      {kept.flatMap(([key, value]) =>
        paramValues(value).map((item, index) => <input key={`${key}-${index}`} type="hidden" name={key} value={item} />),
      )}
      {selects.map((select) => {
        const current = paramValues(query[select.name])[0] ?? "";
        return (
          <label key={select.name} className="min-w-0 flex-1 sm:w-56 sm:flex-none">
            <span className="sr-only">{select.label}</span>
            <Select
              // A new key when the URL changes: an uncontrolled <select> would keep its old choice.
              key={current}
              name={select.name}
              defaultValue={current}
              onChange={(event) => choose(select.name, event.target.value)}
              className={cn("h-10 rounded-full text-sm", current && "border-brand-300 bg-brand-50/50 font-semibold")}
            >
              <SelectOptions options={select.options} placeholder={select.placeholder} />
            </Select>
          </label>
        );
      })}
      <noscript>
        <button type="submit" className="h-10 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white">
          Filtrer
        </button>
      </noscript>
      {hasFilters ? (
        <Link
          href={basePath}
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-white hover:text-ink"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Réinitialiser
        </Link>
      ) : null}
    </form>
  );
}
