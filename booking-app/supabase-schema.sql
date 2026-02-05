-- =====================================================
-- BARBERSHOP BOOKING SYSTEM - DATABASE SCHEMA
-- =====================================================
-- This schema supports the complete booking workflow:
-- - Service & Add-on Management
-- - Staff Management with PIN Authentication
-- - Booking System with Time Slots
-- - Payment Integration (Paystack)
-- - Admin Dashboard
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SHOP SETTINGS
-- =====================================================
CREATE TABLE shop_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name VARCHAR(255) NOT NULL DEFAULT 'His-seer Barbershop',
  shop_email VARCHAR(255),
  shop_phone VARCHAR(50),
  shop_address TEXT,
  business_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "10:00", "close": "16:00"}, "sunday": {"open": null, "close": null}}',
  booking_policies TEXT,
  cancellation_hours INTEGER DEFAULT 1, -- Free cancellation up to X hours before
  slot_duration_minutes INTEGER DEFAULT 30,
  advance_booking_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default shop settings
INSERT INTO shop_settings (shop_name, booking_policies) VALUES (
  'His-seer Barbershop',
  'Free cancellation up to 1 hour before your appointment. Late arrivals may result in reduced service time. Please arrive 5 minutes early.'
);

-- =====================================================
-- SERVICES
-- =====================================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default services
INSERT INTO services (name, description, price, duration_minutes, display_order) VALUES
  ('Classic Haircut', 'Traditional barbershop cut with precision and style', 25.00, 30, 1),
  ('Beard Trim', 'Professional beard shaping and grooming', 15.00, 20, 2),
  ('Hot Towel Shave', 'Luxurious straight razor shave with hot towel treatment', 35.00, 45, 3),
  ('Hair & Beard Combo', 'Complete grooming package - haircut and beard trim', 35.00, 50, 4);

-- =====================================================
-- ADD-ONS
-- =====================================================
CREATE TABLE addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default add-ons
INSERT INTO addons (name, description, price, duration_minutes, display_order) VALUES
  ('Hair Wash', 'Refreshing scalp massage and premium shampoo', 8.00, 10, 1),
  ('Scalp Treatment', 'Nourishing treatment for healthy hair growth', 12.00, 15, 2),
  ('Facial Mask', 'Rejuvenating facial treatment', 15.00, 20, 3),
  ('Eyebrow Trim', 'Professional eyebrow shaping', 5.00, 5, 4);

-- =====================================================
-- STAFF (Barbers)
-- =====================================================
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  pin_hash VARCHAR(255) NOT NULL, -- Hashed 4-digit PIN for authentication
  avatar_url TEXT,
  bio TEXT,
  specialties TEXT[], -- Array of specialties
  is_active BOOLEAN DEFAULT true,
  paystack_subaccount_code VARCHAR(100), -- For split payments
  commission_percentage DECIMAL(5, 2) DEFAULT 70.00, -- Barber gets 70% by default
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample staff (PIN: 1234 - you should hash this properly in production)
INSERT INTO staff (name, email, pin_hash, bio, specialties, paystack_subaccount_code) VALUES
  ('Marcus Johnson', 'marcus@hisseer.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGjad68LJZdL17lhWy', 'Master barber with 10+ years experience', ARRAY['Classic Cuts', 'Fades', 'Beard Styling'], 'ACCT_svc456'),
  ('David Smith', 'david@hisseer.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGjad68LJZdL17lhWy', 'Specialist in modern styles and designs', ARRAY['Modern Cuts', 'Hair Designs', 'Color'], 'ACCT_svc456');

-- =====================================================
-- STAFF SCHEDULES
-- =====================================================
CREATE TABLE staff_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, day_of_week)
);

-- Insert default schedules for staff (Monday-Friday 9AM-6PM, Saturday 10AM-4PM)
INSERT INTO staff_schedules (staff_id, day_of_week, start_time, end_time)
SELECT 
  s.id,
  d.day,
  CASE 
    WHEN d.day = 6 THEN '10:00'::TIME -- Saturday
    ELSE '09:00'::TIME -- Monday-Friday
  END,
  CASE 
    WHEN d.day = 6 THEN '16:00'::TIME -- Saturday
    ELSE '18:00'::TIME -- Monday-Friday
  END
FROM staff s
CROSS JOIN (SELECT generate_series(1, 6) AS day) d; -- Monday(1) to Saturday(6)

-- =====================================================
-- STAFF TIME OFF
-- =====================================================
CREATE TABLE staff_time_off (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BOOKINGS
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50), -- Optional for privacy-conscious clients
  prefer_email_only BOOLEAN DEFAULT false, -- VIP/high-profile client flag
  reminder_preference VARCHAR(20) DEFAULT 'email_sms' CHECK (reminder_preference IN ('email_only', 'email_sms')),
  
  -- Booking Details
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  staff_id UUID REFERENCES staff(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  
  -- Pricing
  service_price DECIMAL(10, 2) NOT NULL,
  addons_price DECIMAL(10, 2) DEFAULT 0.00,
  total_price DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_reference VARCHAR(255) UNIQUE,
  paystack_reference VARCHAR(255),
  paid_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no-show')),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Notes
  customer_notes TEXT,
  staff_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT valid_booking_datetime CHECK (booking_date >= CURRENT_DATE)
);

