-- =====================================================
-- PRIVACY ENHANCEMENTS - DATABASE MIGRATION
-- =====================================================
-- Run this if you've already deployed the original schema
-- This adds privacy features for high-profile clients
-- =====================================================

-- 1. Make phone number optional
ALTER TABLE bookings 
  ALTER COLUMN customer_phone DROP NOT NULL;

-- 2. Add privacy preference fields
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS prefer_email_only BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_preference VARCHAR(20) DEFAULT 'email_sms' 
    CHECK (reminder_preference IN ('email_only', 'email_sms'));

-- 3. Create access log table for tracking who views booking details
CREATE TABLE IF NOT EXISTS booking_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  accessed_by_user_id UUID, -- Admin or staff user ID
  accessed_by_role VARCHAR(50), -- 'admin', 'staff'
  access_type VARCHAR(50) DEFAULT 'view' CHECK (access_type IN ('view', 'edit', 'delete')),
  ip_address VARCHAR(45), -- IPv4 or IPv6
  user_agent TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_booking_access_log_booking ON booking_access_log(booking_id);
CREATE INDEX idx_booking_access_log_user ON booking_access_log(accessed_by_user_id);
CREATE INDEX idx_booking_access_log_time ON booking_access_log(accessed_at);

-- Enable RLS on access log
ALTER TABLE booking_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view access logs
CREATE POLICY "Admins can view access logs" ON booking_access_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- Anyone authenticated can insert access logs (for tracking)
CREATE POLICY "Authenticated users can log access" ON booking_access_log FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Create function to log booking access
CREATE OR REPLACE FUNCTION log_booking_access(
  p_booking_id UUID,
  p_user_id UUID,
  p_role VARCHAR(50),
  p_access_type VARCHAR(50) DEFAULT 'view'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO booking_access_log (
    booking_id,
    accessed_by_user_id,
    accessed_by_role,
    access_type
  ) VALUES (
    p_booking_id,
    p_user_id,
    p_role,
    p_access_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to get masked phone number (for staff view)
CREATE OR REPLACE FUNCTION mask_phone_number(phone VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  IF phone IS NULL OR phone = '' THEN
    RETURN 'Not provided';
  END IF;
  
  -- Show only last 4 digits: ***-***-1234
  IF LENGTH(phone) >= 4 THEN
    RETURN '***-***-' || RIGHT(phone, 4);
  ELSE
    RETURN '***-***-****';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Create view for staff to see bookings with masked contact info
CREATE OR REPLACE VIEW staff_booking_view AS
SELECT 
  b.id,
  b.customer_name,
  b.customer_email,
  CASE 
    WHEN b.prefer_email_only THEN 'Email only (VIP)'
    ELSE mask_phone_number(b.customer_phone)
  END AS customer_phone_masked,
  b.prefer_email_only,
  b.booking_date,
  b.booking_time,
  b.service_id,
  b.staff_id,
  b.total_price,
  b.payment_status,
  b.status,
  b.customer_notes,
  b.staff_notes,
  b.created_at
FROM bookings b;

-- Grant access to staff view
CREATE POLICY "Staff can view their masked bookings" ON bookings FOR SELECT 
  USING (
    staff_id = (current_setting('request.jwt.claims', true)::json->>'staff_id')::uuid
    OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
  );

-- 7. Add comment to bookings table
COMMENT ON COLUMN bookings.customer_phone IS 'Optional - for privacy-conscious clients';
COMMENT ON COLUMN bookings.prefer_email_only IS 'Flag for VIP/high-profile clients who prefer email-only contact';
COMMENT ON COLUMN bookings.reminder_preference IS 'Customer preference for appointment reminders';

-- =====================================================
-- COMPLETED - Privacy Features Added
-- =====================================================
-- New features:
-- ✅ Optional phone number
-- ✅ Email-only preference flag
-- ✅ Reminder preference setting
-- ✅ Access logging for audit trail
-- ✅ Phone number masking for staff
-- ✅ Separate view for staff with limited contact info
-- =====================================================
