-- =====================================================
-- Create First Admin User for JALA 2 Development
-- =====================================================
-- Run this in your Development Supabase SQL Editor
-- Project: wjfcqqrlhwdvjmefxky
-- =====================================================

-- 1. Create the admin user in Supabase Auth
-- IMPORTANT: Replace 'YOUR_SECURE_PASSWORD' with your actual password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@jala2.com',  -- Change this email if needed
  crypt('Admin123!', gen_salt('bf')),  -- CHANGE THIS PASSWORD!
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin","name":"Admin User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 2. Verify the user was created
SELECT 
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'name' as name,
  created_at
FROM auth.users
WHERE email = 'admin@jala2.com';

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/sql/new
-- 2. Copy and paste this script
-- 3. Change the password 'Admin123!' to something secure
-- 4. Optionally change the email 'admin@jala2.com'
-- 5. Click "Run" at the bottom right
-- 6. Check the results - you should see your new admin user
-- 7. Go to https://jala2-dev.netlify.app/admin/login
-- 8. Log in with:
--    Email: admin@jala2.com (or whatever you set)
--    Password: Admin123! (or whatever you set)
-- =====================================================

-- =====================================================
-- ALTERNATIVE: Create via Supabase Dashboard UI
-- =====================================================
-- If you prefer not to use SQL:
-- 1. Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/auth/users
-- 2. Click "Add User" → "Create new user"
-- 3. Fill in:
--    - Email: admin@jala2.com
--    - Password: (choose a secure password)
--    - Auto Confirm User: ✅ ENABLE THIS
--    - User Metadata (click "Add metadata"):
--      {
--        "role": "admin",
--        "name": "Admin User"
--      }
-- 4. Click "Create User"
-- =====================================================
