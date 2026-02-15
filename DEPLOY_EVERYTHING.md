# Complete Deployment Guide - Frontend & Backend

**Date:** February 15, 2026  
**Purpose:** Deploy all code changes for end-to-end testing

---

## Overview

This guide will deploy:
1. ✅ Backend (Edge Functions) - Already deployed with Ed25519 security fix
2. 🔄 Frontend (React App) - Ready to deploy to Netlify

---

## Prerequisites

### Backend (Already Complete)
- ✅ Ed25519 keys configured in Supabase
- ✅ Backend deployed to development
- ✅ Security vulnerability closed
- ✅ Health check passing

### Frontend (To Deploy)
- [ ] Netlify account connected
- [ ] Environment variables configured
- [ ] Build passing locally

---

## Step 1: Backend Deployment (Already Done)

The backend is already deployed with the latest security fixes:

```bash
# Already deployed - no action needed
# Backend URL: https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3
```

**Verification:**
```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "environment": "development",
  "version": "2.2"
}
```

---

## Step 2: Frontend Environment Variables

### Required Environment Variables

Create/update `.env` file in project root:

```bash
# Supabase Configuration (Development)
VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Backend API URL
VITE_API_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3

# Environment
VITE_APP_ENV=development
```

### Get Your Anon Key

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky
2. Navigate to: Settings → API
3. Copy the `anon` `public` key
4. Paste it in the `.env` file

---

## Step 3: Local Build Test

Before deploying, verify the build works locally:

```bash
# Install dependencies (if needed)
npm install

# Run type check
npm run type-check

# Build the frontend
npm run build

# Preview the build locally
npm run preview
```

**Expected Output:**
```
✓ built in 15s
dist/index.html                   0.50 kB │ gzip:  0.32 kB
dist/assets/index-abc123.css     45.23 kB │ gzip: 12.45 kB
dist/assets/index-xyz789.js     234.56 kB │ gzip: 78.90 kB
```

**Test the preview:**
1. Open http://localhost:4173
2. Navigate to /admin/login
3. Try logging in with: admin@example.com / Admin123!
4. Verify dashboard loads

---

## Step 4: Deploy to Netlify

### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your Netlify site (first time only)
netlify link

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://wjfcqqrlhwdvvjmefxky.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "<your-anon-key>"
netlify env:set VITE_API_URL "https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3"
netlify env:set VITE_APP_ENV "development"

# Deploy
netlify deploy --prod
```

### Option B: Deploy via Git Push

If your Netlify site is connected to GitHub:

```bash
# Commit your changes
git add .
git commit -m "Deploy: Ed25519 security fix and latest features"

# Push to main branch
git push origin main
```

Netlify will automatically:
1. Detect the push
2. Run `npm run build`
3. Deploy the `dist` folder
4. Provide a deployment URL

### Option C: Manual Deploy via Netlify Dashboard

1. Build locally:
   ```bash
   npm run build
   ```

2. Go to Netlify Dashboard: https://app.netlify.com
3. Drag and drop the `dist` folder to deploy

---

## Step 5: Configure Netlify Environment Variables

If not using CLI, configure in Netlify Dashboard:

1. Go to: Site Settings → Environment Variables
2. Add the following variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://wjfcqqrlhwdvvjmefxky.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `<your-anon-key>` |
| `VITE_API_URL` | `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3` |
| `VITE_APP_ENV` | `development` |
| `NODE_VERSION` | `20` |

3. Trigger a redeploy: Deploys → Trigger deploy → Deploy site

---

## Step 6: Verify Deployment

### Frontend Health Check

1. **Open your Netlify URL** (e.g., https://your-site.netlify.app)

2. **Check Landing Page**
   - Should load without errors
   - Check browser console for errors

3. **Test Admin Login**
   - Navigate to: https://your-site.netlify.app/admin/login
   - Login with: admin@example.com / Admin123!
   - Should redirect to dashboard

4. **Verify API Connection**
   - Open browser DevTools → Network tab
   - Login should make request to: `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/auth/login`
   - Response should include `access_token`

### Backend Health Check

```bash
# Test backend directly
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

# Test login endpoint
curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@example.com",
    "password": "Admin123!"
  }'
