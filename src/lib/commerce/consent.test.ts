import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/client";
import { handleConsentError } from "./consent";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

describe("handleConsentError", () => {
  it("refetches the view on terms_mismatch, so the next attempt uses the current hash", () => {
    const refetch = vi.fn();
    handleConsentError(new ApiError({ status: 409, code: "terms_mismatch", detail: "stale" }), refetch);
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("refetches the view on checkout_mismatch too", () => {
    const refetch = vi.fn();
    handleConsentError(new ApiError({ status: 409, code: "checkout_mismatch", detail: "stale" }), refetch);
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("does not refetch for an unrelated error", () => {
    const refetch = vi.fn();
    handleConsentError(new ApiError({ status: 400, code: "token_invalid", detail: "bad token" }), refetch);
    expect(refetch).not.toHaveBeenCalled();
  });
});
