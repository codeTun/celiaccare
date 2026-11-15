"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Button, buttonStyles } from "@/components/ui/button";
import { interpolate } from "@/i18n/interpolate";
import type { ProductsDict } from "@/i18n/resources/fr/products";
import { cn } from "@/lib/utils";

import { CatalogFilterForm, type CatalogFilterOptions, type CatalogFilterValues } from "./catalog-filter-form";

const FORM_ID = "catalog-filters-sheet";

/**
 * Phones and tablets: a "Filtres" button that opens the filters in a bottom sheet
 * (native <dialog>: the focus stays inside, Escape closes it). Hidden from `lg`,
 * where the filters are in the sidebar.
 */
export function MobileFilters({
  action,
  values,
  options,
  labels,
  activeCount,
  resetHref,
  className,
}: {
  action: string;
  values: CatalogFilterValues;
  options: CatalogFilterOptions;
  labels: ProductsDict["filters"];
  /** Number of active filters, shown on the button */
  activeCount: number;
  /** Link that removes every filter */
  resetHref: string;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Visited pages stay mounted in the background: never leave the sheet open behind us.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => dialog?.close();
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <Button
        variant="outline"
        size="md"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn("lg:hidden", className)}
      >
        <SlidersHorizontal aria-hidden="true" />
        {labels.button}
        {activeCount > 0 ? (
          <span className="grid min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] leading-5 font-bold text-white tabular">
            {activeCount}
            <span className="sr-only">{` — ${interpolate(labels.activeCount, { count: activeCount })}`}</span>
          </span>
        ) : null}
      </Button>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => {
          // a click on the dark backdrop closes the sheet
          if (event.target === dialogRef.current) close();
        }}
        aria-labelledby={`${FORM_ID}-title`}
        className="m-0 mt-auto h-auto max-h-[90dvh] w-full max-w-none overflow-hidden rounded-t-3xl border-0 bg-white p-0 text-ink shadow-lift backdrop:bg-brand-950/40 backdrop:backdrop-blur-[2px] lg:hidden"
      >
        {open ? (
          <div className="flex max-h-[90dvh] flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
              <h2 id={`${FORM_ID}-title`} className="text-lg font-bold">
                {labels.title}
              </h2>
              <button
                type="button"
                onClick={close}
                className="grid size-10 place-items-center rounded-full text-ink-muted transition-colors hover:bg-canvas"
              >
                <X className="size-5" aria-hidden="true" />
                <span className="sr-only">{labels.close}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              <CatalogFilterForm
                id={FORM_ID}
                action={action}
                values={values}
                options={options}
                labels={labels}
                onNavigate={() => {
                  close();
                  document.getElementById("catalog-results")?.scrollIntoView({ block: "start" });
                }}
              />
            </div>

            <div className="flex items-center gap-3 border-t border-line bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Link href={resetHref} scroll={false} onClick={close} className={buttonStyles({ variant: "ghost" })}>
                {labels.clearAll}
              </Link>
              <Button type="submit" form={FORM_ID} className="flex-1">
                {labels.showResults}
              </Button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
