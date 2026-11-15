import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder of a product card, same shape as <ProductCard>. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
      <div className="p-2 pb-0">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-3 w-2/3" />
        <div className="mt-3 flex items-end justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="size-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Shown while the catalogue loads (same layout as the real page: category chips,
 * filters sidebar on large screens, toolbar and product grid).
 */
export function CatalogSkeleton({ label }: { label: string }) {
  return (
    <Container className="py-8 sm:py-10" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-32 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-10 xl:gap-12">
        <div className="hidden flex-col gap-7 lg:flex">
          <Skeleton className="h-11 w-full" />
          {[5, 4, 3].map((rows, block) => (
            <div key={block} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              {Array.from({ length: rows }, (_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))}
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-44" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
