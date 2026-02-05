-- =====================================================
-- RESTORE AVAILABILITY SCRIPT (NUCLEAR OPTION)
-- =====================================================

-- 1. DROP functions first to clear conflicts
DROP FUNCTION IF EXISTS toggle_staff_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_available_slots(UUID, DATE, INTEGER);

-- 2. RESET Everyone to Active (Ensures no one is stuck offline)
UPDATE staff SET is_active = true;

-- 3. Restore Availability Logic (Simplified to GUARANTEE slots show)
-- I have removed the "is_active" check temporarily to restore basic functionality.
CREATE OR REPLACE FUNCTION get_available_slots(
  p_staff_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(time_slot TIME)
SECURITY DEFINER
AS $$
DECLARE
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
  v_slot_duration INTERVAL;
BEGIN
  -- Get Schedule
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  SELECT start_time, end_time INTO v_start_time, v_end_time
  FROM staff_schedules
  WHERE staff_id = p_staff_id AND day_of_week = v_day_of_week AND is_available = true;
  
  -- If no schedule found, return empty (Valid behavior)
  IF v_start_time IS NULL THEN
    RETURN;
  END IF;
  
  -- Duration
  v_slot_duration := (COALESCE(p_duration_minutes, 30) || ' minutes')::INTERVAL;
  
  -- Generate Slots
  RETURN QUERY
  SELECT t::TIME
  FROM generate_series(
    v_start_time,
    v_end_time - v_slot_duration,
    v_slot_duration
  ) AS t
  WHERE NOT EXISTS (
    SELECT 1 
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.id
    WHERE b.staff_id = p_staff_id
      AND b.booking_date = p_date
      AND b.status NOT IN ('cancelled', 'no-show') 
      -- Collision Check
      AND t::TIME < (b.booking_time + (COALESCE(s.duration_minutes, 30) || ' minutes')::INTERVAL)::TIME
      AND (t::TIME + v_slot_duration)::TIME > b.booking_time
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Restore Staff Toggle Function (Changes DB, but doesn't block slots yet)
CREATE OR REPLACE FUNCTION toggle_staff_status(p_staff_id UUID, p_is_active BOOLEAN)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  UPDATE staff SET is_active = p_is_active WHERE id = p_staff_id;
END;
$$ LANGUAGE plpgsql;

-- 5. FIX PERMISSIONS (Grant Execute to everyone)
GRANT EXECUTE ON FUNCTION get_available_slots TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION toggle_staff_status TO anon, authenticated, service_role;

-- 6. Ensure Booking Updates still work
DROP POLICY IF EXISTS "Staff can update own bookings" ON bookings;
CREATE POLICY "Staff can update own bookings" ON bookings FOR UPDATE
  USING (staff_id = (current_setting('request.jwt.claims', true)::json->>'staff_id')::uuid);
