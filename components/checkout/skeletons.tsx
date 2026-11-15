import { Skeleton } from "@/components/ui/skeleton";

/* Grey placeholders shown while the cart is read from the browser (same layout as the real content). */

/** Lines of the cart + summary card. `label` is read by screen readers ("Chargement de votre panier…"). */
export function CartSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
      <span className="sr-only">{label}</span>
      <div className="rounded-[var(--radius-card)] border border-line bg-white shadow-soft">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex gap-4 border-b border-line px-5 py-5 last:border-0 sm:px-6">
            <Skeleton className="size-20 shrink-0 sm:size-24" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
              <Skeleton className="h-11 w-32 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Steps + delivery form + order summary. */
export function CheckoutSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <Skeleton className="mb-8 h-10 w-full max-w-xl rounded-full" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-7">
          <Skeleton className="h-6 w-64" />
          <div className="grid gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3].map((field) => (
              <div key={field} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
        <div className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

/** Tracking form (while the ?ref= of the address is read). */
export function TrackingFormSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-7">
      <Skeleton className="h-6 w-56" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="h-12 w-48 rounded-full" />
    </div>
  );
}
