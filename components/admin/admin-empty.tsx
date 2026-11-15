import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Empty state of an admin page or section ("Aucun produit pour l'instant") with an
 * optional call to action. For an empty FILTERED table, use EmptyTableRow (data-table.tsx).
 *
 * @example
 * <AdminEmpty icon={<Package />} title="Aucun produit pour l'instant"
 *   description="Ajoutez le premier produit d'un artisan partenaire."
 *   action={<Link href="/admin/produits/nouveau" className={buttonStyles()}>Ajouter un produit</Link>} />
 */
export function AdminEmpty({
  icon,
  title,
  description,
  action,
  className,
}: {
  /** A lucide icon element, e.g. <Inbox /> */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-white px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <span
          className="mb-4 grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100 [&_svg]:size-5"
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <p className="text-base font-bold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
