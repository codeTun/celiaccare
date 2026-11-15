import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AdminBreadcrumb = { label: string; href?: string };

/**
 * Top of every admin page: breadcrumbs, the page <h1>, a description and action buttons.
 *
 * @example
 * <AdminPageHeader
 *   title="Produits"
 *   description="Les produits sans gluten vendus par nos artisans."
 *   breadcrumbs={[{ label: "Tableau de bord", href: "/admin" }, { label: "Produits" }]}
 *   actions={<Link href="/admin/produits/nouveau" className={buttonStyles()}><Plus aria-hidden="true" />Ajouter</Link>}
 * />
 */
export function AdminPageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons / links shown on the end side (wrap on small screens). */
  actions?: ReactNode;
  /** The last item is the current page (no link). */
  breadcrumbs?: AdminBreadcrumb[];
  className?: string;
}) {
  return (
    <header className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Fil d'Ariane" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-ink-subtle">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                    {index > 0 ? <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" /> : null}
                    {crumb.href && !isLast ? (
                      <Link href={crumb.href} className="rounded transition-colors hover:text-brand-700">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span aria-current={isLast ? "page" : undefined} className="text-ink-muted">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
        <h1 className="text-2xl font-extrabold text-ink sm:text-[1.7rem]">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
