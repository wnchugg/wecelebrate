# 🚀 Quick Deployment Steps

**Simple step-by-step guide to deploy JALA 2 to production**

---

## ⚡ QUICK START

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

---

## 📦 BACKEND DEPLOYMENT

### Step 1: Deploy to Development (Test First)
```bash
# Link to development project
supabase link --project-ref wjfcqqrlhwdvvjmefxky

# Deploy edge function
supabase functions deploy server

# Test it works
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-07T...",
  "environment": "development"
}
```

---

### Step 2: Set Environment Variables

Go to Supabase Dashboard → Your Project → Settings → Edge Functions → Secrets

**Add these secrets:**
```
SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
SUPABASE_ANON_KEY=[from project settings]
SUPABASE_SERVICE_ROLE_KEY=[from project settings]
SUPABASE_DB_URL=[from project settings]
ALLOWED_ORIGINS=*
SEED_ON_STARTUP=false
```

**For multi-environment support, also add:**
```
SUPABASE_SERVICE_ROLE_KEY_PROD=[production service role key]
```

---

### Step 3: Deploy to Production
```bash
# Link to production project
supabase link --project-ref lmffeqwhrnbsbhdztwyv

# Deploy edge function
supabase functions deploy server

# Test it works
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health
```

**Repeat Step 2 for Production project with production credentials**

---

## 🎨 FRONTEND DEPLOYMENT

### Step 1: Build Frontend
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test locally (optional)
npm run preview
```

---

### Step 2: Deploy to Hosting Platform

#### Option A: Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Or use Netlify Drop (drag & drop dist/ folder)
# https://app.netlify.com/drop
```

---

#### Option B: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

#### Option C: Manual (Any Host)
```bash
# Upload dist/ folder to your server
# Point web server to serve static files from dist/
# Ensure fallback to index.html for SPA routing
```

---

## ✅ VERIFICATION

### Test Backend
```bash
# Health check
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health

# Database connection
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/test-db

# Public sites endpoint
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/public/sites
```

### Test Frontend
1. Open your deployed URL
2. Check browser console (should be no errors)
3. Try environment switcher (should switch between Dev/Prod)
4. Test admin login
5. Create a client/site/gift
6. Verify data persists

---

## 🔧 TROUBLESHOOTING

### Backend Issues

**Problem:** Function not deploying
```bash
# Update Supabase CLI
npm install -g supabase@latest

# Re-login
supabase login

# Try again
supabase functions deploy server
```

**Problem:** Health check fails
- Check environment variables are set in Supabase Dashboard
- View logs: `supabase functions logs server`
- Ensure correct project is linked

**Problem:** CORS errors
- Update ALLOWED_ORIGINS in environment variables
- Include your frontend domain
- Redeploy function

---

### Frontend Issues

**Problem:** Build fails
```bash
# Clear and rebuild
rm -rf node_modules dist
npm install
npm run build
```

**Problem:** White screen after deployment
- Check browser console for errors
- Verify all assets uploaded
- Check routing configuration

**Problem:** API calls fail
- Ensure backend is deployed
- Check environment configuration in `/src/app/config/environments.ts`
- Verify CORS is configured on backend

---

## 📊 DEPLOYMENT CHECKLIST

### Backend
- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Deployed to development
- [ ] Tested development health endpoint
- [ ] Set development environment variables
- [ ] Deployed to production
- [ ] Tested production health endpoint
- [ ] Set production environment variables

### Frontend
- [ ] Dependencies installed
- [ ] Production build successful
- [ ] Build tested locally
- [ ] Deployed to hosting platform
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Tested production URL
- [ ] No console errors
- [ ] All features working

---

## 🎉 SUCCESS!

If all checks pass, your JALA 2 platform is now live in production! 🚀

### Next Steps
1. Monitor logs for errors
2. Test all features thoroughly
3. Set up monitoring/alerts
4. Share URL with team
5. Begin Week 2 development

---

## 📞 Quick Commands Reference

```bash
# Backend
supabase login
supabase link --project-ref PROJECT_ID
supabase functions deploy server
supabase functions logs server

# Frontend
npm install
npm run build
npm run preview

# Netlify
netlify login
netlify deploy --prod --dir=dist

# Vercel
vercel login
vercel --prod

# Testing
curl https://PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health
```

---

**Estimated Deployment Time:** 15-30 minutes  
**Difficulty:** Easy with CLI, Easier with script

Use `./deploy.sh` for interactive guided deployment! ✨
