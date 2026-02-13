# Backend Connection Error Fix Guide

## Error: "TypeError: Failed to fetch"

This error indicates that the Supabase Edge Function backend is **not deployed** or **not responding**.

---

## 🎯 Quick Fix (Recommended)

### Step 1: Verify Your Supabase Project ID

**Development Environment:**
- Project ID: `wjfcqqrlhwdvjmefxky`
- Dashboard: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky

**Production Environment:**
- Project ID: `lmffeqwhrnbsbhdztwyv`
- Dashboard: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv

### Step 2: Deploy the Backend Function

#### Option A: Deploy via Supabase CLI (Recommended)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   # For Development
   supabase link --project-ref wjfcqqrlhwdvjmefxky
   
   # OR for Production
   supabase link --project-ref lmffeqwhrnbsbhdztwyv
   ```

4. **Deploy the Edge Function:**
   ```bash
   supabase functions deploy make-server-6fcaeea3
   ```

5. **Verify deployment:**
   ```bash
   # Test the health endpoint
   curl https://wjfcqqrlhwdvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
   ```

#### Option B: Deploy via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvjmefxky/functions
2. Click "New Edge Function"
3. Name: `make-server-6fcaeea3`
4. Copy the contents of `/supabase/functions/server/index.tsx` and all related files
5. Deploy

---

## 🔍 Troubleshooting

### Error: "Failed to fetch" Persists After Deployment

**Check 1: CORS Configuration**

The backend should already have CORS enabled. Verify in `/supabase/functions/server/index.tsx`:

```typescript
app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (allowedOrigins.includes('*')) {
        return origin || '*';
      }
      // ... rest of CORS logic
    },
    allowHeaders: ["Content-Type", "Authorization", "X-Access-Token", "X-CSRF-Token", "X-Environment-ID"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
  }),
);
```

**Check 2: Environment Variables**

Make sure these are set in Supabase Dashboard → Settings → Edge Functions:

Required:
- `SUPABASE_URL` (auto-set by Supabase)
- `SUPABASE_ANON_KEY` (auto-set by Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` (auto-set by Supabase)
- `SUPABASE_DB_URL` (auto-set by Supabase)
- `ALLOWED_ORIGINS` (set to `*` for testing, or your Netlify URL)

Optional:
- `SEED_ON_STARTUP=false` (set to `true` only for initial setup)
- `DENO_ENV=development` (or `production`)

**Check 3: Test the Health Endpoint Directly**

```bash
# Development
curl https://wjfcqqrlhwdvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

# Production
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "timestamp": "2026-02-08T...",
  "environment": "development",
  "database": true,
  "responseTime": 123,
  "version": "2.0"
}
```

**Check 4: View Edge Function Logs**

1. Go to Supabase Dashboard → Edge Functions → `make-server-6fcaeea3`
2. Click "Logs" tab
3. Look for errors or deployment issues

---

## 🚀 After Deployment

### 1. Verify Connection in Frontend

Refresh the admin page and check the "Backend Connection Status" card. It should show:
- ✅ Green checkmark
- "Backend connection successful!"
- Response details showing database status

### 2. Set ALLOWED_ORIGINS

For production, update the `ALLOWED_ORIGINS` environment variable:

```bash
# In Supabase Dashboard → Settings → Edge Functions
ALLOWED_ORIGINS=https://jala2-dev.netlify.app,http://localhost:5173
```

### 3. Run Initial Database Seed

**Option 1: Via Admin UI**
1. Go to `/admin/initial-seed`
2. Click "Initialize Database"

**Option 2: Via API**
```bash
curl -X POST https://wjfcqqrlhwdvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/dev/reseed \
  -H "Content-Type: application/json"
```

---

## 📚 Common Issues

### Issue 1: "Function not found"

**Symptom:** 404 error when calling the endpoint

**Solution:**
- Verify function name is exactly `make-server-6fcaeea3`
- Check deployment was successful
- Wait 30-60 seconds after deployment

### Issue 2: "Invalid JWT" or "Unauthorized"

**Symptom:** Works on health check, fails on protected routes

**Solution:**
- Make sure you're passing the access token in `X-Access-Token` header
- Verify the token is from the correct Supabase project
- Check the `X-Environment-ID` header matches your project

### Issue 3: "Database connection failed"

**Symptom:** Health check shows `database: false`

**Solution:**
- Check `SUPABASE_DB_URL` environment variable is set
- Verify database is not paused (free tier auto-pauses)
- Check database connection limits

### Issue 4: CORS errors in browser console

**Symptom:** "blocked by CORS policy"

**Solution:**
1. Update `ALLOWED_ORIGINS` environment variable
2. Make sure your Netlify URL is included
3. Redeploy the Edge Function after changing env vars

---

## 🆘 Still Not Working?

### Debug Checklist:

- [ ] Supabase CLI is installed and logged in
- [ ] Project is linked to correct Supabase project
- [ ] Edge Function is deployed (`supabase functions list` shows it)
- [ ] Health endpoint returns 200 OK
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Browser console shows the exact error
- [ ] Edge Function logs show the request

### Get Help:

1. **Check Edge Function Logs:**
   - Dashboard → Edge Functions → make-server-6fcaeea3 → Logs

2. **Test with curl:**
   ```bash
   curl -v https://wjfcqqrlhwdvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
   ```

3. **Check browser console:**
   - Press F12
   - Go to Network tab
   - Look for failed requests
   - Check response headers

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Health check returns 200 OK with JSON response
2. ✅ Backend Connection Diagnostic shows green checkmark
3. ✅ No CORS errors in browser console
4. ✅ Admin login page loads without errors
5. ✅ Edge Function logs show successful requests

---

**Last Updated:** February 8, 2026  
**Environment:** Development (wjfcqqrlhwdvjmefxky)  
**Backend Version:** 2.0
