import { defineConfig } from "@playwright/test";

/**
 * Phase 7 (hardening) e2e harness. Runs the real dashboard UI against a
 * real backend - no mocked API, no fixtures. See e2e/README.md for
 * prerequisites (the backend must be running with EMAIL_PROVIDER=resend
 * or file, and MAIL_FILE set, so tests can read verification/reset/
 * invitation tokens the same way scripts/e2e.sh does on the backend).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // signup shares one IP rate limit; keep runs serial
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    // Not 3000: that's both this project's own dev default AND other
    // projects' default on a shared machine, so reuseExistingServer below
    // can silently reuse an unrelated app that happens to answer there.
    // 3001 is this app's own documented fallback port (what `pnpm dev`
    // picks when 3000 is taken) and is already in the backend's
    // CORS_ALLOWED_ORIGINS - see README.md.
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3001",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "pnpm dev",
    env: { PORT: process.env.E2E_PORT ?? "3001" },
    url: process.env.E2E_BASE_URL ?? "http://localhost:3001",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
