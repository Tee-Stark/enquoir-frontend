import type { components } from "@/lib/api/schema";

type AttemptOutcome = components["schemas"]["AttemptOutcome"];

/** Outcomes that mean "this attempt did not succeed," for visual emphasis only - never collapsed into one failure bucket for the payment itself. */
const UNHAPPY_OUTCOMES = new Set<AttemptOutcome>([
  "invalid",
  "payee_unknown",
  "error",
  "rejected",
  "ambiguous",
  "duplicate_transfers",
  "interrupted",
]);

export function isUnhappyOutcome(outcome: AttemptOutcome): boolean {
  return UNHAPPY_OUTCOMES.has(outcome);
}
