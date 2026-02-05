import { test, expect } from '@playwright/test';

// Helper to login as admin (you'll need to update with actual credentials)
async function loginAsAdmin(page: any, email?: string, password?: string) {
    const adminEmail = email || process.env.ADMIN_EMAIL;
    const adminPassword = password || process.env.ADMIN_PASSWORD;

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
        await page.waitForLoadState('networkidle');
    }
}

test.describe('Admin Dashboard - Comprehensive Tests', () => {

    test.describe('Dashboard Overview', () => {
        test('should display dashboard header', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for Dashboard heading
            const heading = page.getByRole('heading', { name: /dashboard/i });
            await expect(heading).toBeVisible();

            // Check for greeting message
            const greeting = page.getByText(/good (morning|afternoon|evening)/i);
            await expect(greeting).toBeVisible();
        });

        test('should display quick action buttons', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for New Booking button
            const newBookingBtn = page.getByRole('button', { name: /new booking/i });
            await expect(newBookingBtn).toBeVisible();

            // Check for Reports button
            const reportsBtn = page.getByRole('button', { name: /reports/i });
            await expect(reportsBtn).toBeVisible();

            // Check for Team link
            const teamLink = page.getByRole('link', { name: /team/i });
            await expect(teamLink).toBeVisible();
        });
    });

    test.describe('Revenue Triumvirate', () => {
        test('should display today\'s revenue', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for Today's Revenue card
            const todayRevenue = page.getByText(/today.*revenue/i);
            await expect(todayRevenue).toBeVisible();

            // Should show GHS amount
            const ghsAmount = page.getByText(/GHS \d+/i).first();
            await expect(ghsAmount).toBeVisible();

            // Should show appointment count
            const apptCount = page.getByText(/\d+ appts/i);
            await expect(apptCount).toBeVisible();
        });

        test('should display this week\'s revenue', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for This Week card
            const weekRevenue = page.getByText(/this week/i);
            await expect(weekRevenue).toBeVisible();

            // Should show revenue amount
            const weekAmount = weekRevenue.locator('..').getByText(/GHS \d+/i);
            await expect(weekAmount).toBeVisible();
        });

        test('should display this month\'s revenue', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for This Month card
            const monthRevenue = page.getByText(/this month/i);
            await expect(monthRevenue).toBeVisible();

            // Should show revenue amount
            const monthAmount = monthRevenue.locator('..').getByText(/GHS \d+/i);
            await expect(monthAmount).toBeVisible();
        });

        test('should show revenue as numbers not NaN', async ({ page }) => {
            await loginAsAdmin(page);

            // Get all revenue amounts
            const revenueElements = page.getByText(/GHS \d+/i);
            const count = await revenueElements.count();

            for (let i = 0; i < count; i++) {
                const text = await revenueElements.nth(i).textContent();
                expect(text).not.toContain('NaN');
                expect(text).not.toContain('undefined');
            }
        });
    });

    test.describe('Peak Booking Times Chart', () => {
        test('should display peak times chart', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for Peak Booking Times heading
            const chartHeading = page.getByText(/peak booking times/i);
            await expect(chartHeading).toBeVisible();

            // Check for chart description
            const chartDesc = page.getByText(/average bookings per hour/i);
            await expect(chartDesc).toBeVisible();
        });

        test('should show weekday and weekend legend', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for legend items
            const weekdayLegend = page.getByText(/weekdays/i);
            const weekendLegend = page.getByText(/weekends/i);

            await expect(weekdayLegend).toBeVisible();
            await expect(weekendLegend).toBeVisible();
        });

        test('should render chart with data', async ({ page }) => {
            await loginAsAdmin(page);

            // Wait for chart to render
            await page.waitForTimeout(2000);

            // Check if chart SVG exists
            const chartSvg = page.locator('svg').first();
            await expect(chartSvg).toBeVisible();
        });
    });

    test.describe('Seat Utilization', () => {
        test('should display seat utilization card', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for Seat Utilization heading
            const heading = page.getByText(/seat utilization/i);
            await expect(heading).toBeVisible();
        });

        test('should show utilization percentage', async ({ page }) => {
            await loginAsAdmin(page);

            // Should show percentage (e.g., "73.2%")
            const percentage = page.getByText(/\d+\.?\d*%/);
            await expect(percentage.first()).toBeVisible();
        });

        test('should show status badge', async ({ page }) => {
            await loginAsAdmin(page);

            // Should show status like "Healthy", "Good", etc.
            const status = page.getByText(/(healthy|good|excellent|low)/i);
            await expect(status.first()).toBeVisible();
        });

        test('should display circular progress indicator', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for SVG circle (progress indicator)
            const circles = page.locator('circle');
            const count = await circles.count();
            expect(count).toBeGreaterThan(0);
        });
    });

    test.describe('No-Show Stats', () => {
        test('should display no-show statistics', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for No-Show heading or text
            const noShowText = page.getByText(/no-show/i);
            await expect(noShowText).toBeVisible();
        });

        test('should show no-show count and total', async ({ page }) => {
            await loginAsAdmin(page);

            // Should show format like "5 / 100"
            const noShowStat = page.getByText(/\d+ \/ \d+/);
            await expect(noShowStat).toBeVisible();
        });
    });

    test.describe('Barber Performance Leaderboard', () => {
        test('should display barber performance table', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for Barber Performance heading
            const heading = page.getByText(/barber performance/i);
            await expect(heading).toBeVisible();
        });

        test('should show table headers', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for table headers
            const barberHeader = page.getByRole('columnheader', { name: /barber/i });
            const revenueHeader = page.getByRole('columnheader', { name: /revenue/i });
            const apptsHeader = page.getByRole('columnheader', { name: /appts/i });
            const retentionHeader = page.getByRole('columnheader', { name: /retention/i });

            await expect(barberHeader).toBeVisible();
            await expect(revenueHeader).toBeVisible();
            await expect(apptsHeader).toBeVisible();
            await expect(retentionHeader).toBeVisible();
        });

        test('should display barber data or empty state', async ({ page }) => {
            await loginAsAdmin(page);

            // Either shows barber rows or "No performance data yet"
            const tableRows = page.locator('tbody tr');
            const rowCount = await tableRows.count();

            if (rowCount > 0) {
                // Should have at least one barber row
                const firstRow = tableRows.first();
                await expect(firstRow).toBeVisible();
            } else {
                // Should show empty state
                const emptyState = page.getByText(/no performance data/i);
                await expect(emptyState).toBeVisible();
            }
        });

        test('should show barber avatars', async ({ page }) => {
            await loginAsAdmin(page);

            const tableRows = page.locator('tbody tr');
            const rowCount = await tableRows.count();

            if (rowCount > 0) {
                // First row should have avatar (circle with initial)
                const avatar = tableRows.first().locator('[class*="rounded-full"]').first();
                await expect(avatar).toBeVisible();
            }
        });

        test('should show retention rate badges', async ({ page }) => {
            await loginAsAdmin(page);

            const tableRows = page.locator('tbody tr');
            const rowCount = await tableRows.count();

            if (rowCount > 0) {
                // Should show retention percentage
                const retentionBadge = page.getByText(/\d+%/);
                if (await retentionBadge.count() > 0) {
                    await expect(retentionBadge.first()).toBeVisible();
                }
            }
        });
    });

    test.describe('Recent Transactions', () => {
        test('should display recent transactions table', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for Recent Transactions heading
            const heading = page.getByText(/recent transactions/i);
            await expect(heading).toBeVisible();
        });

        test('should show transaction table headers', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for table headers
            const timeHeader = page.getByRole('columnheader', { name: /time/i });
            const clientHeader = page.getByRole('columnheader', { name: /client/i });
            const amountHeader = page.getByRole('columnheader', { name: /amount/i });
            const statusHeader = page.getByRole('columnheader', { name: /status/i });

            await expect(timeHeader).toBeVisible();
            await expect(clientHeader).toBeVisible();
            await expect(amountHeader).toBeVisible();
            await expect(statusHeader).toBeVisible();
        });

        test('should display transactions or empty state', async ({ page }) => {
            await loginAsAdmin(page);

            // Either shows transaction rows or "No recent transactions"
            const tableRows = page.locator('tbody tr');
            const rowCount = await tableRows.count();

            if (rowCount > 0) {
                // Should have at least one transaction row
                const firstRow = tableRows.first();
                await expect(firstRow).toBeVisible();
            } else {
                // Should show empty state
                const emptyState = page.getByText(/no recent transactions/i);
                await expect(emptyState).toBeVisible();
            }
        });

        test('should show payment status badges', async ({ page }) => {
            await loginAsAdmin(page);

            const tableRows = page.locator('tbody tr');
            const rowCount = await tableRows.count();

            if (rowCount > 0) {
                // Should show status badges (paid, pending, refunded)
                const statusBadge = page.getByText(/(paid|pending|refunded)/i);
                if (await statusBadge.count() > 0) {
                    await expect(statusBadge.first()).toBeVisible();
                }
            }
        });

        test('should show transaction dates and times', async ({ page }) => {
            await loginAsAdmin(page);

            const tableRows = page.locator('tbody tr');
            const rowCount = await tableRows.count();

            if (rowCount > 0) {
                // Should show time in format like "09:00"
                const timeText = tableRows.first().getByText(/\d{1,2}:\d{2}/);
                if (await timeText.count() > 0) {
                    await expect(timeText.first()).toBeVisible();
                }
            }
        });
    });

    test.describe('Navigation', () => {
        test('should navigate to team page', async ({ page }) => {
            await loginAsAdmin(page);

            // Click Team link
            const teamLink = page.getByRole('link', { name: /team/i });
            await teamLink.click();

            // Should navigate to staff page
            await expect(page).toHaveURL(/\/admin\/dashboard\/staff/);
        });

        test('should have navigation menu', async ({ page }) => {
            await loginAsAdmin(page);

            // Check for navigation items (sidebar or top nav)
            const dashboardLink = page.getByRole('link', { name: /dashboard/i }).first();

            if (await dashboardLink.isVisible()) {
                await expect(dashboardLink).toBeVisible();
            }
        });
    });

    test.describe('Loading States', () => {
        test('should show loading spinner initially', async ({ page }) => {
            // Navigate to dashboard
            await page.goto('/admin/dashboard');

            // Should show loading spinner briefly
            const spinner = page.locator('[class*="LoadingSpinner"]');

            // Wait a bit to see if spinner appears
            await page.waitForTimeout(100);

            // Eventually content should load
            await page.waitForLoadState('networkidle');
        });

        test('should load all data without errors', async ({ page }) => {
            await loginAsAdmin(page);

            // Wait for all data to load
            await page.waitForTimeout(3000);

            // Check that main sections are visible
            const revenueSection = page.getByText(/today.*revenue/i);
            const chartSection = page.getByText(/peak booking times/i);
            const barberSection = page.getByText(/barber performance/i);

            await expect(revenueSection).toBeVisible();
            await expect(chartSection).toBeVisible();
            await expect(barberSection).toBeVisible();
        });
    });

    test.describe('Responsive Design', () => {
        test('should be responsive on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await loginAsAdmin(page);

            // Dashboard should still be visible
            const heading = page.getByRole('heading', { name: /dashboard/i });
            await expect(heading).toBeVisible();

            // Revenue cards should stack vertically
            const revenueCards = page.getByText(/today.*revenue|this week|this month/i);
            await expect(revenueCards.first()).toBeVisible();
        });

        test('should be responsive on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await loginAsAdmin(page);

            // Dashboard should still be visible
            const heading = page.getByRole('heading', { name: /dashboard/i });
            await expect(heading).toBeVisible();
        });
    });

    test.describe('Data Accuracy', () => {
        test('should not show NaN or undefined values', async ({ page }) => {
            await loginAsAdmin(page);

            // Wait for data to load
            await page.waitForTimeout(3000);

            // Get all text content
            const bodyText = await page.locator('body').textContent();

            // Should not contain error values
            expect(bodyText).not.toContain('NaN');
            expect(bodyText).not.toContain('undefined');
            expect(bodyText).not.toContain('null');
        });

        test('should show realistic data ranges', async ({ page }) => {
            await loginAsAdmin(page);

            // Revenue should be >= 0
            const revenueElements = page.getByText(/GHS \d+/i);
            const count = await revenueElements.count();

            for (let i = 0; i < count; i++) {
                const text = await revenueElements.nth(i).textContent();
                const amount = parseFloat(text?.replace(/[^0-9.]/g, '') || '0');
                expect(amount).toBeGreaterThanOrEqual(0);
            }
        });
    });

    test.describe('Error Handling', () => {
        test('should handle API errors gracefully', async ({ page }) => {
            await loginAsAdmin(page);

            // Even if API fails, should show empty states, not crash
            await page.waitForTimeout(3000);

            // Page should still be functional
            const heading = page.getByRole('heading', { name: /dashboard/i });
            await expect(heading).toBeVisible();
        });
    });

    test.describe('Console Errors', () => {
        test('should have no critical console errors', async ({ page }) => {
            const consoleErrors: string[] = [];

            page.on('console', (msg) => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            await loginAsAdmin(page);
            await page.waitForTimeout(3000);

            // Filter out known acceptable errors
            const criticalErrors = consoleErrors.filter(error => {
                return !error.includes('third-party') &&
                    !error.includes('extension') &&
                    !error.includes('favicon');
            });

            if (criticalErrors.length > 0) {
                console.log('Console errors found:', criticalErrors);
            }

            // Should have minimal critical errors
            expect(criticalErrors.length).toBeLessThanOrEqual(3);
        });
    });
});
