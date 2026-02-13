# ✅ Deployment Checklist

**Follow this checklist step-by-step for successful deployment**

---

## 📦 PRE-DEPLOYMENT (Do Once)

### ☐ 1. Download Code from Figma Make
- [ ] Click Download/Export in Figma Make
- [ ] Extract .zip file to a folder
- [ ] Open terminal in that folder

### ☐ 2. Install Supabase CLI
```bash
npm install -g supabase
```

Verify:
```bash
supabase --version
# Should show: supabase 1.x.x
```

### ☐ 3. Login to Supabase
```bash
supabase login
```

- [ ] Browser opens
- [ ] Login to your Supabase account
- [ ] Return to terminal
- [ ] See "Logged in" message

### ☐ 4. Set Environment Variables for DEVELOPMENT

Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky

Steps:
1. [ ] Click Settings (bottom left)
2. [ ] Click Edge Functions
3. [ ] Click "Secrets" or "Add secret"
4. [ ] Add each variable below:

**Variables to add:**

- [ ] `SUPABASE_URL` = `https://wjfcqqrlhwdvvjmefxky.supabase.co`

- [ ] `SUPABASE_ANON_KEY` = Get from:
  - Settings → API → Project API keys → anon public

- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Get from:
  - Settings → API → Project API keys → service_role (click "Reveal")

- [ ] `SUPABASE_DB_URL` = Get from:
  - Settings → Database → Connection string → URI
  - Format: `postgresql://postgres:[password]@[host]:6543/postgres`

- [ ] `ALLOWED_ORIGINS` = `*`

- [ ] `SEED_ON_STARTUP` = `false`

**Optional (for multi-environment):**
- [ ] `SUPABASE_SERVICE_ROLE_KEY_PROD` = [Production service role key]

### ☐ 5. Set Environment Variables for PRODUCTION

Go to: https://supabase.com/dashboard/project/lmffeqwhrnbsbhdztwyv

**Repeat step 4 with production values:**

- [ ] `SUPABASE_URL` = `https://lmffeqwhrnbsbhdztwyv.supabase.co`
- [ ] `SUPABASE_ANON_KEY` = [Production anon key]
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = [Production service_role key]
- [ ] `SUPABASE_DB_URL` = [Production DB URI]
- [ ] `ALLOWED_ORIGINS` = `https://yourdomain.com` (or `*` for testing)
- [ ] `SEED_ON_STARTUP` = `false`

**Optional:**
- [ ] `SUPABASE_SERVICE_ROLE_KEY_DEV` = [Development service role key]

### ☐ 6. (Optional) Install Frontend Deployment CLI

**For Netlify:**
```bash
npm install -g netlify-cli
netlify login
```

**For Vercel:**
```bash
npm install -g vercel
vercel login
```

---

## 🚀 DEPLOYMENT (Main Process)

### ☐ 7. Make Script Executable
```bash
chmod +x quick-deploy.sh
```

Verify:
```bash
ls -la quick-deploy.sh
# Should show: -rwxr-xr-x
```

### ☐ 8. Run Deployment Script
```bash
./quick-deploy.sh
```

### ☐ 9. Select Deployment Option
```
What would you like to deploy?

  1) 🚀 Everything (Backend + Frontend)
  2) 🔧 Backend Only (Dev + Prod)
  3) 🎨 Frontend Only
  4) ❌ Cancel

Choice (1-4):
```

- [ ] Type `1` and press Enter

### ☐ 10. Wait for Backend Deployment to Development

You'll see:
```
━━━ Backend Deployment ━━━

ℹ️  Checking Supabase login...
✅ Logged in to Supabase
ℹ️  Deploying to Development...
```

- [ ] Wait for completion (30-60 seconds)
- [ ] Look for: ✅ Development deployment complete!
- [ ] Look for: ✅ Development health check PASSED ✓

**If it fails:**
- Check environment variables are set
- Run: `supabase functions logs server --project-ref wjfcqqrlhwdvvjmefxky`

### ☐ 11. Confirm Production Deployment
```
⚠️  Deploy to PRODUCTION?
Type 'yes' to confirm:
```

- [ ] Type `yes` and press Enter

### ☐ 12. Wait for Backend Deployment to Production

- [ ] Wait for completion (30-60 seconds)
- [ ] Look for: ✅ Production deployment complete!
- [ ] Look for: ✅ Production health check PASSED ✓

**If it fails:**
- Check production environment variables
- Run: `supabase functions logs server --project-ref lmffeqwhrnbsbhdztwyv`

