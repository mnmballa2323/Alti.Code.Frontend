import { test, expect } from '@playwright/test';

test.describe('Core Studio Layout', () => {

  test.beforeEach(async ({ context, page }) => {
    // Mock an authenticated session
    await context.addCookies([{ 
      name: 'e2e-session', 
      value: JSON.stringify({ role: 'user', mfaRequired: false }), 
      domain: 'localhost', 
      path: '/' 
    }]);

    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { role: 'user', mfaRequired: false }, expires: '2099-01-01T00:00:00.000Z' })
      });
    });
  });

  test('renders the main studio layout correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Build The Future')).toBeVisible();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
