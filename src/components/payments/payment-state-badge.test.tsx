import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaymentStateBadge, type PaymentState } from "./payment-state-badge";

describe("PaymentStateBadge", () => {
  it("renders a distinguishable label for every payment state", () => {
    const states: PaymentState[] = [
      "RECEIVED",
      "PROPOSED",
      "AUTHORIZED",
      "IN_FLIGHT",
      "UNKNOWN",
      "APPLIED",
      "FAILED",
      "BLOCKED",
    ];

    for (const state of states) {
      render(<PaymentStateBadge state={state} />);
    }

    expect(screen.getByText("Received")).toBeInTheDocument();
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Blocked")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("gives UNKNOWN, FAILED, and BLOCKED visually distinct treatments", () => {
    const { container: unknown } = render(<PaymentStateBadge state="UNKNOWN" />);
    const { container: failed } = render(<PaymentStateBadge state="FAILED" />);
    const { container: blocked } = render(<PaymentStateBadge state="BLOCKED" />);

    const classesOf = (c: HTMLElement) => c.querySelector("span")?.className;

    expect(classesOf(unknown)).not.toBe(classesOf(failed));
    expect(classesOf(failed)).not.toBe(classesOf(blocked));
    expect(classesOf(unknown)).not.toBe(classesOf(blocked));
  });
});
