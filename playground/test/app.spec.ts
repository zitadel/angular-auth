import { test, expect } from '@playwright/test';

test('home page returns 200', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
});

test('withholds the protected page when unauthenticated', async ({ page }) => {
  await page.goto('/profile');
  // The authGuard stores the intercepted path and calls signinRedirect() to
  // the external IdP, which is unreachable in tests, so the guarded route must
  // not activate and the protected page must not render. (The nav has a
  // "Profile" link, so target the heading by role.)
  await expect(page.getByRole('heading', { name: 'Profile' })).toHaveCount(0);
});

test('callback route without params does not crash the app', async ({
  page,
}) => {
  const response = await page.goto('/auth/callback');
  expect(response?.status()).toBe(200);
  // The app shell still mounts (no unhandled error blanks the page).
  await expect(page.locator('app-root')).toBeAttached();
});
