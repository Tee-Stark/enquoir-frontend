import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// React Testing Library's own auto-cleanup only self-registers when it
// finds a global `afterEach` (e.g. with Vitest's `globals: true`) - this
// config doesn't set that, so without this, one test file's rendered DOM
// leaks into the next `it` block in the same file.
afterEach(cleanup);