### ☐ 13. Wait for Frontend Build

```
━━━ Frontend Deployment ━━━

ℹ️  Installing dependencies...
ℹ️  Building production bundle...
```

- [ ] Wait for npm install (1-2 minutes)
- [ ] Wait for build (30-60 seconds)
- [ ] Look for: ✅ Frontend built successfully!
- [ ] Look for build size info

**If it fails:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

### ☐ 14. Select Frontend Deployment Platform

```
How would you like to deploy the frontend?

  1) 🌐 Netlify (CLI)
  2) 🌐 Vercel (CLI)
  3) 📦 Manual (just show me the folder)
  4) ⏭️  Skip frontend deployment

Choice (1-4):
```

**Choose one:**
- [ ] Option 1 (Netlify) - Easiest, drag & drop alternative
- [ ] Option 2 (Vercel) - Also easy
- [ ] Option 3 (Manual) - Upload dist/ folder yourself
- [ ] Option 4 (Skip) - Deploy frontend later

### ☐ 15. Complete Frontend Deployment

**If you chose Netlify (Option 1):**
- [ ] Script runs `netlify deploy --prod --dir=dist`
- [ ] If CLI not installed, note the instructions
- [ ] OR use Netlify Drop: https://app.netlify.com/drop
- [ ] Drag the `dist/` folder to Netlify Drop
- [ ] Wait for deployment
- [ ] Copy the deployment URL

**If you chose Vercel (Option 2):**
- [ ] Script runs `vercel --prod`
- [ ] Follow prompts in terminal
- [ ] Wait for deployment
- [ ] Copy the deployment URL

**If you chose Manual (Option 3):**
- [ ] Upload `dist/` folder to your server
- [ ] Configure web server to serve static files
- [ ] Ensure SPA routing (fallback to index.html)

### ☐ 16. Note Your Deployment URLs

**Backend Development:**
```
https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3
```
- [ ] Copy this URL

**Backend Production:**
```
https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3
```
- [ ] Copy this URL

**Frontend:**
```
[Your Netlify/Vercel URL]
```
- [ ] Copy this URL

---

## ✅ VERIFICATION (Critical!)

### ☐ 17. Test Backend Health - Development

```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-07T...",
  "environment": "development",
  "version": "1.0.0"
}
```

- [ ] Response shows "healthy"
- [ ] No errors

### ☐ 18. Test Backend Health - Production

```bash
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-07T...",
  "environment": "production",
  "version": "1.0.0"
}
```

- [ ] Response shows "healthy"
- [ ] No errors

### ☐ 19. Test Backend Database - Development

```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/test-db
```

- [ ] Response shows successful DB connection
- [ ] No errors

### ☐ 20. Test Backend Database - Production

```bash
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/test-db
```

- [ ] Response shows successful DB connection
- [ ] No errors

### ☐ 21. Test Frontend Loading

Open your frontend URL in browser:
```
https://[your-netlify-or-vercel-url].com
```

- [ ] Page loads without errors
- [ ] No white screen
- [ ] JALA 2 logo/branding visible
- [ ] Navigation works

### ☐ 22. Check Browser Console

Press F12 to open Developer Tools

- [ ] No red errors in Console tab
- [ ] No failed network requests in Network tab
- [ ] All API calls return 200 or expected status

### ☐ 23. Test Environment Switcher

In the app:
- [ ] See environment selector in navigation
- [ ] Can switch between "Development" and "Production"
- [ ] Switching environments works (no errors)

### ☐ 24. Test Admin Access

- [ ] Navigate to `/admin` route
- [ ] Redirects to login page (expected, no admin user yet)
- [ ] Login page loads correctly
- [ ] No console errors

### ☐ 25. Create First Admin User

**Option A: Via Bootstrap API**
```bash
curl -X POST https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/bootstrap/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "username": "admin"
  }'
```

- [ ] API returns success
- [ ] User created

**Option B: Via Supabase Dashboard**
1. [ ] Go to Supabase Dashboard → Authentication → Users
2. [ ] Click "Add User"
3. [ ] Set email and password
4. [ ] In User Metadata, add: `{"role": "admin"}`
5. [ ] Save

### ☐ 26. Test Login

In the app:
- [ ] Navigate to login page
- [ ] Enter admin credentials
- [ ] Click login
- [ ] Successfully redirects to admin dashboard
- [ ] No errors

### ☐ 27. Test Client Management

- [ ] Navigate to Clients page
- [ ] Click "Add Client"
- [ ] Fill in client details
- [ ] Save
- [ ] Client appears in list
- [ ] Can edit client
- [ ] Can view client details

