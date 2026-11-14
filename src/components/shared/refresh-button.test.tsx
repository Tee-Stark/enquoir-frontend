import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
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

  describe("minimum spin duration", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("keeps spinning past a refetch that resolves in a few milliseconds", () => {
      const { rerender } = render(<RefreshButton onRefresh={() => {}} isRefreshing={false} />);

      fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
      // The query already resolved - isRefreshing goes true then back to
      // false almost immediately, before the animation could ever have
      // been seen without a guaranteed minimum.
      rerender(<RefreshButton onRefresh={() => {}} isRefreshing={true} />);
      rerender(<RefreshButton onRefresh={() => {}} isRefreshing={false} />);

      expect(screen.getByRole("button", { name: "Refresh" })).toBeDisabled();

      act(() => vi.advanceTimersByTime(501));

      expect(screen.getByRole("button", { name: "Refresh" })).not.toBeDisabled();
    });
  });
});
