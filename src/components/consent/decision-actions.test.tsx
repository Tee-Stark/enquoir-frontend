import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DecisionActions } from "./decision-actions";

describe("DecisionActions", () => {
  it("disables both buttons once either mutation is pending, not just the one clicked", () => {
    render(
      <DecisionActions
        primary={{ label: "Approve", pending: true, onClick: () => {} }}
        secondary={{ label: "Decline", pending: false, onClick: () => {} }}
      />,
    );

    expect(screen.getByText("Approve")).toBeDisabled();
    expect(screen.getByText("Decline")).toBeDisabled();
  });

  it("leaves both enabled when neither is pending", () => {
    render(
      <DecisionActions
        primary={{ label: "Approve", pending: false, onClick: () => {} }}
        secondary={{ label: "Decline", pending: false, onClick: () => {} }}
      />,
    );

    expect(screen.getByText("Approve")).not.toBeDisabled();
    expect(screen.getByText("Decline")).not.toBeDisabled();
  });
});
