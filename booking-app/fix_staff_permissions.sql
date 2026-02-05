-- =====================================================
-- FIX: ALLOW STAFF TO UPDATE BOOKINGS
-- =====================================================

-- 1. Allow Staff to UPDATE their own bookings
-- This covers: "Mark as Completed", "No Show", "Cancel", and adding notes
DROP POLICY IF EXISTS "Staff can update own bookings" ON bookings;
CREATE POLICY "Staff can update own bookings" ON bookings FOR UPDATE
  USING (staff_id = (current_setting('request.jwt.claims', true)::json->>'staff_id')::uuid);


-- 2. Allow Staff to INSERT new bookings (for Walk-ins)
-- Currently only "Anyone can create bookings" exists, which is fine, 
-- but ensuring staff explicit permission prevents edge cases.
-- (The existing "Anyone" policy covers this, so we don't strictly need a new one, 
-- but we should double check if authenticated users are restricted differently).
-- The "Anyone can create bookings" policy is: FOR INSERT WITH CHECK (true);
-- So walk-ins work fine.

-- 3. Verify Earnings Calculation Logic
-- The dashboard calculates "Earnings" based on `status = 'completed'`.
-- Once the update policy above is applied, staff can successfully change status to 'completed'.
-- This will automatically trigger the Dashboard Logic in `StaffDashboard/page.tsx` 
-- to move the money from "Pending" to "Earned" and increment the "Done" count.

-- 4. Allow Staff to View Services (needed for Walk-in modal to fetch prices)
-- existing policy: "Public can view active services" -> Covers it.

-- 5. Allow Staff to View Customers (needed for auto-complete in Walk-ins)
-- We added this in missing_schema.sql: "Staff can view customers" -> Covers it.

-- SUMMARY: Just applying the UPDATE policy fixes the dashboard interactivity.
