-- =====================================================
-- FINAL TABLES & EXTENSIONS
-- Run this to finalize your database setup
-- =====================================================

-- 1. Enable pgcrypto for password hashing (create_staff)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Hero Slides Table (Carousel)
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  subtitle VARCHAR(255),
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS for Hero Slides
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Hero Slides
-- Public can view active slides
DROP POLICY IF EXISTS "Public can view active hero slides" ON hero_slides;
CREATE POLICY "Public can view active hero slides" ON hero_slides FOR SELECT USING (is_active = true);

-- Admins can manage slides
DROP POLICY IF EXISTS "Admins manage hero slides" ON hero_slides;
CREATE POLICY "Admins manage hero slides" ON hero_slides FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

-- 5. Trigger for updated_at
DROP TRIGGER IF EXISTS update_hero_slides_updated_at ON hero_slides;
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
