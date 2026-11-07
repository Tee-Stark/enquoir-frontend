import { describe, expect, it } from "vitest";
import { ApiError, isApiError, problemMessage, unwrap } from "./client";

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

  it("appends a human Retry-After duration when the server sent one", () => {
    const seconds = new ApiError({
      status: 429,
      code: "rate_limited",
      retryAfterSeconds: 45,
    });
    expect(problemMessage(seconds)).toMatch(/try again in 45 seconds/i);

    const minutes = new ApiError({
      status: 423,
      code: "account_locked",
      retryAfterSeconds: 3600,
    });
    expect(problemMessage(minutes)).toMatch(/try again in 60 minutes/i);
  });
});

describe("unwrap", () => {
  it("returns undefined for a successful no-content response (204/202), not an error", async () => {
    // This is exactly what openapi-fetch returns for a 204/202: no `error`
    // key at all, and `data: undefined` because there was no body to parse.
    const result = await unwrap(
      Promise.resolve({
        data: undefined,
        response: new Response(null, { status: 204 }),
      })
    );
    expect(result).toBeUndefined();
  });

  it("returns the parsed body for a successful response with content", async () => {
    const result = await unwrap(
      Promise.resolve({
        data: { ok: true },
        response: new Response(null, { status: 200 }),
      })
    );
    expect(result).toEqual({ ok: true });
  });

  it("throws ApiError for a non-ok response even when the body is unparseable", async () => {
    await expect(
      unwrap(
        Promise.resolve({
          error: undefined,
          response: new Response(null, { status: 500 }),
        })
      )
    ).rejects.toThrow(ApiError);
  });

  it("throws ApiError carrying the parsed problem for a non-ok response", async () => {
    try {
      await unwrap(
        Promise.resolve({
          error: { code: "not_found", detail: "no such payment" },
          response: new Response(null, { status: 404 }),
        })
      );
      expect.unreachable();
    } catch (error) {
      expect(isApiError(error)).toBe(true);
      expect((error as ApiError).code).toBe("not_found");
      expect((error as ApiError).status).toBe(404);
    }
  });

  it("carries the Retry-After header onto the thrown ApiError", async () => {
    try {
      await unwrap(
        Promise.resolve({
          error: { code: "rate_limited" },
          response: new Response(null, {
            status: 429,
            headers: { "Retry-After": "30" },
          }),
        })
      );
      expect.unreachable();
    } catch (error) {
      expect((error as ApiError).retryAfterSeconds).toBe(30);
    }
  });
});
