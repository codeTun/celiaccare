"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";

import { formatDinars } from "@/lib/format";
import type { CategoryRevenueDTO } from "@/types";

import { CHART_COLORS, formatAxisDinars } from "./chart-theme";

/**
 * Product revenue per category, as horizontal green bars (long category names stay readable).
 * Purely visual (aria-hidden): render a <ChartDataTable> next to it for screen readers.
 * The height grows with the number of categories.
 *
 * @example <CategoryBarChart data={await getRevenueByCategory()} />
 */
export function CategoryBarChart({ data }: { data: CategoryRevenueDTO[] }) {
  const height = Math.max(200, data.length * 38 + 40);
  return (
    <div className="w-full" style={{ height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            tickFormatter={(value: number) => formatAxisDinars(value)}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width="auto"
            tickLine={false}
            axisLine={false}
            tick={{ fill: CHART_COLORS.ink, fontSize: 12 }}
          />
          <Tooltip content={CategoryTooltip} cursor={{ fill: CHART_COLORS.brandWash }} />
          <Bar dataKey="revenue" name="Chiffre d'affaires" fill={CHART_COLORS.brand} radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as CategoryRevenueDTO;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold text-ink">{item.name}</p>
      <p className="mt-0.5 text-ink-muted tabular">{formatDinars(item.revenue)}</p>
    </div>
  );
}
