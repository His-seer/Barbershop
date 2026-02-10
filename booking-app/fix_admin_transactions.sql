-- =====================================================
-- FIX: ADMIN CAN'T SEE TRANSACTIONS IN FINANCE PAGE
-- =====================================================
-- The finance page uses admin authentication (JWT)
-- but the current policies don't allow admins to view all bookings
-- =====================================================

-- Allow authenticated users (admins) to view all bookings
-- This is needed for the admin finance page and calendar
DROP POLICY IF EXISTS "Authenticated users can view all bookings" ON bookings;

CREATE POLICY "Authenticated users can view all bookings" ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Note: This doesn't conflict with "Public can view bookings" 
-- Both policies can coexist - they are ORed together
-- This ensures both staff (via cookies) and admins (via JWT) can see bookings

-- After running this, the finance page should show all transactions!
