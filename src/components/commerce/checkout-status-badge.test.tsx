import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckoutStatusBadge, CHECKOUT_STATUS_STYLE, type CheckoutStatus } from "./checkout-status-badge";

describe("CheckoutStatusBadge", () => {
  it("renders a distinguishable label for every checkout status", () => {
    const statuses = Object.keys(CHECKOUT_STATUS_STYLE) as CheckoutStatus[];

    for (const status of statuses) {
      render(<CheckoutStatusBadge status={status} />);
    }

    expect(screen.getByText("Authorized")).toBeInTheDocument();
    expect(screen.getByText("Denied")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  it("gives denied the same accent treatment as treasury's BLOCKED, distinct from an actual failure", () => {
    const { container: denied } = render(<CheckoutStatusBadge status="denied" />);
    const { container: rejected } = render(<CheckoutStatusBadge status="rejected" />);
    const { container: paymentFailed } = render(<CheckoutStatusBadge status="payment_failed" />);

    const classesOf = (c: HTMLElement) => c.querySelector("span")?.className;

    expect(classesOf(denied)).toContain("accent");
    expect(classesOf(denied)).not.toBe(classesOf(rejected));
    expect(classesOf(denied)).not.toBe(classesOf(paymentFailed));
  });
});
