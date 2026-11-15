import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Eyebrow + title + description (+ optional "see all" link) at the top of a section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: { href: string; label: string };
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal">
            <span className="h-px w-6 bg-brand-400" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <Tag className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</Tag>
        {description ? <p className="mt-2 text-base leading-relaxed text-ink-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
