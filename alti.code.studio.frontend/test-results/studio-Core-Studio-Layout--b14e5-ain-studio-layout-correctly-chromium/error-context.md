# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio.spec.ts >> Core Studio Layout >> renders the main studio layout correctly
- Location: e2e/studio.spec.ts:23:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Build The Future')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Build The Future')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e11]:
    - img "Logo" [ref=e14]
    - listbox [ref=e18]:
      - option "Chat" [selected] [ref=e19] [cursor=pointer]:
        - generic [ref=e20]: Chat
      - option "Billing" [ref=e21] [cursor=pointer]:
        - generic [ref=e22]: Billing
      - option "Members" [ref=e23] [cursor=pointer]:
        - generic [ref=e24]: Members
      - option "Documents" [ref=e25] [cursor=pointer]:
        - generic [ref=e26]: Documents
      - option "Data Hub" [ref=e27] [cursor=pointer]:
        - generic [ref=e28]: Data Hub
      - option "Marketplace" [ref=e29] [cursor=pointer]:
        - generic [ref=e30]: Marketplace
    - button "My Account" [ref=e31] [cursor=pointer]:
      - generic [ref=e33]: My Account
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
  3  | test.describe('Core Studio Layout', () => {
  4  | 
  5  |   test.beforeEach(async ({ context, page }) => {
  6  |     // Mock an authenticated session
  7  |     await context.addCookies([{ 
  8  |       name: 'e2e-session', 
  9  |       value: JSON.stringify({ role: 'user', mfaRequired: false }), 
  10 |       domain: 'localhost', 
  11 |       path: '/' 
  12 |     }]);
  13 | 
  14 |     await page.route('**/api/auth/session', route => {
  15 |       route.fulfill({
  16 |         status: 200,
  17 |         contentType: 'application/json',
  18 |         body: JSON.stringify({ user: { role: 'user', mfaRequired: false }, expires: '2099-01-01T00:00:00.000Z' })
  19 |       });
  20 |     });
  21 |   });
  22 | 
  23 |   test('renders the main studio layout correctly', async ({ page }) => {
  24 |     await page.goto('/dashboard');
> 25 |     await expect(page.getByText('Build The Future')).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  26 |     await expect(page).toHaveURL(/.*\/dashboard/);
  27 |   });
  28 | });
  29 | 
```