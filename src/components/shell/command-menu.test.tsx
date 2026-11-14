import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandMenu } from "./command-menu";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("CommandMenu", () => {
  it("lists every nav destination by label while open", () => {
    render(<CommandMenu open={true} onOpenChange={() => {}} />);
    expect(screen.getByText("Payments")).toBeInTheDocument();
    expect(screen.getByText("Spending policy")).toBeInTheDocument();
  });

  it("navigates to the selected page and closes itself", async () => {
    const onOpenChange = vi.fn();
    render(<CommandMenu open={true} onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByText("Payments"));

    expect(push).toHaveBeenCalledWith("/payments");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders nothing searchable when closed", () => {
    render(<CommandMenu open={false} onOpenChange={() => {}} />);
    expect(screen.queryByText("Payments")).not.toBeInTheDocument();
  });

  it("toggles open on Cmd+K", async () => {
    const onOpenChange = vi.fn();
    render(<CommandMenu open={false} onOpenChange={onOpenChange} />);

    await userEvent.keyboard("{Meta>}k{/Meta}");

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
