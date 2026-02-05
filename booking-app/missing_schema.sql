-- =====================================================
-- MISSING TABLES AND FUNCTIONS
-- Run this to complete your Supabase setup
-- =====================================================

-- =====================================================
-- 1. Create Missing Tables
-- =====================================================

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  notes TEXT,
  total_bookings INTEGER DEFAULT 0,
  last_booking_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  customer_name VARCHAR(255),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) CHECK (category IN ('rent', 'supplies', 'utilities', 'equipment', 'marketing', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_by UUID REFERENCES auth.users(id), -- Optional link to admin who created it
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STAFF PAYROLL TABLE
CREATE TABLE IF NOT EXISTS staff_payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  base_salary DECIMAL(10, 2) DEFAULT 0,
  commission_earned DECIMAL(10, 2) DEFAULT 0,
  bonus DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  total_pay DECIMAL(10, 2) GENERATED ALWAYS AS (base_salary + commission_earned + bonus - deductions) STORED,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_payroll ENABLE ROW LEVEL SECURITY;

-- Basic Policies
-- Customers
DROP POLICY IF EXISTS "Admins have full access to customers" ON customers;
CREATE POLICY "Admins have full access to customers" ON customers FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff can view customers" ON customers;
CREATE POLICY "Staff can view customers" ON customers FOR SELECT USING (EXISTS (SELECT 1 FROM staff WHERE is_active = true));

-- Reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Anyone can create reviews" ON reviews;
CREATE POLICY "Anyone can create reviews" ON reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Expenses
DROP POLICY IF EXISTS "Admins manage expenses" ON expenses;
CREATE POLICY "Admins manage expenses" ON expenses FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Payroll
DROP POLICY IF EXISTS "Admins manage payroll" ON staff_payroll;
CREATE POLICY "Admins manage payroll" ON staff_payroll FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Staff view own payroll" ON staff_payroll;
CREATE POLICY "Staff view own payroll" ON staff_payroll FOR SELECT USING (staff_id = (current_setting('request.jwt.claims', true)::json->>'staff_id')::uuid);

-- =====================================================
-- 2. Create Missing Functions (RPCs)
-- =====================================================

-- GET_DASHBOARD_STATS
DROP FUNCTION IF EXISTS get_dashboard_stats();
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  v_today_revenue DECIMAL;
  v_today_count INTEGER;
  v_week_revenue DECIMAL;
  v_week_count INTEGER;
  v_month_revenue DECIMAL;
  v_month_count INTEGER;
  v_noshow_count INTEGER;
  v_total_bookings INTEGER;
BEGIN
  -- Today
  SELECT COALESCE(SUM(total_price), 0), COUNT(*)
  INTO v_today_revenue, v_today_count
  FROM bookings
  WHERE booking_date = CURRENT_DATE AND status != 'cancelled';

  -- Week
  SELECT COALESCE(SUM(total_price), 0), COUNT(*)
  INTO v_week_revenue, v_week_count
  FROM bookings
  WHERE booking_date >= date_trunc('week', CURRENT_DATE) AND status != 'cancelled';

  -- Month
  SELECT COALESCE(SUM(total_price), 0), COUNT(*)
  INTO v_month_revenue, v_month_count
  FROM bookings
  WHERE booking_date >= date_trunc('month', CURRENT_DATE) AND status != 'cancelled';

  -- No-show stats (overall)
  SELECT COUNT(*) INTO v_noshow_count FROM bookings WHERE status = 'no-show';
  SELECT COUNT(*) INTO v_total_bookings FROM bookings;

  RETURN jsonb_build_object(
    'today', jsonb_build_object('revenue', v_today_revenue, 'count', v_today_count, 'previous_revenue', 0, 'previous_count', 0),
    'week', jsonb_build_object('revenue', v_week_revenue, 'count', v_week_count, 'previous_revenue', 0),
    'month', jsonb_build_object('revenue', v_month_revenue, 'count', v_month_count, 'previous_revenue', 0),
    'noshow', jsonb_build_object('count', v_noshow_count, 'total', v_total_bookings)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- GET_BARBER_PERFORMANCE
DROP FUNCTION IF EXISTS get_barber_performance();
CREATE OR REPLACE FUNCTION get_barber_performance()
RETURNS TABLE (
  staff_id UUID,
  staff_name TEXT,
  revenue DECIMAL,
  appointments INTEGER,
  retention_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name::TEXT,
    COALESCE(SUM(b.total_price), 0),
    COUNT(b.id)::INTEGER,
    0.0::DECIMAL -- Placeholder for retention rate calculation
  FROM staff s
  LEFT JOIN bookings b ON s.id = b.staff_id AND b.status = 'completed'
  WHERE s.is_active = true
  GROUP BY s.id, s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- GET_RECENT_TRANSACTIONS
DROP FUNCTION IF EXISTS get_recent_transactions(INTEGER);
CREATE OR REPLACE FUNCTION get_recent_transactions(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  booking_date DATE,
  booking_time TIME,
  customer_name TEXT,
  total_price DECIMAL,
  payment_status VARCHAR,
  status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.booking_date,
    b.booking_time,
    b.customer_name::TEXT,
    b.total_price,
    b.payment_status::VARCHAR,
    b.status::VARCHAR
  FROM bookings b
  ORDER BY b.booking_date DESC, b.booking_time DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE_STAFF
DROP FUNCTION IF EXISTS create_staff(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT);
CREATE OR REPLACE FUNCTION create_staff(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_pin TEXT, -- Raw PIN
  p_bio TEXT DEFAULT NULL,
  p_specialties TEXT[] DEFAULT NULL,
  p_payment_details TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_new_id UUID;
  v_pin_hash TEXT;
BEGIN
  -- In a real app, hash the PIN here using pgcrypto if available, or pass pre-hashed
  -- For this example, we assume pgcrypto is on OR we store it simply (unsafe) -> 
  -- Ideally: v_pin_hash := crypt(p_pin, gen_salt('bf'));
  -- But we will use a placeholder logic if extension not enabled, assuming app might hash it or we use straight text for MVP demo (NOT RECOMMENDED for production)
  -- Based on schema, it expects a hash. Let's assume we store it as is for now or use pgcrypto if present.
  
  -- Assuming pgcrypto is enabled in step 1 of your setup.
  v_pin_hash := crypt(p_pin, gen_salt('bf'));

  INSERT INTO staff (name, email, phone, pin_hash, bio, specialties, paystack_subaccount_code, avatar_url)
  VALUES (p_name, p_email, p_phone, v_pin_hash, p_bio, p_specialties, p_payment_details, p_avatar_url)
  RETURNING id INTO v_new_id;

  -- Create default schedule (Mon-Fri)
  INSERT INTO staff_schedules (staff_id, day_of_week, start_time, end_time)
  SELECT v_new_id, generate_series(1, 5), '09:00', '18:00';

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE_STAFF
DROP FUNCTION IF EXISTS update_staff(UUID, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT);
CREATE OR REPLACE FUNCTION update_staff(
  p_staff_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_bio TEXT DEFAULT NULL,
  p_specialties TEXT[] DEFAULT NULL,
  p_payment_details TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE staff
  SET 
    name = p_name,
    email = p_email,
    phone = p_phone,
    bio = p_bio,
    specialties = p_specialties,
    paystack_subaccount_code = p_payment_details,
    avatar_url = p_avatar_url,
    updated_at = NOW()
  WHERE id = p_staff_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TOGGLE_STAFF_STATUS
DROP FUNCTION IF EXISTS toggle_staff_status(UUID, BOOLEAN);
CREATE OR REPLACE FUNCTION toggle_staff_status(
  p_staff_id UUID,
  p_is_active BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE staff
  SET is_active = p_is_active, updated_at = NOW()
  WHERE id = p_staff_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE_STAFF_SCHEDULE
-- Takes a JSON array of schedule objects: [{"day": 1, "start": "09:00", "end": "17:00", "is_available": true}, ...]
DROP FUNCTION IF EXISTS update_staff_schedule(UUID, JSONB);
CREATE OR REPLACE FUNCTION update_staff_schedule(
  p_staff_id UUID,
  p_schedules JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  s JSONB;
BEGIN
  -- Loop through the array
  FOR s IN SELECT * FROM jsonb_array_elements(p_schedules)
  LOOP
    INSERT INTO staff_schedules (staff_id, day_of_week, start_time, end_time, is_available)
    VALUES (
      p_staff_id,
      (s->>'day')::INTEGER,
      (s->>'start')::TIME,
      (s->>'end')::TIME,
      (s->>'is_available')::BOOLEAN
    )
    ON CONFLICT (staff_id, day_of_week) 
    DO UPDATE SET
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time,
      is_available = EXCLUDED.is_available,
      updated_at = NOW();
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
