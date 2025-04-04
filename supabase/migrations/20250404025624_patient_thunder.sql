/*
  # Add visibility control to products

  1. Changes
    - Add visible column to products table
    - Set default visibility to true for existing products
    - Make visible column required

  2. Security
    - No changes to security policies required
*/

-- Add visible column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS visible boolean DEFAULT true;

-- Set default visibility for existing products
UPDATE products 
SET visible = true 
WHERE visible IS NULL;

-- Make visible required
ALTER TABLE products 
ALTER COLUMN visible SET NOT NULL;