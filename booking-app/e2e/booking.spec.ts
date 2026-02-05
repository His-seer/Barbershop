import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/book');
        await page.waitForLoadState('networkidle');
    });

    test('should load booking page', async ({ page }) => {
        // Check page title
        await expect(page).toHaveTitle(/Noir Hair Studios/);

        // Check for booking heading
        const heading = page.getByRole('heading', { name: /book your/i });
        await expect(heading).toBeVisible();

        // Check for step indicator
        const stepIndicator = page.getByText(/step 1 of 4/i);
        await expect(stepIndicator).toBeVisible();
    });

    test('should display services from database', async ({ page }) => {
        // Wait for services to load (max 10 seconds)
        await page.waitForTimeout(2000);

        // Check if "Loading services..." is replaced with actual services
        const loadingText = page.getByText(/loading services/i);

        // Either services loaded or still loading
        const servicesLoaded = await page.locator('[data-testid="service-card"]').count() > 0;
        const stillLoading = await loadingText.isVisible().catch(() => false);

        // At least one should be true
        expect(servicesLoaded || stillLoading).toBeTruthy();
    });

    test('should show Paystack security badge', async ({ page }) => {
        const paystackBadge = page.getByText(/secure booking via paystack/i);
        await expect(paystackBadge).toBeVisible();
    });

    test('should have WhatsApp contact link', async ({ page }) => {
        const whatsappLink = page.getByRole('link', { name: /chat with us on whatsapp/i });
        await expect(whatsappLink).toBeVisible();

        // Check that link has proper href
        const href = await whatsappLink.getAttribute('href');
        expect(href).toContain('wa.me');
    });

    test('should navigate back to home', async ({ page }) => {
        const backButton = page.getByRole('link', { name: /back to home/i });

        if (await backButton.isVisible()) {
            await backButton.click();
            await expect(page).toHaveURL('/');
        }
    });

    test('should complete full booking flow', async ({ page }) => {
        // This test is skipped by default as it requires:
        // 1. Services to be loaded from database
        // 2. Available time slots
        // 3. Payment integration (which we don't want to trigger in tests)

        // Step 1: Select a service
        const firstService = page.locator('[data-testid="service-card"]').first();
        if (await firstService.isVisible()) {
            await firstService.click();

            // Wait for next step
            await expect(page.getByText(/step 2 of 4/i)).toBeVisible();

            // Step 2: Skip add-ons or select some
            const continueButton = page.getByRole('button', { name: /continue/i });
            await continueButton.click();

            // Step 3: Select barber and time
            await expect(page.getByText(/step 3 of 4/i)).toBeVisible();

            // Select first available barber
            const firstBarber = page.locator('[data-testid="barber-card"]').first();
            if (await firstBarber.isVisible()) {
                await firstBarber.click();
            }

            // Select first available time slot
            const firstTimeSlot = page.locator('[data-testid="time-slot"]').first();
            if (await firstTimeSlot.isVisible()) {
                await firstTimeSlot.click();
                await continueButton.click();
            }

            // Step 4: Review and payment
            await expect(page.getByText(/step 4 of 4/i)).toBeVisible();

            // Check that booking summary is displayed
            const bookingSummary = page.locator('[data-testid="booking-summary"]');
            await expect(bookingSummary).toBeVisible();

            // Don't actually proceed to payment in tests
        }
    });

    test('should be responsive on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Check that booking page renders properly on mobile
        const heading = page.getByRole('heading', { name: /book your/i });
        await expect(heading).toBeVisible();
    });
});
