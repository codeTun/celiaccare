import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ==========================================================================
   Table primitives for the admin lists.
   - The card scrolls horizontally on small screens (no page overflow).
   - On large screens the table area has a max height and the header row stays
     visible while scrolling inside it (sticky header).
   - Rows highlight on hover; EmptyTableRow fills an empty (filtered) list.

   @example
   <DataTable caption="Liste des produits">
     <Thead>
       <Th>Produit</Th>
       <Th>Catégorie</Th>
       <Th align="end">Prix</Th>
       <Th align="end"><span className="sr-only">Actions</span></Th>
     </Thead>
     <Tbody>
       {products.items.length === 0 ? (
         <EmptyTableRow colSpan={4} title="Aucun produit trouvé" description="Modifiez la recherche ou les filtres." />
       ) : (
         products.items.map((product) => (
           <Tr key={product.id}>
             <Td className="font-semibold text-ink">{product.name}</Td>
             <Td>{product.categoryName}</Td>
             <Td align="end"><Price value={product.price} locale="fr" /></Td>
             <Td align="end">…</Td>
           </Tr>
         ))
       )}
     </Tbody>
   </DataTable>
   ========================================================================== */

type Align = "start" | "center" | "end";

const alignClass: Record<Align, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

export function DataTable({
  caption,
  children,
  className,
  tableClassName,
  stickyHeader = true,
}: {
  /** Read by screen readers only: what the table lists. */
  caption?: string;
  children: ReactNode;
  className?: string;
  /** e.g. "min-w-[56rem]" for a table with many columns (default min width: 40rem). */
  tableClassName?: string;
  /** Limit the height on large screens so the header row can stay visible (default true). */
  stickyHeader?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-soft", className)}>
      <div className={cn("overflow-auto", stickyHeader && "lg:max-h-[calc(100dvh-13rem)]")}>
        <table
          className={cn(
            "w-full min-w-[40rem] border-separate border-spacing-0 text-sm [&_tbody_tr:last-child>td]:border-b-0",
            tableClassName,
          )}
        >
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          {children}
        </table>
      </div>
    </div>
  );
}

/** Header row: put <Th> cells directly inside. */
export function Thead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <thead className={className}>
      <tr>{children}</tr>
    </thead>
  );
}

export function Tbody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

export function Th({ align = "start", className, scope = "col", ...props }: Omit<ComponentProps<"th">, "align"> & { align?: Align }) {
  return (
    <th
      scope={scope}
      className={cn(
        "sticky top-0 z-10 border-b border-line bg-canvas px-4 py-2.5 text-[0.7rem] font-bold tracking-[0.08em] whitespace-nowrap text-ink-subtle uppercase",
        alignClass[align],
        className,
      )}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition-colors hover:bg-brand-50/40", className)} {...props} />;
}

export function Td({ align = "start", className, ...props }: Omit<ComponentProps<"td">, "align"> & { align?: Align }) {
  return (
    <td className={cn("border-b border-line px-4 py-3 align-middle text-ink-muted", alignClass[align], className)} {...props} />
  );
}

/**
 * A full-width row for an empty list.
 * @example <EmptyTableRow colSpan={5} title="Aucune commande" description="Rien ne correspond à ces filtres." />
 */
export function EmptyTableRow({
  colSpan,
  title,
  description,
  icon,
  action,
}: {
  colSpan: number;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center">
          {icon ? (
            <span className="mb-3 grid size-12 place-items-center rounded-full bg-canvas text-brand-600 ring-1 ring-line [&_svg]:size-5" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <p className="text-sm font-semibold text-ink">{title}</p>
          {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </td>
    </tr>
  );
}
