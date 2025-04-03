/*
  # Create storage buckets for images

  1. New Storage Buckets
    - `product-images` for product photos
    - `site-images` for site assets like hero images
  
  2. Security
    - Enable public read access
    - Restrict write access to authenticated admin users
*/

-- Create storage buckets if they don't exist
DO $$
BEGIN
  -- Create product-images bucket
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-images', 'product-images', true);
  END IF;

  -- Create site-images bucket
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'site-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('site-images', 'site-images', true);
  END IF;
END $$;

-- Set up storage policies for product-images
CREATE POLICY "Give public read access to product-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow admin users to manage product-images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  )
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  );

-- Set up storage policies for site-images
CREATE POLICY "Give public read access to site-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'site-images');

CREATE POLICY "Allow admin users to manage site-images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'site-images' AND
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  )
  WITH CHECK (
    bucket_id = 'site-images' AND
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  );