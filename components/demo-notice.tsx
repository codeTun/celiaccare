import { FlaskConical } from "lucide-react";

import { Container } from "@/components/ui/container";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Demo notice (siteConfig.demoMode): CeliacCare is a student prototype that lists
   REAL businesses which are not partners, so no order is ever sent to them.
   Plain components (no hooks): usable in Server and Client Components.
   Texts: dict.common.demo.
   ========================================================================== */

export type DemoTexts = CommonDict["demo"];

/** Slim bar above the header of every public page. Short sentence on phones, full one from `sm`. */
export function DemoBar({ texts }: { texts: DemoTexts }) {
  return (
    <aside aria-label={texts.label} className="bg-brand-950 text-brand-50">
      <Container className="flex items-center justify-center gap-2 py-1.5 text-center text-xs leading-snug">
        <span className="shrink-0 rounded-full bg-saffron-400 px-2 py-px text-[11px] font-bold text-brand-950">
          {texts.badge}
        </span>
        <span className="sm:hidden">{texts.short}</span>
        <span className="hidden sm:inline">{texts.text}</span>
      </Container>
    </aside>
  );
}

/** The clear version, e.g. on the checkout before confirming and on the order confirmation. */
export function DemoNotice({ title, text, className }: { title: string; text: string; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-2xl border border-saffron-300 bg-saffron-50 p-4 text-sm leading-relaxed text-saffron-700",
        className,
      )}
    >
      <FlaskConical className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-bold text-ink">{title}</p>
        <p className="mt-0.5">{text}</p>
      </div>
    </div>
  );
}
