-- =====================================================
-- DEBUG: WHY BOOKING NOT SHOWING IN STAFF DASHBOARD
-- =====================================================

-- 1. Check if the booking was actually created
SELECT 
    id,
    reference,
    customer_name,
    staff_id,
    booking_date,
    booking_time,
    status,
    payment_status,
    created_at
FROM bookings 
WHERE reference = 'BBOOK-17707307988178-415'
ORDER BY created_at DESC;

-- 2. Check what staff_id corresponds to "David Smith"
SELECT id, name, phone, is_active 
FROM staff 
WHERE name ILIKE '%David%Smith%';

-- 3. Check all bookings for today (2026-02-10)
SELECT 
    b.id,
    b.reference,
    b.customer_name,
    b.booking_time,
    b.staff_id,
    s.name as staff_name,
    b.status
FROM bookings b
LEFT JOIN staff s ON b.staff_id = s.id
WHERE b.booking_date = '2026-02-10'
ORDER BY b.booking_time;

-- 4. Check RLS policies on bookings table that might block staff
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual AS "using_expression",
    with_check AS "with_check_expression"
FROM pg_policies 
WHERE tablename = 'bookings'
ORDER BY policyname;

-- If the booking exists but David Smith can't see it, the issue is likely:
-- A) RLS policy blocking staff from viewing their own bookings
-- B) staff_id mismatch in the booking record
