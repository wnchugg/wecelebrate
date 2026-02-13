# 🔧 Troubleshooting Guide

## Common Deployment Issues & Solutions

---

## ❌ Error: "index.ts: no such file or directory"

### Problem
```
WARN: failed to read file: open supabase/functions/server/index.ts: no such file or directory
unexpected deploy status 400: {"message":"Entrypoint path does not exist..."}
```

### Cause
Figma Make creates `.tsx` files, but Supabase Edge Functions need `.ts` files.

### ✅ Solution
The **updated `quick-deploy.sh` script now handles this automatically!**

Just run:
```bash
./quick-deploy.sh
```

The script will:
1. ✅ Convert all `.tsx` files to `.ts`
2. ✅ Update import statements
3. ✅ Deploy to Supabase

### What It Does Behind the Scenes
```bash
# Creates .deploy-temp/ folder
# Copies .tsx files as .ts files
# Updates imports: from "./file.tsx" → from "./file.ts"
# Deploys from temp folder
# Cleans up automatically
```

---

## ❌ Error: "Supabase CLI not found"

### Problem
```
supabase: command not found
```

### ✅ Solution
```bash
# Install Supabase CLI globally
npm install -g supabase

# Verify installation
supabase --version
```

---

## ❌ Error: "Not logged in"

### Problem
```
Error: Not logged in
```

### ✅ Solution
```bash
# Login to Supabase
supabase login

# This will open your browser
# Login with your Supabase account
# Return to terminal - you should see "Logged in"
```

---

## ❌ Error: "Health check failed"

### Problem
```
⚠️  Development health check failed
```

### Possible Causes
1. Environment variables not set
2. Function still deploying
3. Database connection issue

### ✅ Solution

**1. Check environment variables are set:**
- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions
- Verify these secrets exist:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_DB_URL`
  - `ALLOWED_ORIGINS`
  - `SEED_ON_STARTUP`

**2. Wait and retry:**
```bash
# Sometimes functions need a moment to initialize
sleep 10

# Test manually
curl https://PROJECT_ID.supabase.co/functions/v1/make-server-6fcaeea3/health
```

**3. Check logs:**
```bash
supabase functions logs server --project-ref PROJECT_ID
```

**4. Redeploy:**
```bash
./quick-deploy.sh
# Select option 2 (Backend only)
```

---

## ❌ Error: "Build failed - dist/ folder not created"

### Problem
```
❌ Build failed - dist/ folder not created
```

### ✅ Solution
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build

# If that doesn't work, check for errors
npm run build 2>&1 | tee build.log
```

---

## ❌ Error: "Permission denied" when running script

### Problem
```
-bash: ./quick-deploy.sh: Permission denied
```

### ✅ Solution
```bash
# Make script executable
chmod +x quick-deploy.sh

# Now run it
./quick-deploy.sh
```

---

## ❌ Error: CORS errors in browser

### Problem
```
Access to fetch at '...' has been blocked by CORS policy
```

### ✅ Solution

**1. Update ALLOWED_ORIGINS:**
- Go to Supabase Dashboard → Settings → Edge Functions
- Update `ALLOWED_ORIGINS` secret:
  - Development: `*` (allow all)
  - Production: `https://yourdomain.com`

**2. Redeploy backend:**
```bash
./quick-deploy.sh
# Select option 2 (Backend only)
```

**3. Clear browser cache:**
- Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Clear cached files
- Reload page

---

## ❌ Error: Frontend shows white screen

### Problem
App loads but shows blank white page

### ✅ Solution

**1. Check browser console (F12):**
- Look for error messages
- Note which file/request is failing

**2. Verify backend is deployed:**
```bash
curl https://lmffeqwhrnbsbhdztwyv.supabase.co/functions/v1/make-server-6fcaeea3/health
```

**3. Check environment configuration:**
- Open `/src/app/config/environments.ts`
- Verify URLs and keys are correct

**4. Clear browser cache and hard reload:**
- Press Ctrl+Shift+R (Cmd+Shift+R on Mac)

**5. Rebuild and redeploy frontend:**
```bash
rm -rf dist
npm run build
netlify deploy --prod --dir=dist
```

---

## ❌ Error: "Cannot find module" in backend logs

### Problem
```
Error: Cannot find module './kv_store.ts'
```

### Cause
Import statement still references `.tsx` instead of `.ts`

### ✅ Solution
The script should handle this, but if it doesn't:

**Manual fix:**
```bash
# Check the .deploy-temp folder
ls -la .deploy-temp/supabase/functions/server/

# Verify all files are .ts
# If you see .tsx files, the conversion failed

# Delete temp and try again
rm -rf .deploy-temp
./quick-deploy.sh
```

---

## ❌ Error: "Deployment timed out"

### Problem
```
Error: Deployment timed out after 60s
```

### ✅ Solution

**1. Try again (temporary issue):**
```bash
./quick-deploy.sh
```

**2. Check Supabase status:**
- Visit: https://status.supabase.com
- Check if there are any ongoing incidents

**3. Deploy manually:**
```bash
cd .deploy-temp
supabase functions deploy server --project-ref YOUR_PROJECT_ID
```

