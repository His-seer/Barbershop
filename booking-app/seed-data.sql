-- =====================================================
-- BARBERSHOP SEED DATA
-- Run this in Supabase SQL Editor to add initial data
-- =====================================================

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM booking_services;
-- DELETE FROM booking_addons;
-- DELETE FROM bookings;
-- DELETE FROM staff_schedules;
-- DELETE FROM staff;
-- DELETE FROM addons;
-- DELETE FROM services;
-- DELETE FROM shop_settings;

-- =====================================================
-- 1. SHOP SETTINGS
-- =====================================================
INSERT INTO shop_settings (shop_name, shop_email, shop_phone, shop_address, booking_policies)
SELECT 
  'His-seer Barbershop',
  'info@hisseer.com',
  '+233 24 123 4567',
  '123 Main Street, Accra, Ghana',
  'Free cancellation up to 1 hour before your appointment. Late arrivals may result in reduced service time. Please arrive 5 minutes early.'
WHERE NOT EXISTS (SELECT 1 FROM shop_settings);

-- =====================================================
-- 2. SERVICES
-- =====================================================
INSERT INTO services (name, description, price, duration_minutes, display_order, is_active)
SELECT * FROM (VALUES
  ('Classic Haircut', 'Traditional barbershop cut with precision and style', 25.00::DECIMAL, 30, 1, true),
  ('Beard Trim', 'Professional beard shaping and grooming', 15.00::DECIMAL, 20, 2, true),
  ('Hot Towel Shave', 'Luxurious straight razor shave with hot towel treatment', 35.00::DECIMAL, 45, 3, true),
  ('Hair & Beard Combo', 'Complete grooming package - haircut and beard trim', 35.00::DECIMAL, 50, 4, true),
  ('Kids Haircut', 'Gentle and fun haircuts for children under 12', 18.00::DECIMAL, 25, 5, true),
  ('Fade Cut', 'Modern gradient fade from skin to longer lengths', 30.00::DECIMAL, 40, 6, true)
) AS v(name, description, price, duration_minutes, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

-- =====================================================
-- 3. ADD-ONS
-- =====================================================
INSERT INTO addons (name, description, price, duration_minutes, display_order, is_active)
SELECT * FROM (VALUES
  ('Hair Wash', 'Refreshing scalp massage and premium shampoo', 8.00::DECIMAL, 10, 1, true),
  ('Scalp Treatment', 'Nourishing treatment for healthy hair growth', 12.00::DECIMAL, 15, 2, true),
  ('Facial Mask', 'Rejuvenating facial treatment', 15.00::DECIMAL, 20, 3, true),
  ('Eyebrow Trim', 'Professional eyebrow shaping', 5.00::DECIMAL, 5, 4, true),
  ('Hair Design', 'Custom patterns and designs', 10.00::DECIMAL, 15, 5, true)
) AS v(name, description, price, duration_minutes, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM addons LIMIT 1);

-- =====================================================
-- 4. STAFF (Barbers)
-- PIN is hashed '1234' - use for testing
-- =====================================================
INSERT INTO staff (name, email, phone, pin_hash, bio, specialties, commission_percentage, is_active)
SELECT * FROM (VALUES
  ('Marcus Johnson', 'marcus@hisseer.com', '0241234567', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGjad68LJZdL17lhWy', 
   'Master barber with 10+ years experience', ARRAY['Classic Cuts', 'Fades', 'Beard Styling'], 70.00::DECIMAL, true),
  ('David Smith', 'david@hisseer.com', '0247654321', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGjad68LJZdL17lhWy', 
   'Specialist in modern styles and designs', ARRAY['Modern Cuts', 'Hair Designs', 'Color'], 70.00::DECIMAL, true),
  ('Kwame Asante', 'kwame@hisseer.com', '0551234567', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGjad68LJZdL17lhWy', 
   'Expert in traditional and contemporary African styles', ARRAY['Afro Cuts', 'Beard Art', 'Fades'], 70.00::DECIMAL, true)
) AS v(name, email, phone, pin_hash, bio, specialties, commission_percentage, is_active)
WHERE NOT EXISTS (SELECT 1 FROM staff LIMIT 1);

-- =====================================================
-- 5. STAFF SCHEDULES (Mon-Sat working hours)
-- =====================================================
INSERT INTO staff_schedules (staff_id, day_of_week, start_time, end_time, is_available)
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
  END,
  true
FROM staff s
CROSS JOIN (SELECT generate_series(1, 6) AS day) d -- Monday(1) to Saturday(6)
WHERE NOT EXISTS (SELECT 1 FROM staff_schedules LIMIT 1);

-- =====================================================
-- 6. HERO SLIDES (Homepage carousel)
-- =====================================================
INSERT INTO hero_slides (title, subtitle, image_url, display_order, is_active)
SELECT * FROM (VALUES
  ('Premium Grooming Experience', 'Where style meets precision', '/images/hero1.jpg', 1, true),
  ('Master Barbers', 'Skilled craftsmen for every style', '/images/hero2.jpg', 2, true)
) AS v(title, subtitle, image_url, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM hero_slides LIMIT 1);

-- =====================================================
-- VERIFY DATA
-- =====================================================
SELECT 'shop_settings' as table_name, COUNT(*) as count FROM shop_settings
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'addons', COUNT(*) FROM addons
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'staff_schedules', COUNT(*) FROM staff_schedules
UNION ALL
SELECT 'hero_slides', COUNT(*) FROM hero_slides;

-- =====================================================
-- 7. DEMO BOOKINGS (Optional)
-- =====================================================
-- Insert sample bookings if none exist
DO $$
DECLARE
  staff1_id UUID;
  staff2_id UUID;
  service1_id UUID;
  service2_id UUID;
  customer_id UUID; -- Use a dummy UUID or current user if available, here we generate one
BEGIN
  -- Get IDs
  SELECT id INTO staff1_id FROM staff LIMIT 1;
  SELECT id INTO staff2_id FROM staff OFFSET 1 LIMIT 1;
  SELECT id INTO service1_id FROM services LIMIT 1;
  SELECT id INTO service2_id FROM services OFFSET 1 LIMIT 1;
  customer_id := gen_random_uuid(); -- Dummy customer ID

  IF NOT EXISTS (SELECT 1 FROM bookings LIMIT 1) THEN
    -- Past booking (Completed)
    INSERT INTO bookings (customer_name, customer_email, customer_phone, staff_id, service_id, booking_date, booking_time, service_price, total_price, status, payment_status)
    VALUES 
    ('John Doe', 'john@example.com', '0240000001', staff1_id, service1_id, CURRENT_DATE - INTERVAL '2 days', '10:00', 25.00, 25.00, 'completed', 'paid'),
    ('Jane Smith', 'jane@example.com', '0240000002', staff2_id, service2_id, CURRENT_DATE - INTERVAL '1 day', '14:00', 15.00, 15.00, 'completed', 'paid');

    -- Upcoming booking (Confirmed)
    INSERT INTO bookings (customer_name, customer_email, customer_phone, staff_id, service_id, booking_date, booking_time, service_price, total_price, status, payment_status)
    VALUES
    ('Mike Brown', 'mike@example.com', '0240000003', staff1_id, service1_id, CURRENT_DATE + INTERVAL '1 day', '09:00', 25.00, 25.00, 'confirmed', 'pending');
  END IF;
END $$;

-- =====================================================
-- 8. DEMO EXPENSES & PAYROLL (Optional)
-- =====================================================
DO $$
DECLARE
  staff1_id UUID;
BEGIN
  SELECT id INTO staff1_id FROM staff LIMIT 1;

  -- Insert sample expenses
  IF NOT EXISTS (SELECT 1 FROM expenses LIMIT 1) THEN
    INSERT INTO expenses (category, amount, description, expense_date) VALUES
    ('supplies', 150.00, 'Barber supplies (blades, alcohol)', CURRENT_DATE - INTERVAL '5 days'),
    ('utilities', 300.00, 'Electricity bill', CURRENT_DATE - INTERVAL '10 days'),
    ('marketing', 100.00, 'Instagram ads', CURRENT_DATE - INTERVAL '15 days');
  END IF;

  -- Insert sample payroll (Draft)
  IF NOT EXISTS (SELECT 1 FROM staff_payroll LIMIT 1) THEN
    INSERT INTO staff_payroll (staff_id, pay_period_start, pay_period_end, base_salary, commission_earned, status)
    VALUES
    (staff1_id, (CURRENT_DATE - INTERVAL '1 month')::DATE, CURRENT_DATE, 500.00, 1200.00, 'draft');
  END IF;
END $$;
