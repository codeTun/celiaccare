import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown in the content area (the sidebar and top bar stay) while an admin page loads.
 * Same layout as most admin pages: header, stat cards, then a table.
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Chargement…
      </span>

      <div className="mb-6 space-y-2.5">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-[28rem] max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-10 rounded-xl" />
            </div>
            <Skeleton className="mt-3 h-8 w-32" />
            <Skeleton className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-soft">
        <div className="flex gap-6 border-b border-line bg-canvas px-4 py-3">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-3 w-20 bg-line" />
          ))}
        </div>
        <div className="divide-y divide-line">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex items-center gap-6 px-4 py-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="ms-auto h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
