-- =====================================================
-- EMERGENCY FIX: V2 (WITH DROPS)
-- =====================================================

-- 0. DROP EXISTING FUNCTIONS (MANDATORY FIX)
-- We must drop these functions first because we are changing their return types
-- or logic significantly. This solves the "cannot change return type" error.
DROP FUNCTION IF EXISTS toggle_staff_status(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS get_available_slots(UUID, DATE, INTEGER);

-- FIX 1: Allow Staff to Update Bookings (Solves "Mark as Completed", "Cancel", "No Show")
-- This enables the buttons in the Staff Dashboard to actually update the database.
DROP POLICY IF EXISTS "Staff can update own bookings" ON bookings;
CREATE POLICY "Staff can update own bookings" ON bookings FOR UPDATE
  USING (staff_id = (current_setting('request.jwt.claims', true)::json->>'staff_id')::uuid);

-- FIX 2: Ensure the "Go Offline" Button actually updates the DB
CREATE OR REPLACE FUNCTION toggle_staff_status(p_staff_id UUID, p_is_active BOOLEAN)
RETURNS VOID
SECURITY DEFINER -- Allows staff to update their own status
SET search_path = public
AS $$
BEGIN
  UPDATE staff SET is_active = p_is_active WHERE id = p_staff_id;
END;
$$ LANGUAGE plpgsql;

-- FIX 3: Make "Offline" actually hide slots & Fix Availability Logic
-- 1. Checks if staff is Offline (returns 0 slots if so).
-- 2. Uses SECURITY DEFINER to correctly see all existing bookings for collision detection.
-- 3. Joins 'services' to get proper duration (fixing the missing column bug).
CREATE OR REPLACE FUNCTION get_available_slots(
  p_staff_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(time_slot TIME)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
  v_slot_duration INTERVAL;
  v_is_active BOOLEAN;
BEGIN
  -- 1. Check Active Status
  SELECT is_active INTO v_is_active FROM staff WHERE id = p_staff_id;
  IF v_is_active IS NOT TRUE THEN
    RETURN;
  END IF;

  -- 2. Get Schedule
  v_day_of_week := EXTRACT(DOW FROM p_date);
  SELECT start_time, end_time INTO v_start_time, v_end_time
  FROM staff_schedules
  WHERE staff_id = p_staff_id AND day_of_week = v_day_of_week AND is_available = true;
  
  IF v_start_time IS NULL THEN
    RETURN;
  END IF;
  
  -- 3. Duration
  v_slot_duration := (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- 4. Generate Slots
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
      AND b.status NOT IN ('cancelled', 'no-show') -- These slots are free
      -- Check collision using Service Duration (default 30m if missing)
      AND t::TIME < (b.booking_time + (COALESCE(s.duration_minutes, 30) || ' minutes')::INTERVAL)::TIME
      AND (t::TIME + v_slot_duration)::TIME > b.booking_time
  );
END;
$$ LANGUAGE plpgsql;
