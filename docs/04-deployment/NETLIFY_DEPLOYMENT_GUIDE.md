# 🚀 Netlify Deployment Guide - JALA 2

## Current Deployment
- **Site:** https://jala2-dev.netlify.app/
- **Status:** Active
- **Backend:** Development Supabase (wjfcqqrlhwdvvjmefxky)

---

## 📋 Prerequisites

You need:
1. **Git repository** connected to Netlify
2. **Netlify account** with access to jala2-dev site
3. **Code changes** from Figma Make exported to your repository

---

## 🔄 Deployment Methods

### **Method 1: Git Push (RECOMMENDED)**

If your Netlify site is connected to a Git repository (GitHub, GitLab, Bitbucket):

#### Step 1: Export Code from Figma Make

1. In **Figma Make**, click the **Export** button (top-right)
2. Download the code as a ZIP file
3. Extract the ZIP to your local machine

#### Step 2: Copy to Your Git Repository

```bash
# Navigate to your local git repository
cd /path/to/your/jala2-repo

# Copy all files from Figma Make export (replace /path/to/extracted/zip)
cp -r /path/to/extracted/zip/* .

# Check what changed
git status

# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Fix JWT authentication - auto token cleanup and migration"

# Push to your main/master branch
git push origin main
```

#### Step 3: Netlify Auto-Deploys

- Netlify detects the push
- Automatically runs `npm run build`
- Deploys to https://jala2-dev.netlify.app/
- Usually takes 1-3 minutes

#### Step 4: Verify Deployment

1. Go to https://app.netlify.com/sites/jala2-dev/deploys
2. Wait for deployment to complete (green checkmark)
3. Visit https://jala2-dev.netlify.app/
4. Check browser console - old tokens should auto-clear!

---

### **Method 2: Netlify CLI (MANUAL)**

If you don't have Git connected or want to deploy directly:

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify

```bash
netlify login
```

This opens a browser window - authorize the CLI.

#### Step 3: Export and Build

```bash
# Navigate to your Figma Make export directory
cd /path/to/figma-make-export

# Install dependencies
npm install

# Build the project
npm run build
```

#### Step 4: Deploy

```bash
# Deploy to your existing site
netlify deploy --prod --site jala2-dev

# When prompted for publish directory, enter:
dist
```

#### Step 5: Verify

Visit https://jala2-dev.netlify.app/ - deployment complete!

---

### **Method 3: Netlify Drop (SIMPLEST)**

For quick manual deployments:

#### Step 1: Build Locally

```bash
cd /path/to/figma-make-export
npm install
npm run build
```

#### Step 2: Upload to Netlify

1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder onto the page
3. Wait for upload to complete
4. Netlify provides a temporary URL

⚠️ **Warning:** This creates a NEW site, not updating jala2-dev. Use Method 1 or 2 instead.

---

## 🧪 Testing in Figma Make Preview

You mentioned you're testing in the Figma Make interface. Here's how the token migration works there:

### **Automatic Token Cleanup**

When you load the app in Figma Make preview:

1. **App loads** → `App.tsx` runs migration
2. **Checks for token** → If exists, validates issuer
3. **Old token?** → Automatically cleared
4. **User redirected** → Login page
5. **Fresh login** → New valid token

### **What You'll See in Console:**

If you have an old token:
```
[Token Migration] Clearing token from old backend instance
[Token Migration] Old issuer: https://lmffeqwhrnbsbhdztwyv.supabase.co/auth/v1
[Token Migration] Expected issuer: wjfcqqrlhwdvvjmefxky
```

If no token or valid token:
```
(No migration messages - everything is fine)
```

### **To Force Clear in Figma Make:**

If you need to manually clear tokens in the preview:

1. Open **browser DevTools** (F12) in the preview iframe
2. Go to **Console** tab
3. Run:
   ```javascript
   sessionStorage.clear();
   localStorage.clear();
   location.reload();
   ```

---

## 🔍 Verify Deployment Worked

