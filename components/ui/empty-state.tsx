import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas/60 px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 grid size-14 place-items-center rounded-full bg-white text-brand-600 shadow-soft [&_svg]:size-6">
          {icon}
        </div>
      ) : null}
      <p className="text-base font-bold text-ink">{title}</p>
      {description ? <p className="mt-1.5 max-w-md text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
