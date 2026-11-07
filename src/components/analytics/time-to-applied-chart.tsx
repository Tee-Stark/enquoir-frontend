"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatBucketLabel, timeSeriesToRows } from "@/lib/analytics/chart-data";
import { formatMs } from "@/lib/format";
import type { TimeSeries } from "@/lib/analytics/queries";

const config: ChartConfig = {
  all: { label: "Median time to applied", color: "var(--primary)" },
};

/** Single series (the backend only reports median here - no group_by for this metric), so one hue and no legend box; the title already says what's plotted. */
export function TimeToAppliedChart({ series }: { series: TimeSeries }) {
  const data = timeSeriesToRows(series);

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="bucket"
          tickFormatter={(v) => formatBucketLabel(v, series.interval)}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v) => formatMs(v)} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => formatBucketLabel(String(value), series.interval)}
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {value === null ? "—" : formatMs(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Line
          dataKey="all"
          name="Median time to applied"
          type="monotone"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ r: 2, fill: "var(--primary)", strokeWidth: 0 }}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
}
