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

/**
 * The analytics time series endpoint has no Money object to render, only a
 * raw minor-units number per currency group - unlike every other money value
 * in this app, there is no pre-formatted string to defer to here, so this is
 * the one place that derives display formatting from minor_units itself.
 * Safe only because every supported currency (USD/EUR/GBP) has 2 decimal
 * places; this would need revisiting if a 0- or 3-decimal currency shipped.
 */
export function formatMinorUnits(minorUnits: number, currency: Money["currency"]): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(minorUnits / 100);
}
