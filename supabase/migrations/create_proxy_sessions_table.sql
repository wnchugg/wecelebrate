-- Create proxy_sessions table for Proxy Login feature
-- This table stores temporary proxy sessions when admins login as employees

CREATE TABLE IF NOT EXISTS proxy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES site_users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CHECK (expires_at > created_at)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_proxy_sessions_admin_id ON proxy_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_proxy_sessions_employee_id ON proxy_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_proxy_sessions_site_id ON proxy_sessions(site_id);
CREATE INDEX IF NOT EXISTS idx_proxy_sessions_token ON proxy_sessions(token);
CREATE INDEX IF NOT EXISTS idx_proxy_sessions_expires_at ON proxy_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_proxy_sessions_active ON proxy_sessions(expires_at) WHERE ended_at IS NULL;

-- Enable Row Level Security
ALTER TABLE proxy_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin users can view their own proxy sessions
CREATE POLICY "Admin users can view their own proxy sessions"
  ON proxy_sessions
  FOR SELECT
  USING (
    admin_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- Admin users can create proxy sessions
CREATE POLICY "Admin users can create proxy sessions"
  ON proxy_sessions
  FOR INSERT
  WITH CHECK (
    admin_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users can update their own proxy sessions (to end them)
CREATE POLICY "Admin users can update their own proxy sessions"
  ON proxy_sessions
  FOR UPDATE
  USING (admin_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON proxy_sessions TO authenticated;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_proxy_sessions()
RETURNS void AS $$
BEGIN
  UPDATE proxy_sessions
  SET ended_at = NOW()
  WHERE expires_at < NOW()
    AND ended_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE proxy_sessions IS 'Temporary sessions for admin proxy login (login as employee)';
COMMENT ON COLUMN proxy_sessions.token IS 'Secure token for proxy session authentication';
COMMENT ON COLUMN proxy_sessions.ended_at IS 'When the session was manually ended (NULL if still active or expired naturally)';
COMMENT ON FUNCTION cleanup_expired_proxy_sessions() IS 'Marks expired proxy sessions as ended';
