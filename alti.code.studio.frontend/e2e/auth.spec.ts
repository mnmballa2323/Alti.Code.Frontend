import { test, expect } from '@playwright/test';

test.describe('Authentication and RBAC', () => {

  test('unauthenticated users are redirected from protected routes', async ({ page }) => {
    // Unauthenticated (no cookies)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('standard users cannot access admin routes', async ({ context, page }) => {
    // Authenticated as standard user
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

    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('admin users can access admin routes', async ({ context, page }) => {
    // Authenticated as admin
    await context.addCookies([{ 
      name: 'e2e-session', 
      value: JSON.stringify({ role: 'admin', mfaRequired: false }), 
      domain: 'localhost', 
      path: '/' 
    }]);

    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { role: 'admin', mfaRequired: false }, expires: '2099-01-01T00:00:00.000Z' })
      });
    });

    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/admin/);
  });

  test('users with mfaRequired are redirected to MFA challenge', async ({ context, page }) => {
    // Authenticated but requires MFA
    await context.addCookies([{ 
      name: 'e2e-session', 
      value: JSON.stringify({ role: 'user', mfaRequired: true }), 
      domain: 'localhost', 
      path: '/' 
    }]);

    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { role: 'user', mfaRequired: true }, expires: '2099-01-01T00:00:00.000Z' })
      });
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/auth\/mfa/);

    // Verify MFA UI is visible
    await expect(page.getByText('Two-Factor Authentication')).toBeVisible();
    await expect(page.getByPlaceholder('000000')).toBeVisible();
  });

});
