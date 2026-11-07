import type { TimeSeries } from "./queries";

/** One row per bucket, one column per series group - the shape Recharts wants. */
export function timeSeriesToRows(ts: TimeSeries): Array<Record<string, string | number | null>> {
  return ts.buckets.map((bucket, i) => {
    const row: Record<string, string | number | null> = { bucket };
    for (const s of ts.series) {
      row[s.group] = s.points[i]?.value ?? null;
    }
    return row;
  });
}

export function formatBucketLabel(iso: string, interval: TimeSeries["interval"]): string {
  const d = new Date(iso);
  if (interval === "hour") {
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric" });
  }
  if (interval === "month") {
    return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