```

---

## Step 7: End-to-End Testing

### Test Scenarios

1. **Authentication Flow**
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials (should fail)
   - [ ] Logout
   - [ ] Token persists across page refresh

2. **Dashboard Access**
   - [ ] Dashboard loads after login
   - [ ] Site selection works
   - [ ] Navigation between pages works

3. **Site Management**
   - [ ] View sites list
   - [ ] Create new site
   - [ ] Edit site configuration
   - [ ] Delete site

4. **Catalog Management**
   - [ ] View catalogs
   - [ ] Assign catalog to site
   - [ ] View catalog products

5. **Employee Management**
   - [ ] View employees
   - [ ] Add employee
   - [ ] Edit employee
   - [ ] Delete employee

6. **Gift Selection (Employee View)**
   - [ ] Access employee portal
   - [ ] View available gifts
   - [ ] Select gift
   - [ ] Submit selection

---

## Troubleshooting

### Build Fails

**Error:** `Type error: ...`
```bash
# Run type check to see all errors
npm run type-check

# Fix errors and rebuild
npm run build
```

**Error:** `Module not found`
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Fails

**Error:** `Environment variable not set`
- Check Netlify Dashboard → Site Settings → Environment Variables
- Ensure all required variables are set
- Trigger redeploy

**Error:** `404 on page refresh`
- Check `netlify.toml` has the redirect rule
- Ensure `[[redirects]]` section exists

### Login Fails

**Error:** `Failed to fetch` or `Network error`
- Check browser console for CORS errors
- Verify `VITE_API_URL` is correct
- Check backend is running: `curl <backend-url>/health`

**Error:** `401 Unauthorized`
- Check admin user exists in Supabase
- Try bootstrap page: https://your-site.netlify.app/admin/bootstrap
- Create first admin user

**Error:** `Invalid JWT`
- Check Ed25519 keys are set in Supabase
- Verify backend logs show: "✅ JWT Ed25519 private key loaded"
- Redeploy backend if needed: `./deploy-backend.sh dev`

### Dashboard Doesn't Load

**Error:** `No sites available`
- Check if sites exist in database
- Run seed script: Navigate to /admin/initial-seed
- Create test sites

**Error:** `Blank page after login`
- Check browser console for errors
- Verify token is stored: `localStorage.getItem('token')`
- Check network tab for failed API calls

---

## Quick Commands Reference

### Backend
```bash
# Deploy backend
./deploy-backend.sh dev

# Test backend health
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

# Test Ed25519 tokens
./test_ed25519_deployment.sh

# Test security (HS256 rejection)
./test_hs256_rejection.sh
```

### Frontend
```bash
# Build
npm run build

# Preview locally
npm run preview

# Deploy to Netlify (CLI)
netlify deploy --prod

# Type check
npm run type-check

# Run tests
npm test
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Backend deployed and healthy
- [ ] Ed25519 keys configured
- [ ] Environment variables set
- [ ] Local build successful
- [ ] Type check passing

### Deployment
- [ ] Frontend built successfully
- [ ] Deployed to Netlify
- [ ] Environment variables configured in Netlify
- [ ] Deployment URL accessible

### Post-Deployment
- [ ] Landing page loads
- [ ] Admin login works
- [ ] Dashboard accessible
- [ ] API calls successful
- [ ] No console errors
- [ ] Token verification working

### Testing
- [ ] Authentication flow tested
- [ ] Site management tested
- [ ] Catalog management tested
- [ ] Employee management tested
- [ ] Gift selection tested

---

## Support

### Logs

**Backend Logs:**
- Supabase Dashboard → Edge Functions → make-server-6fcaeea3 → Logs

**Frontend Logs:**
- Browser DevTools → Console
- Netlify Dashboard → Deploys → [Latest Deploy] → Deploy log

### Common Issues

1. **CORS errors** → Check backend CORS configuration
2. **401 errors** → Check JWT keys and token
3. **404 errors** → Check netlify.toml redirects
4. **Build errors** → Run `npm run type-check`
5. **Blank pages** → Check browser console

---

## Next Steps After Deployment

1. **Test all features** using the test scenarios above
2. **Monitor logs** for any errors
3. **Create test data** if needed (use /admin/initial-seed)
4. **Document any issues** found during testing
5. **Plan production deployment** once testing is complete

---

**Deployment Status:**
- Backend: ✅ Deployed (Development)
- Frontend: 🔄 Ready to Deploy
- Security: ✅ Ed25519 Active
- Testing: ⏳ Pending Deployment
