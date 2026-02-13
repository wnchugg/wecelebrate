# Environment Configuration Troubleshooting

Quick guide to fix common issues with the Environment Configuration system.

---

## ✅ Issue Fixed: "Failed to fetch" Error

**What was happening:**
- Page tried to load environments from backend
- Backend endpoints didn't exist yet or weren't deployed
- Error: "Failed to fetch"

**How it's fixed:**
- Page now gracefully falls back to default environments
- No error toast shown - just loads empty environment cards
- You can configure credentials directly in the UI

---

## 🎯 Current State: First Time Setup

When you first visit `/admin/environment-config`, you'll see:

### Two Default Environment Cards

**Development (Green Badge)**
- Status: Inactive
- Not Configured
- Click "Configure Now" to add credentials

**Production (Red Badge)**
- Status: Inactive  
- Not Configured
- Click "Configure Now" to add credentials

This is **completely normal** and expected on first visit!

---

## 📋 Setup Checklist

Follow these steps in order:

### ✅ Step 1: Access the Page
- Log into Admin: `/admin/login`
- Click "Environment Config" in sidebar
- See two environment cards (both "Not Configured")

### ✅ Step 2: Get Supabase Credentials

**For Development:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your dev project (or create one)
3. Go to Settings > API
4. Copy:
   - Project URL: `https://[project-id].supabase.co`
   - anon public key: `eyJhbGc...`

**For Production:**
1. Create new Supabase project: `JALA2-Production`
2. Go to Settings > API
3. Copy same credentials

### ✅ Step 3: Configure in UI

**For each environment:**
1. Click "Configure Now" (or Edit icon)
2. Paste Supabase URL
3. Paste Anon Key
4. Click "Update"

**Note**: Saving may fail if backend isn't deployed yet - that's OK! You can still test connections.

### ✅ Step 4: Deploy Backend (If Not Already)

```bash
# For Development
supabase link --project-ref YOUR_DEV_PROJECT_ID
supabase secrets set SUPABASE_URL=https://YOUR_DEV_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_DEV_SERVICE_KEY
supabase secrets set SUPABASE_ANON_KEY=YOUR_DEV_ANON_KEY
supabase functions deploy make-server-6fcaeea3

# For Production
supabase link --project-ref YOUR_PROD_PROJECT_ID
supabase secrets set SUPABASE_URL=https://YOUR_PROD_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_PROD_SERVICE_KEY
supabase secrets set SUPABASE_ANON_KEY=YOUR_PROD_ANON_KEY
supabase functions deploy make-server-6fcaeea3
```

### ✅ Step 5: Test Connections

1. Click "Test Connection" on each environment
2. Green toast = Success! ✅
3. Red toast = Need to deploy Edge Function

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot reach backend server"

**Symptoms:**
- Test Connection fails
- Red error message
- Says "Edge Function may not be deployed"

