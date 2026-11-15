import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Loading placeholders of the directory pages (same layout as the real content,
   no spinner — DESIGN-SYSTEM "Loading").
   ========================================================================== */

/** Filter bar + result count + a grid of cards. */
export function DirectoryResultsSkeleton({ variant, cards = 6 }: { variant: "restaurant" | "producer"; cards?: number }) {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-80 w-full rounded-[var(--radius-card)] sm:h-56 md:h-36" />
      <Skeleton className="mt-8 h-5 w-32" />
      <div
        className={cn(
          "mt-5 grid gap-4 sm:gap-6",
          variant === "restaurant" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {Array.from({ length: cards }, (_, index) =>
          variant === "restaurant" ? (
            <div key={index} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
              <Skeleton className="aspect-[16/10] rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ) : (
            <div key={index} className="flex flex-col items-center rounded-[var(--radius-card)] border border-line bg-white p-5">
              <div className="arch aspect-[4/5] w-full max-w-52 animate-pulse bg-brand-50" />
              <Skeleton className="mt-4 h-5 w-24 rounded-full" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

/** Restaurant or artisan page while its data loads. */
export function DetailPageSkeleton({ variant }: { variant: "restaurant" | "producer" }) {
  return (
    <div aria-hidden="true">
      <div className="border-b border-line bg-canvas">
        <Container className="py-8 sm:py-10 lg:py-12">
          <Skeleton className="h-4 w-56" />
          <div
            className={cn(
              "mt-7 grid items-center gap-8",
              variant === "restaurant" ? "lg:grid-cols-2 lg:gap-12" : "md:grid-cols-[auto_minmax(0,1fr)] md:gap-12",
            )}
          >
            {variant === "restaurant" ? (
              <Skeleton className="aspect-[16/10] w-full rounded-[var(--radius-card)]" />
            ) : (
              <div className="arch aspect-[4/5] w-44 animate-pulse bg-brand-50 sm:w-56 lg:w-64" />
            )}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-11 w-36 rounded-full" />
                <Skeleton className="h-11 w-28 rounded-full" />
              </div>
            </div>
          </div>
        </Container>
      </div>
      <Container className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[28rem] w-full rounded-[var(--radius-card)]" />
      </Container>
    </div>
  );
}
