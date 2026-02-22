-- Add password expiration column to site_users table
-- This allows temporary passwords to expire after a set time

ALTER TABLE site_users 
ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMPTZ;

-- Add index for efficient expiration checks
CREATE INDEX IF NOT EXISTS idx_site_users_password_expires_at 
ON site_users(password_expires_at) 
WHERE password_expires_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN site_users.password_expires_at IS 'When the temporary password expires (NULL for permanent passwords)';

-- Create function to check for expired passwords
CREATE OR REPLACE FUNCTION check_password_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- If password has expired, prevent login
  IF NEW.password_expires_at IS NOT NULL AND NEW.password_expires_at < NOW() THEN
    RAISE EXCEPTION 'Password has expired. Please contact an administrator to reset your password.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check password expiration on login attempts
-- Note: This would be called by the authentication logic
CREATE OR REPLACE FUNCTION cleanup_expired_passwords()
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Mark users with expired passwords as requiring reset
  UPDATE site_users
  SET force_password_reset = true
  WHERE password_expires_at IS NOT NULL
    AND password_expires_at < NOW()
    AND force_password_reset = false;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_passwords IS 'Marks users with expired passwords as requiring password reset';
