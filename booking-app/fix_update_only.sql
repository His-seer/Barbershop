-- =====================================================
-- FIX: STAFF CAN'T UPDATE BOOKING STATUS
-- =====================================================
-- Just the UPDATE policy fix (viewing is already fixed)

DROP POLICY IF EXISTS "Staff can update own bookings" ON bookings;

CREATE POLICY "Authenticated users can update bookings" ON bookings 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- That's it! Now test:
-- 1. Mark as Completed
-- 2. Mark as No-Show  
-- 3. Cancel Booking
-- All should work and update the dashboard immediately
