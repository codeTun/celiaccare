import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A white card grouping related fields (or any admin content): title, short
 * description, optional actions on the end side, then the content.
 *
 * @example
 * <FormSection title="Informations" description="Ce que les visiteurs voient sur la fiche.">
 *   <FormGrid>
 *     <TextField name="name" label="Nom" required />
 *     <MoneyField name="price" label="Prix" required defaultMillimes={product.price} />
 *   </FormGrid>
 * </FormSection>
 */
export function FormSection({
  title,
  description,
  actions,
  children,
  className,
  id,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("rounded-[var(--radius-card)] border border-line bg-white shadow-soft", className)}
    >
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2 id={headingId} className="text-base font-bold text-ink">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}
