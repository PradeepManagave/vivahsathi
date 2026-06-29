import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(/VivahSathi|M-Plus Matrimony/i);
  });

  test('shows navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav, header, [role="navigation"]').first()).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('text=required')).toBeVisible();
  });
});

test.describe('Search', () => {
  test('search page loads with filters', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('text=Search')).toBeVisible();
  });
});

test.describe('Profile', () => {
  test('profile page shows details', async ({ page }) => {
    const response = await page.goto('/profile/123');
    expect(response?.ok()).toBeTruthy();
  });
});
