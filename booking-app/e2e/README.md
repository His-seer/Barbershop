# E2E Testing with Playwright

This directory contains end-to-end tests for the Noir Hair Studios booking application.

## 📁 Test Files

- **`homepage.spec.ts`** - Tests for homepage loading, navigation, and responsiveness
- **`booking.spec.ts`** - Tests for the complete booking flow
- **`auth.spec.ts`** - Tests for staff and admin authentication
- **`staff-dashboard.spec.ts`** - Comprehensive tests for staff dashboard (appointments, earnings, controls, status management)
- **`admin-dashboard.spec.ts`** - Comprehensive tests for admin dashboard (revenue, charts, barber performance, transactions)
- **`integration.spec.ts`** - API health checks, database integration, performance, SEO, and accessibility tests

## 🚀 Running Tests

### Run all tests (headless)
```bash
npm run test:e2e
```

### Run tests with browser visible
```bash
npm run test:e2e:headed
```

### Run tests in interactive UI mode
```bash
npm run test:e2e:ui
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test e2e/booking.spec.ts
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

## 🎯 Test Coverage

### ✅ Currently Testing

1. **Homepage**
   - Page loads successfully
   - Meta tags are correct
   - Navigation works
   - Responsive design

2. **Booking Flow**
   - Booking page loads
   - Services load from database
   - Paystack badge displays
   - WhatsApp link works
   - Navigation works

3. **Authentication**
   - Staff login page loads
   - Admin login page loads
   - Invalid credentials are rejected

4. **Integration**
   - API routes are accessible
   - Database connectivity
   - Performance metrics
   - SEO basics
   - Accessibility
   - Error handling (404 pages)

### 🔄 Skipped Tests (Enable when ready)

Some tests are marked with `test.skip()` because they require:

1. **Full Booking Flow** - Requires:
   - Active services in database
   - Available time slots
   - Payment integration (we don't want to trigger real payments in tests)

2. **Staff Login** - Requires:
   - Valid staff PIN
   - Update the test and replace `'VALID_PIN'` with an actual PIN

3. **Admin Login** - Requires:
   - Set environment variables:
     ```bash
     ADMIN_EMAIL=your-admin@email.com
     ADMIN_PASSWORD=your-password
     ```

## 🔧 Configuration

The test configuration is in `playwright.config.ts`:

- **Base URL**: `https://noirhairstudios.vercel.app` (can be overridden with `PLAYWRIGHT_TEST_BASE_URL` env var)
- **Browser**: Chromium (can enable Firefox and WebKit)
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Trace**: On first retry

## 🧪 Testing Against Different Environments

### Test against production (Vercel)
```bash
npm run test:e2e
```

### Test against local development
```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npm run test:e2e
```

### Test against staging
```bash
PLAYWRIGHT_TEST_BASE_URL=https://your-staging-url.vercel.app npm run test:e2e
```

## 📊 Test Reports

After running tests, you can view detailed reports:

```bash
npm run test:e2e:report
```

This will open an HTML report showing:
- Test results
- Screenshots of failures
- Videos of failures
- Execution traces

## 🐛 Debugging Failed Tests

1. **Run in headed mode** to see what's happening:
   ```bash
   npm run test:e2e:headed
   ```

2. **Use debug mode** for step-by-step execution:
   ```bash
   npx playwright test --debug
   ```

3. **Check the trace viewer** for failed tests:
   ```bash
   npx playwright show-trace test-results/[test-name]/trace.zip
   ```

## 📝 Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/your-page');
    
    // Your test code here
    const element = page.getByRole('button', { name: /click me/i });
    await expect(element).toBeVisible();
  });
});
```

### Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for network idle**: Use `await page.waitForLoadState('networkidle')` after navigation
3. **Handle dynamic content**: Use `waitForTimeout` or `waitForSelector` for content that loads asynchronously
4. **Use data-testid**: Add `data-testid` attributes to elements that are hard to select semantically
5. **Keep tests independent**: Each test should be able to run in isolation
6. **Clean up**: Use `test.beforeEach` and `test.afterEach` for setup/teardown

## 🔐 Environment Variables for Tests

Create a `.env.test` file (don't commit this!) with:

```bash
# For admin login tests
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-password

# For testing against local dev
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test Generator](https://playwright.dev/docs/codegen) - Generate tests by recording your actions

## 🎬 Recording New Tests

Use Playwright's codegen to record tests:

```bash
npx playwright codegen https://noirhairstudios.vercel.app
```

This will open a browser and record your actions, generating test code automatically.
