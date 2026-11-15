import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a product sheet loads: same layout as <ProductSheet> (photo on the left, details on the right). */
export function ProductSheetSkeleton({ label }: { label: string }) {
  return (
    <Container className="pt-6 pb-14 sm:pt-8 lg:pb-20" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Skeleton className="mb-6 h-4 w-64 max-w-full sm:mb-8" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <Skeleton className="aspect-square w-full rounded-[var(--radius-card)]" />
        <div className="flex flex-col">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-9 w-11/12" />
          <Skeleton className="mt-2 h-9 w-2/3" />
          <Skeleton className="mt-4 h-4 w-56" />
          <Skeleton className="mt-6 h-28 w-full rounded-2xl" />
          <Skeleton className="mt-6 h-9 w-40" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-12 w-32 rounded-full" />
            <Skeleton className="h-12 flex-1 rounded-full sm:max-w-60" />
          </div>
          <Skeleton className="mt-6 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      </div>
    </Container>
  );
}
