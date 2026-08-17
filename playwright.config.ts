import { defineConfig, devices } from "@playwright/test";

// Critical-path E2E suite (Fase 10). Needs a real panel account — see
// PLAYWRIGHT_TEST_EMAIL/PASSWORD in .env.example. Specs skip themselves
// with a clear message when the env vars are missing (see e2e/fixtures.ts).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      // Logs in once, saves the session — every other project reuses it
      // instead of re-authenticating per test (see auth.setup.ts for why:
      // the login rate limiter makes repeated fresh logins fail fast).
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      testIgnore: /auth\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  // Only auto-starts a dev server when no explicit base URL is given (i.e.
  // running locally) — CI or manual runs against Railway pass
  // PLAYWRIGHT_BASE_URL and skip this entirely.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run start",
        url: "http://localhost:3000/login",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
