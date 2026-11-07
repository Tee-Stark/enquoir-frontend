import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MoneyDisplay } from "./money";

describe("MoneyDisplay", () => {
  it("always renders the currency alongside the amount", () => {
    render(
      <MoneyDisplay money={{ minor_units: 1050, currency: "USD", amount: "10.50" }} />
    );

    expect(screen.getByText("$10.50")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });
});
