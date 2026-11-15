"use client";

import { LoaderCircle, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Filter form of the directory pages (restaurants, artisans). It is a normal GET form:
 * without JavaScript the browser simply loads "?q=...&gouvernorat=...".
 * With JavaScript the page is updated without a full reload, without jumping to the
 * top, and empty fields are left out of the URL.
 *
 * Layout: the fields (`children`, ideally 3: search + 2 lists) on the first row,
 * then `extra` (e.g. a toggle) and the buttons on the second row.
 *
 * Give it a `key` built from the current filters so its fields are reset when the
 * filters change from elsewhere (the "Effacer les filtres" link for example).
 */
export function FilterForm({
  action,
  label,
  submitLabel,
  resetLabel,
  showReset,
  extra,
  children,
  className,
}: {
  /** Page path, e.g. "/fr/restaurants" */
  action: string;
  /** Name of the form for screen readers */
  label: string;
  submitLabel: string;
  resetLabel: string;
  /** Show the "reset" link (when at least one filter is active) */
  showReset: boolean;
  /** Shown at the start of the second row (e.g. the "partners only" toggle) */
  extra?: ReactNode;
  /** The fields of the first row */
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value.trim() !== "") query.append(name, value.trim());
    }
    const text = query.toString();
    const href = text ? `${action}?${text}` : action;
    startTransition(() => router.push(href, { scroll: false }));
  }

  return (
    <form
      action={action}
      method="get"
      role="search"
      aria-label={label}
      aria-busy={isPending}
      onSubmit={handleSubmit}
      className={cn("rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-soft sm:p-5", className)}
    >
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] md:items-end">
        {children}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>{extra}</div>
        <div className="flex items-center gap-4">
          {showReset ? (
            <Link
              href={action}
              scroll={false}
              className="shrink-0 text-sm font-semibold text-ink-muted underline-offset-4 hover:text-brand-700 hover:underline"
            >
              {resetLabel}
            </Link>
          ) : null}
          <Button type="submit" className="flex-1 sm:flex-none" disabled={isPending}>
            {isPending ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <SlidersHorizontal aria-hidden="true" />
            )}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