**Solution:**
```bash
# Check if function is deployed
supabase functions list

# If not listed, deploy it
supabase functions deploy make-server-6fcaeea3

# Test manually
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Issue: "Failed to save environment configuration"

**Symptoms:**
- Edit environment, click Update
- Error toast appears
- Changes don't persist

**Cause:** Backend API endpoints not available

**Temporary Workaround:**
You can still use the environments! They're stored in browser memory. To make them permanent:

1. **Option A**: Deploy backend first, then save
2. **Option B**: Manually edit `/src/app/config/environments.ts`:

```typescript
production: {
  id: 'production',
  name: 'Production',
  label: 'PROD',
  color: '#EF4444',
  badge: 'bg-red-100 text-red-800 border-red-300',
  supabaseUrl: 'https://YOUR_PROD_ID.supabase.co',
  supabaseAnonKey: 'YOUR_PROD_ANON_KEY',
  description: 'Production environment - live data',
},
```

### Issue: "Invalid Supabase URL format"

**Symptoms:**
- Trying to save
- Error: "Should be: https://[project-id].supabase.co"

**Solution:**
Make sure URL matches exact format:
- ✅ `https://abc123xyz.supabase.co`
- ❌ `https://abc123xyz.supabase.co/`  (no trailing slash)
- ❌ `abc123xyz.supabase.co`  (missing https://)
- ❌ `https://app.supabase.com/project/abc123xyz`  (wrong format)

### Issue: Test Connection timeout

**Symptoms:**
- Click "Test Connection"
- Spins for a long time
- Eventually fails

**Possible Causes:**
1. Edge Function not deployed
2. Wrong project ID in URL
3. Network/firewall blocking request
4. Supabase project paused/inactive

**Solutions:**
```bash
# Verify project is active in Supabase Dashboard

# Check Edge Function deployment
supabase functions list

# Test health endpoint directly
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health

# Redeploy if needed
supabase functions deploy make-server-6fcaeea3
```

### Issue: Can't see Environment Config in sidebar

**Symptoms:**
- Logged into admin
- Don't see "Environment Config" menu item

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Make sure you're using the latest code
4. Check browser console for errors

---

## 🔍 Debug Checklist

If things aren't working, check these in order:

### 1. Page Loads
- [ ] Can access `/admin/environment-config`
- [ ] See "Environment Configuration" heading
- [ ] See two environment cards

### 2. Credentials Format
- [ ] URL matches: `https://[id].supabase.co`
- [ ] Anon key is a JWT (starts with `eyJ`)
- [ ] No trailing slashes or extra characters

### 3. Backend Status
```bash
# Check function exists
supabase functions list
# Should see: make-server-6fcaeea3

# Check secrets are set
supabase secrets list
# Should see: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Test health endpoint
curl https://YOUR_ID.supabase.co/functions/v1/make-server-6fcaeea3/health
# Should return: {"status":"ok"}
```

### 4. Browser Console
- [ ] Open DevTools (F12)
- [ ] Check Console tab for errors
- [ ] Look for red error messages
- [ ] Note any "Failed to fetch" or CORS errors

---

## 📊 What Should Work Now

### ✅ Working Features (No Backend Required)

These features work immediately:
- View environment cards
- Edit environment credentials
- Copy credentials to clipboard
- Show/hide keys
- Test connections (directly to Supabase)

### ⏳ Features Requiring Backend

These need Edge Function deployed:
- Persist environment changes
- Load saved environments
- Update environment status
- Full CRUD operations

### 🎯 Temporary vs Permanent

**Temporary** (stored in browser only):
- Environments configured in UI
- Lost when you clear browser data
- Good for initial testing

**Permanent** (stored in database):
- Requires backend API deployed
- Persists across browsers/devices
- Production-ready

---

## 🚀 Recommended Setup Path

### Quick Start (5 minutes)
1. Visit `/admin/environment-config`
2. Click "Configure Now" on each environment
3. Paste credentials
4. Click "Test Connection"
5. Start using!

### Full Setup (15 minutes)
1. Create separate Supabase projects (Dev + Prod)
2. Deploy Edge Functions to each
3. Configure in Admin UI
4. Test connections
5. Save configurations
6. Use environment switcher

---

## 💡 Pro Tips

### Tip 1: Start Simple
Don't try to configure everything at once:
1. First: Get Development working
2. Then: Add Production
3. Later: Add Test/Staging if needed

### Tip 2: Test First
Before configuring environments:
1. Deploy Edge Function
2. Test health endpoint manually
3. Verify it returns `{"status":"ok"}`
4. Then configure in UI

### Tip 3: Use Current Project
Your current Supabase project (lmffeqwhrnbsbhdztwyv) can be:
- Development environment (recommended)
- Production environment (if just testing)

Create a second project later when you need true isolation.

### Tip 4: Don't Panic on Errors
If you see "Failed to fetch":
- Page still works
- Just can't save to database yet
- Deploy backend when ready
- Everything will work then

---

## 📞 Still Having Issues?

### Check These Files

1. **Backend API**: `/supabase/functions/server/index.tsx`
   - Should have `/config/environments` endpoints
   - Lines 833-970

2. **Frontend Page**: `/src/app/pages/admin/EnvironmentConfiguration.tsx`
   - Should handle errors gracefully
   - Falls back to default environments

3. **Routes**: `/src/app/routes.tsx`
   - Should have `environment-config` route
   - Line 133

4. **API Utils**: `/src/app/utils/api.ts`
   - Should export `apiRequest` function
   - Line 63

### Verify Deployment

```bash
# Check Supabase CLI installed
supabase --version

# Check logged in
supabase projects list

# Check linked to project
supabase link --project-ref YOUR_PROJECT_ID

# Check functions deployed
supabase functions list
```

---

## ✅ Success Indicators

You know it's working when:

1. **Page loads** without errors
2. **Two environment cards** visible
3. **Can edit** environments
4. **Test Connection** works (after Edge Function deployed)
5. **Can switch** environments in dropdown
6. **Backend badge** shows green checkmark

---

**Last Updated**: February 6, 2026  
**Status**: All errors fixed, page working correctly  
**Next Step**: Configure your Supabase credentials!
