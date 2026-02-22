-- Create permissions system for fine-grained access control
-- This migration creates tables and functions for managing ADMIN user permissions
-- 
-- IMPORTANT: This system is for admin_users (platform admins) only.
-- Site users (site_users table) have their own permission system managed separately.

-- Create permissions table (defines available permissions for admin users)
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'user_management', 'proxy_login', 'admin_bypass', 'site_management', 'client_management')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CHECK (name ~ '^[a-z_]+$') -- Only lowercase letters and underscores
);

-- Create admin_user_permissions table (assigns permissions to admin users)
CREATE TABLE IF NOT EXISTS admin_user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(admin_user_id, permission),
  FOREIGN KEY (permission) REFERENCES admin_permissions(name) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_user_permissions_admin_user_id ON admin_user_permissions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_user_permissions_permission ON admin_user_permissions(permission);
CREATE INDEX IF NOT EXISTS idx_admin_user_permissions_expires_at ON admin_user_permissions(expires_at) WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_permissions table
-- All authenticated admin users can view available permissions
CREATE POLICY "Admin users can view permissions"
  ON admin_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Only super admins can manage permission definitions
CREATE POLICY "Super admins can manage permissions"
  ON admin_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- RLS Policies for admin_user_permissions table
-- Admin users can view their own permissions
CREATE POLICY "Admin users can view their own permissions"
  ON admin_user_permissions
  FOR SELECT
  USING (
    admin_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role IN ('admin', 'super_admin')
    )
  );

-- Only super admins can grant/revoke permissions
CREATE POLICY "Super admins can manage user permissions"
  ON admin_user_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- Grant permissions
GRANT SELECT ON admin_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_user_permissions TO authenticated;

-- Insert default permissions for admin users
INSERT INTO admin_permissions (name, description, category) VALUES
  ('proxy_login', 'Ability to login as another user (proxy login)', 'proxy_login'),
  ('user_management', 'Ability to create, edit, and delete users', 'user_management'),
  ('user_edit', 'Ability to edit user details', 'user_management'),
  ('user_password_set', 'Ability to set user passwords', 'user_management'),
  ('user_delete', 'Ability to delete users', 'user_management'),
  ('admin_bypass_login', 'Ability to use admin bypass login for SSO sites', 'admin_bypass'),
  ('site_admin', 'Full administrative access to site settings', 'site_management'),
  ('client_admin', 'Full administrative access to client settings', 'client_management')
ON CONFLICT (name) DO NOTHING;

-- Create function to check if admin user has permission
CREATE OR REPLACE FUNCTION admin_user_has_permission(
  p_admin_user_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
  v_user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO v_user_role
  FROM admin_users
  WHERE id = p_admin_user_id;
  
  -- Super admins have all permissions
  IF v_user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has the specific permission
  SELECT EXISTS (
    SELECT 1
    FROM admin_user_permissions
    WHERE admin_user_id = p_admin_user_id
      AND permission = p_permission
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_has_permission;
  
  -- Also check if user has wildcard permission
  IF NOT v_has_permission THEN
    SELECT EXISTS (
      SELECT 1
      FROM admin_user_permissions
      WHERE admin_user_id = p_admin_user_id
        AND permission = '*'
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO v_has_permission;
  END IF;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to grant permission to admin user
CREATE OR REPLACE FUNCTION grant_admin_permission(
  p_admin_user_id UUID,
  p_permission TEXT,
  p_granted_by UUID DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_permission_id UUID;
BEGIN
  -- Verify permission exists
  IF NOT EXISTS (SELECT 1 FROM admin_permissions WHERE name = p_permission) THEN
    RAISE EXCEPTION 'Permission % does not exist', p_permission;
  END IF;
  
  -- Verify target user is an admin
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id = p_admin_user_id) THEN
    RAISE EXCEPTION 'User % is not an admin user', p_admin_user_id;
  END IF;
  
  -- Insert or update permission
  INSERT INTO admin_user_permissions (admin_user_id, permission, granted_by, expires_at)
  VALUES (p_admin_user_id, p_permission, COALESCE(p_granted_by, auth.uid()), p_expires_at)
  ON CONFLICT (admin_user_id, permission)
  DO UPDATE SET
    granted_by = COALESCE(p_granted_by, auth.uid()),
    granted_at = NOW(),
    expires_at = p_expires_at
  RETURNING id INTO v_permission_id;
  
  RETURN v_permission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to revoke permission from admin user
CREATE OR REPLACE FUNCTION revoke_admin_permission(
  p_admin_user_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM admin_user_permissions
  WHERE admin_user_id = p_admin_user_id
    AND permission = p_permission;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all permissions for an admin user
CREATE OR REPLACE FUNCTION get_admin_user_permissions(p_admin_user_id UUID)
RETURNS TABLE (
  permission TEXT,
  description TEXT,
  category TEXT,
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.permission,
    p.description,
    p.category,
    up.granted_at,
    up.expires_at
  FROM admin_user_permissions up
  LEFT JOIN admin_permissions p ON p.name = up.permission
  WHERE up.admin_user_id = p_admin_user_id
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  ORDER BY p.category, up.permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up expired admin permissions
CREATE OR REPLACE FUNCTION cleanup_expired_admin_permissions()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM admin_user_permissions
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE admin_permissions IS 'Available permissions for admin users';
COMMENT ON TABLE admin_user_permissions IS 'Permissions granted to admin users';
COMMENT ON FUNCTION admin_user_has_permission IS 'Check if an admin user has a specific permission';
COMMENT ON FUNCTION grant_admin_permission IS 'Grant a permission to an admin user';
COMMENT ON FUNCTION revoke_admin_permission IS 'Revoke a permission from an admin user';
COMMENT ON FUNCTION get_admin_user_permissions IS 'Get all active permissions for an admin user';
COMMENT ON FUNCTION cleanup_expired_admin_permissions IS 'Remove expired admin permissions';
