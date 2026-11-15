import { ExternalLink, Lock, Pencil } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonStyles } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Small building blocks of the catalogue pages: the summary at the top of an
   edit page, the "danger zone" with the delete button, row action buttons and
   the link to the public sheet.
   ========================================================================== */

/** Top of an edit page: photo, name, details and badges of the sheet being edited. */
export function RecordSummary({
  title,
  subtitle,
  imageUrl,
  imageAlt,
  fallbackIcon,
  badges,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  imageUrl?: string | null;
  imageAlt?: string;
  /** Category icon key (lib/icons.ts) for the placeholder; `null` = no picture at all. */
  fallbackIcon?: string | null;
  badges?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section
      aria-label="Fiche en cours de modification"
      className="mb-6 flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:p-5"
    >
      {imageAlt ? (
        <CloudImage
          src={imageUrl}
          alt={imageAlt}
          sizes="64px"
          fallbackIcon={fallbackIcon}
          className="size-16 shrink-0"
          rounded="rounded-2xl"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-bold text-ink">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p> : null}
        {badges ? <div className="mt-2 flex flex-wrap items-center gap-1.5">{badges}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </section>
  );
}

/** "Voir sur le site" (new tab). */
export function PublicLink({ href, label = "Voir sur le site" }: { href: string; label?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "outline", size: "sm" })}>
      <ExternalLink aria-hidden="true" />
      {label}
      <span className="sr-only">(nouvel onglet)</span>
    </a>
  );
}

/** Bottom of an edit page: what deleting means, and the delete button (or why it is not possible). */
export function DangerZone({ title, description, children }: { title: string; description: ReactNode; children: ReactNode }) {
  return (
    <section
      aria-labelledby="danger-zone-title"
      className="mt-10 flex flex-col gap-4 rounded-[var(--radius-card)] border border-red-200 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="min-w-0">
        <h2 id="danger-zone-title" className="text-base font-bold text-red-700">
          {title}
        </h2>
        <div className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </section>
  );
}

/** Pencil button of a table row, to the edit page. */
export function EditRowLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} title={label} className={buttonStyles({ variant: "ghost", size: "icon-sm" })}>
      <Pencil aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </Link>
  );
}

/** Shown instead of the delete button when deleting is refused (e.g. products still attached). */
export function DeleteLocked({ reason, className }: { reason: string; className?: string }) {
  return (
    <span
      title={reason}
      className={cn("inline-grid size-9 cursor-help place-items-center rounded-full text-ink-subtle", className)}
    >
      <Lock className="size-4" aria-hidden="true" />
      <span className="sr-only">{reason}</span>
    </span>
  );
}
