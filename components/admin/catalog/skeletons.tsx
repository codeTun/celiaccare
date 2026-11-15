import { Skeleton } from "@/components/ui/skeleton";

/* ==========================================================================
   Loading placeholders of the catalogue pages (shown by <Suspense> while the
   session is checked and the data loaded). Same shapes as the real content.
   ========================================================================== */

function LoadingLabel() {
  return (
    <span className="sr-only" role="status">
      Chargement…
    </span>
  );
}

/** A list page: search + filters, status tabs, then the table. */
export function CatalogListSkeleton({ columns = 6, rows = 8, filters = 0 }: { columns?: number; rows?: number; filters?: number }) {
  return (
    <div aria-busy="true">
      <LoadingLabel />
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <Skeleton className="h-10 w-full rounded-full sm:max-w-sm" />
        <div className="flex gap-2">
          {Array.from({ length: filters }, (_, index) => (
            <Skeleton key={index} className="h-10 w-44 rounded-full" />
          ))}
        </div>
      </div>
      <div className="mb-4 flex gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-soft">
        <div className="flex gap-6 border-b border-line bg-canvas px-4 py-3">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton key={index} className="h-3 w-20 bg-line" />
          ))}
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-center gap-6 px-4 py-3.5">
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="hidden h-4 w-24 sm:block" />
              <Skeleton className="hidden h-6 w-20 rounded-full md:block" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({ fields }: { fields: number }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white shadow-soft">
      <div className="space-y-2 border-b border-line px-5 py-4 sm:px-6">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
      <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** An edit / create page: the record summary (edit only), then the form in two columns. */
export function CatalogFormSkeleton({ summary = true, side = true }: { summary?: boolean; side?: boolean }) {
  return (
    <div aria-busy="true">
      <LoadingLabel />
      {summary ? (
        <div className="mb-6 flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft">
          <Skeleton className="size-16 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-56 max-w-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ) : null}
      <div className={side ? "grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,23rem)]" : "max-w-3xl"}>
        <div className="space-y-6">
          <SectionSkeleton fields={4} />
          <SectionSkeleton fields={2} />
        </div>
        {side ? (
          <div className="space-y-6">
            <SectionSkeleton fields={1} />
            <SectionSkeleton fields={1} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