-- Create indexes for performance
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_staff ON bookings(staff_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);

-- =====================================================
-- BOOKING ADD-ONS (Junction Table)
-- =====================================================
CREATE TABLE booking_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES addons(id) ON DELETE RESTRICT,
  addon_name VARCHAR(255) NOT NULL, -- Snapshot for historical records
  addon_price DECIMAL(10, 2) NOT NULL, -- Snapshot for historical records
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ADMINS (Using Supabase Auth)
-- =====================================================
-- Note: Admin authentication is handled by Supabase Auth
-- We just need a table to track admin-specific data
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_shop_settings_updated_at BEFORE UPDATE ON shop_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON addons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON staff_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public read access for shop settings, services, addons (for booking flow)
CREATE POLICY "Public can view shop settings" ON shop_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active addons" ON addons FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active staff" ON staff FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view staff schedules" ON staff_schedules FOR SELECT USING (true);

-- Bookings: Customers can create bookings
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view their own bookings" ON bookings FOR SELECT 
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Booking add-ons: Allow inserts for new bookings
CREATE POLICY "Anyone can add booking addons" ON booking_addons FOR INSERT WITH CHECK (true);

-- Admin policies (full access for authenticated admins)
CREATE POLICY "Admins have full access to shop settings" ON shop_settings FOR ALL 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to services" ON services FOR ALL 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to addons" ON addons FOR ALL 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to staff" ON staff FOR ALL 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to staff schedules" ON staff_schedules FOR ALL 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to staff time off" ON staff_time_off FOR ALL 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to bookings" ON bookings FOR ALL 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to booking addons" ON booking_addons FOR ALL 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Staff policies (can view and update their own data and bookings)
CREATE POLICY "Staff can view their own profile" ON staff FOR SELECT 
  USING (id = (current_setting('request.jwt.claims', true)::json->>'staff_id')::uuid);

CREATE POLICY "Staff can view their own schedules" ON staff_schedules FOR SELECT 
  USING (staff_id = (current_setting('request.jwt.claims', true)::json->>'staff_id')::uuid);

CREATE POLICY "Staff can view their own bookings" ON bookings FOR SELECT 
  USING (staff_id = (current_setting('request.jwt.claims', true)::json->>'staff_id')::uuid);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get available time slots for a staff member on a specific date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_staff_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(time_slot TIME) AS $$
DECLARE
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
  v_slot_duration INTERVAL;
BEGIN
  -- Get day of week (0=Sunday, 6=Saturday)
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Get staff schedule for this day
  SELECT start_time, end_time INTO v_start_time, v_end_time
  FROM staff_schedules
  WHERE staff_id = p_staff_id AND day_of_week = v_day_of_week AND is_available = true;
  
  -- If no schedule found, return empty
  IF v_start_time IS NULL THEN
    RETURN;
  END IF;
  
  -- Set slot duration
  v_slot_duration := (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- Generate all possible time slots
  RETURN QUERY
  SELECT t::TIME
  FROM generate_series(
    v_start_time,
    v_end_time - v_slot_duration,
    v_slot_duration
  ) AS t
  WHERE NOT EXISTS (
    -- Exclude slots that conflict with existing bookings
    SELECT 1 FROM bookings
    WHERE staff_id = p_staff_id
      AND booking_date = p_date
      AND status NOT IN ('cancelled', 'no-show')
      AND t::TIME < (booking_time + (duration_minutes || ' minutes')::INTERVAL)::TIME
      AND (t::TIME + v_slot_duration)::TIME > booking_time
  );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total booking duration
CREATE OR REPLACE FUNCTION calculate_booking_duration(
  p_service_id UUID,
  p_addon_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
  v_total_minutes INTEGER := 0;
BEGIN
  -- Add service duration
  SELECT duration_minutes INTO v_total_minutes
  FROM services
  WHERE id = p_service_id;
  
  -- Add addon durations
  IF p_addon_ids IS NOT NULL AND array_length(p_addon_ids, 1) > 0 THEN
    SELECT v_total_minutes + COALESCE(SUM(duration_minutes), 0) INTO v_total_minutes
    FROM addons
    WHERE id = ANY(p_addon_ids);
  END IF;
  
  RETURN v_total_minutes;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View for booking summary with all details
CREATE OR REPLACE VIEW booking_details AS
SELECT 
  b.id,
  b.customer_name,
  b.customer_email,
  b.customer_phone,
  b.booking_date,
  b.booking_time,
  s.name AS service_name,
  st.name AS staff_name,
  b.service_price,
  b.addons_price,
  b.total_price,
  b.payment_status,
  b.status,
  b.created_at,
  ARRAY_AGG(a.name) FILTER (WHERE a.name IS NOT NULL) AS addon_names
FROM bookings b
LEFT JOIN services s ON b.service_id = s.id
LEFT JOIN staff st ON b.staff_id = st.id
LEFT JOIN booking_addons ba ON b.id = ba.booking_id
LEFT JOIN addons a ON ba.addon_id = a.id
GROUP BY b.id, s.name, st.name;

-- =====================================================
-- COMPLETED
-- =====================================================
-- Schema creation complete!
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Create your first admin user via Supabase Auth
-- 3. Insert the admin's UUID into the admins table
-- =====================================================
