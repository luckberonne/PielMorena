/*
  # Update schema with proper RLS policies and authentication

  1. Changes
    - Add storage bucket for product images
    - Update RLS policies for admin access
    - Add storage policies for product images

  2. Security
    - Enable RLS on storage objects
    - Add policies for authenticated admin access
    - Add policies for public read access
*/

-- Create storage bucket for product images if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('product-images', 'product-images', true);
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on products" ON products;
DROP POLICY IF EXISTS "Allow admin insert on products" ON products;
DROP POLICY IF EXISTS "Allow admin update on products" ON products;
DROP POLICY IF EXISTS "Allow admin delete on products" ON products;
DROP POLICY IF EXISTS "Allow public read access on product_images" ON product_images;
DROP POLICY IF EXISTS "Allow admin insert on product_images" ON product_images;
DROP POLICY IF EXISTS "Allow admin update on product_images" ON product_images;
DROP POLICY IF EXISTS "Allow admin delete on product_images" ON product_images;
DROP POLICY IF EXISTS "Allow public read access on product images storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin access on product images storage" ON storage.objects;

-- Create policies for products
CREATE POLICY "Allow public read access on products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin insert on products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  );

CREATE POLICY "Allow admin update on products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  );

CREATE POLICY "Allow admin delete on products"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  );

-- Create policies for product_images
CREATE POLICY "Allow public read access on product_images"
  ON product_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin insert on product_images"
  ON product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  );

CREATE POLICY "Allow admin update on product_images"
  ON product_images
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  );

CREATE POLICY "Allow admin delete on product_images"
  ON product_images
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'admin@cuero.com'
  );

-- Create storage policies
CREATE POLICY "Allow public read access on product images storage"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow admin access on product images storage"
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