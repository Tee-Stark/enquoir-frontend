import { describe, expect, it } from "vitest";
import { formatMs, formatPercent } from "./format";

describe("formatPercent", () => {
  it("formats a 0-1 ratio as a percentage with one decimal", () => {
    expect(formatPercent(0.982)).toBe("98.2%");
    expect(formatPercent(1)).toBe("100.0%");
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("shows an em dash when nothing has settled yet", () => {
    expect(formatPercent(null)).toBe("—");
  });
});

describe("formatMs", () => {
  it("shows milliseconds under a second", () => {
    expect(formatMs(230)).toBe("230 ms");
  });

  it("shows seconds with one decimal at or above a second", () => {
    expect(formatMs(1200)).toBe("1.2 s");
  });

  it("shows an em dash when there's no data", () => {
    expect(formatMs(null)).toBe("—");
  });
});
