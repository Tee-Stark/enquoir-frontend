import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePersistedMode } from "./use-persisted-mode";

const VALID = ["treasury", "merchant"] as const;

describe("usePersistedMode", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("starts at the default and persists a change across remounts", () => {
    const { result, unmount } = renderHook(() => usePersistedMode("test:mode", VALID, "treasury"));
    expect(result.current[0]).toBe("treasury");

    act(() => result.current[1]("merchant"));
    expect(result.current[0]).toBe("merchant");
    unmount();

    const { result: second } = renderHook(() => usePersistedMode("test:mode", VALID, "treasury"));
    expect(second.current[0]).toBe("merchant");
  });

  // Regression: setValue used to swallow a setItem failure and then call
  // emit(), which made getSnapshot re-read localStorage - throwing again
  // and overwriting the just-requested change with the default. A viewer
  // with storage blocked (SecurityError, private mode, quota) could never
  // leave the default no matter what they clicked.
  it("still reflects a change for the rest of the session when localStorage throws", () => {
    vi.spyOn(window.localStorage.__proto__, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });

    const { result } = renderHook(() => usePersistedMode("test:mode-blocked", VALID, "treasury"));
    expect(result.current[0]).toBe("treasury");

    act(() => result.current[1]("merchant"));
    expect(result.current[0]).toBe("merchant");
  });
});
