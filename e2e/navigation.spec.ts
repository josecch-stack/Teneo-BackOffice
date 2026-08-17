import { NAV_GROUPS } from "../src/app/(panel)/nav-items";
import { test, expect, requireTestCredentials } from "./fixtures";

test.beforeEach(() => {
  requireTestCredentials();
});

const routes = NAV_GROUPS.flatMap((group) => group.items)
  .filter((item) => item.implemented)
  .map((item) => item.href);

// Broad, shallow regression net: every implemented nav destination should
// load without a server error or an empty page, whatever the logged-in
// account's role turns out to be. Doesn't assert page-specific content —
// that's what more targeted specs are for. Runs authenticated via the
// "chromium" project's shared storageState (see auth.setup.ts) — no
// per-test login.
for (const href of routes) {
  test(`${href} loads without error`, async ({ page }) => {
    const response = await page.goto(href);
    expect(
      response?.ok(),
      `${href} responded ${response?.status()}`,
    ).toBeTruthy();
    await expect(page.locator("body")).not.toContainText("Application error");
  });
}
