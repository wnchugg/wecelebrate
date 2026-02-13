# 🚀 JALA 2 Deployment Guide

**Complete Production Deployment for Frontend and Backend**

---

## 📋 PREREQUISITES

### Required Tools
- [x] Supabase CLI installed: `npm install -g supabase`
- [x] Node.js 18+ installed
- [x] npm or pnpm installed
- [x] Supabase account with projects created
- [x] Git repository access

### Supabase Projects
- **Production:** `lmffeqwhrnbsbhdztwyv`
- **Development:** `wjfcqqrlhwdvvjmefxky`

---

## 🎯 DEPLOYMENT OVERVIEW

### What We're Deploying
1. **Backend Edge Function** → Supabase Edge Functions (Both environments)
2. **Frontend Application** → Hosting platform (Netlify/Vercel/etc)
3. **Environment Configuration** → Environment variables
4. **Database Setup** → Initial seeding

### Deployment Order
1. ✅ **Step 1:** Backend to Development (test)
2. ✅ **Step 2:** Backend to Production
3. ✅ **Step 3:** Frontend Build
4. ✅ **Step 4:** Frontend to Production
5. ✅ **Step 5:** Verification & Testing

---

## 🔧 STEP 1: BACKEND DEPLOYMENT TO DEVELOPMENT

### 1.1 Login to Supabase
```bash
# Login to Supabase
supabase login

# Link to development project
supabase link --project-ref wjfcqqrlhwdvvjmefxky
```

### 1.2 Set Environment Variables (Development)
```bash
# Set in Supabase Dashboard → Project Settings → Edge Functions → Secrets

SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
SUPABASE_ANON_KEY=[your-dev-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-dev-service-role-key]
SUPABASE_DB_URL=[your-dev-db-connection-string]

# Production credentials (for multi-environment support)
SUPABASE_SERVICE_ROLE_KEY_PROD=[your-prod-service-role-key]

# Optional settings
ALLOWED_ORIGINS=*
SEED_ON_STARTUP=false
```

### 1.3 Deploy Edge Function to Development
```bash
# Deploy the edge function
supabase functions deploy server --project-ref wjfcqqrlhwdvvjmefxky

# Expected output:
# ✓ Deployed Function server
# URL: https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/server
```

### 1.4 Test Development Deployment
```bash
# Test health endpoint
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2026-02-07T...",
#   "environment": "development",
#   "responseTime": 123
# }
```

---

## 🔧 STEP 2: BACKEND DEPLOYMENT TO PRODUCTION

### 2.1 Link to Production Project
```bash
# Link to production project
supabase link --project-ref lmffeqwhrnbsbhdztwyv
```

### 2.2 Set Environment Variables (Production)
```bash
# Set in Supabase Dashboard → Project Settings → Edge Functions → Secrets

SUPABASE_URL=https://lmffeqwhrnbsbhdztwyv.supabase.co
SUPABASE_ANON_KEY=[your-prod-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-prod-service-role-key]
SUPABASE_DB_URL=[your-prod-db-connection-string]

# Development credentials (for multi-environment support)
SUPABASE_SERVICE_ROLE_KEY_DEV=[your-dev-service-role-key]

# Production settings
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SEED_ON_STARTUP=false
```

### 2.3 Deploy Edge Function to Production
```bash
# Deploy the edge function
supabase functions deploy server --project-ref lmffeqwhrnbsbhdztwyv

# Expected output:
# ✓ Deployed Function server
# URL: https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/server
```

### 2.4 Test Production Deployment
```bash
# Test health endpoint
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2026-02-07T...",
#   "environment": "production",
#   "responseTime": 123
# }
```

---

## 🎨 STEP 3: FRONTEND BUILD

### 3.1 Verify Environment Configuration
Check `/src/app/config/environments.ts`:

```typescript
export const ENVIRONMENTS: Environment[] = [
  {
    id: 'development',
    name: 'Development',
    supabaseUrl: 'https://wjfcqqrlhwdvvjmefxky.supabase.co',
    supabaseAnonKey: '[dev-anon-key]',
  },
  {
    id: 'production',
    name: 'Production',
    supabaseUrl: 'https://lmffeqwhrnbsbhdztwyv.supabase.co',
    supabaseAnonKey: '[prod-anon-key]',
  }
];
```

