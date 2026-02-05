# Supabase Setup Guide - His-seer Barbershop

## ✅ Step 1: Environment Variables (COMPLETED)

Your `.env.local` file is already configured with:
- ✅ Supabase Project URL
- ✅ Supabase Anon Key (Publishable)
- ✅ Supabase Service Role Key

## 📋 Step 2: Run Database Schema

1. **Open Supabase Dashboard:**
   - Go to: https://ivevgcuzrgdxfvmckapb.supabase.co
   - Navigate to: **SQL Editor** (in the left sidebar)

2. **Execute Schema:**
   - Click **"New Query"**
   - Copy the entire contents of `supabase-schema.sql`
   - Paste into the SQL Editor
   - Click **"Run"** or press `Ctrl+Enter`

3. **Verify Tables Created:**
   - Go to **Table Editor** in the left sidebar
   - You should see these tables:
     - `shop_settings`
     - `services`
     - `addons`
     - `staff`
     - `staff_schedules`
     - `staff_time_off`
     - `bookings`
     - `booking_addons`
     - `admins`

## 👤 Step 3: Create Your First Admin User

### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **"Add User"** → **"Create new user"**
3. Enter:
   - **Email:** your-admin-email@example.com
   - **Password:** (choose a strong password)
   - Check **"Auto Confirm User"**
4. Click **"Create User"**
5. Copy the **User UUID** that appears

### Option B: Via SQL

```sql
-- This will be done automatically when you sign up via your app
-- But you can also create users directly in Supabase Auth UI
```

### Add Admin to admins table:

1. Go back to **SQL Editor**
2. Run this query (replace `YOUR-USER-UUID` with the actual UUID):

```sql
INSERT INTO admins (id, full_name, role)
VALUES ('YOUR-USER-UUID', 'Your Name', 'super_admin');
```

## 🔐 Step 4: Test Authentication

### Test Admin Login:
1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/login`
3. Login with the email/password you created

### Test Staff Login:
The schema includes 2 sample staff members with PIN: **1234**
- Marcus Johnson (marcus@hisseer.com)
- David Smith (david@hisseer.com)

Navigate to: `http://localhost:3000/staff/login`

## 📊 Database Schema Overview

### Core Tables:

**shop_settings**
- Stores barbershop configuration
- Business hours, policies, booking rules

**services**
- Main services (haircuts, shaves, etc.)
- Pricing and duration

**addons**
- Optional add-ons (hair wash, treatments, etc.)
- Additional pricing

**staff**
- Barber profiles
- PIN authentication (hashed)
- Paystack subaccount codes for split payments

**staff_schedules**
- Weekly availability for each barber
- Day of week + time ranges

**bookings**
- Customer appointments
- Payment status tracking
- Cancellation handling

**booking_addons**
- Links bookings to selected add-ons
- Historical pricing snapshots

### Security Features:

✅ **Row Level Security (RLS)** enabled on all tables
✅ **Public access** for viewing services/staff (booking flow)
✅ **Admin-only access** for management operations
✅ **Customer access** to their own bookings
✅ **Staff access** to their own schedules and bookings

### Helper Functions:

**get_available_slots(staff_id, date, duration)**
- Returns available time slots for booking
- Excludes already booked times
- Respects staff schedules

**calculate_booking_duration(service_id, addon_ids)**
- Calculates total appointment duration
- Includes service + all add-ons

## 🎨 Sample Data Included:

### Services:
- Classic Haircut ($25, 30min)
- Beard Trim ($15, 20min)
- Hot Towel Shave ($35, 45min)
- Hair & Beard Combo ($35, 50min)

### Add-ons:
- Hair Wash ($8, 10min)
- Scalp Treatment ($12, 15min)
- Facial Mask ($15, 20min)
- Eyebrow Trim ($5, 5min)

### Staff:
- Marcus Johnson (Master Barber)
- David Smith (Modern Styles Specialist)

Both work Monday-Friday 9AM-6PM, Saturday 10AM-4PM

## 🔄 Next Steps:

1. ✅ Run the schema SQL
2. ✅ Create your admin user
3. ✅ Test admin login
4. ✅ Test staff login (PIN: 1234)
5. 🚀 Start building/testing your booking flow!

## 🛠️ Useful SQL Queries:

### View all bookings with details:
```sql
SELECT * FROM booking_details ORDER BY booking_date DESC, booking_time DESC;
```

### Check available slots for a staff member:
```sql
SELECT * FROM get_available_slots(
  'staff-uuid-here'::uuid,
  '2026-01-30'::date,
  30
);
```

### View today's bookings:
```sql
SELECT 
  customer_name,
  booking_time,
  s.name as service,
  st.name as barber,
  total_price,
  status
FROM bookings b
JOIN services s ON b.service_id = s.id
JOIN staff st ON b.staff_id = st.id
WHERE booking_date = CURRENT_DATE
ORDER BY booking_time;
```

## 📞 Support:

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Verify RLS policies are enabled
3. Ensure your admin user is in the `admins` table
4. Check that environment variables are loaded (restart dev server)

---

**Database Schema Version:** 1.0  
**Last Updated:** 2026-01-28
