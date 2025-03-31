/*
  # Create site settings table

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `hero_image` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `site_settings` table
    - Add policy for admin to manage settings
    - Add policy for public to read settings
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_image text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow admin to manage settings
CREATE POLICY "Allow admin manage site_settings"
  ON site_settings
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email'::text) = 'admin@cuero.com'::text)
  WITH CHECK ((auth.jwt() ->> 'email'::text) = 'admin@cuero.com'::text);

-- Allow public to read settings
CREATE POLICY "Allow public read site_settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

-- Insert default hero image
INSERT INTO site_settings (hero_image)
VALUES ('https://images.unsplash.com/photo-1614252240798-17e859b3e353?auto=format&fit=crop&q=80&w=2000')
ON CONFLICT (id) DO NOTHING;