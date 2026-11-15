import { X } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const numberFormat = new Intl.NumberFormat("fr-TN", { numberingSystem: "latn" });

/**
 * "12 résultats · Effacer les filtres" above a filtered admin list.
 *
 * @example
 * {isFiltered ? <QueryReset href="/admin/restaurants" total={restaurants.total} /> : null}
 */
export function QueryReset({ href, total, className }: { href: string; total: number; className?: string }) {
  return (
    <p className={cn("mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted", className)}>
      <span className="tabular" role="status">
        {total === 0 ? "Aucun résultat" : `${numberFormat.format(total)} résultat${total > 1 ? "s" : ""}`}
      </span>
      <Link
        href={href}
        className="inline-flex items-center gap-1 rounded-full font-semibold text-brand-700 hover:text-brand-800 hover:underline"
      >
        <X className="size-3.5" aria-hidden="true" />
        Effacer les filtres
      </Link>
    </p>
  );
}
