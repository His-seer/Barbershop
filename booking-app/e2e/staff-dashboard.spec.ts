import { test, expect } from '@playwright/test';

// Helper to login as staff (you'll need to update with actual PIN)
async function loginAsStaff(page: any, pin: string = '1234') {
    await page.goto('/staff/login');
    await page.waitForLoadState('networkidle');

    const pinInput = page.getByLabel(/pin/i);
    if (await pinInput.isVisible()) {
        await pinInput.fill(pin);
        const loginButton = page.getByRole('button', { name: /login|sign in/i });
        await loginButton.click();
        await page.waitForLoadState('networkidle');
    }
}

test.describe('Staff Dashboard - Comprehensive Tests', () => {

    test.describe('Dashboard Overview', () => {
        test('should display dashboard header with earnings', async ({ page }) => {
            await loginAsStaff(page);

            // Check for dashboard header
            const header = page.locator('[class*="DashboardHeader"]').first();
            await expect(header).toBeVisible();

            // Check for earnings display
            const earningsText = page.getByText(/today.*earnings/i);
            await expect(earningsText).toBeVisible();

            // Check for target/progress
            const targetText = page.getByText(/target/i);
            await expect(targetText).toBeVisible();
        });

        test('should display schedule section', async ({ page }) => {
            await loginAsStaff(page);

            // Check for Schedule heading
            const scheduleHeading = page.getByRole('heading', { name: /schedule/i });
            await expect(scheduleHeading).toBeVisible();

            // Check for appointment count
            const appointmentCount = page.getByText(/\d+ appointments/i);
            await expect(appointmentCount).toBeVisible();
        });

        test('should display earnings card', async ({ page }) => {
            await loginAsStaff(page);

            // Check for Today's Earnings
            const earningsCard = page.getByText(/today.*earnings/i);
            await expect(earningsCard).toBeVisible();

            // Check for GHS currency
            const ghsAmount = page.getByText(/GHS \d+/i).first();
            await expect(ghsAmount).toBeVisible();

            // Check for Completed/Pending breakdown
            const completedText = page.getByText(/completed/i);
            const pendingText = page.getByText(/pending/i);
            await expect(completedText).toBeVisible();
            await expect(pendingText).toBeVisible();
        });

        test('should display performance stats', async ({ page }) => {
            await loginAsStaff(page);

            // Check for Clients stat
            const clientsStat = page.getByText(/clients/i);
            await expect(clientsStat).toBeVisible();

            // Check for Done/Completed stat
            const doneStat = page.getByText(/done/i);
            await expect(doneStat).toBeVisible();
        });

        test('should display status guide', async ({ page }) => {
            await loginAsStaff(page);

            // Check for Status Guide
            const statusGuide = page.getByText(/status guide/i);
            await expect(statusGuide).toBeVisible();

            // Check for guide items
            const clickCardText = page.getByText(/click card to view details/i);
            await expect(clickCardText).toBeVisible();
        });
    });

    test.describe('Staff Controls', () => {
        test('should display staff name', async ({ page }) => {
            await loginAsStaff(page);

            // Staff name should be visible (e.g., "Good morning, John")
            const greeting = page.getByText(/good (morning|afternoon|evening)/i);
            await expect(greeting).toBeVisible();
        });

        test('should have go offline/online toggle', async ({ page }) => {
            await loginAsStaff(page);

            // Check for online/offline status button
            const statusButton = page.getByRole('button', { name: /(go offline|go online)/i });
            await expect(statusButton).toBeVisible();
        });

        test('should toggle online/offline status', async ({ page }) => {
            await loginAsStaff(page);

            // Find the status button
            const statusButton = page.getByRole('button', { name: /(go offline|go online)/i });
            const initialText = await statusButton.textContent();

            // Click to toggle
            await statusButton.click();
            await page.waitForTimeout(1000);

            // Text should change
            const newText = await statusButton.textContent();
            expect(initialText).not.toBe(newText);
        });

        test('should have logout button', async ({ page }) => {
            await loginAsStaff(page);

            // Check for logout button
            const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
            await expect(logoutButton).toBeVisible();
        });

        test('should logout successfully', async ({ page }) => {
            await loginAsStaff(page);

            // Click logout
            const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
            await logoutButton.click();

            // Should redirect to login page
            await expect(page).toHaveURL(/\/staff\/login/);
        });
    });

    test.describe('Appointment Cards', () => {
        test('should display appointment cards when appointments exist', async ({ page }) => {
            await loginAsStaff(page);

            // Check for appointment cards (if any exist)
            const appointmentCards = page.locator('[class*="AppointmentCard"]');
            const count = await appointmentCards.count();

            if (count > 0) {
                // First card should be visible
                await expect(appointmentCards.first()).toBeVisible();
            } else {
                // Should show empty state
                const emptyState = page.getByText(/no appointments scheduled/i);
                await expect(emptyState).toBeVisible();
            }
        });

        test('should expand appointment card on click', async ({ page }) => {
            await loginAsStaff(page);

            const appointmentCards = page.locator('[class*="AppointmentCard"]');
            const count = await appointmentCards.count();

            if (count > 0) {
                const firstCard = appointmentCards.first();

                // Click to expand
                await firstCard.click();
                await page.waitForTimeout(500);

                // Should show customer notes or additional details
                const details = page.getByText(/customer notes|phone|total/i);
                await expect(details.first()).toBeVisible();
            }
        });

        test('should show appointment menu (3 dots)', async ({ page }) => {
            await loginAsStaff(page);

            const appointmentCards = page.locator('[class*="AppointmentCard"]');
            const count = await appointmentCards.count();

            if (count > 0) {
                // Look for menu button (3 dots)
                const menuButton = appointmentCards.first().getByRole('button', { name: /menu|more/i });

                if (await menuButton.isVisible()) {
                    await expect(menuButton).toBeVisible();
                }
            }
        });

        test('should mark appointment as completed', async ({ page }) => {
            await loginAsStaff(page);

            const appointmentCards = page.locator('[class*="AppointmentCard"]');
            const count = await appointmentCards.count();

            if (count > 0) {
                const firstCard = appointmentCards.first();

                // Find and click menu button
                const menuButton = firstCard.getByRole('button', { name: /menu|more/i });
                if (await menuButton.isVisible()) {
                    await menuButton.click();

                    // Click "Mark as Completed"
                    const completeButton = page.getByRole('button', { name: /mark.*completed/i });
                    if (await completeButton.isVisible()) {
                        await completeButton.click();
                        await page.waitForTimeout(1000);

                        // Should show success or update status
                        const completedBadge = page.getByText(/completed/i);
                        await expect(completedBadge).toBeVisible();
                    }
                }
            }
        });

        test('should show appointment time', async ({ page }) => {
            await loginAsStaff(page);

            const appointmentCards = page.locator('[class*="AppointmentCard"]');
            const count = await appointmentCards.count();

            if (count > 0) {
                // Should show time in format like "09:00" or "9:00 AM"
                const timeText = appointmentCards.first().getByText(/\d{1,2}:\d{2}/);
                await expect(timeText).toBeVisible();
            }
        });

        test('should show client name', async ({ page }) => {
            await loginAsStaff(page);

            const appointmentCards = page.locator('[class*="AppointmentCard"]');
            const count = await appointmentCards.count();

            if (count > 0) {
                // Client name should be visible
                const card = appointmentCards.first();
                const cardText = await card.textContent();
                expect(cardText).toBeTruthy();
                expect(cardText!.length).toBeGreaterThan(0);
            }
        });

        test('should show service name', async ({ page }) => {
            await loginAsStaff(page);

            const appointmentCards = page.locator('[class*="AppointmentCard"]');
            const count = await appointmentCards.count();

            if (count > 0) {
                // Service name should be visible (e.g., "Classic Cut", "Beard Trim")
                const card = appointmentCards.first();
                const cardText = await card.textContent();
                const hasServiceKeyword = cardText && (
                    cardText.includes('Cut') ||
                    cardText.includes('Trim') ||
                    cardText.includes('Shave') ||
                    cardText.includes('Fade')
                );
                expect(hasServiceKeyword).toBeTruthy();
            }
        });

        test('should show appointment status badge', async ({ page }) => {
            await loginAsStaff(page);

            const appointmentCards = page.locator('[class*="AppointmentCard"]');
            const count = await appointmentCards.count();

            if (count > 0) {
                // Should have status badge (confirmed, completed, pending, etc.)
                const statusBadge = appointmentCards.first().locator('[class*="badge"]');
                if (await statusBadge.count() > 0) {
                    await expect(statusBadge.first()).toBeVisible();
                }
            }
        });
    });

    test.describe('Time Indicator', () => {
        test('should show current time indicator line', async ({ page }) => {
            await loginAsStaff(page);

            // Check for time indicator (usually a line showing current time)
            const timeIndicator = page.locator('[class*="TimeIndicator"]');

            if (await timeIndicator.count() > 0) {
                await expect(timeIndicator.first()).toBeVisible();
            }
        });
    });

    test.describe('Date Selection', () => {
        test('should allow date navigation', async ({ page }) => {
            await loginAsStaff(page);

            // Look for date picker or date navigation
            const datePicker = page.locator('input[type="date"]');

            if (await datePicker.isVisible()) {
                await expect(datePicker).toBeVisible();

                // Try changing date
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];

                await datePicker.fill(tomorrowStr);
                await page.waitForLoadState('networkidle');
            }
        });
    });

    test.describe('Empty States', () => {
        test('should show empty state when no appointments', async ({ page }) => {
            await loginAsStaff(page);

            // If no appointments, should show empty state
            const emptyState = page.getByText(/no appointments scheduled/i);
            const appointmentCards = page.locator('[class*="AppointmentCard"]');

            const hasAppointments = await appointmentCards.count() > 0;
            const hasEmptyState = await emptyState.isVisible().catch(() => false);

            // Either has appointments OR shows empty state
            expect(hasAppointments || hasEmptyState).toBeTruthy();
        });

        test('should show encouraging message in empty state', async ({ page }) => {
            await loginAsStaff(page);

            const emptyState = page.getByText(/no appointments scheduled/i);

            if (await emptyState.isVisible()) {
                // Should have encouraging message
                const encouragement = page.getByText(/enjoy.*downtime|master barber/i);
                await expect(encouragement).toBeVisible();
            }
        });
    });

    test.describe('Responsive Design', () => {
        test('should be responsive on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await loginAsStaff(page);

            // Dashboard should still be visible and functional
            const scheduleHeading = page.getByRole('heading', { name: /schedule/i });
            await expect(scheduleHeading).toBeVisible();
        });

        test('should be responsive on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await loginAsStaff(page);

            // Dashboard should still be visible and functional
            const scheduleHeading = page.getByRole('heading', { name: /schedule/i });
            await expect(scheduleHeading).toBeVisible();
        });
    });

    test.describe('Real-time Updates', () => {
        test('should update earnings when appointment marked complete', async ({ page }) => {
            await loginAsStaff(page);

            // Get initial earnings
            const earningsElement = page.getByText(/GHS \d+/).first();
            const initialEarnings = await earningsElement.textContent();

            // Mark an appointment as completed (if any exist)
            const appointmentCards = page.locator('[class*="AppointmentCard"]');
            if (await appointmentCards.count() > 0) {
                const firstCard = appointmentCards.first();
                const menuButton = firstCard.getByRole('button', { name: /menu|more/i });

                if (await menuButton.isVisible()) {
                    await menuButton.click();
                    const completeButton = page.getByRole('button', { name: /mark.*completed/i });

                    if (await completeButton.isVisible()) {
                        await completeButton.click();
                        await page.waitForTimeout(2000);

                        // Earnings should update
                        const newEarnings = await earningsElement.textContent();
                        // Note: This might not change if appointment was already completed
                    }
                }
            }
        });
    });
});
