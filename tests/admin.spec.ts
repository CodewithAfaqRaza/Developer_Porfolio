import { expect, test } from '@playwright/test';

test('owner login, inquiry details, search and logout work without storing private data in the browser', async ({ page }) => {
  let loggedIn = false;
  await page.route('**/api/admin/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/login')) { loggedIn = true; await route.fulfill({ json: { authenticated: true } }); }
    else if (path.endsWith('/logout')) { loggedIn = false; await route.fulfill({ json: { authenticated: false } }); }
    else if (path.endsWith('/session')) await route.fulfill({ json: { authenticated: loggedIn, local: true, siteKey: null } });
    else await route.fulfill({ json: { inquiries: [{ id: '12345678-1234-4234-8234-123456789abc', createdAt: Date.now(), details: {
      name: 'UI Test Collaborator', email: 'ui-test@example.com', phone: null, country: 'PK', kind: 'collaboration', description: '<script>alert("xss")</script> Build an event portal with Drupal.', budget: '1000-5000', budgetCurrency: 'USD',
    }}], next: null } });
  });
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /Behind closed doors/ })).toBeVisible();
  await page.getByLabel('Owner password').fill('generated-test-password-32-characters-long');
  await page.getByLabel('Verify this local login').check();
  await page.getByRole('button', { name: 'Log in →' }).click();
  await expect(page.getByRole('heading', { name: 'The inbox.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'UI Test Collaborator' })).toBeVisible();
  await expect(page.locator('.admin-detail')).toContainText('Pakistan');
  await expect(page.locator('.admin-detail')).toContainText('$1,000–$5,000');
  await expect(page.locator('.admin-description')).toContainText('<script>');
  await expect(page.locator('.admin-detail script')).toHaveCount(0);
  await page.getByLabel('Search loaded submissions').fill('no-match');
  await expect(page.getByText('No matching submissions.')).toBeVisible();
  await page.getByLabel('Search loaded submissions').fill('ui-test');
  await expect(page.getByRole('button', { name: /UI Test Collaborator/ })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('heading', { name: 'The inbox.' }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/admin-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/admin-desktop.png', fullPage: true });
  const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(storage).not.toContain('ui-test@example.com');
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByLabel('Owner password')).toBeVisible();
  await expect(page.getByText('ui-test@example.com', { exact: true })).toHaveCount(0);
});

test('admin handles setup errors and failed login without opening inbox', async ({ page }) => {
  await page.route('**/api/admin/session', route => route.fulfill({ status: 503, json: { error: 'Admin login is not configured. Run the admin setup command.' } }));
  await page.goto('/admin');
  await expect(page.getByRole('alert')).toContainText('not configured');
  await page.route('**/api/admin/session', route => route.fulfill({ json: { authenticated: false, local: true, siteKey: null } }));
  await page.getByRole('button', { name: 'Retry connection' }).click();
  await page.route('**/api/admin/login', route => route.fulfill({ status: 401, json: { error: 'Login failed.' } }));
  await page.getByLabel('Owner password').fill('invalid-test-password-32-characters-long');
  await page.getByLabel('Verify this local login').check();
  await page.getByRole('button', { name: 'Log in →' }).click();
  await expect(page.getByRole('alert')).toHaveText('Login failed.');
  await expect(page.getByLabel('Verify this local login')).not.toBeChecked();
  await expect(page.getByRole('heading', { name: 'The inbox.' })).toHaveCount(0);
});
