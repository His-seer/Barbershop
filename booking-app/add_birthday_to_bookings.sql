-- Add birthday columns to store customer birthday for promotions
-- Storing as MM-DD string (e.g. '05-15' for May 15th)

-- 1. Add to bookings table to capture it at booking time
ALTER TABLE bookings 
ADD COLUMN customer_birthday VARCHAR(5); -- Format: MM-DD

-- 2. Add to customers table (if it exists) to store it permanently
-- Check if table exists first to avoid error, or just run it and ignore if fails
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday VARCHAR(5);
    END IF;
END $$;

-- 3. Update the view if needed (booking_details view doesn't explicitly list * so it might need recreation if we want this column there)
-- But the view definition in schema.sql selects specific columns. We can update it later if needed.
