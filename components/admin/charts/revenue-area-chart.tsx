"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";

import { formatDinars } from "@/lib/format";
import type { RevenuePointDTO } from "@/types";

import { CHART_COLORS, formatAxisDinars, formatCount } from "./chart-theme";

/**
 * Revenue over time (one point per day or per month), as a green area.
 * Purely visual (aria-hidden): render a <ChartDataTable> next to it for screen readers.
 * The parent gives the height (h-72 here) so the page does not jump while recharts measures.
 *
 * @example <RevenueAreaChart data={await getRevenueSeries("30d")} />
 */
export function RevenueAreaChart({ data }: { data: RevenuePointDTO[] }) {
  return (
    <div className="h-72 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <defs>
            <linearGradient id="dashboard-revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.brand} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART_COLORS.brand} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            tickMargin={8}
            minTickGap={20}
          />
          <YAxis
            width="auto"
            tickLine={false}
            axisLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            tickFormatter={(value: number) => formatAxisDinars(value)}
            allowDecimals={false}
          />
          <Tooltip content={RevenueTooltip} cursor={{ stroke: CHART_COLORS.brandSoft, strokeWidth: 1.5 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Chiffre d'affaires"
            stroke={CHART_COLORS.brand}
            strokeWidth={2.25}
            fill="url(#dashboard-revenue-fill)"
            activeDot={{ r: 4.5, stroke: "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** White card: the period, its revenue and its number of orders. */
function RevenueTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as RevenuePointDTO;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold text-ink">{label}</p>
      <p className="mt-1 text-ink-muted">
        Chiffre d&apos;affaires : <span className="font-semibold text-ink tabular">{formatDinars(point.revenue)}</span>
      </p>
      <p className="text-ink-muted">
        Commandes : <span className="font-semibold text-ink tabular">{formatCount(point.orders)}</span>
      </p>
    </div>
  );
}
