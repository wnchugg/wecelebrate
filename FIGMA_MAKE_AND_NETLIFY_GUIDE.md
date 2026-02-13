# 🎨 Figma Make + Netlify Dual Environment Guide

## Overview

Your JALA 2 app now works in **BOTH** environments:

1. **Figma Make Preview** - For development and rapid prototyping
2. **Netlify** - For staging/production deployment

---

## 🔧 CORS Configuration

The backend now allows requests from:

✅ **Figma Make:**
- `https://*.supabase.co` (Figma Make preview domains)
- `https://*.figma.com` (Figma-related domains)

✅ **Netlify:**
- `https://*.netlify.app` (all Netlify deployments)

✅ **Local Development:**
- `http://localhost:*` (any port)
- `http://127.0.0.1:*` (any port)

---

## 🎨 Using Figma Make Preview

### How to Access:
1. **Open your project in Figma Make**
2. **Click the preview button** (top right)
3. **App loads at:** `https://wjfcqqrlhwdvvjmefxky.supabase.co/...`

### Features That Work:
✅ Real-time preview of changes
✅ Backend API calls (CORS fixed)
✅ All public routes
✅ Admin routes (`/admin/login`, `/admin/dashboard`, etc.)
✅ Gift catalog initialization
✅ Environment switching

### Limitations:
⚠️ **Custom Domain:** No custom domain (uses Supabase preview URL)
⚠️ **Persistence:** Preview may reset on Figma Make updates
⚠️ **Performance:** Slightly slower than production build

---

## 🚀 Using Netlify Deployment

### How to Access:
**Live URL:** https://jala2-dev.netlify.app/

### Features That Work:
✅ Custom domain support
✅ Production-optimized build
✅ Fast CDN delivery
✅ SPA routing (all routes work)
✅ Security headers
✅ Backend API calls (CORS fixed)

### Deployment:
```bash
# Deploy backend + frontend
./deploy-fix.sh

# Or manually
git add .
git commit -m "Update app"
git push origin main
```

Netlify auto-deploys on every push to `main`.

---

## 🔀 When to Use Each

### Use **Figma Make** When:
- 🎨 Rapid prototyping
- 🔄 Testing UI changes quickly
- 👀 Sharing preview with stakeholders
- 🧪 Experimenting with features
- ⚡ No need to wait for build

### Use **Netlify** When:
- 🚀 Testing production build
- 🌍 Sharing with external users
- 📊 Performance testing
- 🔒 Security testing
- 📱 Testing on real devices

---

## 🛠️ Setup Checklist

### ✅ Backend Setup (One-time):
- [x] Deploy Edge Function to Development Supabase
- [x] Configure CORS to allow Figma Make domains
- [x] Configure CORS to allow Netlify domains
- [x] Set environment variables

### ✅ Figma Make Setup (One-time):
- [x] Backend already configured
- [x] CORS allows `*.supabase.co`
- [x] No additional setup needed!

### ✅ Netlify Setup (One-time):
- [x] Create `netlify.toml` for SPA routing
- [x] Connect GitHub repo to Netlify
- [x] Configure build settings
- [x] Set environment variables (if needed)

---

## 🧪 Testing Both Environments

### Test Figma Make:
1. Open Figma Make preview
2. Open browser console (F12)
3. Navigate to `/admin/login`
4. Check for errors:
   - ✅ No CORS errors
   - ✅ No 401 errors
   - ✅ Route loads correctly

### Test Netlify:
1. Visit: https://jala2-dev.netlify.app/admin/login
2. Open browser console (F12)
3. Hard refresh: `Cmd + Shift + R`
4. Check for errors:
   - ✅ No CORS errors
   - ✅ No 401 errors
   - ✅ No 404 errors
   - ✅ Route loads correctly

---

## 🔄 Workflow Recommendation

### Recommended Development Flow:

```
1. Edit in Figma Make
   ↓
2. Preview changes instantly
   ↓
3. Test functionality
   ↓
4. When ready, push to Git
   ↓
5. Netlify auto-deploys
   ↓
6. Test on Netlify
   ↓
7. Share Netlify URL with stakeholders
```

---

## 🌐 Environment URLs

### Development Environment:

