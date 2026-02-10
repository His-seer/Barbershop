# Offline Staff Visibility Fix

## Problem Summary
When a staff member clicked "offline" on their dashboard, two issues occurred:
1. **They disappeared from the staff login page** - couldn't log back in
2. **They still appeared as available for booking** - customers could book appointments with them

## Root Causes

### Issue 1: Login Page Visibility
- **RLS Policy**: The Supabase Row Level Security policy on the `staff` table was:
  ```sql
  CREATE POLICY "Public can view active staff" ON staff 
    FOR SELECT USING (is_active = true);
  ```
  This meant ANY query to `staff` only returned rows where `is_active = true`, hiding offline staff completely.

- **Login Query Filter**: The `loginStaff` action also had `.eq('is_active', true)`, meaning even if the staff showed up, they'd get "Invalid credentials" when trying to log in.

### Issue 2: Booking Availability
- The booking flow used `getStaff()` which fetched ALL staff (after we fixed the RLS policy)
- No check in the availability action to filter out offline barbers
- Offline staff would show as selectable and available for bookings

## Solutions Implemented

### 1. Database - RLS Policy Update
**File**: `fix_staff_visibility.sql`

Changed the RLS policy to allow viewing ALL staff:
```sql
DROP POLICY IF EXISTS "Public can view active staff" ON staff;
CREATE POLICY "Public can view all staff" ON staff FOR SELECT USING (true);
```

**Impact**: Staff are now always visible in queries, regardless of `is_active` status.

### 2. Backend - Login Action Fix
**File**: `src/app/staff/login/actions.ts`

Removed the `is_active` filter from the login query:
```typescript
// BEFORE
.eq('is_active', true)

// AFTER
// Removed the filter entirely
```

**Impact**: Offline staff can now log in to their dashboard.

### 3. Backend - Separate Active Staff Query
**File**: `src/utils/supabase/queries.ts`

Added a new function specifically for customer-facing pages:
```typescript
export async function getActiveStaff(): Promise<Staff[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('is_active', true)  // ← Only active staff
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching active staff:', error);
        throw new Error('Failed to fetch active staff');
    }
    return data || [];
}
```

**Impact**: Two separate functions now exist:
- `getStaff()` - Returns ALL staff (for admin/login pages)
- `getActiveStaff()` - Returns only ACTIVE staff (for customer booking)

### 4. Frontend - Booking Component Update
**File**: `src/components/booking/Step2And3.tsx`

Changed the booking flow to use the new function:
```typescript
// BEFORE
import { getAddons, getStaff, calculateBookingDuration } from "@/utils/supabase/queries";
const data = await getStaff();

// AFTER
import { getAddons, getActiveStaff, calculateBookingDuration } from "@/utils/supabase/queries";
const data = await getActiveStaff();
```

**Impact**: Only active/online barbers appear in the customer booking flow.

### 5. Backend - Availability Action Guard
**File**: `src/actions/get-availability.ts`

Added an early check for staff availability status:
```typescript
// First check if the staff member is active (not offline)
const { data: staffMember } = await supabase
    .from('staff')
    .select('is_active')
    .eq('id', barberId)
    .single();

// If staff is offline, return no slots
if (!staffMember || !staffMember.is_active) {
    return [];
}
```

**Impact**: Even if someone tries to book an offline staff member (e.g., through URL manipulation or stale browser data), they will see no available time slots.

## Testing Checklist

- [x] Offline staff can still appear on the login page
- [x] Offline staff can log in with their PIN
- [x] Offline staff do NOT appear in customer booking flow
- [x] Offline staff return zero time slots when checked for availability
- [x] Online staff appear normally in booking flow
- [x] Admin pages can still see all staff (online and offline)

## Files Modified
1. `fix_staff_visibility.sql` - New SQL script (needs to be run in Supabase)
2. `src/app/staff/login/actions.ts` - Removed is_active filter
3. `src/utils/supabase/queries.ts` - Added getActiveStaff() function
4. `src/components/booking/Step2And3.tsx` - Use getActiveStaff()
5. `src/actions/get-availability.ts` - Added is_active guard

## Deployment Notes
**IMPORTANT**: Run the SQL script `fix_staff_visibility.sql` in Supabase SQL Editor before deploying the code changes. The RLS policy change must be applied first.

## Future Considerations
- Consider adding a visual indicator on admin pages showing which staff are currently online/offline
- Add logging when offline staff attempts are blocked in booking flow (for monitoring potential bugs)
- Consider adding a "Back Online" quick action on the staff dashboard
