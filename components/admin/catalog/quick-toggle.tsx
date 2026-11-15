"use client";

import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

export type QuickToggleTone = "on" | "off" | "warning" | "featured" | "idle";

const tones: Record<QuickToggleTone, string> = {
  on: "bg-brand-50 text-brand-800 ring-brand-200 hover:bg-brand-100",
  off: "bg-canvas text-ink-muted ring-line-strong hover:bg-white hover:text-ink",
  warning: "bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-100",
  featured: "bg-saffron-50 text-saffron-700 ring-saffron-100 hover:bg-saffron-100",
  idle: "bg-white text-ink-subtle ring-line hover:text-ink hover:ring-line-strong",
};

/**
 * A status pill of a table row that is also a button: one click switches the value
 * (e.g. "Actif" ↔ "Inactif"). It is a tiny form posting to a Server Action bound
 * on the server, e.g. `toggleProductFlagAction.bind(null, product.id, "isActive", false)`.
 * Works without JavaScript; shows a spinner while it is sent.
 *
 * @example
 * <QuickToggle action={...} tone="on" icon={<Eye />} label="Actif" actionLabel="Masquer ce produit du site" />
 */
export function QuickToggle({
  action,
  label,
  actionLabel,
  tone,
  icon,
}: {
  action: (formData: FormData) => Promise<void>;
  /** The current state, shown on the pill ("Actif"). */
  label: string;
  /** What a click does ("Masquer ce produit du site"): tooltip and screen readers. */
  actionLabel: string;
  tone: QuickToggleTone;
  icon?: ReactNode;
}) {
  return (
    <form action={action} className="inline-flex">
      <PillButton label={label} actionLabel={actionLabel} tone={tone} icon={icon} />
    </form>
  );
}

function PillButton({ label, actionLabel, tone, icon }: Omit<Parameters<typeof QuickToggle>[0], "action">) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      title={actionLabel}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap ring-1 transition-colors disabled:cursor-wait disabled:opacity-70 [&_svg]:size-3.5 [&_svg]:shrink-0",
        tones[tone],
      )}
    >
      {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : icon}
      {label}
      <span className="sr-only"> — {actionLabel}</span>
    </button>
  );
}