---

## ❌ Error: "npm install" fails

### Problem
```
npm ERR! code EACCES
npm ERR! syscall access
```

### ✅ Solution

**Option 1: Fix npm permissions**
```bash
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

**Option 2: Use sudo (not recommended)**
```bash
sudo npm install -g supabase
```

**Option 3: Use nvm (recommended)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js via nvm
nvm install 18
nvm use 18

# Now install without sudo
npm install -g supabase
```

---

## ❌ Error: ".deploy-temp already exists"

### Problem
```
Error: .deploy-temp directory already exists
```

### ✅ Solution
```bash
# Remove temp directory
rm -rf .deploy-temp

# Run script again
./quick-deploy.sh
```

The script should clean this up automatically, but if it doesn't, manual removal works.

---

## ❌ Error: "Function size too large"

### Problem
```
Error: Function size exceeds 50MB limit
```

### ✅ Solution

**1. Check what's being deployed:**
```bash
du -sh .deploy-temp/supabase/functions/server/*
```

**2. Remove unnecessary files:**
- The script should only copy necessary files
- Check if large .md or other files are being included

**3. Optimize imports:**
- Use specific imports instead of `import *`
- Remove unused dependencies

---

## 🆘 Still Having Issues?

### Check These Common Mistakes

1. **Not in the right directory:**
```bash
# Verify you're in project root
ls -la
# Should see: supabase/ src/ package.json quick-deploy.sh
```

2. **Environment variables not set:**
```bash
# Go to Supabase Dashboard
# Settings → Edge Functions → Secrets
# Verify ALL variables are set
```

3. **Wrong Supabase project:**
```bash
# Verify project IDs in script match your projects
# Edit quick-deploy.sh if needed:
# DEV_PROJECT="wjfcqqrlhwdvvjmefxky"
# PROD_PROJECT="lmffeqwhrnbsbhdztwyv"
```

4. **Outdated Supabase CLI:**
```bash
# Update CLI
npm install -g supabase@latest

# Verify version
supabase --version
```

---

## 📊 Debug Checklist

When something goes wrong, check:

- [ ] Are you in the project root directory?
- [ ] Is Supabase CLI installed? (`supabase --version`)
- [ ] Are you logged in? (`supabase projects list`)
- [ ] Are environment variables set in Supabase Dashboard?
- [ ] Does `supabase/functions/server/` exist?
- [ ] Do `.tsx` files exist in that folder?
- [ ] Is the script executable? (`ls -la quick-deploy.sh`)
- [ ] Is your internet connection stable?
- [ ] Is Supabase status OK? (https://status.supabase.com)

---

## 🔍 View Detailed Logs

### Backend Deployment Logs
```bash
# View real-time logs
supabase functions logs server --project-ref wjfcqqrlhwdvvjmefxky

# View last 100 lines
supabase functions logs server --project-ref wjfcqqrlhwdvvjmefxky --limit 100
```

### Frontend Build Logs
```bash
# Verbose build output
npm run build -- --debug

# Save to file
npm run build 2>&1 | tee build.log
```

### Deployment Script Debug Mode
```bash
# Run with debug output
bash -x ./quick-deploy.sh
```

---

## 💡 Pro Tips

1. **Always deploy to Dev first**
   - Test in development before production
   - Catch issues early

2. **Check logs immediately after deployment**
   - Watch for any error messages
   - Verify requests are being processed

3. **Keep environment variables in sync**
   - Document your variables
   - Use same structure for Dev and Prod

4. **Use git to track changes**
   - Commit before deploying
   - Easy to rollback if needed

5. **Test locally before deploying**
   - Run `npm run dev` to test frontend
   - Verify no build errors

---

## 📞 Getting Help

### 1. Check Documentation
- `/START_HERE.md` - Quick start
- `/DEPLOYMENT_GUIDE.md` - Full guide
- `/DEPLOYMENT_CHECKLIST.md` - Step-by-step

### 2. Check Supabase Docs
- https://supabase.com/docs/guides/functions
- https://supabase.com/docs/reference/cli

### 3. View Logs
```bash
# Backend logs
supabase functions logs server

# Check what was deployed
ls -la .deploy-temp/supabase/functions/server/
```

### 4. Manual Deployment (Last Resort)
If the script fails, deploy manually:

```bash
# 1. Convert files manually
mkdir -p deploy/supabase/functions/server
cp supabase/functions/server/*.tsx deploy/supabase/functions/server/
cd deploy/supabase/functions/server/
for f in *.tsx; do mv "$f" "${f%.tsx}.ts"; done

# 2. Fix imports manually
# Use a text editor to change all .tsx to .ts in import statements

# 3. Deploy manually
cd deploy
supabase functions deploy server --project-ref YOUR_PROJECT_ID
```

---

**Most issues are resolved by:**
1. ✅ Ensuring environment variables are set
2. ✅ Running the updated `quick-deploy.sh` script
3. ✅ Checking logs for specific errors
4. ✅ Retrying the deployment

**The script now handles .tsx → .ts conversion automatically!** 🎉
