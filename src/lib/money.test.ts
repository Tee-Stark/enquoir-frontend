import { describe, expect, it } from "vitest";
import { formatMoney, type Money } from "./money";

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
