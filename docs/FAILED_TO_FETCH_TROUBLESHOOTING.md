# Troubleshooting "Failed to Fetch" Errors

## 🔍 What This Error Means

The "Failed to fetch" error occurs when the frontend application cannot connect to the Supabase Edge Function backend. This is typically because:

1. **The Edge Function hasn't been deployed yet** ⬅️ Most common
2. **Incorrect Supabase credentials**
3. **CORS configuration issues**
4. **Network connectivity problems**

---

## ✅ Quick Fix Checklist

Follow these steps in order:

### Step 1: Deploy the Edge Function

The most common cause is that the backend hasn't been deployed yet.

```bash
# Navigate to your project directory
cd /path/to/JALA2

# Run the deployment script
./scripts/deploy-to-environment.sh dev
```

**What this does:**
- Links to your Supabase project
- Sets environment secrets
- Deploys the Edge Function
- Tests the health endpoint

### Step 2: Verify Credentials in Admin UI

After deployment:

1. Go to `/admin/environment-config`
2. Click **Edit** on the Development environment
3. Enter your credentials:
   - **Supabase URL**: `https://[your-project-id].supabase.co`
   - **Anon Key**: Your anon/public key from Supabase Dashboard
4. Click **Save**
5. Click **Test Connection**

### Step 3: Check Supabase Dashboard

Verify the Edge Function is deployed:

1. Go to Supabase Dashboard → **Edge Functions**
2. You should see: `make-server-6fcaeea3`
3. Status should be: **Active** (green)

---

## 🔧 Common Issues and Solutions

### Issue 1: "Edge Function not found" (404 Error)

**Cause:** The Edge Function hasn't been deployed to this Supabase project.

**Solution:**
```bash
# Deploy to Development
./scripts/deploy-to-environment.sh dev

# OR deploy to Production
./scripts/deploy-to-environment.sh prod
```

### Issue 2: "Authentication failed" (401/403 Error)

**Cause:** The Anon Key is incorrect or expired.

**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the **anon public** key (NOT the service_role key)
3. Update it in `/admin/environment-config`
4. Test connection again

### Issue 3: "Connection timeout"

**Cause:** The Edge Function is taking too long to respond or isn't running.

**Solution:**
1. Check Edge Function logs in Supabase Dashboard
2. Verify the function is deployed:
   ```bash
   supabase functions list
   ```
3. Redeploy if needed:
   ```bash
   ./scripts/deploy-to-environment.sh dev
   ```

### Issue 4: CORS Error

**Cause:** The backend isn't allowing requests from your domain.

**Solution:**
```bash
# Set ALLOWED_ORIGINS to allow all origins (development only)
supabase secrets set ALLOWED_ORIGINS="*"

# For production, use your actual domain:
supabase secrets set ALLOWED_ORIGINS="https://yourdomain.com"
```

### Issue 5: "Invalid Supabase URL format"

**Cause:** The URL is malformed or missing.

**Solution:**
The URL must be in this exact format:
```
https://[your-project-id].supabase.co
```

