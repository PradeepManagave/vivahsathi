import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test('completes multi-step registration', async ({ page }) => {
    await page.goto('/register');

    // Step 1: Basic Info
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.fill('[name="phone"]', '9876543210');
    await page.getByRole('button', { name: /next/i }).click();

    // Step 2: Profile Details
    await expect(page.locator('text=Profile Details')).toBeVisible();
    await page.fill('[name="dateOfBirth"]', '1995-06-15');
    await page.selectOption('[name="gender"]', 'male');
    await page.selectOption('[name="religion"]', 'Hindu');
    await page.getByRole('button', { name: /next/i }).click();

    // Step 3: Preferences
    await expect(page.locator('text=Partner Preferences')).toBeVisible();
    await page.fill('[name="ageMin"]', '25');
    await page.fill('[name="ageMax"]', '35');
    await page.getByRole('button', { name: /submit/i }).click();

    // Success
    await expect(page.locator('text=Registration Successful')).toBeVisible({ timeout: 10000 });
  });
});
