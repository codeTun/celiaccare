import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder with the shape of the contact form, shown for an instant while it loads. */
export function ContactFormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <FieldSkeleton />
      <FieldSkeleton />
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <FieldSkeleton />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-12 w-full rounded-full sm:w-52" />
    </div>
  );
}

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}
