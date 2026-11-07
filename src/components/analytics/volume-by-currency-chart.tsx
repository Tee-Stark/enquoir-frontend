"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatBucketLabel, timeSeriesToRows } from "@/lib/analytics/chart-data";
import { formatMinorUnits } from "@/lib/money";
import type { Money } from "@/lib/money";
import type { TimeSeries } from "@/lib/analytics/queries";

/**
 * Small multiples, one chart per currency - never one chart with currencies
 * overlaid, since amounts in different currencies aren't comparable on a
 * shared axis. Each facet is a single series, so it carries one consistent
 * hue (this is a magnitude story, not an identity one); currencies aren't
 * told apart by color here, only by which card they're in.
 */
export function VolumeByCurrencyChart({ series }: { series: TimeSeries }) {
  if (series.series.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No applied payments in this period.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {series.series.map((currencySeries) => (
        <CurrencyFacet key={currencySeries.group} series={series} currency={currencySeries.group} />
      ))}
    </div>
  );
}

function CurrencyFacet({
  series,
  currency,
}: {
  series: TimeSeries;
  currency: string;
}) {
  const money = currency as Money["currency"];
  const data = timeSeriesToRows({ ...series, series: series.series.filter((s) => s.group === currency) });

  const config: ChartConfig = {
    [currency]: { label: currency, color: "var(--primary)" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{currency}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-40 w-full">
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="bucket"
              tickFormatter={(v) => formatBucketLabel(v, series.interval)}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
              tick={{ fontSize: 10 }}
            />
            <YAxis hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatBucketLabel(String(value), series.interval)}
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {formatMinorUnits(Number(value), money)}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey={currency}
              name={currency}
              type="monotone"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.12}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
