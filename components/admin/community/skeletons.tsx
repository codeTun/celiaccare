import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Loading placeholders (Suspense fallbacks) with the same layout as the
   content they stand for: no spinner for page loads (DESIGN-SYSTEM.md).
   ========================================================================== */

function LoadingLabel() {
  return (
    <span className="sr-only" role="status">
      Chargement…
    </span>
  );
}

/** Stat cards + filter bar + table rows. */
export function AdminListSkeleton({ stats = 0, rows = 8 }: { stats?: number; rows?: number }) {
  return (
    <div aria-busy="true">
      <LoadingLabel />
      {stats > 0 ? (
        <div className={cn("mb-6 grid gap-4 sm:grid-cols-2", stats >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3")}>
          {Array.from({ length: stats }, (_, index) => (
            <div key={index} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="size-10 rounded-xl" />
              </div>
              <Skeleton className="mt-3 h-8 w-24" />
            </div>
          ))}
        </div>
      ) : null}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-full sm:max-w-sm" />
      </div>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-soft">
        <div className="flex gap-6 border-b border-line bg-canvas px-4 py-3">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-3 w-20 bg-line" />
          ))}
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-center gap-6 px-4 py-4">
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="ms-auto h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Cards of fields (create / edit pages). */
export function AdminFormSkeleton({ sections = 3, aside = false }: { sections?: number; aside?: boolean }) {
  const card = (key: number, fields: number) => (
    <div key={key} className="rounded-[var(--radius-card)] border border-line bg-white shadow-soft">
      <div className="space-y-2 border-b border-line px-5 py-4 sm:px-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-72 max-w-full" />
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
  return (
    <div aria-busy="true" className={cn("grid items-start gap-6", aside && "xl:grid-cols-[minmax(0,1fr)_22rem]")}>
      <LoadingLabel />
      <div className="space-y-6">{Array.from({ length: sections }, (_, index) => card(index, 4))}</div>
      {aside ? <div className="space-y-6">{[0, 1].map((index) => card(index, 2))}</div> : null}
    </div>
  );
}

/** A detail page: main card + side cards. */
export function AdminDetailSkeleton() {
  return (
    <div aria-busy="true" className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <LoadingLabel />
      <div className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-soft">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="space-y-2 pt-4">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="space-y-6">
        {[0, 1].map((index) => (
          <div key={index} className="space-y-3 rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-soft">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
