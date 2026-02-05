-- =====================================================
-- FIX BOOKING AND CUSTOMERS RLS POLICIES
-- =====================================================
-- This migration fixes the Row-Level Security policies
-- to allow anonymous users to create bookings through
-- the public booking flow.
-- This script is idempotent and can be run multiple times.
-- =====================================================

-- =====================================================
-- BOOKINGS TABLE POLICIES
-- =====================================================

-- Drop ALL existing policies (both old and new names)
DROP POLICY IF EXISTS "Customers can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Enable insert for all users" ON bookings;
DROP POLICY IF EXISTS "Users can view bookings by email" ON bookings;

-- Drop booking_addons policies
DROP POLICY IF EXISTS "Anyone can add booking addons" ON booking_addons;
DROP POLICY IF EXISTS "Enable insert for booking addons" ON booking_addons;
DROP POLICY IF EXISTS "Enable read for booking addons" ON booking_addons;

-- Create new, more permissive policies for bookings
-- Allow anyone (including anonymous users) to insert bookings
CREATE POLICY "Enable insert for all users" 
  ON bookings 
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to view bookings by email (for receipt/confirmation pages)
CREATE POLICY "Users can view bookings by email" 
  ON bookings 
  FOR SELECT 
  USING (
    customer_email = current_setting('request.jwt.claims', true)::json->>'email'
    OR auth.role() = 'anon'  -- Allow anonymous access for public queries
  );

-- Allow anyone to insert booking add-ons (needed during booking creation)
CREATE POLICY "Enable insert for booking addons" 
  ON booking_addons 
  FOR INSERT 
  WITH CHECK (true);

-- Allow reading booking add-ons for anyone (needed for displaying booking details)
CREATE POLICY "Enable read for booking addons" 
  ON booking_addons 
  FOR SELECT 
  USING (true);

-- =====================================================
-- CUSTOMERS TABLE POLICIES (if table exists)
-- =====================================================

-- Drop ALL existing policies on customers table (both old and new names)
DROP POLICY IF EXISTS "Customers can view their own data" ON customers;
DROP POLICY IF EXISTS "Authenticated users can create customers" ON customers;
DROP POLICY IF EXISTS "Enable insert for all users" ON customers;
DROP POLICY IF EXISTS "Users can view their own customer data" ON customers;
DROP POLICY IF EXISTS "Enable update for all users" ON customers;

-- Allow anyone (including anonymous users and triggers) to insert customers
CREATE POLICY "Enable insert for all users" 
  ON customers 
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to view their own customer data by email
CREATE POLICY "Users can view their own customer data" 
  ON customers 
  FOR SELECT 
  USING (
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR auth.role() = 'anon'  -- Allow anonymous access for public queries
  );

-- Allow updates for customer data (for updating booking counts, etc.)
CREATE POLICY "Enable update for all users" 
  ON customers 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- NOTES
-- =====================================================
-- Admin and Staff policies remain unchanged and take precedence
-- The existing admin policies provide full access to authenticated admins
-- The existing staff policies allow staff to view their assigned bookings
