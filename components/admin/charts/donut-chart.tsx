"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipContentProps } from "recharts";

import { formatDinars } from "@/lib/format";

import { CHART_COLORS, formatCount } from "./chart-theme";

export type DonutSlice = {
  label: string;
  value: number;
  /** Color of the slice (CHART_COLORS, ORDER_STATUS_COLORS…). */
  color: string;
};

type ValueFormat = "count" | "dinars";

function formatValue(value: number, format: ValueFormat) {
  return format === "dinars" ? formatDinars(value) : formatCount(value);
}

/**
 * Ring chart with a big number in its center (e.g. the total of orders).
 * Purely visual (aria-hidden): the page shows a legend with the same numbers as text.
 * Values in millimes when `valueFormat="dinars"`.
 *
 * @example
 * <DonutChart slices={[{ label: "Livrées", value: 194, color: ORDER_STATUS_COLORS.DELIVERED }]}
 *   centerValue="220" centerLabel="commandes" />
 */
export function DonutChart({
  slices,
  centerValue,
  centerLabel,
  valueFormat = "count",
}: {
  slices: DonutSlice[];
  centerValue: string;
  centerLabel: string;
  valueFormat?: ValueFormat;
}) {
  // recharts 3: the color of each slice is read from the `fill` of its data item (<Cell> is deprecated).
  const data = slices.filter((slice) => slice.value > 0).map((slice) => ({ name: slice.label, value: slice.value, fill: slice.color }));
  const isEmpty = data.length === 0;

  return (
    <div className="relative mx-auto h-56 w-full max-w-[15rem]" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart accessibilityLayer={false}>
          <Pie
            data={isEmpty ? [{ name: "Aucune donnée", value: 1, fill: CHART_COLORS.empty }] : data}
            dataKey="value"
            nameKey="name"
            innerRadius="66%"
            outerRadius="94%"
            startAngle={90}
            endAngle={-270}
            paddingAngle={data.length > 1 ? 2 : 0}
            cornerRadius={4}
            stroke="#ffffff"
            strokeWidth={2}
          />
          {isEmpty ? null : (
            <Tooltip content={(props: TooltipContentProps) => <SliceTooltip {...props} valueFormat={valueFormat} />} />
          )}
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-2xl font-extrabold text-ink tabular">{centerValue}</p>
          <p className="text-xs font-medium text-ink-subtle">{centerLabel}</p>
        </div>
      </div>
    </div>
  );
}

function SliceTooltip({ active, payload, valueFormat }: TooltipContentProps & { valueFormat: ValueFormat }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lift">
      <p className="font-semibold text-ink">{String(entry.name)}</p>
      <p className="mt-0.5 text-ink-muted tabular">{formatValue(Number(entry.value), valueFormat)}</p>
    </div>
  );
}