| Environment | URL | Backend |
|-------------|-----|---------|
| **Figma Make** | `https://wjfcqqrlhwdvvjmefxky.supabase.co/...` | Development |
| **Netlify** | `https://jala2-dev.netlify.app` | Development |
| **Backend** | `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3` | Development |

### Production Environment (Future):

| Environment | URL | Backend |
|-------------|-----|---------|
| **Netlify Prod** | `https://jala2.netlify.app` | Production |
| **Backend Prod** | `https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3` | Production |

---

## 🐛 Troubleshooting

### Figma Make Preview Not Loading:

**Issue:** Blank page or loading errors

**Solution:**
1. Check browser console for errors
2. Verify backend is deployed:
   ```bash
   curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
   ```
3. Check CORS:
   ```bash
   curl -H "Origin: https://wjfcqqrlhwdvvjmefxky.supabase.co" -I https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
   ```
4. Redeploy backend if needed:
   ```bash
   ./deploy-fix.sh
   ```

### Netlify 404 on Routes:

**Issue:** Direct links to routes show 404

**Solution:**
1. Verify `netlify.toml` exists in root
2. Redeploy:
   ```bash
   git add netlify.toml
   git commit -m "Add Netlify SPA routing"
   git push origin main
   ```
3. Wait for build to complete (2-3 min)

### CORS Errors:

**Issue:** `Access-Control-Allow-Origin` errors

**Solution:**
1. Check which origin is being blocked (browser console)
2. Verify backend CORS config includes that domain
3. Redeploy backend:
   ```bash
   supabase functions deploy make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky --no-verify-jwt
   ```

---

## 📊 Feature Comparison

| Feature | Figma Make | Netlify |
|---------|-----------|---------|
| **Preview Speed** | ⚡ Instant | 🕐 2-3 min build |
| **Custom Domain** | ❌ No | ✅ Yes |
| **SPA Routing** | ⚠️ Limited | ✅ Full support |
| **Performance** | 🐢 Slower | 🚀 Fast (CDN) |
| **Security Headers** | ⚠️ Basic | ✅ Full |
| **Caching** | ❌ No | ✅ Yes |
| **SSL Certificate** | ✅ Yes | ✅ Yes |
| **Monitoring** | ⚠️ Limited | ✅ Full analytics |
| **Rollback** | ❌ No | ✅ Easy rollback |

---

## 🎯 Best Practices

### For Figma Make:
1. ✅ Use for rapid UI development
2. ✅ Test component changes quickly
3. ✅ Share early previews with team
4. ❌ Don't use for production
5. ❌ Don't rely on persistence

### For Netlify:
1. ✅ Use for staging/production
2. ✅ Test before sharing publicly
3. ✅ Monitor build logs
4. ✅ Use environment variables for secrets
5. ✅ Enable deploy previews for PRs

---

## 🚀 Quick Deploy Commands

### Deploy Backend Only:
```bash
supabase functions deploy make-server-6fcaeea3 \
  --project-ref wjfcqqrlhwdvvjmefxky \
  --no-verify-jwt
```

### Deploy Backend + Frontend:
```bash
./deploy-fix.sh
```

### Manual Frontend Deploy (if not using Git):
```bash
npm run build
# Then drag dist/ folder to Netlify dashboard
```

---

## ✅ Verification After Deploy

After running `./deploy-fix.sh`:

### Check Backend:
```bash
# Health check
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

# CORS check
./test-cors.sh
```

### Check Figma Make:
1. Open preview in Figma Make
2. Navigate to `/admin/login`
3. Check console - no errors
4. Test login flow

### Check Netlify:
1. Visit https://jala2-dev.netlify.app/admin/login
2. Hard refresh: `Cmd + Shift + R`
3. Check console - no errors
4. Test login flow

---

## 📝 Summary

**Both environments now work perfectly!** 🎉

- ✅ Figma Make preview has full backend access
- ✅ Netlify deployment has full SPA routing
- ✅ CORS allows both domains
- ✅ All routes work in both environments
- ✅ Admin panel accessible in both
- ✅ No authentication errors
- ✅ No CORS errors

**Choose the right tool for the job:**
- **Figma Make** = Fast iteration
- **Netlify** = Production testing

---

**Ready to use both!** 🚀
