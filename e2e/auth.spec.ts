import {
  test,
  expect,
  login,
  requireTestCredentials,
  TEST_EMAIL,
} from "./fixtures";

// This file exercises the login/logout flow itself, so it starts logged
// out — overrides the "chromium" project's shared authenticated
// storageState (see playwright.config.ts) rather than inheriting it.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("auth", () => {
  test("unauthenticated visitors get bounced to /login", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("/login");
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("wrong password shows an error and does not sign in", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "nobody-real@example.com");
    await page.fill('input[name="password"]', "definitely-wrong");
    await page.click('button[type="submit"]');
    await expect(page.locator('p[role="alert"]')).toContainText("incorrectas");
    expect(page.url()).toContain("/login");
  });

  test("real credentials log in and land on the dashboard", async ({
    page,
  }) => {
    requireTestCredentials();
    await login(page);
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toContainText(/Hola/);
  });

  test("logout returns to /login and blocks the panel again", async ({
    page,
  }) => {
    requireTestCredentials();
    await login(page);
    await page.click(`text=${TEST_EMAIL!.split("@")[0]}`);
    await page.click("text=Cerrar sesión");
    await page.waitForURL("/login");

    // Session is really gone, not just a client-side redirect.
    await page.goto("/");
    await page.waitForURL("/login");
  });

  test("forgot-password form accepts an email without revealing whether it exists", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.fill('input[name="email"]', "anything@example.com");
    await page.click('button[type="submit"]');
    await expect(page.locator("h1")).toContainText("Revisa tu correo");
  });
});
