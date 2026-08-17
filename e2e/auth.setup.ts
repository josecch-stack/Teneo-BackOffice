import { test as setup } from "@playwright/test";
import { STORAGE_STATE, TEST_EMAIL, TEST_PASSWORD } from "./fixtures";

// Runs once before the credentialed specs (see playwright.config.ts's
// "setup" project) and saves the session so every other test reuses it
// instead of logging in fresh — besides being faster, logging in once
// keeps the whole suite well under the login rate limit (5/15min per IP,
// see src/lib/rate-limit.ts), which a fresh login per test would blow
// through immediately.
setup("authenticate", async ({ page }) => {
  setup.skip(
    !TEST_EMAIL || !TEST_PASSWORD,
    "PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD not set — see .env.example",
  );

  await page.goto("/login");
  await page.fill('input[name="email"]', TEST_EMAIL!);
  await page.fill('input[name="password"]', TEST_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL("/");
  await page.context().storageState({ path: STORAGE_STATE });
});
