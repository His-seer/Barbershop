# Vercel Deployment Fix Checklist

## 🚨 Critical Issues to Fix

### 1. Environment Variables (MUST DO FIRST)

Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables

Add these variables (copy from your `.env.local`):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ivevgcuzrgdxfvmckapb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZXZnY3V6cmdkeGZ2bWNrYXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODE3ODMsImV4cCI6MjA4NTE1Nzc4M30.vhlGvvp-3d4pcd9qk0SEFgdUoUZ_N1xQMPg9IaHrAbc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZXZnY3V6cmdkeGZ2bWNrYXBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU4MTc4MywiZXhwIjoyMDg1MTU3NzgzfQ.QiWfYTlxQqQXFPUXo3Oz3DobFkjLBHd5L2IiENUH2pE

# Paystack
PAYSTACK_SECRET_KEY=sk_test_a7bc50324a2eaa4ca9a563805132aa6e31f87933
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_05a5f7847743cdc74a0e4e0935014cd6ab4020d3
PAYSTACK_SUBACCOUNT_OPS=ACCT_ops123
PAYSTACK_SUBACCOUNT_SVC=ACCT_svc456

# Email
RESEND_API_KEY=re_BMsxrT7p_F6KfuwpRPP9TDNQj4K8oKpVD
EMAIL_FROM=etorkoko27@gmail.com
```

**Important**: 
- Make sure to select "All Environments" (Production, Preview, Development)
- Click "Save" after adding each variable
- After adding all variables, trigger a new deployment

---

### 2. Redeploy After Adding Variables

After adding environment variables:

1. Go to Deployments tab
2. Click on the latest deployment
3. Click the "..." menu → "Redeploy"
4. Wait for deployment to complete

---

### 3. Verify Supabase RLS Policies

Go to [Supabase Dashboard](https://supabase.com) → SQL Editor

Run this query to check if services are accessible:

```sql
-- Check if services table has data
SELECT * FROM services;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'services';
```

If services exist but RLS is blocking access, run:

```sql
-- Allow anonymous users to read services
CREATE POLICY "Allow anonymous read access to services"
ON services FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to read staff (for barber selection)
CREATE POLICY "Allow anonymous read access to staff"
ON staff FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to read availability
CREATE POLICY "Allow anonymous read access to availability"
ON availability FOR SELECT
TO anon
USING (true);
```

---

### 4. Test the Deployment

After redeploying, test these URLs:

- [ ] Homepage: https://noirhairstudios.vercel.app/
- [ ] Booking: https://noirhairstudios.vercel.app/book
- [ ] API Services: https://noirhairstudios.vercel.app/api/services
- [ ] Staff Login: https://noirhairstudios.vercel.app/staff
- [ ] Admin Login: https://noirhairstudios.vercel.app/admin

---

### 5. Run E2E Tests Again

After fixing environment variables and redeploying:

```bash
npm run test:e2e
```

Expected result: More tests should pass, especially:
- ✅ Services should load on booking page
- ✅ Database integration tests should pass
- ✅ API health checks should pass

---

## 📊 Quick Verification Steps

### Step 1: Check if services load
1. Visit: https://noirhairstudios.vercel.app/book
2. Wait 3-5 seconds
3. You should see service cards (not "Loading services...")

### Step 2: Check API endpoint
1. Visit: https://noirhairstudios.vercel.app/api/services
2. You should see JSON data with services
3. If you see an error, check Vercel function logs

### Step 3: Check Vercel Logs
1. Go to Vercel Dashboard → Deployments → [Latest]
2. Click "Functions" tab
3. Look for any errors in the logs

### Step 4: Check Supabase Logs
1. Go to Supabase Dashboard → Logs
2. Filter by "API" logs
3. Look for any connection errors or RLS policy blocks

---

## 🐛 Common Issues & Solutions

### Issue: "Loading services..." never goes away

**Solution**:
1. Check browser console for errors (F12)
2. Verify NEXT_PUBLIC_SUPABASE_URL is set in Vercel
3. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is set in Vercel
4. Check Supabase RLS policies

### Issue: API routes return 500 errors

**Solution**:
1. Check Vercel function logs
2. Verify SUPABASE_SERVICE_ROLE_KEY is set
3. Check if database tables exist
4. Verify Supabase connection

### Issue: Services exist but don't show

**Solution**:
1. Check RLS policies (see step 3 above)
2. Verify services have `is_active = true`
3. Check if services have proper data

---

## ✅ Success Checklist

After completing all steps above, verify:

- [ ] Environment variables added to Vercel
- [ ] Application redeployed
- [ ] Services load on booking page
- [ ] API endpoints return data
- [ ] No errors in Vercel logs
- [ ] No errors in Supabase logs
- [ ] E2E tests pass (at least database tests)
- [ ] Can complete a test booking (without payment)

---

## 🎯 Final Test

Run the full E2E test suite:

```bash
npm run test:e2e
```

**Target**: At least 20/24 tests passing (excluding skipped tests)

If you achieve this, your deployment is ready! 🎉

---

## 📞 Need Help?

If issues persist:

1. Check `TEST_RESULTS.md` for detailed analysis
2. Run tests in headed mode: `npm run test:e2e:headed`
3. Check test screenshots in `test-results/` folder
4. Review Vercel deployment logs
5. Review Supabase logs
