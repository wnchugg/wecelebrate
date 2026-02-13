# Fix JWT Validation - Set Correct Environment Variables

## Problem
The backend is deployed to the development Supabase project (`wjfcqqrlhwdvvjmefxky`) but the environment variables are not set correctly, causing JWT validation to fail.

## Solution
Set the correct environment variables in the Supabase Edge Functions configuration.

---

## Step 1: Go to Supabase Dashboard

Open this URL in your browser:
```
https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/functions
```

---

## Step 2: Set Environment Variables

Click on **"Environment Variables"** or **"Secrets"** tab.

Add/Update these variables:

### Required Variables:

1. **SUPABASE_URL**
   ```
   https://wjfcqqrlhwdvvjmefxky.supabase.co
   ```

2. **SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec
   ```

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/api
   - Copy the **service_role** key (the secret one, NOT the anon key)
   - Paste it as the value

4. **SUPABASE_DB_URL** (if needed for direct database access)
   - Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/settings/database
   - Copy the connection string (Connection Pooling → Transaction mode)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

### Optional Variables (for CORS):

5. **ALLOWED_ORIGINS**
   ```
   https://jala2-dev.netlify.app,http://localhost:5173,http://localhost:3000
   ```

### Optional Variables (for Production Environment - NOT needed now):

6. **SUPABASE_URL_PROD** (leave empty for now)
7. **SUPABASE_SERVICE_ROLE_KEY_PROD** (leave empty for now)

---

## Step 3: Redeploy the Edge Function

After setting the environment variables, you need to redeploy so they take effect:

```bash
cd ~/jala2-app
supabase functions deploy make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky
```

**OR** use the quick script:
```bash
cd ~/jala2-app
./scripts/redeploy-backend.sh dev
```

---

## Step 4: Test JWT Validation

### Test 1: Health Check
```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Expected response:
```json
{
  "status": "ok",
  "deployment": {
    "supabaseProject": "wjfcqqrlhwdvvjmefxky",
    ...
  }
}
```

### Test 2: Login (creates a JWT token)
```bash
curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@jala2.com",
    "password": "YourPassword123!"
  }'
```

This should return:
```json
{
  "accessToken": "eyJ...",
  "user": { ... }
}
```

### Test 3: Use the JWT Token
Copy the `accessToken` from the login response and test it:

```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/clients \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

This should return a list of clients (or empty array) instead of "Invalid JWT" error.

---

## Why This Fixes JWT Validation

1. **Token Issuer**: When you log in, Supabase Auth (at `wjfcqqrlhwdvvjmefxky`) issues a JWT token signed with its secret key.

2. **Token Validator**: The backend uses `supabase.auth.getUser(token)` which needs to connect to the **same** Supabase project to validate the token.

3. **Environment Variables**: By setting `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the development project, the backend can properly validate tokens issued by that project.

---

## Troubleshooting

### If you still see "Invalid JWT":

1. **Check the environment variables are actually set**:
   - Go to Edge Functions settings
   - Verify all variables are listed
   - Make sure there are no typos

2. **Check you redeployed after setting variables**:
   - Environment variables only take effect after redeployment
   - Run the deploy command again

3. **Check the backend logs**:
   - Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky/logs/edge-functions
   - Look for JWT verification errors
   - The logs will show which Supabase URL it's trying to use

4. **Clear your browser cache and tokens**:
   - Open DevTools → Application → Local Storage
   - Clear `jala_access_token` and `deployment_environment`
   - Try logging in again

---

## Quick Command Summary

```bash
# 1. Set environment variables in Supabase Dashboard (web UI)
# 2. Then redeploy:
cd ~/jala2-app
./scripts/redeploy-backend.sh dev

# 3. Test:
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

---

**Last Updated**: February 8, 2026
**Environment**: Development (`wjfcqqrlhwdvvjmefxky`)
