---
name: playwright-e2e
description: Sets up and configures Playwright for end-to-end browser testing. Use when adding E2E tests, testing user flows, or setting up browser automation.
argument-hint: [test-name]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Playwright E2E Testing

Sets up Playwright for end-to-end browser testing with best practices.

## Your Task

1. **Check existing setup**: Look for existing Playwright configuration
2. **Install Playwright**: Add dependencies if not present
3. **Configure**: Create or update playwright.config.ts
4. **Create test structure**: Set up test directory and example tests
5. **Verify**: Run tests to confirm setup works

## Quick Start

```bash
npm init playwright@latest
```

## Configuration Template

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## Example Test

```typescript
import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My App/);
});

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Tips

- Use `page.waitForLoadState()` for dynamic content
- Use data-testid attributes for reliable selectors
- Run `npx playwright codegen` to generate tests interactively
