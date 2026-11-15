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
import { CHECKOUT_STATUS_STYLE, type CheckoutStatus } from "@/components/commerce/checkout-status-badge";
import { formatBucketLabel, timeSeriesToRows } from "@/lib/analytics/chart-data";
import type { TimeSeries } from "@/lib/analytics/queries";

/**
 * Stacked, not a multi-line comparison - mirrors PaymentsByStateChart,
 * reusing the exact status colors CheckoutStatusBadge already uses
 * everywhere else in the app.
 */
export function CheckoutsByStatusChart({ series }: { series: TimeSeries }) {
  const data = timeSeriesToRows(series);
  const statuses = series.series.map((s) => s.group as CheckoutStatus);

  const config: ChartConfig = Object.fromEntries(
    statuses.map((status) => [
      status,
      { label: CHECKOUT_STATUS_STYLE[status].label, color: CHECKOUT_STATUS_STYLE[status].chartColor },
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
        {statuses.map((status) => (
          <Area
            key={status}
            dataKey={status}
            name={status}
            type="monotone"
            stackId="statuses"
            stroke={`var(--color-${status})`}
            fill={`var(--color-${status})`}
            fillOpacity={0.12}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
