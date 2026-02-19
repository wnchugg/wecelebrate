-- Fix Function Search Path Security Warnings
-- Sets search_path to prevent schema injection attacks

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. Fix update_site_catalog_assignments_updated_at function
CREATE OR REPLACE FUNCTION public.update_site_catalog_assignments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 3. Fix update_site_price_overrides_updated_at function
CREATE OR REPLACE FUNCTION public.update_site_price_overrides_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 4. Fix cleanup_expired_proxy_sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_proxy_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM proxy_sessions
  WHERE expires_at < NOW();
END;
$$;

-- 5. Fix admin_user_has_permission function
-- Drop and recreate to change parameter names and add search_path
DROP FUNCTION IF EXISTS public.admin_user_has_permission(UUID, TEXT);

CREATE FUNCTION public.admin_user_has_permission(
  p_user_id UUID,
  p_permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_has_permission BOOLEAN;
  v_user_role TEXT;
BEGIN
  -- Check if user is super_admin (has all permissions)
  SELECT role INTO v_user_role
  FROM admin_users
  WHERE id = p_user_id;
  
  IF v_user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has the specific permission
  SELECT EXISTS (
    SELECT 1
    FROM admin_user_permissions aup
    JOIN admin_permissions ap ON aup.permission_id = ap.id
    WHERE aup.user_id = p_user_id
      AND ap.name = p_permission_name
      AND (aup.expires_at IS NULL OR aup.expires_at > NOW())
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$;

-- 6. Fix grant_admin_permission function
-- Drop and recreate to change parameter names and add search_path
DROP FUNCTION IF EXISTS public.grant_admin_permission(UUID, TEXT, UUID, TIMESTAMPTZ);

CREATE FUNCTION public.grant_admin_permission(
  p_user_id UUID,
  p_permission_name TEXT,
  p_granted_by UUID DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_permission_id UUID;
  v_assignment_id UUID;
BEGIN
  -- Get permission ID
  SELECT id INTO v_permission_id
  FROM admin_permissions
  WHERE name = p_permission_name;
  
  IF v_permission_id IS NULL THEN
    RAISE EXCEPTION 'Permission % does not exist', p_permission_name;
  END IF;
  
  -- Check if permission already exists
  SELECT id INTO v_assignment_id
  FROM admin_user_permissions
  WHERE user_id = p_user_id
    AND permission_id = v_permission_id;
  
  IF v_assignment_id IS NOT NULL THEN
    -- Update existing permission
    UPDATE admin_user_permissions
    SET expires_at = p_expires_at,
        granted_by = COALESCE(p_granted_by, granted_by),
        granted_at = NOW()
    WHERE id = v_assignment_id;
    
    RETURN v_assignment_id;
  ELSE
    -- Insert new permission
    INSERT INTO admin_user_permissions (
      user_id,
      permission_id,
      granted_by,
      expires_at
    ) VALUES (
      p_user_id,
      v_permission_id,
      p_granted_by,
      p_expires_at
    )
    RETURNING id INTO v_assignment_id;
    
    RETURN v_assignment_id;
  END IF;
END;
$$;

-- 7. Fix revoke_admin_permission function
-- Drop and recreate to change parameter names and add search_path
DROP FUNCTION IF EXISTS public.revoke_admin_permission(UUID, TEXT);

CREATE FUNCTION public.revoke_admin_permission(
  p_user_id UUID,
  p_permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_permission_id UUID;
  v_deleted_count INTEGER;
BEGIN
  -- Get permission ID
  SELECT id INTO v_permission_id
  FROM admin_permissions
  WHERE name = p_permission_name;
  
  IF v_permission_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Delete permission assignment
  DELETE FROM admin_user_permissions
  WHERE user_id = p_user_id
    AND permission_id = v_permission_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count > 0;
END;
$$;

-- 8. Fix get_admin_user_permissions function
-- Drop and recreate to change parameter names and add search_path
DROP FUNCTION IF EXISTS public.get_admin_user_permissions(UUID);

CREATE FUNCTION public.get_admin_user_permissions(
  p_user_id UUID
)
RETURNS TABLE (
  permission_name TEXT,
  permission_description TEXT,
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  granted_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.name,
    ap.description,
    aup.granted_at,
    aup.expires_at,
    aup.granted_by
  FROM admin_user_permissions aup
  JOIN admin_permissions ap ON aup.permission_id = ap.id
  WHERE aup.user_id = p_user_id
    AND (aup.expires_at IS NULL OR aup.expires_at > NOW())
  ORDER BY ap.name;
END;
$$;

-- 9. Fix cleanup_expired_admin_permissions function
-- Drop and recreate to add search_path
DROP FUNCTION IF EXISTS public.cleanup_expired_admin_permissions();

CREATE FUNCTION public.cleanup_expired_admin_permissions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM admin_user_permissions
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- 10. Fix check_password_expiration function
-- Drop and recreate to add search_path
DROP FUNCTION IF EXISTS public.check_password_expiration();

CREATE FUNCTION public.check_password_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check if password has expired
  IF NEW.password_expires_at IS NOT NULL AND NEW.password_expires_at < NOW() THEN
    NEW.force_password_reset = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 11. Fix cleanup_expired_passwords function
-- Drop and recreate to add search_path
DROP FUNCTION IF EXISTS public.cleanup_expired_passwords();

CREATE FUNCTION public.cleanup_expired_passwords()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  UPDATE site_users
  SET force_password_reset = TRUE
  WHERE password_expires_at IS NOT NULL
    AND password_expires_at < NOW()
    AND force_password_reset = FALSE;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN v_updated_count;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to update updated_at timestamp. Uses fixed search_path for security.';
COMMENT ON FUNCTION public.admin_user_has_permission(UUID, TEXT) IS 'Check if admin user has a specific permission. Uses fixed search_path for security.';
COMMENT ON FUNCTION public.grant_admin_permission(UUID, TEXT, UUID, TIMESTAMPTZ) IS 'Grant permission to admin user. Uses fixed search_path for security.';
COMMENT ON FUNCTION public.revoke_admin_permission(UUID, TEXT) IS 'Revoke permission from admin user. Uses fixed search_path for security.';
COMMENT ON FUNCTION public.get_admin_user_permissions(UUID) IS 'Get all permissions for admin user. Uses fixed search_path for security.';
COMMENT ON FUNCTION public.cleanup_expired_admin_permissions() IS 'Remove expired admin permissions. Uses fixed search_path for security.';
COMMENT ON FUNCTION public.check_password_expiration() IS 'Trigger to check password expiration. Uses fixed search_path for security.';
COMMENT ON FUNCTION public.cleanup_expired_passwords() IS 'Force reset for expired passwords. Uses fixed search_path for security.';
