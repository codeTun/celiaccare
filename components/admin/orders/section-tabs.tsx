import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type SectionTab = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

/**
 * Sub-navigation of a section split into several pages (underlined tabs), e.g.
 * Livraisons → "En cours" / "Zones" / "Livreurs". Unlike FilterTabs (pills that filter
 * ONE list through the URL), each tab here is its own page. Rendered on the server:
 * the page says which tab is current, no client hook needed.
 *
 * @example
 * <SectionTabs label="Rubriques des livraisons" current="/admin/livraisons/zones" tabs={DELIVERY_TABS} />
 */
export function SectionTabs({
  tabs,
  current,
  label,
  className,
}: {
  tabs: SectionTab[];
  /** href of the current tab. */
  current: string;
  /** Accessible name of the navigation. */
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("-mx-1 mb-6 overflow-x-auto scrollbar-none", className)}>
      <ul className="flex w-max min-w-full gap-1 border-b border-line px-1">
        {tabs.map((tab) => {
          const active = tab.href === current;
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "border-brand-600 text-brand-800"
                    : "border-transparent text-ink-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
