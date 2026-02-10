-- =====================================================
-- VERIFY STAFF RLS POLICY IS CORRECT
-- =====================================================

-- Check current policies on the staff table
SELECT 
    schemaname,
    tablename,
    policyname,
    qual AS "using_expression"
FROM pg_policies 
WHERE tablename = 'staff';

-- If you see "Public can view all staff" with using = true, you're good!
-- If you see "Public can view active staff" with using = (is_active = true), run the fix below:

-- =====================================================
-- FIX (only if needed - run this if the old policy still exists)
-- =====================================================

-- Force drop both old and new policy names
DROP POLICY IF EXISTS "Public can view active staff" ON staff;
DROP POLICY IF EXISTS "Public can view all staff" ON staff;

-- Create the correct policy
CREATE POLICY "Public can view all staff" ON staff 
  FOR SELECT 
  USING (true);
