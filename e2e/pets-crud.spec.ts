import { test, expect, requireTestCredentials } from "./fixtures";

// Writes real rows. This project has no separate staging database (see
// docs/deploy-checklist.md) — every environment IS production data. Opt in
// explicitly with E2E_ALLOW_WRITES=1 so this never runs by accident (e.g.
// from a CI job that only meant to run the read-only specs).
test.skip(
  process.env.E2E_ALLOW_WRITES !== "1",
  "Set E2E_ALLOW_WRITES=1 to run write-path tests — see e2e/pets-crud.spec.ts",
);

test("create a pet for an existing owner, then delete it", async ({ page }) => {
  requireTestCredentials();

  await page.goto("/pets/new");

  // Pick whichever owner comes back first for a broad, common query letter —
  // this suite runs against real data, not a fixture set, so it can't
  // assume a specific tutor exists.
  await page.fill("#owner_search", "a");
  await page.waitForTimeout(600);
  const firstResult = page.locator("ul button").first();
  await expect(firstResult).toBeVisible({ timeout: 5000 });
  await firstResult.click();

  const petName = `E2E Test Pet ${Date.now()}`;
  await page.fill("#name", petName);
  await page.fill("#birth_date", "2022-01-01");
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/pets\/[0-9a-f-]+$/);
  await expect(page.locator("h1")).toContainText(petName);

  // Cleanup: delete via the UI, same path a real user would take. The
  // confirmation requires typing the pet's exact name (see ConfirmDialog).
  await page.click('button:has-text("Eliminar mascota")');
  await page.fill("#confirm-text", petName);
  await page.locator('button:has-text("Eliminar mascota")').last().click();
  await page.waitForURL("/pets");
});
