import { describe, expect, it } from "vitest";
import { isSafeNextPath } from "./login-form";

describe("isSafeNextPath", () => {
  it("accepts an ordinary in-app path", () => {
    expect(isSafeNextPath("/dashboard")).toBe(true);
    expect(isSafeNextPath("/payments/abc123")).toBe(true);
  });

  it("rejects null and empty values", () => {
    expect(isSafeNextPath(null)).toBe(false);
    expect(isSafeNextPath("")).toBe(false);
  });

  it("rejects a protocol-relative URL", () => {
    expect(isSafeNextPath("//evil.com")).toBe(false);
  });

  it("rejects an absolute URL to another origin", () => {
    expect(isSafeNextPath("https://evil.com")).toBe(false);
    expect(isSafeNextPath("http://evil.com/dashboard")).toBe(false);
  });

  // The WHATWG "backslash trick": a browser's URL parser treats a leading
  // "/" followed by "\" as the authority marker for a special scheme,
  // identically to "//" - a naive startsWith("/") && !startsWith("//")
  // check misses all three of these.
  it("rejects the backslash-authority bypass in every form", () => {
    expect(isSafeNextPath("/\\evil.com")).toBe(false);
    expect(isSafeNextPath("/\\\\evil.com")).toBe(false);
    expect(isSafeNextPath("/\\/evil.com")).toBe(false);
  });

  it("rejects a javascript: URL", () => {
    expect(isSafeNextPath("javascript:alert(1)")).toBe(false);
  });
});
