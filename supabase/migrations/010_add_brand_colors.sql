-- Migration 010: Add additional brand color fields
-- Adds body text colors and accent colors to brands table

ALTER TABLE brands
ADD COLUMN body_text_color_dark VARCHAR(7) DEFAULT '#1F2937',
ADD COLUMN body_text_color_light VARCHAR(7) DEFAULT '#F9FAFB',
ADD COLUMN accent_color_1 VARCHAR(7),
ADD COLUMN accent_color_2 VARCHAR(7);

-- Add comments for documentation
COMMENT ON COLUMN brands.body_text_color_dark IS 'Body text color for light backgrounds';
COMMENT ON COLUMN brands.body_text_color_light IS 'Body text color for dark backgrounds';
COMMENT ON COLUMN brands.accent_color_1 IS 'First brand accent color';
COMMENT ON COLUMN brands.accent_color_2 IS 'Second brand accent color';
