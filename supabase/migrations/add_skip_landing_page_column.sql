-- Add skip_landing_page column to sites table
-- This controls whether the landing page is shown or skipped

ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS skip_landing_page BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN sites.skip_landing_page IS 'When true, users bypass the landing page and go directly to authentication';
