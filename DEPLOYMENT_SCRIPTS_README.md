# 🚀 Deployment Scripts Guide

**Three deployment scripts to fit your workflow**

---

## 📦 Available Scripts

### 1. `quick-deploy.sh` ⭐ **RECOMMENDED**
**Best for:** Quick, streamlined deployments

```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

**What it does:**
- ✅ Deploys backend to both Dev & Prod
- ✅ Builds and deploys frontend
- ✅ Automatic health checks
- ✅ Simple menu-driven interface
- ✅ Fast and efficient

**Perfect when:** You just want to deploy everything quickly

---

### 2. `auto-deploy.sh`
**Best for:** Advanced users who need file conversion

```bash
chmod +x auto-deploy.sh
./auto-deploy.sh
```

**What it does:**
- ✅ Converts .tsx to .ts files (if needed)
- ✅ Prepares deployment files
- ✅ Deploys to Dev and/or Prod
- ✅ Builds frontend
- ✅ Deploys to Netlify/Vercel
- ✅ Comprehensive testing
- ✅ Full control over each step

**Perfect when:** You need fine-grained control or file conversion

---

### 3. `deploy.sh`
**Best for:** Step-by-step guided deployment

```bash
chmod +x deploy.sh
./deploy.sh
```

**What it does:**
- ✅ Interactive menu system
- ✅ Guided deployment process
- ✅ View logs and test endpoints
- ✅ Deploy backend and frontend separately
- ✅ Multiple deployment options

**Perfect when:** You want to deploy specific parts individually

---

## 🎯 Quick Start (Fastest Way)

### One-Command Deployment

```bash
# Make script executable
chmod +x quick-deploy.sh

# Run deployment
./quick-deploy.sh
```

Then select option **1** for "Everything"

**That's it!** ✨

---

## 📋 What You Need Before Deploying

### 1. Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Environment Variables Set
Go to Supabase Dashboard and set these secrets for both projects:

**Required for both Dev and Prod:**
```
SUPABASE_URL=https://PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=[from Settings → API]
SUPABASE_SERVICE_ROLE_KEY=[from Settings → API]
SUPABASE_DB_URL=[from Settings → Database]
ALLOWED_ORIGINS=*  (or your domain for prod)
SEED_ON_STARTUP=false
```

**Get them from:**
- Supabase Dashboard → Your Project → Settings → API
- Supabase Dashboard → Your Project → Settings → Database

### 4. (Optional) Frontend Deployment CLI

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

## 🎬 Deployment Walkthrough

### Using `quick-deploy.sh` (Recommended)

**Step 1:** Make it executable
```bash
chmod +x quick-deploy.sh
```

**Step 2:** Run the script
```bash
./quick-deploy.sh
```

**Step 3:** Choose deployment option
```
What would you like to deploy?

  1) 🚀 Everything (Backend + Frontend)
  2) 🔧 Backend Only (Dev + Prod)
  3) 🎨 Frontend Only
  4) ❌ Cancel

Choice (1-4): 1
```

**Step 4:** Wait for deployment
The script will:
- Deploy backend to Development
- Test development endpoint
- Ask for confirmation before Production
- Deploy backend to Production
- Test production endpoint
- Build frontend
- Ask which platform to deploy to
- Deploy frontend

**Step 5:** Verify
- Backend Dev: `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health`
- Backend Prod: `https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health`
- Frontend: Your deployed URL

**Done!** 🎉

---

## 🔧 Script Comparison

| Feature | quick-deploy.sh | auto-deploy.sh | deploy.sh |
|---------|----------------|----------------|-----------|
| **Speed** | ⚡⚡⚡ Fastest | ⚡⚡ Fast | ⚡ Normal |
| **Ease of Use** | ⭐⭐⭐ Easiest | ⭐⭐ Moderate | ⭐⭐ Moderate |
| **File Conversion** | ❌ No | ✅ Yes | ❌ No |
| **Control** | 🎮 Basic | 🎮🎮🎮 Full | 🎮🎮 Advanced |
| **Health Checks** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Log Viewing** | ❌ No | ✅ Yes | ✅ Yes |
| **Menu System** | ✅ Simple | ✅ Advanced | ✅ Interactive |
| **Best For** | Quick deploys | Full automation | Step-by-step |

---

## 📊 Deployment Time Estimates

### Using quick-deploy.sh
- **Backend Only:** ~3 minutes
- **Frontend Only:** ~2 minutes  
- **Everything:** ~5 minutes

### Using auto-deploy.sh
- **Backend Only:** ~4 minutes
- **Frontend Only:** ~3 minutes
- **Everything:** ~7 minutes

### Using deploy.sh
- **Backend Only:** ~5 minutes
- **Frontend Only:** ~3 minutes
- **Everything:** ~8 minutes

*Times include testing and verification*

---

## 🐛 Troubleshooting

### Script won't run: "Permission denied"
```bash
chmod +x quick-deploy.sh
chmod +x auto-deploy.sh
chmod +x deploy.sh
```

### "Supabase CLI not found"
```bash
npm install -g supabase
```

### "Not logged in to Supabase"
```bash
supabase login
```

### Health check fails
```bash
# View logs
supabase functions logs server --project-ref lmffeqwhrnbsbhdztwyv

