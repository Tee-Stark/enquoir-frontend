import { describe, expect, it } from "vitest";
import { formatMinorUnits, formatMoney, type Money } from "./money";

function money(overrides: Partial<Money>): Money {
  return { minor_units: 1050, currency: "USD", amount: "10.50", ...overrides };
}

describe("formatMoney", () => {
  it("prefixes the backend-supplied amount string with the currency symbol", () => {
    expect(formatMoney(money({ currency: "USD", amount: "10.50" }))).toBe(
      "$10.50"
    );
    expect(formatMoney(money({ currency: "EUR", amount: "10.50" }))).toBe(
      "€10.50"
    );
    expect(formatMoney(money({ currency: "GBP", amount: "10.50" }))).toBe(
      "£10.50"
    );
  });

  it("never derives display text from minor_units", () => {
    // Same minor_units, different pre-formatted amount: the display must
    // follow `amount`, since the backend owns display formatting.
    expect(formatMoney(money({ minor_units: 100000, amount: "1,000.00" }))).toBe(
      "$1,000.00"
    );
  });
});

describe("formatMinorUnits", () => {
  // The analytics endpoint has no pre-formatted amount, so this is the one
  // place that derives display text from minor_units via a bare /100 - the
  // supported currencies (USD/EUR/GBP) all have 2 decimal places.
  it("divides minor units by 100 and formats with the currency's symbol", () => {
    expect(formatMinorUnits(105000, "USD")).toBe("$1,050.00");
    expect(formatMinorUnits(99, "EUR")).toBe("€0.99");
    expect(formatMinorUnits(0, "GBP")).toBe("£0.00");
  });

  it("rounds to the currency's standard fraction digits rather than truncating", () => {
    // 1 minor unit = $0.01 exactly; nothing here should introduce floating-point drift.
    expect(formatMinorUnits(1, "USD")).toBe("$0.01");
    expect(formatMinorUnits(333, "USD")).toBe("$3.33");
  });
});
