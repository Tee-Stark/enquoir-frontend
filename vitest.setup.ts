import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// React Testing Library's own auto-cleanup only self-registers when it
// finds a global `afterEach` (e.g. with Vitest's `globals: true`) - this
// config doesn't set that, so without this, one test file's rendered DOM
// leaks into the next `it` block in the same file.
afterEach(cleanup);

// jsdom has no ResizeObserver - cmdk (the command palette) observes its
// list to size itself and throws without one. A minimal stub is enough:
// nothing under test asserts on actual resize callbacks.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom also has no scrollIntoView - cmdk scrolls the highlighted item
// into view as the selection moves.
if (typeof Element.prototype.scrollIntoView === "undefined") {
  Element.prototype.scrollIntoView = () => {};
}
