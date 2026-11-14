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

/**
 * Parses a major-units amount a person typed (e.g. "500" or "19.99")
 * into integer minor units, without ever going through a float - a
 * plain `Number(x) * 100` risks drift (19.99 * 100 is not exactly
 * 1999 in IEEE 754). Blank or "0" means unlimited, matching the
 * backend's own zero-means-unlimited convention for policy limits.
 * Returns null for anything that isn't a plain decimal amount with at
 * most 2 fraction digits (every supported currency's own precision).
 */
/**
 * The inverse of parseMajorUnitsInput, for pre-filling an edit form
 * from stored minor units - plain digits, no currency symbol or
 * grouping, since this feeds back into an editable number input, not
 * a display label. 0 (unlimited) renders as an empty string so the
 * field reads as blank, not "0.00".
 */
export function minorUnitsToMajorInput(minorUnits: number): string {
  if (minorUnits === 0) return "";
  return (minorUnits / 100).toFixed(2);
}

export function parseMajorUnitsInput(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(trimmed);
  if (!match) return null;
  const [, whole, frac = ""] = match;
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}
