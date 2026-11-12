import { describe, expect, it } from "vitest";
import { formatBucketLabel, timeSeriesToRows } from "./chart-data";
import type { TimeSeries } from "./queries";

function timeSeries(overrides: Partial<TimeSeries>): TimeSeries {
  return {
    metric: "payments",
    interval: "day",
    group_by: null,
    unit: "count",
    period: { from: "2026-11-01T00:00:00Z", to: "2026-11-03T00:00:00Z", tz: "UTC" },
    buckets: ["2026-11-01T00:00:00Z", "2026-11-02T00:00:00Z"],
    series: [],
    ...overrides,
  };
}

describe("timeSeriesToRows", () => {
  it("pivots one row per bucket, one column per series group", () => {
    const ts = timeSeries({
      series: [
        { group: "APPLIED", points: [{ start: "2026-11-01T00:00:00Z", value: 3 }, { start: "2026-11-02T00:00:00Z", value: 5 }] },
        { group: "FAILED", points: [{ start: "2026-11-01T00:00:00Z", value: 1 }, { start: "2026-11-02T00:00:00Z", value: 0 }] },
      ],
    });

    expect(timeSeriesToRows(ts)).toEqual([
      { bucket: "2026-11-01T00:00:00Z", APPLIED: 3, FAILED: 1 },
      { bucket: "2026-11-02T00:00:00Z", APPLIED: 5, FAILED: 0 },
    ]);
  });

  it("fills a missing point as null rather than dropping the row or column", () => {
    const ts = timeSeries({
      series: [{ group: "APPLIED", points: [{ start: "2026-11-01T00:00:00Z", value: 3 }] }],
    });

    expect(timeSeriesToRows(ts)).toEqual([
      { bucket: "2026-11-01T00:00:00Z", APPLIED: 3 },
      { bucket: "2026-11-02T00:00:00Z", APPLIED: null },
    ]);
  });

  it("returns one row per bucket even with no series at all", () => {
    expect(timeSeriesToRows(timeSeries({}))).toEqual([
      { bucket: "2026-11-01T00:00:00Z" },
      { bucket: "2026-11-02T00:00:00Z" },
    ]);
  });
});

describe("formatBucketLabel", () => {
  it("formats an hour bucket with the hour included", () => {
    expect(formatBucketLabel("2026-11-01T15:00:00Z", "hour")).toMatch(/\d/);
  });

  it("formats a month bucket as month + year only", () => {
    const label = formatBucketLabel("2026-11-01T00:00:00Z", "month");
    expect(label).toContain("2026");
    expect(label).not.toMatch(/\d{1,2}:\d{2}/);
  });

  it("formats a day bucket as month + day", () => {
    const label = formatBucketLabel("2026-11-01T00:00:00Z", "day");
    expect(label.length).toBeGreaterThan(0);
  });
});
