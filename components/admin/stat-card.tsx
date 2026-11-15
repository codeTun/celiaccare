import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type StatTone = "brand" | "saffron" | "sky" | "violet" | "amber" | "red" | "neutral";

const toneStyles: Record<StatTone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  saffron: "bg-saffron-50 text-saffron-700 ring-saffron-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  red: "bg-red-50 text-red-700 ring-red-100",
  neutral: "bg-canvas text-ink-muted ring-line",
};

const percentFormat = new Intl.NumberFormat("fr-TN", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
  numberingSystem: "latn",
});

/**
 * One number of the dashboard: label, value, optional icon and evolution in %.
 *
 * @example
 * <StatCard label="Chiffre d'affaires du mois" value={formatDinars(stats.revenueThisMonth)}
 *   icon={<Wallet />} tone="saffron" delta={12.5} deltaLabel="vs mois dernier" />
 * <StatCard label="Commandes en attente" value={stats.pendingOrders} icon={<Hourglass />}
 *   tone="amber" href="/admin/commandes?status=PENDING" />
 */
export function StatCard({
  label,
  value,
  icon,
  tone = "brand",
  delta,
  deltaLabel,
  invertDelta = false,
  hint,
  href,
  className,
}: {
  label: ReactNode;
  /** Already formatted (formatDinars(), a number...). */
  value: ReactNode;
  /** A lucide icon ELEMENT, e.g. <Wallet /> (sized automatically). */
  icon?: ReactNode;
  tone?: StatTone;
  /** Evolution in percent: 12.5 → "+12,5 %" (null/undefined = not shown). */
  delta?: number | null;
  deltaLabel?: ReactNode;
  /** true when a rise is bad news (e.g. refused orders): the colors are swapped. */
  invertDelta?: boolean;
  hint?: ReactNode;
  /** Makes the whole card a link (e.g. to the filtered list). */
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        {icon ? (
          <span
            className={cn("grid size-10 shrink-0 place-items-center rounded-xl ring-1 [&_svg]:size-5", toneStyles[tone])}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-2xl font-extrabold text-ink tabular sm:text-[1.75rem]">{value}</p>
      {delta != null || hint ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {delta != null && Number.isFinite(delta) ? <DeltaBadge delta={delta} invert={invertDelta} /> : null}
          {delta != null && deltaLabel ? <span className="text-ink-subtle">{deltaLabel}</span> : null}
          {hint ? <span className="text-ink-subtle">{hint}</span> : null}
        </div>
      ) : null}
    </>
  );

  const box = "block rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft";
  if (href) {
    return (
      <Link
        href={href}
        className={cn(box, "transition duration-150 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift", className)}
      >
        {content}
      </Link>
    );
  }
  return <div className={cn(box, className)}>{content}</div>;
}

function DeltaBadge({ delta, invert }: { delta: number; invert: boolean }) {
  const rounded = Math.round(delta * 10) / 10;
  const good = invert ? rounded < 0 : rounded > 0;
  const bad = invert ? rounded > 0 : rounded < 0;
  let Icon = Minus;
  if (rounded > 0) Icon = ArrowUpRight;
  if (rounded < 0) Icon = ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular",
        good && "bg-brand-50 text-brand-700",
        bad && "bg-red-50 text-red-700",
        !good && !bad && "bg-canvas text-ink-muted",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {percentFormat.format(rounded)} %
    </span>
  );
}
