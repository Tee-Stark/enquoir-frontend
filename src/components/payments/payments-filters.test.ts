import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, toApiFilters } from "./payments-filters";

describe("toApiFilters (payments)", () => {
  it("omits from/to entirely when the filter form is empty", () => {
    expect(toApiFilters(EMPTY_FILTERS).from).toBeUndefined();
    expect(toApiFilters(EMPTY_FILTERS).to).toBeUndefined();
  });

  it("converts a datetime-local value to a full ISO instant, down to the minute picked", () => {
    const to = "2026-11-09T15:30";
    expect(toApiFilters({ ...EMPTY_FILTERS, to }).to).toBe(new Date(to).toISOString());
  });

  it("filters to the exact minute, not the start or end of the whole day", () => {
    // The bug this replaces: a date-only picker silently meant "midnight",
    // which the backend's *exclusive* `to` boundary then read as "nothing
    // on this day" - filtering "to 15:30" must mean exactly 15:30, not
    // midnight and not end-of-day.
    const to = "2026-11-09T15:30";
    const converted = toApiFilters({ ...EMPTY_FILTERS, to }).to!;
    expect(converted).not.toBe(new Date("2026-11-09T00:00").toISOString());
    expect(converted).not.toBe(new Date("2026-11-09T23:59:59.999").toISOString());
  });

  it("drops 'all' selections rather than sending them as filters", () => {
    const filters = toApiFilters({ ...EMPTY_FILTERS, state: "all", currency: "all", agentId: "all", payee: "all" });
    expect(filters.state).toBeUndefined();
    expect(filters.currency).toBeUndefined();
    expect(filters.agent_id).toBeUndefined();
    expect(filters.payee).toBeUndefined();
  });
});
