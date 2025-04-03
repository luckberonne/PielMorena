/*
  # Add banner to site settings

  1. Changes
    - Add banner fields to site_settings table:
      - banner_image (text)
      - banner_text (text)
      - banner_enabled (boolean)
      - banner_link (text)

  2. Security
    - No changes to security policies required (using existing site_settings policies)
*/

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS banner_image text,
ADD COLUMN IF NOT EXISTS banner_text text,
ADD COLUMN IF NOT EXISTS banner_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS banner_link text;