-- Create site_users table for Advanced Authentication
-- This table stores user accounts for sites with SSO/Advanced Auth

CREATE TABLE IF NOT EXISTS site_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  employee_id TEXT,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  force_password_reset BOOLEAN NOT NULL DEFAULT true,
  password_hash TEXT, -- Will be set by backend when password is assigned
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  UNIQUE(site_id, email),
  UNIQUE(site_id, employee_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_site_users_site_id ON site_users(site_id);
CREATE INDEX IF NOT EXISTS idx_site_users_email ON site_users(email);
CREATE INDEX IF NOT EXISTS idx_site_users_employee_id ON site_users(employee_id);
CREATE INDEX IF NOT EXISTS idx_site_users_status ON site_users(status);
CREATE INDEX IF NOT EXISTS idx_site_users_created_at ON site_users(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_site_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_users_updated_at
  BEFORE UPDATE ON site_users
  FOR EACH ROW
  EXECUTE FUNCTION update_site_users_updated_at();

-- Enable Row Level Security
ALTER TABLE site_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin users can see all site users
CREATE POLICY "Admin users can view all site users"
  ON site_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users can insert site users
CREATE POLICY "Admin users can insert site users"
  ON site_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users can update site users
CREATE POLICY "Admin users can update site users"
  ON site_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users can delete (soft delete via status update) site users
CREATE POLICY "Admin users can delete site users"
  ON site_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON site_users TO authenticated;
GRANT USAGE ON SEQUENCE site_users_id_seq TO authenticated;

-- Add comment
COMMENT ON TABLE site_users IS 'User accounts for sites with Advanced Authentication (SSO)';
COMMENT ON COLUMN site_users.force_password_reset IS 'If true, user must reset password on next login';
COMMENT ON COLUMN site_users.password_hash IS 'Hashed password for username/password auth (when SSO bypass is enabled)';
COMMENT ON COLUMN site_users.metadata IS 'Additional user metadata (custom fields, preferences, etc.)';
