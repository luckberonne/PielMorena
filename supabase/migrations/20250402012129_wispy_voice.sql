/*
  # Add category field to products table

  1. Changes
    - Add category column to products table
    - Set default category for existing products
    - Make category column required

  2. Security
    - No changes to security policies required
*/

-- Add category column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category text;

-- Set default category for existing products
UPDATE products 
SET category = 'Otros' 
WHERE category IS NULL;

-- Make category required
ALTER TABLE products 
ALTER COLUMN category SET NOT NULL;