**Example:**
- ✅ Correct: `https://abc123xyz.supabase.co`
- ❌ Wrong: `abc123xyz.supabase.co` (missing https://)
- ❌ Wrong: `https://abc123xyz.supabase.co/` (trailing slash)
- ❌ Wrong: `https://supabase.co` (missing project ID)

---

## 🛠️ Advanced Troubleshooting

### Check Health Endpoint Manually

Test the backend directly with curl:

```bash
# Replace with your actual values
PROJECT_ID="your-project-id"
ANON_KEY="your-anon-key"

# Test health endpoint
curl "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-6fcaeea3/health" \
  -H "Authorization: Bearer ${ANON_KEY}"

# Expected response:
# {"status":"ok"}
```

### View Edge Function Logs

1. Go to Supabase Dashboard
2. Click **Edge Functions** → `make-server-6fcaeea3`
3. Click **Logs** tab
4. Look for error messages

Common log errors:
- `Function not found` → Need to deploy
- `Invalid JWT` → Wrong Anon Key
- `CORS error` → Need to set ALLOWED_ORIGINS

### Verify Environment Secrets

Check that all required secrets are set:

```bash
supabase secrets list

# You should see:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - ALLOWED_ORIGINS
```

If any are missing:
```bash
supabase secrets set SUPABASE_URL="https://your-project-id.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="your-anon-key"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set ALLOWED_ORIGINS="*"
```

### Check Browser Console

Open browser DevTools (F12) and check the Console tab:

**What to look for:**
- `[Connection Check] Testing: https://...` - Shows the URL being tested
- `[Connection Check] Response status: 200` - Success!
- `[Connection Check] Error: Failed to fetch` - Connection problem
- `[Connection Check] Response status: 404` - Function not deployed
- `[Connection Check] Response status: 401` - Auth problem

---

## 📋 Step-by-Step Verification

Use this checklist to verify everything is working:

- [ ] **Supabase Project Created**
  - Development project exists
  - Production project exists (separate from dev)
  
- [ ] **Supabase CLI Installed and Logged In**
  ```bash
  supabase --version
  supabase login
  ```

- [ ] **Edge Function Deployed**
  ```bash
  ./scripts/deploy-to-environment.sh dev
  ```
  
- [ ] **Deployment Health Check Passed**
  - Script shows: "Health check passed! Backend is online ✓"
  
- [ ] **Credentials Added to Admin UI**
  - Go to `/admin/environment-config`
  - Edit Development environment
  - Add Supabase URL and Anon Key
  - Save changes
  
- [ ] **Connection Test Passed**
  - Click "Test Connection" button
  - See: "Development environment is online!" toast

---

## 🆘 Still Having Issues?

### Quick Diagnostics

Run this command to check everything:

```bash
# Check if Supabase CLI is installed
supabase --version

# Check if linked to a project
supabase projects list

# Check Edge Functions
supabase functions list

# Check secrets (won't show values, just names)
supabase secrets list

# Test health endpoint directly
curl "https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Check These Common Mistakes

1. **Using Service Role Key instead of Anon Key**
   - The frontend should use the **anon public** key
   - The service_role key is only for the backend

2. **Wrong Project ID in URL**
   - Make sure the project ID in the URL matches your Supabase project

3. **Edge Function Name Mismatch**
   - The function name must be exactly: `make-server-6fcaeea3`

4. **Not Waiting After Deployment**
   - After deploying, wait 10-20 seconds for the function to be ready

5. **Browser Cache**
   - Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## 📞 Getting Help

If you're still stuck:

1. **Check the deployment logs:**
   - Look at the output from `deploy-to-environment.sh`
   - Check Supabase Dashboard → Edge Functions → Logs

2. **Verify you completed all steps:**
   - Review `/docs/OPTION_B_START_HERE.md`
   - Make sure you didn't skip any steps

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for detailed error messages

4. **Try redeploying:**
   ```bash
   # Unlink and redeploy
   supabase unlink
   ./scripts/deploy-to-environment.sh dev
   ```

---

## ✨ Success Indicators

You know everything is working when:

1. ✅ Deployment script shows: "Health check passed! Backend is online ✓"
2. ✅ Supabase Dashboard shows: Edge Function status is "Active"
3. ✅ Admin UI shows: "Development environment is online!" after testing
4. ✅ No error banners on `/admin/environment-config` page
5. ✅ Backend Connection Status component doesn't show errors

---

## 🎉 Next Steps

Once the connection is working:

1. Create an admin user:
   ```bash
   ./scripts/create-admin-user.sh
   ```

2. Deploy to Production:
   ```bash
   ./scripts/deploy-to-environment.sh prod
   ```

3. Test both environments in Admin UI

4. Start using the application!

---

**Last Updated:** 2026-02-06  
**Related Guides:**
- [Deployment Quick Start](/docs/OPTION_B_START_HERE.md)
- [Creating Admin Users](/docs/CREATE_ADMIN_USER_GUIDE.md)
- [Environment Configuration](/docs/ENVIRONMENT_CONFIGURATION_GUIDE.md)
