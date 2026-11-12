import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, toApiFilters, toDateTimeInput } from "./analytics-filters";

describe("toApiFilters (analytics)", () => {
  it("omits from/to entirely when the filter form is empty", () => {
    expect(toApiFilters(DEFAULT_FILTERS).from).toBeUndefined();
    expect(toApiFilters(DEFAULT_FILTERS).to).toBeUndefined();
  });

  it("converts a datetime-local value to a full ISO instant, down to the minute picked", () => {
    const to = "2026-11-09T15:30";
    expect(toApiFilters({ ...DEFAULT_FILTERS, to }).to).toBe(new Date(to).toISOString());
  });

  it("filters to the exact minute, not the start or end of the whole day", () => {
    const to = "2026-11-09T15:30";
    const converted = toApiFilters({ ...DEFAULT_FILTERS, to }).to!;
    expect(converted).not.toBe(new Date("2026-11-09T00:00").toISOString());
    expect(converted).not.toBe(new Date("2026-11-09T23:59:59.999").toISOString());
  });

  it("passes the timezone selection through untouched", () => {
    expect(toApiFilters({ ...DEFAULT_FILTERS, tz: "Africa/Lagos" }).tz).toBe("Africa/Lagos");
  });
});

describe("toDateTimeInput", () => {
  it("round-trips through toApiFilters to the same instant it was built from", () => {
    const now = new Date(2026, 10, 9, 15, 30, 0, 0); // local time: Nov 9 2026, 15:30
    const asInput = toDateTimeInput(now);
    expect(toApiFilters({ ...DEFAULT_FILTERS, to: asInput }).to).toBe(now.toISOString());
  });
});
