# 🚀 QUICK START - Fix 401/403 Errors

## The Problem
You're seeing **401/403 errors** because the backend Edge Function hasn't been deployed to Supabase yet.

## The Solution (3 Steps, 15 minutes)

### ⚡ Step 1: Set Production Secret (5 min)
1. Open: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv
2. Go to: **Settings → Edge Functions → Secrets**
3. Add new secret:
   - Name: `SUPABASE_SERVICE_ROLE_KEY_PROD`
   - Value: Copy from **Settings → API** (service_role key)
4. Save

### ⚡ Step 2: Deploy Backend (5 min)

Run this in your terminal:
```bash
chmod +x deploy-backend.sh
./deploy-backend.sh
```

Or manually:
```bash
# Development
npx supabase functions deploy make-server-6fcaeea3 --project-ref wjfcqqrlhwdvjmefxky --no-verify-jwt

# Production
npx supabase functions deploy make-server-6fcaeea3 --project-ref lmffeqwhrnbsbhdztwyv --no-verify-jwt
```

### ⚡ Step 3: Test (2 min)

1. **Hard refresh** your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Look for **green "Backend is online"** message ✅
3. Try logging in - it should work!

---

## ✅ Success Indicators

- ✅ Backend shows "online" in green
- ✅ No more 401/403 errors
- ✅ Login works
- ✅ API calls succeed

---

## 🆘 Troubleshooting

**Still getting errors?**
1. Wait 30 seconds (Edge Function needs to start)
2. Hard refresh browser
3. Check Supabase Dashboard → Edge Functions
4. Read `/FIX_SUMMARY.md` for detailed help

---

## 📚 More Info

- **Full Guide**: `/DEPLOY_BACKEND.md`
- **What Changed**: `/FIX_SUMMARY.md`
- **Technical Docs**: `/supabase/functions/server/MIGRATION_COMPLETE.md`

---

**That's it! After deployment, everything will work! 🎉**