### 3.2 Build Frontend
```bash
# Install dependencies
npm install

# Run production build
npm run build

# Expected output:
# ✓ Built in 30-60 seconds
# dist/ folder created with optimized files
```

### 3.3 Test Build Locally
```bash
# Preview production build
npm run preview

# Open browser to http://localhost:4173
# Verify:
# - No console errors
# - All pages load
# - Environment switcher works
# - API calls work (after backend deployed)
```

---

## 🌐 STEP 4: FRONTEND DEPLOYMENT

### Option A: Netlify Deployment

#### 4.1 Netlify Manual Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Follow prompts:
# - Create new site or link existing
# - Confirm production deployment
```

#### 4.2 Netlify Git Integration
1. Push code to GitHub/GitLab
2. Login to Netlify Dashboard
3. Click "New site from Git"
4. Select repository
5. Configure build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click "Deploy site"

---

### Option B: Vercel Deployment

#### 4.1 Vercel Manual Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod

# Follow prompts
```

#### 4.2 Vercel Git Integration
1. Push code to GitHub
2. Login to Vercel Dashboard
3. Click "New Project"
4. Import repository
5. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click "Deploy"

---

### Option C: Custom Server (e.g., AWS, DigitalOcean)

```bash
# Build application
npm run build

# Copy dist/ folder to server
scp -r dist/* user@yourserver:/var/www/html/

# Configure nginx or Apache to serve static files
# Point domain to server
```

---

## ✅ STEP 5: VERIFICATION & TESTING

### 5.1 Backend Verification

#### Test Health Endpoint
```bash
# Development
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

# Production
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health
```

#### Test Database Connection
```bash
# Development
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/test-db

# Production  
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/test-db
```

### 5.2 Frontend Verification

#### Check Production URL
```
https://your-domain.com
```

#### Verify Functionality:
- [x] Home page loads
- [x] No console errors
- [x] Environment switcher present
- [x] Can switch between Dev/Prod
- [x] Login page accessible
- [x] Admin routes protected

### 5.3 Integration Testing

#### Test Client Management
```bash
# Login to admin panel
# Navigate to /admin/clients
# Create a test client
# Verify in both Dev and Prod environments
```

#### Test Site Management
```bash
# Navigate to /admin/sites
# Create a test site
# Assign branding colors
# Save and verify
```

#### Test Gift Management
```bash
# Navigate to /admin/gifts
# Create a test gift
# Verify it appears in list
# Test search and filter
```

#### Test Gift Assignment
```bash
# Navigate to /admin/site-gift-assignment
# Select a site
# Choose assignment strategy
# Configure and save
# Verify preview updates
```

### 5.4 Public API Testing

#### Test Public Endpoints (No Auth Required)
```bash
# Get active sites
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/public/sites

# Get gifts for a site
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/public/sites/SITE_ID/gifts
```

---

## 🔐 SECURITY CHECKLIST

### Production Security
- [x] ALLOWED_ORIGINS set to actual domain (not *)
- [x] HTTPS enabled
- [x] Service role key not exposed to frontend
- [x] CSRF protection enabled
- [x] Rate limiting configured
- [x] Environment variables secured
- [x] Audit logging enabled

### Frontend Security
- [x] No hardcoded secrets
- [x] HTTPS enforced in production
- [x] Content Security Policy headers
- [x] XSS prevention
- [x] CSRF tokens in state-changing requests

---

## 📊 POST-DEPLOYMENT MONITORING

### 5.1 Backend Monitoring

#### View Edge Function Logs
```bash
# Development
supabase functions logs server --project-ref wjfcqqrlhwdvvjmefxky

# Production
supabase functions logs server --project-ref lmffeqwhrnbsbhdztwyv
```

#### Monitor in Dashboard
1. Login to Supabase Dashboard
2. Navigate to Edge Functions → server
3. View logs, invocations, errors

### 5.2 Frontend Monitoring

#### Check Browser Console
- Open developer tools
- Check for errors
- Monitor network requests
- Verify API responses

#### Performance Monitoring
- Check page load times
- Monitor API response times
- Verify no memory leaks
- Test on mobile devices

