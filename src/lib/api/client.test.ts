import { describe, expect, it } from "vitest";
import { ApiError, isApiError, problemMessage } from "./client";

describe("ApiError", () => {
  it("carries the problem's stable code, not just its status", () => {
    const error = new ApiError({
      status: 429,
      code: "account_locked",
      title: "Too Many Requests",
      detail: "Locked for an hour.",
    });

    expect(error.status).toBe(429);
    expect(error.code).toBe("account_locked");
    expect(error.detail).toBe("Locked for an hour.");
    expect(isApiError(error)).toBe(true);
  });

  it("falls back to 'unknown' when the response has no problem code", () => {
    const error = new ApiError({ status: 500 });
    expect(error.code).toBe("unknown");
  });

  it("is not mistaken for a plain Error by isApiError", () => {
    expect(isApiError(new Error("boom"))).toBe(false);
    expect(isApiError("boom")).toBe(false);
  });
});

describe("problemMessage", () => {
  it("maps a known code to its human-readable copy", () => {
    const error = new ApiError({
      status: 423,
      code: "account_locked",
      detail: "raw backend detail",
    });
    expect(problemMessage(error)).toMatch(/temporarily locked/i);
  });

  it("falls back to the raw detail for an unmapped code", () => {
    const error = new ApiError({
      status: 400,
      code: "rail_rejected",
      detail: "the rail said no",
    });
    expect(problemMessage(error)).toBe("the rail said no");
  });

  it("gives a generic message for a non-ApiError", () => {
    expect(problemMessage(new Error("network down"))).toMatch(/something went wrong/i);
  });
});
