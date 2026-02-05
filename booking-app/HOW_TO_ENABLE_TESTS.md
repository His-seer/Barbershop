# How to Enable Skipped Tests

## Quick Guide

### Why are tests skipped?

Tests are marked with `test.skip()` when they require:
1. **Authentication credentials** (staff PIN or admin password)
2. **Working database** (for full booking flow)
3. **Real data** (to avoid triggering actual payments)

### How to enable them

#### Method 1: Remove `test.skip()` → Change to `test()`

**Before:**
```typescript
test.skip('should display dashboard header', async ({ page }) => {
    // test code
});
```

**After:**
```typescript
test('should display dashboard header', async ({ page }) => {
    // test code
});
```

#### Method 2: Use Environment Variables

**For Admin Tests:**
1. Create `.env.test` file:
```bash
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-password
```

2. The tests will automatically use these credentials

**For Staff Tests:**
1. Update `staff-dashboard.spec.ts` line 4:
```typescript
async function loginAsStaff(page: any, pin: string = 'YOUR_REAL_PIN') {
```

2. Remove `test.skip` from the tests

#### Method 3: Enable Only Specific Tests

Change only the tests you want to run:

```typescript
// This test will run
test('should load homepage', async ({ page }) => {
    // ...
});

// This test is skipped
test.skip('should login with credentials', async ({ page }) => {
    // ...
});
```

---

## Current Test Status

### ✅ Running Tests (24 tests)
- Homepage tests (4)
- Booking page load tests (7)
- Auth page load tests (3)
- Integration tests (10)

### ⏭️ Skipped Tests (78 tests)
- Staff dashboard tests (35) - **Need staff PIN**
- Admin dashboard tests (40) - **Need admin credentials**
- Full booking flow (1) - **Need working database**
- Successful login tests (2) - **Need credentials**

---

## Enable All Tests - Step by Step

### Step 1: Add Staff PIN

Edit `e2e/staff-dashboard.spec.ts` line 4:
```typescript
async function loginAsStaff(page: any, pin: string = '1234') {
```
Change `'1234'` to your actual staff PIN.

### Step 2: Add Admin Credentials

Create `.env.test` file:
```bash
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-password
```

### Step 3: Remove All test.skip()

Run this command to enable all tests:
```bash
# Find and replace in all test files
# Change: test.skip(
# To: test(
```

Or I can do this for you automatically!

### Step 4: Run Tests

```bash
npm run test:e2e
```

---

## Want Me to Enable Them?

I can automatically:
1. ✅ Remove all `test.skip()` from all test files
2. ✅ Update the login helper to use your PIN
3. ✅ Create `.env.test` template

Just tell me:
- Your staff PIN (or I'll use a placeholder)
- Whether to enable all tests or keep some skipped
