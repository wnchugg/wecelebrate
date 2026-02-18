-- Create user_audit_log table for tracking sensitive user management actions
-- This table logs all user edits, password changes, proxy logins, and admin bypass logins

CREATE TABLE IF NOT EXISTS user_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES site_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN (
    'user_created',
    'user_updated',
    'user_deleted',
    'password_set',
    'password_reset_forced',
    'proxy_login_started',
    'proxy_login_ended',
    'admin_bypass_login',
    'role_changed',
    'status_changed'
  )),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_audit_log_site_id ON user_audit_log(site_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_admin_id ON user_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_target_user_id ON user_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_action ON user_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_user_audit_log_created_at ON user_audit_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin users can view audit logs for their sites
CREATE POLICY "Admin users can view audit logs"
  ON user_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users can insert audit logs
CREATE POLICY "Admin users can insert audit logs"
  ON user_audit_log
  FOR INSERT
  WITH CHECK (
    admin_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON user_audit_log TO authenticated;

-- Helper function to log user actions
CREATE OR REPLACE FUNCTION log_user_action(
  p_site_id UUID,
  p_admin_id UUID,
  p_target_user_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO user_audit_log (
    site_id,
    admin_id,
    target_user_id,
    action,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_site_id,
    p_admin_id,
    p_target_user_id,
    p_action,
    p_details,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE user_audit_log IS 'Audit log for all sensitive user management actions';
COMMENT ON COLUMN user_audit_log.details IS 'JSON object with action-specific details (old/new values, reason, etc.)';
COMMENT ON COLUMN user_audit_log.ip_address IS 'IP address of the admin performing the action';
COMMENT ON FUNCTION log_user_action IS 'Helper function to create audit log entries';
