import { Search, X } from "lucide-react";
import Form from "next/form";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { adminHref, firstParam, paramValues, type AdminQuery } from "./query-string";

/**
 * Search box of an admin list (GET form: the search goes in the URL, e.g. ?q=sfax).
 * The other params (filters, sort) are kept; the page number goes back to 1.
 *
 * @example
 * <SearchForm basePath="/admin/produits" query={query} placeholder="Nom, artisan…" />
 */
export function SearchForm({
  basePath,
  query,
  name = "q",
  label = "Rechercher",
  placeholder = "Rechercher…",
  className,
}: {
  /** The list page, e.g. "/admin/produits" */
  basePath: string;
  /** The current search params of the page. */
  query?: AdminQuery;
  /** Name of the search param (default "q"). */
  name?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  const current = firstParam(query?.[name]) ?? "";
  const kept = Object.entries(query ?? {}).filter(([key]) => key !== name && key !== "page" && key !== "ok");

  return (
    <Form action={basePath} role="search" className={cn("relative w-full sm:max-w-sm", className)}>
      {kept.flatMap(([key, value]) =>
        paramValues(value).map((item, index) => <input key={`${key}-${index}`} type="hidden" name={key} value={item} />),
      )}
      <label htmlFor={`search-${name}`} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
        aria-hidden="true"
      />
      <input
        id={`search-${name}`}
        type="search"
        name={name}
        defaultValue={current}
        placeholder={placeholder}
        maxLength={100}
        autoComplete="off"
        className="h-10 w-full rounded-full border border-line-strong bg-white ps-10 pe-32 text-sm text-ink shadow-xs transition placeholder:text-ink-subtle focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute inset-y-0 end-1 flex items-center gap-0.5">
        {current ? (
          <Link
            href={adminHref(basePath, query, { [name]: null })}
            className="grid size-8 place-items-center rounded-full text-ink-subtle transition-colors hover:bg-canvas hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Effacer la recherche</span>
          </Link>
        ) : null}
        <button
          type="submit"
          className="grid h-8 place-items-center rounded-full bg-brand-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Chercher
        </button>
      </div>
    </Form>
  );
}
