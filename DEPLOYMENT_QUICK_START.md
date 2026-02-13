# JALA2 Deployment - Quick Start 🚀

## ✅ Scripts Are Fixed!

The issue with `SUPABASE_` prefixed environment variables has been resolved. 

**Key Insight:** Supabase automatically provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions, so we don't need to set them manually!

---

## 🎯 Run This Now:

```bash
# Make script executable (if not already done)
chmod +x scripts/deploy-full-stack.sh

# Deploy to Development
./scripts/deploy-full-stack.sh dev
```

---

## 📋 What the Script Does:

### ✅ **Checks Prerequisites**
- Node.js, npm, Supabase CLI

### ✅ **Backend Deployment**
1. Links to your Supabase project (`wjfcqqrlhwdvvjmefxky` for dev)
2. Sets custom secrets:
   - `ALLOWED_ORIGINS="*"`
   - `SEED_ON_STARTUP="false"`
3. Deploys Edge Function: `make-server-6fcaeea3`
4. Tests backend health automatically

### ✅ **Frontend Build**
5. Installs dependencies (`npm ci`)
6. Runs TypeScript type check
7. Runs tests
8. Builds frontend (`npm run build`)
9. Shows deployment options

**Time:** ~10 minutes

---

## 🔑 What You'll Need:

When the script asks for credentials, get them from **Supabase Dashboard**:

1. Go to: https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky
2. Navigate to: **Settings → API**
3. Copy:
   - **Project URL**: `https://wjfcqqrlhwdvvjmefxky.supabase.co`
   - **Anon Key** (public)
   - **Service Role Key** (secret - keep safe!)

---

## ✨ What Changed:

### **Before (Broken):**
```bash
# ❌ This failed because SUPABASE_ prefix is reserved
supabase secrets set SUPABASE_URL="..." --no-verbose
supabase secrets set SUPABASE_ANON_KEY="..." --no-verbose
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="..." --no-verbose
```

### **After (Fixed):**
```bash
# ✅ Only set custom secrets (Supabase provides the rest automatically)
supabase secrets set ALLOWED_ORIGINS="*"
supabase secrets set SEED_ON_STARTUP="false"

# Note: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# are automatically provided by Supabase!
```

---

## 🎬 Complete Workflow:

### **Step 1: Deploy Backend**
```bash
./scripts/deploy-full-stack.sh dev
```

**Enter when prompted:**
- Project URL: `https://wjfcqqrlhwdvvjmefxky.supabase.co` (or press Enter for default)
- Anon Key: [paste from Supabase Dashboard]
- Service Role Key: [paste from Supabase Dashboard]

### **Step 2: Wait for Deployment**
The script will:
- ✅ Link to Supabase project
- ✅ Set secrets
- ✅ Deploy backend
- ✅ Test backend health
- ✅ Build frontend
- ✅ Show next steps

### **Step 3: Deploy Frontend** (Choose one)

**Option A: Vercel** (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Netlify**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

**Option C: Manual**
- Upload `dist/` folder to your web server

---

## 🧪 Test the Deployment:

### **Test Backend:**
```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_ANON_KEY_HERE"
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2026-02-07T..."}
```

### **Test Frontend:**
- Visit your deployed frontend URL
- Open browser console (F12)
- Should see no errors
- Backend health check should succeed

---

## 📊 Environment Configuration:

### **Development**
- Project ID: `wjfcqqrlhwdvvjmefxky`
- Backend URL: `https://wjfcqqrlhwdvvjmefxky.supabase.co`
- Edge Function: `make-server-6fcaeea3`

### **Production**
- Project ID: `lmffeqwhrnbsbhdztwyv`
- Backend URL: `https://lmffeqwhrnbsbhdztwyv.supabase.co`
- Edge Function: `make-server-6fcaeea3`

---

## 🚨 Common Issues:

### **Issue: "unknown flag: --no-verbose"**
✅ **Fixed!** Updated scripts to remove this flag.

### **Issue: "Env name cannot start with SUPABASE_"**
✅ **Fixed!** We no longer try to set SUPABASE_* secrets (Supabase provides them automatically).

### **Issue: "Missing authorization header" (401)**
This is **normal** when testing without the Authorization header. Use:
```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### **Issue: Backend health check fails**
```bash
# Check logs
supabase functions logs make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky

# Redeploy
./scripts/deploy-backend.sh dev
```

---

## 📚 Available Scripts:

### **Full Stack** (Recommended)
```bash
./scripts/deploy-full-stack.sh dev   # Backend + Frontend build
./scripts/deploy-full-stack.sh prod
```

### **Backend Only**
```bash
./scripts/deploy-backend.sh dev      # Quick backend updates
./scripts/deploy-backend.sh prod
```

### **Frontend Only**
```bash
./scripts/deploy-frontend.sh dev     # Just build frontend
./scripts/deploy-frontend.sh prod
```

### **Platform Specific**
```bash
./scripts/deploy-to-vercel.sh dev    # Build + deploy to Vercel
./scripts/deploy-to-netlify.sh dev   # Build + deploy to Netlify
```

---

## ⏱️ Time Estimates:

| Task | Time |
|------|------|
| Backend deployment | 2 min |
| Frontend build | 3 min |
| Full stack deployment | 10 min |
| First-time setup (both envs) | 30 min |

---

## 🎯 Next Steps After Deployment:

1. **Create Admin User:**
   ```bash
   ./scripts/create-admin-user.sh
   ```

2. **Configure Environment:**
   - Visit: `https://your-frontend-url.com/admin/environment-config`
   - Add Development credentials
   - Test connection

3. **Test the Platform:**
   - Login to admin panel
   - Create a client
   - Create a site
   - Assign products

---

## 💡 Pro Tips:

### **Tip 1: Quick Backend Updates**
When you only change backend code:
```bash
./scripts/deploy-backend.sh dev  # 2 minutes!
```

### **Tip 2: Watch Logs**
Monitor backend in real-time:
```bash
supabase functions logs make-server-6fcaeea3 --project-ref wjfcqqrlhwdvvjmefxky
```

### **Tip 3: Local Development**
Test locally before deploying:
```bash
npm run dev  # Frontend
# Backend runs on Supabase (can't run locally in this setup)
```

### **Tip 4: Deployment Logs**
All deployments are logged to `deployments/` folder:
```bash
ls -la deployments/
cat deployments/dev-fullstack-*.log
```

---

## ✅ You're Ready!

Run this command to deploy:

```bash
./scripts/deploy-full-stack.sh dev
```

Then follow the prompts. The script will guide you through the rest!

---

## 🆘 Need Help?

- **Scripts Documentation:** [/scripts/README.md](/scripts/README.md)
- **Full Deployment Guide:** [/DEPLOYMENT_GUIDE.md](/DEPLOYMENT_GUIDE.md)
- **Troubleshooting:** [/TROUBLESHOOTING.md](/TROUBLESHOOTING.md)
- **Backend API Docs:** [/supabase/functions/server/API_DOCUMENTATION.md](/supabase/functions/server/API_DOCUMENTATION.md)

---

*Last Updated: February 7, 2026*  
*Scripts Version: 1.1.0 (Fixed)*  
*Status: Ready to Deploy ✅*
