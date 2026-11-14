import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RefreshButton } from "./refresh-button";

describe("RefreshButton", () => {
  it("calls onRefresh when clicked", async () => {
    const onRefresh = vi.fn();
    render(<RefreshButton onRefresh={onRefresh} isRefreshing={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Refresh" }));

    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("disables itself while refreshing, so a second click can't queue another refetch", () => {
    render(<RefreshButton onRefresh={() => {}} isRefreshing={true} />);

    expect(screen.getByRole("button", { name: "Refresh" })).toBeDisabled();
  });
});
