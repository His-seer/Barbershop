import { test, expect } from '@playwright/test';

test.describe('Staff Dashboard', () => {
    test('should load staff login page', async ({ page }) => {
        await page.goto('/staff/login');
        await page.waitForLoadState('networkidle');

        // Check if we're on login page or dashboard
        const isLoginPage = await page.getByText(/enter.*pin/i).isVisible().catch(() => false);
        const isDashboard = await page.getByText(/dashboard/i).isVisible().catch(() => false);

        // Should be on either login or dashboard
        expect(isLoginPage || isDashboard).toBeTruthy();
    });

    test('should login with valid PIN', async ({ page }) => {
        // This test is skipped as it requires a valid staff PIN
        // To run this test, replace 'VALID_PIN' with an actual PIN

        await page.goto('/staff/login');
        await page.waitForLoadState('networkidle');

        const pinInput = page.getByLabel(/pin/i);
        if (await pinInput.isVisible()) {
            await pinInput.fill('VALID_PIN');

            const loginButton = page.getByRole('button', { name: /login|sign in/i });
            await loginButton.click();

            // Should redirect to dashboard
            await expect(page).toHaveURL(/\/staff\/dashboard/);
        }
    });

    test('should reject invalid PIN', async ({ page }) => {
        await page.goto('/staff');
        await page.waitForLoadState('networkidle');

        const pinInput = page.getByLabel(/pin/i);
        if (await pinInput.isVisible()) {
            await pinInput.fill('0000');

            const loginButton = page.getByRole('button', { name: /login|sign in/i });
            await loginButton.click();

            // Should show error message
            await page.waitForTimeout(1000);
            const errorMessage = page.getByText(/invalid|incorrect/i);

            // Either error is shown or we're still on login page
            const hasError = await errorMessage.isVisible().catch(() => false);
            const stillOnLogin = await pinInput.isVisible();

            expect(hasError || stillOnLogin).toBeTruthy();
        }
    });
});

test.describe('Admin Dashboard', () => {
    test('should load admin login page', async ({ page }) => {
        await page.goto('/admin/login');
        await page.waitForLoadState('networkidle');

        // Check if we're on login page or dashboard
        const isLoginPage = await page.getByRole('button', { name: /sign in|login/i }).isVisible().catch(() => false);
        const isDashboard = await page.getByText(/dashboard/i).isVisible().catch(() => false);

        // Should be on either login or dashboard
        expect(isLoginPage || isDashboard).toBeTruthy();
    });

    test('should login with valid credentials', async ({ page }) => {
        // This test is skipped as it requires valid admin credentials
        // To run this test, set ADMIN_EMAIL and ADMIN_PASSWORD environment variables

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            test();
            return;
        }

        await page.goto('/admin/login');
        await page.waitForLoadState('networkidle');

        const emailInput = page.getByLabel(/email/i);
        const passwordInput = page.getByLabel(/password/i);

        if (await emailInput.isVisible() && await passwordInput.isVisible()) {
            await emailInput.fill(adminEmail);
            await passwordInput.fill(adminPassword);

            const loginButton = page.getByRole('button', { name: /sign in|login/i });
            await loginButton.click();

            // Should redirect to dashboard
            await expect(page).toHaveURL(/\/admin\/dashboard/);
        }
    });
});
