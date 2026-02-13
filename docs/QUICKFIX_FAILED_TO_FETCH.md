# ⚡ Quick Fix: "Failed to Fetch" Error

## 🎯 The Issue
You're seeing: **`[Connection Check] Error: TypeError: Failed to fetch`**

## ✅ The Solution (3 Steps)

### Step 1: Deploy the Backend
Open Terminal and run:
```bash
cd /path/to/JALA2
./scripts/deploy-to-environment.sh dev
```

**What this does:**
- Deploys Edge Function to Supabase
- Sets up environment secrets
- Tests the connection

### Step 2: Add Credentials in Admin UI
1. Go to `/admin/environment-config`
2. Click "Edit" on Development environment
3. Enter:
   - **Supabase URL**: `https://[your-project-id].supabase.co`
   - **Anon Key**: Your anon public key
4. Click "Save"

### Step 3: Test Connection
1. Click "Test Connection" button
2. Should see: **"Development environment is online! ✓"**

---

## 🚨 If You're Still Getting the Error

### The error means ONE of these:

1. **Edge Function NOT deployed** ⬅️ Most common
   - Fix: Run `./scripts/deploy-to-environment.sh dev`

2. **Wrong Supabase URL**
   - Must be: `https://[project-id].supabase.co`
   - No trailing slash!

3. **Wrong Anon Key**
   - Use the "anon public" key, NOT service_role key
   - Find it: Supabase Dashboard → Settings → API

4. **Haven't created Supabase project yet**
   - Go to: https://supabase.com/dashboard
   - Click "New Project"
   - Name it "JALA2-Development"

---

## 📱 Where to Find Your Credentials

### Supabase URL:
```
Supabase Dashboard → Settings → API → Configuration → Project URL
```
Should look like: `https://abc123xyz.supabase.co`

### Anon Key:
```
Supabase Dashboard → Settings → API → Project API keys → anon public
```
Should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🔍 How to Verify It's Fixed

### In Terminal:
```bash
# Should show: {"status":"ok"}
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### In Browser:
1. Check browser console (F12)
2. Look for:
   ```
   [Connection Check] Response status: 200
   [Connection Check] Response data: {status: "ok"}
   ```

### In Admin UI:
- See green badge: **"Active"**
- See toast: **"Development environment is online!"**

---

## 🎓 Understanding the Error

```
Failed to fetch = Cannot connect to backend

Why?
└─> Edge Function not deployed
    └─> No server to connect to
        └─> Connection fails
```

**The fix:**
Deploy Edge Function → Server runs → Connection works ✅

---

##  💡 Pro Tips

1. **Always deploy BEFORE testing**
   - Deploy first: `./scripts/deploy-to-environment.sh dev`
   - Then test in Admin UI

2. **Check the deployment script output**
   - Should end with: "Health check passed! Backend is online ✓"
   - If not, read the error messages

3. **Use the Setup Wizard**
   - Shows step-by-step process
   - Built into `/admin/environment-config`

4. **Watch for typos**
   - URL must be exact: `https://[id].supabase.co`
   - No spaces, no trailing slashes

---

## 📚 Related Guides

- **Full Guide**: [FAILED_TO_FETCH_TROUBLESHOOTING.md](/docs/FAILED_TO_FETCH_TROUBLESHOOTING.md)
- **Deployment**: [OPTION_B_START_HERE.md](/docs/OPTION_B_START_HERE.md)
- **Diagrams**: [CONNECTION_FLOW_DIAGRAM.md](/docs/CONNECTION_FLOW_DIAGRAM.md)

---

## 🆘 Still Stuck?

### Check these in order:

1. ☐ Supabase CLI installed? → `supabase --version`
2. ☐ Logged in? → `supabase login`
3. ☐ Created project? → Check Supabase Dashboard
4. ☐ Ran deployment script? → `./scripts/deploy-to-environment.sh dev`
5. ☐ Script succeeded? → Should see "Backend is online ✓"
6. ☐ Added credentials in UI? → Check `/admin/environment-config`
7. ☐ Correct URL format? → `https://[id].supabase.co` (no trailing slash)
8. ☐ Using anon key? → NOT service_role key

If ALL checkboxes are checked and it still doesn't work:
- Check Supabase Dashboard → Edge Functions → Logs
- Check browser console (F12) for detailed errors
- Review the full troubleshooting guide

---

**Last Updated:** 2026-02-06  
**Quick Link:** `/docs/QUICKFIX_FAILED_TO_FETCH.md`
