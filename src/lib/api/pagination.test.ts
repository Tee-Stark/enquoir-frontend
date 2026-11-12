import { describe, expect, it } from "vitest";
import { nextCursorParam, type CursorPage } from "./pagination";

function page(overrides: Partial<CursorPage<number>>): CursorPage<number> {
  return { data: [], next_cursor: null, ...overrides };
}

describe("nextCursorParam", () => {
  it("returns the next_cursor when the backend reports more pages", () => {
    expect(nextCursorParam(page({ next_cursor: "abc123" }))).toBe("abc123");
  });

  it("returns undefined (stopping pagination) when next_cursor is null", () => {
    expect(nextCursorParam(page({ next_cursor: null }))).toBeUndefined();
  });

  it("stops pagination on an empty first page, not just a non-empty last page", () => {
    expect(nextCursorParam(page({ data: [], next_cursor: null }))).toBeUndefined();
  });
});
