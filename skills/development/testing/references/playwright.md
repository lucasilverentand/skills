# Playwright E2E Tests

Playwright tests run against a real dev server with a seeded local database — never mock the API or the database.

## Configuration

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

## Auth fixture

Avoid repeating login steps in every test. Use a Playwright fixture that signs in once and reuses the authenticated session:

```ts
// e2e/fixtures/auth.ts
import { test as base, type Page } from "@playwright/test";

type AuthFixture = { authenticatedPage: Page };

export const test = base.extend<AuthFixture>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/dashboard");
    await use(page);
  },
});
export { expect } from "@playwright/test";
```

```ts
// e2e/dashboard.test.ts
import { test, expect } from "./fixtures/auth";

test("shows user list after login", async ({ authenticatedPage: page }) => {
  await page.goto("/dashboard/users");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByTestId("user-row")).toHaveCount(3);
});
```

## Selectors

- Prefer semantic roles: `page.getByRole("button", { name: "Save" })`
- For programmatic targets with no semantic role: `data-testid` attributes
- Avoid CSS class selectors — they break on refactors

```ts
// Good
await page.getByRole("heading", { name: "Users" }).click();
await page.getByLabel("Email").fill("user@example.com");
await page.getByTestId("create-user-btn").click();

// Avoid
await page.locator(".user-table__row--active").click();
```

## Seeding test data

Seed via an internal API endpoint (authenticated with a test-only secret) or a CLI script before the test run. Keep tests independent — each test sets up exactly the data it needs.

```ts
test.beforeEach(async ({ request }) => {
  await request.post("/internal/seed", {
    headers: { "X-Test-Secret": process.env.TEST_SECRET! },
    data: { scenario: "three-users" },
  });
});

test.afterEach(async ({ request }) => {
  await request.post("/internal/reset", {
    headers: { "X-Test-Secret": process.env.TEST_SECRET! },
  });
});
```

## Writing tests

Group by user journey, not by component. Each test should exercise a complete action — open, fill, submit, assert outcome:

```ts
test("creates a new user", async ({ authenticatedPage: page }) => {
  await page.goto("/dashboard/users");
  await page.getByRole("button", { name: "New user" }).click();
  await page.getByLabel("Name").fill("Alice");
  await page.getByLabel("Email").fill("alice@example.com");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Alice")).toBeVisible();
  await expect(page.getByText("alice@example.com")).toBeVisible();
});

test("shows validation error when email is empty", async ({ authenticatedPage: page }) => {
  await page.goto("/dashboard/users");
  await page.getByRole("button", { name: "New user" }).click();
  await page.getByLabel("Name").fill("Bob");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Email is required")).toBeVisible();
});
```

## Rules

- Never mock the network in E2E tests — test the real stack
- Use `waitForURL`, `waitForResponse`, or role-based assertions instead of `page.waitForTimeout`
- One test per user journey — don't chain unrelated flows in one test
- Tag slow tests with `test.slow()` to extend their timeout automatically
