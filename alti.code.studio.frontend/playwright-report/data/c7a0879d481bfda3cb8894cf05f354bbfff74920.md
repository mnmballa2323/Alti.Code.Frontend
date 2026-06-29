# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication and RBAC >> users with mfaRequired are redirected to MFA challenge
- Location: e2e/auth.spec.ts:53:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Two-Factor Authentication')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Two-Factor Authentication')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e9]: Loading...
  - generic:
    - generic:
      - generic:
        - generic: Inso Copilot
        - button "Close":
          - img
      - generic:
        - generic:
          - generic:
            - paragraph: Hi! 👋 How can I assist you with your code or deployments today?
        - contentinfo
      - generic:
        - textbox "Type a message..."
        - generic:
          - button [disabled]:
            - img
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication and RBAC', () => {
  4  | 
  5  |   test('unauthenticated users are redirected from protected routes', async ({ page }) => {
  6  |     // Unauthenticated (no cookies)
  7  |     await page.goto('/dashboard');
  8  |     await expect(page).toHaveURL(/.*\/login/);
  9  |   });
  10 | 
  11 |   test('standard users cannot access admin routes', async ({ context, page }) => {
  12 |     // Authenticated as standard user
  13 |     await context.addCookies([{ 
  14 |       name: 'e2e-session', 
  15 |       value: JSON.stringify({ role: 'user', mfaRequired: false }), 
  16 |       domain: 'localhost', 
  17 |       path: '/' 
  18 |     }]);
  19 | 
  20 |     await page.route('**/api/auth/session', route => {
  21 |       route.fulfill({
  22 |         status: 200,
  23 |         contentType: 'application/json',
  24 |         body: JSON.stringify({ user: { role: 'user', mfaRequired: false }, expires: '2099-01-01T00:00:00.000Z' })
  25 |       });
  26 |     });
  27 | 
  28 |     await page.goto('/admin');
  29 |     await expect(page).toHaveURL(/.*\/dashboard/);
  30 |   });
  31 | 
  32 |   test('admin users can access admin routes', async ({ context, page }) => {
  33 |     // Authenticated as admin
  34 |     await context.addCookies([{ 
  35 |       name: 'e2e-session', 
  36 |       value: JSON.stringify({ role: 'admin', mfaRequired: false }), 
  37 |       domain: 'localhost', 
  38 |       path: '/' 
  39 |     }]);
  40 | 
  41 |     await page.route('**/api/auth/session', route => {
  42 |       route.fulfill({
  43 |         status: 200,
  44 |         contentType: 'application/json',
  45 |         body: JSON.stringify({ user: { role: 'admin', mfaRequired: false }, expires: '2099-01-01T00:00:00.000Z' })
  46 |       });
  47 |     });
  48 | 
  49 |     await page.goto('/admin');
  50 |     await expect(page).toHaveURL(/.*\/admin/);
  51 |   });
  52 | 
  53 |   test('users with mfaRequired are redirected to MFA challenge', async ({ context, page }) => {
  54 |     // Authenticated but requires MFA
  55 |     await context.addCookies([{ 
  56 |       name: 'e2e-session', 
  57 |       value: JSON.stringify({ role: 'user', mfaRequired: true }), 
  58 |       domain: 'localhost', 
  59 |       path: '/' 
  60 |     }]);
  61 | 
  62 |     await page.route('**/api/auth/session', route => {
  63 |       route.fulfill({
  64 |         status: 200,
  65 |         contentType: 'application/json',
  66 |         body: JSON.stringify({ user: { role: 'user', mfaRequired: true }, expires: '2099-01-01T00:00:00.000Z' })
  67 |       });
  68 |     });
  69 | 
  70 |     await page.goto('/dashboard');
  71 |     await expect(page).toHaveURL(/.*\/auth\/mfa/);
  72 | 
  73 |     // Verify MFA UI is visible
> 74 |     await expect(page.getByText('Two-Factor Authentication')).toBeVisible();
     |                                                               ^ Error: expect(locator).toBeVisible() failed
  75 |     await expect(page.getByPlaceholder('000000')).toBeVisible();
  76 |   });
  77 | 
  78 | });
  79 | 
```