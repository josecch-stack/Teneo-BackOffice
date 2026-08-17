import { defineConfig } from "vitest/config";
import { configDefaults } from "vitest/config";

// e2e/ holds Playwright specs (*.spec.ts) — Vitest's default include glob
// picks those up too since it targets **/*.spec.ts. Playwright tests must
// only run via `npm run test:e2e`, not `npm run test`.
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