After deploying to Netlify, check:

### 1. **Backend Connection**

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZmNxcXJsaHdkdnZqbWVmeGt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTQ4NjgsImV4cCI6MjA4NTkzMDg2OH0.utZqFFSYWNkpiHsvU8qQbu4-abPZ41hAZhNL1XDv6ec" \
  https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

Should return:
```json
{"status":"ok","environment":"development",...}
```

### 2. **Frontend Loads**

Visit https://jala2-dev.netlify.app/

- Page loads without errors
- No 401 errors in console
- Can navigate to /admin/login

### 3. **Login Works**

1. Go to https://jala2-dev.netlify.app/admin/login
2. Login with:
   - **Email:** `admin@example.com`
   - **Password:** `Admin123!`
3. Should see admin dashboard
4. Check console - no 401 errors

### 4. **Token is Valid**

In browser console:
```javascript
const token = sessionStorage.getItem('jala_access_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('✅ Token issuer:', payload.iss);
  // Should show: https://wjfcqqrlhwdvvjmefxky.supabase.co/auth/v1
}
```

---

## 📊 Current Build Configuration

Your `netlify.toml` is already configured:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "20"
```

This means Netlify will:
1. Install dependencies (`npm install`)
2. Run build command (`npm run build`)
3. Deploy the `dist` folder
4. Apply redirects for React Router

---

## ⚙️ Environment Variables (If Needed)

If you need to set environment variables in Netlify:

1. Go to https://app.netlify.com/sites/jala2-dev/settings
2. Click **Environment variables**
3. Add any needed variables (usually not needed for frontend-only changes)

---

## 🚨 Common Issues

### **Issue: Build Fails**

Check Netlify build logs:
1. Go to https://app.netlify.com/sites/jala2-dev/deploys
2. Click the failed deploy
3. Check **Deploy log** for errors

Common fixes:
- Ensure `package.json` is included
- Check Node version compatibility
- Verify all dependencies are installed

### **Issue: 404 on Routes**

This means `netlify.toml` redirects aren't working:
- Ensure `netlify.toml` is in repository root
- Check redirect rule is present (already configured in yours)

### **Issue: Old Code Showing**

Clear Netlify cache:
```bash
netlify build --clear-cache
```

Or in Netlify UI:
1. Go to Site settings → Build & deploy
2. Click "Clear cache and retry deploy"

---

## 📝 Deployment Checklist

Before deploying:

- [ ] All changes saved in Figma Make
- [ ] Code exported from Figma Make
- [ ] Code copied to Git repository
- [ ] Changes committed
- [ ] Pushed to main branch
- [ ] Netlify build triggered
- [ ] Build completed successfully (green checkmark)
- [ ] Site loads at https://jala2-dev.netlify.app/
- [ ] Login works
- [ ] No 401 errors in console
- [ ] Token migration working

---

## 🎯 Recommended Workflow

For ongoing development:

1. **Make changes in Figma Make**
2. **Export code** (download ZIP)
3. **Copy to Git repo** and commit
4. **Push to GitHub/GitLab**
5. **Netlify auto-deploys** (1-3 min)
6. **Test on live site** (https://jala2-dev.netlify.app/)

This keeps your Git repo as source of truth and enables:
- ✅ Version control
- ✅ Automatic deployments
- ✅ Rollback capability
- ✅ Deployment history

---

## 🔗 Useful Links

- **Live Site:** https://jala2-dev.netlify.app/
- **Netlify Dashboard:** https://app.netlify.com/sites/jala2-dev
- **Deployment Logs:** https://app.netlify.com/sites/jala2-dev/deploys
- **Backend Health:** https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

---

## ✅ Next Steps

1. **Export code from Figma Make** (if you haven't already)
2. **Choose deployment method** (Git push recommended)
3. **Deploy to Netlify**
4. **Test the live site**
5. **Verify token migration works**
6. **Login and test admin features**

The token migration will automatically clear old tokens when users visit the site! 🎉