---

## 🐛 TROUBLESHOOTING

### Backend Issues

#### Issue: Edge function not deploying
**Solution:**
```bash
# Check Supabase CLI version
supabase --version

# Update if needed
npm install -g supabase@latest

# Re-login
supabase login

# Try deployment again
```

#### Issue: "Function not found" error
**Solution:**
- Verify function name is exactly "server"
- Check project-ref is correct
- Ensure you're linked to right project
- Check Supabase dashboard for function

#### Issue: Environment variables not set
**Solution:**
1. Go to Supabase Dashboard
2. Project Settings → Edge Functions
3. Add secrets manually
4. Redeploy function

#### Issue: CORS errors
**Solution:**
- Check ALLOWED_ORIGINS environment variable
- Ensure frontend domain is whitelisted
- Verify credentials: false in CORS config

### Frontend Issues

#### Issue: Build fails
**Solution:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

#### Issue: White screen after deployment
**Solution:**
- Check browser console for errors
- Verify base path in vite.config
- Check routing configuration
- Ensure all assets copied

#### Issue: API calls fail in production
**Solution:**
- Verify backend is deployed
- Check environment configuration
- Ensure CORS is configured
- Check browser network tab for errors

#### Issue: Environment switcher not working
**Solution:**
- Verify environments.ts has correct URLs
- Check anon keys are valid
- Ensure X-Environment-ID header sent
- Clear browser cache

---

## 📝 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [x] Code reviewed and tested locally
- [x] All tests passing
- [x] Documentation updated
- [x] Environment variables prepared
- [x] Supabase projects ready
- [x] Domain configured (if applicable)

### Backend Deployment
- [ ] Logged into Supabase CLI
- [ ] Linked to development project
- [ ] Set development environment variables
- [ ] Deployed to development
- [ ] Tested development endpoints
- [ ] Linked to production project
- [ ] Set production environment variables
- [ ] Deployed to production
- [ ] Tested production endpoints

### Frontend Deployment
- [ ] Environment config verified
- [ ] Production build successful
- [ ] Build tested locally
- [ ] Deployed to hosting platform
- [ ] Custom domain configured
- [ ] HTTPS enabled
- [ ] Tested production URL

### Post-Deployment
- [ ] All systems tested
- [ ] Public APIs verified
- [ ] Admin functions tested
- [ ] Error monitoring configured
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Team notified
- [ ] Documentation updated

---

## 🎉 SUCCESS CRITERIA

### Backend
✅ Health endpoint returns 200  
✅ Database connection successful  
✅ All CRUD endpoints working  
✅ Authentication functional  
✅ Public APIs accessible  
✅ Logs visible in dashboard  
✅ No deployment errors  

### Frontend
✅ Application loads without errors  
✅ All pages accessible  
✅ API calls successful  
✅ Environment switching works  
✅ Mobile responsive  
✅ Fast page loads (< 2s)  
✅ No console errors  

### Integration
✅ Frontend connects to backend  
✅ Data persists correctly  
✅ Multi-environment support works  
✅ Public endpoints accessible  
✅ Authentication flow complete  
✅ All features functional  

---

## 📞 SUPPORT

### Resources
- **Supabase Docs:** https://supabase.com/docs
- **Edge Functions Guide:** https://supabase.com/docs/guides/functions
- **CLI Reference:** https://supabase.com/docs/reference/cli
- **Community:** https://github.com/supabase/supabase/discussions

### Quick Commands Reference
```bash
# Supabase CLI
supabase login
supabase link --project-ref PROJECT_ID
supabase functions deploy FUNCTION_NAME
supabase functions logs FUNCTION_NAME

# Frontend Build
npm install
npm run build
npm run preview

# Netlify
netlify login
netlify deploy --prod --dir=dist

# Vercel
vercel login
vercel --prod
```

---

## 🚀 READY TO DEPLOY!

**Follow the steps above in order:**
1. Backend to Development
2. Backend to Production
3. Frontend Build
4. Frontend to Production
5. Verification & Testing

**Estimated Time:** 30-60 minutes

**Good luck with your deployment!** 🎉

---

*Deployment Guide v1.0 - February 7, 2026*
