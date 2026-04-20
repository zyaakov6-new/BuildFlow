# E2E Tests — Scaffold

Currently empty. To wire up Playwright:

## Install
```bash
npm install -D @playwright/test
npx playwright install chromium
```

## Config (playwright.config.ts)
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    locale: "he-IL",
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

## Critical paths to cover
1. **Landing → Auth → Signup** — email/password flow, profile is created
2. **Signup → Onboarding → Dashboard** — 3 steps, children saved, completion screen
3. **Dashboard → FindActivity → Save moment** — moment appears in Upcoming
4. **Upcoming → Mark done → Reflection modal** — rating persisted
5. **Free plan → 4th suggestion** — blocked with Hebrew error

## Sample test
```ts
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("landing → auth page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /כניסה/ }).click();
  await expect(page).toHaveURL(/\/auth/);
});
```

## npm script
```json
"test:e2e": "playwright test"
```