### ☐ 28. Test Site Management

- [ ] Navigate to Sites page
- [ ] Click "Add Site"
- [ ] Select client from dropdown
- [ ] Fill in site details
- [ ] Set branding colors
- [ ] Save
- [ ] Site appears in list

### ☐ 29. Test Gift Management

- [ ] Navigate to Gifts page
- [ ] Click "Add Gift"
- [ ] Fill in gift details
- [ ] Save
- [ ] Gift appears in list
- [ ] Can search/filter gifts

### ☐ 30. Test Gift Assignment

- [ ] Navigate to Site Gift Assignment
- [ ] Select a site
- [ ] Choose assignment strategy
- [ ] Select gifts
- [ ] Configure settings
- [ ] Save
- [ ] Preview updates correctly

### ☐ 31. Test Data Persistence

- [ ] Refresh the browser page
- [ ] All created data still there
- [ ] No data loss
- [ ] Login session persists (if configured)

### ☐ 32. Test Environment Separation

**Switch to Development environment:**
- [ ] Click environment switcher
- [ ] Select "Development"
- [ ] Should see different data (or empty if not seeded)

**Switch back to Production:**
- [ ] Click environment switcher
- [ ] Select "Production"
- [ ] See production data again

- [ ] Data doesn't mix between environments

### ☐ 33. Test Mobile Responsiveness

Open app on mobile or resize browser:
- [ ] Layout adapts to small screens
- [ ] All buttons accessible
- [ ] No horizontal scroll
- [ ] Navigation works on mobile

---

## 📊 POST-DEPLOYMENT

### ☐ 34. Monitor Logs (First Hour)

**View backend logs:**
```bash
# Development
supabase functions logs server --project-ref wjfcqqrlhwdvvjmefxky

# Production
supabase functions logs server --project-ref lmffeqwhrnbsbhdztwyv
```

- [ ] Watch for any errors
- [ ] Verify requests are being processed
- [ ] Check response times

### ☐ 35. Set Up Monitoring

- [ ] Bookmark Supabase Dashboard
- [ ] Check Edge Functions usage/stats
- [ ] Set up error notifications (if available)
- [ ] Monitor frontend analytics (Netlify/Vercel)

### ☐ 36. Document Your Deployment

Create a deployment log:
```
JALA 2 Deployment - [DATE]

Backend URLs:
- Dev: https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3
- Prod: https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3

Frontend URL:
- [Your URL]

Admin Credentials:
- Email: [admin email]
- Password: [stored securely]

Deployment Time: [TIME]
Issues Encountered: [None / List issues]
Resolution: [How fixed]
```

- [ ] Save deployment log

### ☐ 37. Share with Team

- [ ] Share frontend URL
- [ ] Share admin credentials (securely)
- [ ] Provide testing instructions
- [ ] Request feedback

### ☐ 38. Plan Next Steps

- [ ] Review Week 1 completion
- [ ] Plan Week 2 features
- [ ] Schedule team review
- [ ] Identify improvements needed

---

## 🎉 SUCCESS CRITERIA

You've successfully deployed when ALL of these are true:

- [x] Backend health checks return "healthy" for both environments
- [x] Frontend loads without errors
- [x] Can login to admin panel
- [x] Can create clients, sites, and gifts
- [x] Data persists after page refresh
- [x] Environment switcher works
- [x] No console errors in browser
- [x] Mobile responsive
- [x] All 5 management systems functional

**All checked?** 🎊 **CONGRATULATIONS! YOU'RE LIVE!** 🎊

---

## 🐛 Troubleshooting Reference

### Backend deployment fails
```bash
# Check logs
supabase functions logs server

# Verify environment variables
# Go to Supabase Dashboard → Settings → Edge Functions → Secrets

# Redeploy
supabase functions deploy server
```

### Health check fails
- Verify environment variables are set
- Check logs for error details
- Ensure service role key is correct
- Wait 30 seconds and try again

### Frontend build fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Frontend shows white screen
- Check browser console for errors
- Verify API endpoints are accessible
- Check CORS configuration
- Clear browser cache

### Login doesn't work
- Verify admin user created
- Check credentials
- View browser network tab for API errors
- Check backend logs

### Data doesn't persist
- Verify backend is connected to correct DB
- Check SUPABASE_DB_URL is correct
- Ensure service role key has permissions
- Check backend logs for DB errors

---

**Estimated Total Time:** 30-45 minutes (including verification)

**Good luck with your deployment!** 🚀
