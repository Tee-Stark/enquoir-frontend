import type { components } from "@/lib/api/schema";

export type Money = components["schemas"]["Money"];

const SYMBOLS: Record<Money["currency"], string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/**
 * Renders the backend-supplied `amount` string, never re-derived from
 * `minor_units` - the API is the source of truth for display formatting.
 * Always include the currency alongside this; amounts must never be summed
 * or compared across currencies.
 */
export function formatMoney(money: Money): string {
  return `${SYMBOLS[money.currency]}${money.amount}`;
}
