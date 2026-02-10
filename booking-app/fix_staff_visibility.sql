-- =====================================================
-- FIX: ALLOW OFFLINE STAFF TO BE VISIBLE ON LOGIN PAGE
-- =====================================================
-- 
-- PROBLEM: The RLS policy "Public can view active staff" only shows
-- staff where is_active = true. When a staff member goes offline
-- (is_active = false), they disappear from the staff login page
-- and can't log back in.
--
-- SOLUTION: Change the policy so ALL staff are visible regardless
-- of their is_active status. The is_active flag should only control
-- whether the staff member accepts new bookings, NOT their visibility.
-- =====================================================

-- 1. Drop the old restrictive policy
DROP POLICY IF EXISTS "Public can view active staff" ON staff;

-- 2. Create a new policy that allows viewing ALL staff
CREATE POLICY "Public can view all staff" ON staff 
  FOR SELECT 
  USING (true);

-- Verify: This should now show all staff, including offline ones
-- SELECT id, name, is_active FROM staff ORDER BY name;
