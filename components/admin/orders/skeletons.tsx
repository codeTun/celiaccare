import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Loading placeholders (Suspense fallbacks) of the operations pages:
   orders, deliveries and customers. Same shapes as the real content, no spinner.
   ========================================================================== */

/** Filters + table + pagination of a list page. */
export function TableSkeleton({
  rows = 8,
  columns = 6,
  toolbar = true,
  className,
}: {
  rows?: number;
  columns?: number;
  /** Show the tabs and search placeholders above the table. */
  toolbar?: boolean;
  className?: string;
}) {
  return (
    <div aria-busy="true" className={className}>
      <span className="sr-only" role="status">
        Chargement de la liste…
      </span>
      {toolbar ? (
        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton key={index} className="h-9 w-24 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-full max-w-sm rounded-full" />
        </div>
      ) : null}
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-soft">
        <div className="flex gap-6 border-b border-line bg-canvas px-4 py-3">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton key={index} className="h-3 w-20 bg-line" />
          ))}
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-center gap-6 px-4 py-4">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="ms-auto h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A white card with a title and a few lines (detail pages, side panels). */
export function CardSkeleton({ lines = 4, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6", className)}>
      <Skeleton className="h-5 w-40" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton key={index} className={cn("h-4", index % 2 === 0 ? "w-full" : "w-2/3")} />
        ))}
      </div>
    </div>
  );
}

/** Order detail page: summary bar, then two columns of cards. */
export function OrderDetailSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Chargement de la commande…
      </span>
      <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-40 rounded-full" />
        </div>
      </div>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CardSkeleton lines={6} />
          <CardSkeleton lines={4} />
        </div>
        <div className="space-y-6">
          <CardSkeleton lines={5} />
          <CardSkeleton lines={3} />
        </div>
      </div>
    </div>
  );
}

/** Create / edit form: sections of fields and the bottom bar. */
export function FormSkeleton({ sections = 1, fields = 4 }: { sections?: number; fields?: number }) {
  return (
    <div aria-busy="true" className="space-y-6">
      <span className="sr-only" role="status">
        Chargement du formulaire…
      </span>
      {Array.from({ length: sections }, (_, section) => (
        <div key={section} className="rounded-[var(--radius-card)] border border-line bg-white shadow-soft">
          <div className="border-b border-line px-5 py-4 sm:px-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-2 h-3 w-72 max-w-full" />
          </div>
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
            {Array.from({ length: fields }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft">
        <Skeleton className="h-11 w-24 rounded-full" />
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>
    </div>
  );
}