# Check environment variables in Supabase Dashboard
# Redeploy
supabase functions deploy server
```

### Build fails
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### CORS errors
- Update `ALLOWED_ORIGINS` in Supabase environment variables
- Include your frontend domain
- Redeploy backend

---

## 🎯 Common Workflows

### Workflow 1: First-Time Deployment
```bash
# 1. Set environment variables in Supabase Dashboard
# 2. Run quick deploy
./quick-deploy.sh

# 3. Select option 1 (Everything)
# 4. Wait for completion
# 5. Test your application
```

### Workflow 2: Backend Updates Only
```bash
./quick-deploy.sh
# Select option 2 (Backend Only)
```

### Workflow 3: Frontend Updates Only
```bash
./quick-deploy.sh
# Select option 3 (Frontend Only)
```

### Workflow 4: Production Hotfix
```bash
# Make your code changes
# Then deploy
./quick-deploy.sh
# Select option 1
# Confirm production deployment when prompted
```

---

## 📝 What Each Script Actually Does

### quick-deploy.sh Flow
```
1. Check prerequisites (Supabase CLI, login)
2. Deploy backend to Development
3. Test development health endpoint
4. Ask for production confirmation
5. Deploy backend to Production
6. Test production health endpoint
7. Build frontend (npm run build)
8. Ask for frontend deployment method
9. Deploy frontend
10. Show completion summary
```

### auto-deploy.sh Flow
```
1. Check prerequisites
2. Convert .tsx to .ts files (if needed)
3. Prepare deployment files
4. Copy to temp directory
5. Deploy backend to selected environment(s)
6. Test health endpoints
7. Build frontend
8. Deploy frontend to selected platform
9. Run comprehensive tests
10. Cleanup temp files
```

### deploy.sh Flow
```
1. Show interactive menu
2. User selects deployment option
3. Execute selected deployment
4. Show logs if requested
5. Test endpoints if requested
6. Return to menu or exit
```

---

## 🎨 Customization

### Change Project IDs
Edit the script variables at the top:
```bash
DEV_PROJECT="your-dev-project-id"
PROD_PROJECT="your-prod-project-id"
```

### Skip Health Checks
Comment out the health check sections:
```bash
# if curl -s -f "https://..."; then
#   success "Health check passed"
# fi
```

### Auto-confirm Production
Change confirmation logic:
```bash
# From:
read -p "Type 'yes' to confirm: " confirm

# To:
confirm="yes"
```

---

## 🚀 Advanced Usage

### Deploy Specific Environments
```bash
# Backend to dev only
supabase functions deploy server --project-ref wjfcqqrlhwdvvjmefxky

# Backend to prod only
supabase functions deploy server --project-ref lmffeqwhrnbsbhdztwyv
```

### View Logs During Deployment
```bash
# In another terminal
supabase functions logs server --project-ref lmffeqwhrnbsbhdztwyv
```

### Test Endpoints Manually
```bash
# Development
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

# Production
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health
```

---

## 📞 Get Help

### View Script Help
```bash
# Most scripts support --help
./quick-deploy.sh --help
```

### Check Deployment Status
```bash
# List deployed functions
supabase functions list

# View function details
supabase functions logs server
```

### Manual Deployment Guide
See `/DEPLOYMENT_GUIDE.md` for comprehensive manual deployment instructions

---

## ✅ Post-Deployment Checklist

After running any script:

- [ ] Backend health endpoint returns 200
- [ ] Frontend loads without errors
- [ ] Can login to admin panel
- [ ] Can create/edit data
- [ ] Environment switcher works
- [ ] No console errors
- [ ] Data persists correctly

---

## 🎉 Success!

Once deployed, you'll have:

- ✅ Backend running on Supabase Edge Functions
- ✅ Frontend deployed to your hosting platform
- ✅ Both Dev and Prod environments ready
- ✅ Health checks passing
- ✅ Full JALA 2 platform live!

**Estimated Total Time:** 5-10 minutes with `quick-deploy.sh` ⚡

---

## 💡 Pro Tips

1. **Always deploy to Dev first** - Test before production
2. **Set environment variables once** - They persist across deployments
3. **Use quick-deploy.sh for regular deploys** - It's the fastest
4. **Check logs immediately after deployment** - Catch issues early
5. **Keep the scripts updated** - Update project IDs as needed

---

## 📚 Related Documentation

- **Detailed Guide:** `/DEPLOYMENT_GUIDE.md`
- **Quick Steps:** `/DEPLOYMENT_STEPS.md`
- **Action Plan:** `/DEPLOY_NOW.md`
- **Testing:** `/WEEK1_DAY5_TESTING_CHECKLIST.md`

---

**Ready to deploy? Run `./quick-deploy.sh` and select option 1!** 🚀
