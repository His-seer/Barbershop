-- Check if admin (authenticated users) can view all bookings
-- The finance page uses admin authentication

-- View current policies on bookings table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'bookings';

-- If admin can't see all bookings, we need to add a policy
-- Run this if needed:

-- DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

-- CREATE POLICY "Admins can view all bookings" ON bookings
--   FOR SELECT
--   TO authenticated
--   USING (true);
