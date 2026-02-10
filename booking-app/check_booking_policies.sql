-- =====================================================
-- DIAGNOSTIC: CHECK CURRENT BOOKING POLICIES
-- =====================================================
-- Run this to see what RLS policies are currently active on the bookings table

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive AS "permissive?",
    roles,
    cmd AS "command",
    qual AS "USING condition",
    with_check AS "WITH CHECK condition"
FROM pg_policies 
WHERE tablename = 'bookings'
ORDER BY cmd, policyname;

-- Expected output BEFORE fix:
-- - "Staff can view their own bookings" (SELECT) - has JWT check
-- - "Staff can update own bookings" (UPDATE) - has JWT check
-- - "Customers can view their own bookings" (SELECT) - has email check
-- - "Anyone can create bookings" (INSERT) - true
-- - Admin policies (ALL) - admin check

-- Expected output AFTER fix:
-- - "Public can view bookings" (SELECT) - true
-- - "Authenticated users can update bookings" (UPDATE) - true
-- - "Anyone can create bookings" (INSERT) - true
-- - Admin policies (ALL) - admin check
