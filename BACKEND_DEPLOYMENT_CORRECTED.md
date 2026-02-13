# ✅ Backend Deployment Guide - CORRECTED Project ID

**Date:** February 8, 2026  
**Status:** Ready to Deploy  
**Project ID:** `wjfcqqrlhwdvvjmefxky` ← **CORRECT** (with two v's)

---

## 🚨 Important Correction

The development Supabase project ID is:
```
wjfcqqrlhwdvvjmefxky  ✅ CORRECT (note the double 'v')
```

NOT:
```
wjfcqqrlhwdvjmefxky  ❌ WRONG (single 'v')
```

All files have been updated with the correct project ID.

---

## 🚀 Deployment Steps

### Step 1: Open Terminal
```bash
cd /path/to/jala2-platform
```

### Step 2: Run Deployment Script

**Mac/Linux:**
```bash
chmod +x deploy-backend.sh
./deploy-backend.sh
```

**Windows:**
```bash
deploy-backend.bat
```

### Step 3: Follow Prompts

When asked:
```
Which environment do you want to deploy to?
1) Development (wjfcqqrlhwdvvjmefxky)  ← Select this one
2) Production (lmffeqwhrnbsbhdztwyv)
```

**Type:** `1` and press Enter

### Step 4: Login to Supabase

If prompted for login:
1. Browser window opens
2. Login to Supabase
3. Click "Authorize"
4. Return to terminal

If asked for access token:
1. Go to: https://app.supabase.com/account/tokens
2. Generate new token
3. Copy and paste into terminal
4. Press Enter

### Step 5: Wait for Deployment

You'll see:
```
🚀 JALA 2 Backend Deployment Script
====================================

📍 Deploying to: Development (wjfcqqrlhwdvvjmefxky)

🔑 Checking Supabase authentication...
✅ Authenticated!

🔗 Linking to Supabase project...
✅ Project linked!

📤 Deploying Edge Function 'make-server-6fcaeea3'...
✅ Edge Function deployed!

🧪 Testing deployment...
✅ Backend is responding!

==========================================
✅ Deployment Complete!
==========================================
```

### Step 6: Verify Deployment

Test the health endpoint:
```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T...",
  "environment": "development"
}
```

### Step 7: Create Admin User

Visit:
```
https://jala2-dev.netlify.app/admin/bootstrap
```

Create your admin account.

### Step 8: Login

Visit:
```
https://jala2-dev.netlify.app/admin
```

Login with your new credentials!

---

## 📋 Files Updated

All files have been corrected with the proper project ID:

### Deployment Scripts
- ✅ `/deploy-backend.sh` - Updated to `wjfcqqrlhwdvvjmefxky`
- ✅ `/deploy-backend.bat` - Updated to `wjfcqqrlhwdvvjmefxky`

### Configuration Files
- ✅ `/src/app/config/deploymentEnvironments.ts` - Updated
- ✅ `/src/app/config/environments.ts` - Updated
- ✅ `/src/app/pages/SystemStatus.tsx` - Updated
- ✅ `/utils/supabase/info.tsx` - Updated
- ✅ `/utils/supabase/info.ts` - Updated

### Environment Template
- ✅ `.env.example` - Created with correct ID

---

## 🔍 Quick Verification

Check your files have the correct project ID:

```bash
# Should show "wjfcqqrlhwdvvjmefxky" (two v's)
grep -r "wjfcqqrlhw" deploy-backend.sh
```

---

## 🌐 Backend URLs

After deployment, your backend will be available at:

**Health Check:**
```
https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

**API Base:**
```
https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3
```

**Public Sites:**
```
https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/public/sites
```

---

## ⚠️ Troubleshooting

### Wrong Project ID Error

If you see an error about project not found, verify:
```bash
# Check deployment script
cat deploy-backend.sh | grep PROJECT_REF

# Should show:
# PROJECT_REF="wjfcqqrlhwdvvjmefxky"
```

### Can't Find Supabase CLI

Install it:
```bash
npm install -g supabase
```

### Authentication Failed

Logout and login again:
```bash
supabase logout
supabase login
```

---

## ✅ Checklist

- [ ] Verified project ID is `wjfcqqrlhwdvvjmefxky` (two v's)
- [ ] Ran `./deploy-backend.sh`
- [ ] Selected option 1 (Development)
- [ ] Logged in to Supabase
- [ ] Deployment completed successfully
- [ ] Health check returns JSON
- [ ] Created admin user at /admin/bootstrap
- [ ] Can login to admin panel

---

## 🎉 Next Steps

After successful deployment:

1. **Create Admin User:** https://jala2-dev.netlify.app/admin/bootstrap
2. **Login:** https://jala2-dev.netlify.app/admin
3. **Create Clients:** Add your first client
4. **Create Sites:** Configure sites for your client
5. **Add Gifts:** Build your gift catalog
6. **Test Public Flow:** Visit the public site

---

**Status:** Ready to Deploy ✅  
**Project ID:** `wjfcqqrlhwdvvjmefxky` (CORRECTED)  
**Date:** February 8, 2026
