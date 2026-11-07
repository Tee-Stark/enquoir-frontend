"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PAYMENT_STATE_STYLE, type PaymentState } from "@/components/payments/payment-state-badge";
import { formatBucketLabel, timeSeriesToRows } from "@/lib/analytics/chart-data";
import type { TimeSeries } from "@/lib/analytics/queries";

/**
 * Stacked, not a multi-line comparison - the story is total volume and how
 * it's composed, not "which state is biggest." Reuses the exact state
 * colors PaymentStateBadge and StateProgression already use everywhere else
 * in the app, rather than a separate categorical palette for the same
 * meaning. PROPOSED/AUTHORIZED (and IN_FLIGHT/UNKNOWN) share a color there
 * and so do here - the legend and tooltip still name each one by its real
 * state, so nothing is hidden, just visually grouped the same way the rest
 * of the product already groups them.
 */
export function PaymentsByStateChart({ series }: { series: TimeSeries }) {
  const data = timeSeriesToRows(series);
  const states = series.series.map((s) => s.group as PaymentState);

  const config: ChartConfig = Object.fromEntries(
    states.map((state) => [
      state,
      { label: PAYMENT_STATE_STYLE[state].label, color: PAYMENT_STATE_STYLE[state].chartColor },
    ])
  );

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="bucket"
          tickFormatter={(v) => formatBucketLabel(v, series.interval)}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <ChartTooltip
          content={
            <ChartTooltipContent labelFormatter={(value) => formatBucketLabel(String(value), series.interval)} />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {states.map((state) => (
          <Area
            key={state}
            dataKey={state}
            name={state}
            type="monotone"
            stackId="states"
            stroke={`var(--color-${state})`}
            fill={`var(--color-${state})`}
            fillOpacity={0.12}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
