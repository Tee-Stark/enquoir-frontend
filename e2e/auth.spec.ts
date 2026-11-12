import { test, expect } from "@playwright/test";
import { resetSignupRateLimit, testEmail, TEST_PASSWORD } from "./support/backend";
import { waitForToken } from "./support/mail";

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await resetSignupRateLimit();
});

// Next's dev-mode error-indicator overlay (<nextjs-portal>, absent from a
// production build) sits over the whole viewport while this app's known,
// disclosed Cache Components dev warnings are logged on every navigation -
// not something these tests exercise, so strip it rather than work around
// it at every single click.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const strip = () => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove());
    new MutationObserver(strip).observe(document, { childList: true, subtree: true });
    strip();
  });
});

test("an unauthenticated visitor is redirected to /login with a next param", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/login?next=%2Fdashboard");
});

test("sign up, verify by email, log out, reset password, log back in", async ({ page }) => {
  const email = testEmail("journey");
  const newPassword = "a brand new passphrase entirely";

  await test.step("sign up creates a session and shows the unverified banner", async () => {
    await page.goto("/signup");
    await page.getByLabel("Organisation name").fill("E2E Frontend Org");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Create organisation" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByText(`Verify ${email} to create agents, invite members, or register payees.`)
    ).toBeVisible();
  });

  await test.step("the emailed verification link clears the banner", async () => {
    const token = await waitForToken(email, "/verify-email");
    await page.goto(`/verify-email?token=${token}`);
    // CardTitle renders a styled <div>, not a semantic heading - match by text.
    await expect(page.getByText("Email verified", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Go to dashboard" }).click();
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText(/Verify .* to create agents/)).not.toBeVisible();
  });

  await test.step("logging out ends the session", async () => {
    await page.getByText("E2E Frontend Org").click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  await test.step("forgot password emails a reset link that signs in with a new password", async () => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("Check your email", { exact: true })).toBeVisible();

    const token = await waitForToken(email, "/reset-password");
    await page.goto(`/reset-password?token=${token}`);
    await page.getByLabel("New password").fill(newPassword);
    await page.getByLabel("Confirm password").fill(newPassword);
    await page.getByRole("button", { name: "Set new password" }).click();
    await expect(page.getByText("Password changed", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  await test.step("logging in with the new password reaches the dashboard", async () => {
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(newPassword);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/dashboard");
  });
});
