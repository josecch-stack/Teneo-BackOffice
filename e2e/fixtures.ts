import { test as base, expect, type Page } from "@playwright/test";

export const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL;
export const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD;
export const STORAGE_STATE = "playwright/.auth/user.json";

/**
 * Most specs skip cleanly (not fail) when credentials aren't configured —
 * this suite needs a real panel account, and there's no seed/fixture account
 * safe to check into the repo. Set PLAYWRIGHT_TEST_EMAIL/PASSWORD locally or
 * in CI secrets to run it for real.
 */
export function requireTestCredentials() {
  base.skip(
    !TEST_EMAIL || !TEST_PASSWORD,
    "PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD not set — see .env.example",
  );
}

/**
 * Only for specs that need to exercise the login form itself (auth.spec.ts).
 * Everything else should use the "chromium" project's shared storageState
 * (see playwright.config.ts + auth.setup.ts) instead of calling this per
 * test — logging in fresh every time burns through the login rate limit
 * (5/15min per IP) fast across a whole suite.
 */
export async function login(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', TEST_EMAIL!);
  await page.fill('input[name="password"]', TEST_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL("/");
}

export const test = base;
export { expect };
