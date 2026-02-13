# 🚀 Deploy Backend to Fix 401/403 Errors

## ⚠️ The Issue

You're seeing `401/403` errors because the backend Edge Function **has not been deployed yet** to your Supabase projects.

## ✅ Solution: Deploy the Backend

Follow these steps to deploy the updated environment-aware backend:

---

## Step 1: Set Production Secret (CRITICAL ⚠️)

Before deploying to production, you **MUST** set this environment variable:

1. Go to: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv
2. Navigate to: **Settings → Edge Functions → Secrets**
3. Click "**Add new secret**"
4. Name: `SUPABASE_SERVICE_ROLE_KEY_PROD`
5. Value: Get your production service role key from **Settings → API** (it's the `service_role` secret key)
6. Click "**Save**"

**Why is this needed?** The backend needs this key to connect to the production Supabase database when `X-Environment-ID: production` is sent.

---

## Step 2: Deploy to Development (wjfcqqrlhwdvjmefxky)

```bash
# From your project root
npx supabase functions deploy make-server-6fcaeea3 \
  --project-ref wjfcqqrlhwdvjmefxky \
  --no-verify-jwt
```

Or manually:
1. Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky
2. Navigate to: **Edge Functions**
3. Click "**Deploy new function**"
4. Upload the entire `/supabase/functions/server/` directory
5. Function name: `make-server-6fcaeea3`
6. Click "**Deploy**"

---

## Step 3: Deploy to Production (lmffeqwhrnbsbhdztwyv)

```bash
# From your project root
npx supabase functions deploy make-server-6fcaeea3 \
  --project-ref lmffeqwhrnbsbhdztwyv \
  --no-verify-jwt
```

Or manually:
1. Go to: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv
2. Navigate to: **Edge Functions**
3. Click "**Deploy new function**"
4. Upload the entire `/supabase/functions/server/` directory
5. Function name: `make-server-6fcaeea3`
6. Click "**Deploy**"

---

## Step 4: Verify Deployment

### Test Development:
```bash
curl -H "X-Environment-ID: development" \
     https://wjfcqqrlhwdvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": "development",
  "database": true,
  "version": "2.0"
}
```

### Test Production:
```bash
curl -H "X-Environment-ID: production" \
     https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": "production",
  "database": true,
  "version": "2.0"
}
```

---

## Step 5: Test in Your App

1. **Reload your frontend** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. The "Backend Connection Status" should show **green** ✅
3. You should be able to login now

---

## 🐛 Troubleshooting

### Still getting 401/403 after deployment?

1. **Check deployment status:**
   - Go to Supabase Dashboard → Edge Functions
   - Make sure `make-server-6fcaeea3` shows as "deployed"
   - Check the logs for any errors

2. **Verify the secret was set:**
   - Go to Settings → Edge Functions → Secrets
   - Confirm `SUPABASE_SERVICE_ROLE_KEY_PROD` exists

3. **Clear browser cache:**
   ```
   Ctrl+Shift+Delete (Windows/Linux)
   Cmd+Shift+Delete (Mac)
   ```
   Select "Cached images and files" and clear

4. **Check console logs:**
   - Open browser DevTools (F12)
   - Look for network errors in the Console tab
   - Check the Network tab for the health check request

### Function exists but returns 500 errors?

This usually means:
- The `SUPABASE_SERVICE_ROLE_KEY_PROD` secret is missing or incorrect
- Check Edge Function logs in Supabase Dashboard for the actual error

### Connection timeout?

- The Edge Function might be cold starting (first request takes longer)
- Wait 10-15 seconds and try again
- Subsequent requests will be much faster

---

## 📦 What Gets Deployed

When you deploy, the following files are uploaded:

```
/supabase/functions/server/
├── index.tsx                    # Main backend file (UPDATED ✅)
├── kv_env.tsx                   # Environment-aware KV store (NEW ✅)
├── kv_store.tsx                 # Original KV store (kept for compatibility)
├── security.tsx                 # Security utilities
├── seed.tsx                     # Database seeding
├── erp_integration.tsx          # ERP integration
└── erp_scheduler.tsx            # ERP scheduler
```

All 48+ endpoints are now environment-aware! 🎉

---

## ✅ Success Checklist

- [ ] Production secret `SUPABASE_SERVICE_ROLE_KEY_PROD` is set
- [ ] Backend deployed to development (wjfcqqrlhwdvjmefxky)
- [ ] Backend deployed to production (lmffeqwhrnbsbhdztwyv)
- [ ] Health check returns 200 OK for development
- [ ] Health check returns 200 OK for production
- [ ] Frontend shows green "Backend is online" status
- [ ] Can login to development environment
- [ ] Can login to production environment (after creating admin)

---

## 🎯 After Deployment

### Create Production Admin User

Once deployed, create your first production admin:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: production" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!",
    "username": "prodadmin"
  }' \
  https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/bootstrap/create-admin
```

Or use the admin signup page in your frontend.

---

## 📞 Need Help?

If you still see 401/403 errors after following these steps:

1. Check the browser console for detailed error messages
2. Check Supabase Edge Function logs
3. Verify the `X-Environment-ID` header is being sent (check Network tab)
4. Make sure you're using the correct Supabase project URL

---

**Once deployed, all 401/403 errors will be resolved! 🚀**
