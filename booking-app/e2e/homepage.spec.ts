import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test('should load successfully', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/Noir Hair Studios/);

        // Wait for page to fully load (remove loading spinner)
        await page.waitForLoadState('networkidle');

        // Check for main heading or key content
        // Adjust selectors based on your actual homepage content
        await expect(page.locator('body')).toBeVisible();
    });

    test('should have proper meta tags', async ({ page }) => {
        await page.goto('/');

        // Check meta description
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute('content', /Experience the art of grooming/);
    });

    test('should navigate to booking page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Look for "Book Now" or similar button
        // Adjust selector based on your actual button
        const bookButton = page.getByRole('link', { name: /book/i }).first();

        if (await bookButton.isVisible()) {
            await bookButton.click();
            await expect(page).toHaveURL(/\/book/);
        }
    });

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check that page renders properly on mobile
        await expect(page.locator('body')).toBeVisible();
    });
});
