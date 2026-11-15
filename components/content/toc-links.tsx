"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string };

/**
 * Links of the table of contents. While the visitor scrolls, the section
 * being read is highlighted (it works without JavaScript too, just without
 * the highlight).
 */
export function TocLinks({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);
    if (sections.length === 0) return;

    // A section is "being read" when it crosses a thin line near the top of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-25% 0px -70% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <ol className="space-y-0.5 border-s border-line">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active ? "location" : undefined}
              className={cn(
                "-ms-px block border-s-2 py-1.5 ps-4 pe-2 text-sm leading-snug transition-colors",
                active
                  ? "border-brand-600 font-semibold text-brand-800"
                  : "border-transparent text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
