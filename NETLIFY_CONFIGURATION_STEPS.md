# Netlify Configuration Steps

Step-by-step guide to configure Netlify for the multi-branch deployment strategy.

---

## Overview

You have two options:
1. **Single Site with Branch Deploys** (Simpler, recommended for now)
2. **Multiple Sites** (One per environment, more isolated)

We'll start with Option 1, which is easier to set up.

---

## Option 1: Single Site with Branch Deploys (Recommended)

### Step 1: Configure Production Branch

1. Go to **Netlify Dashboard** → Your Site (wecelebrate)
2. Click **Site Settings** → **Build & Deploy** → **Continuous Deployment**
3. Under **Deploy Contexts**, find **Production branch**
4. Click **Edit settings**
5. Change from `main` to `production`
6. Click **Save**

**Result**: Only the `production` branch will deploy to your main site URL.

### Step 2: Enable Branch Deploys

1. Still in **Build & Deploy** → **Continuous Deployment**
2. Scroll to **Branch deploys**
3. Click **Edit settings**
4. Select **Let me add individual branches**
5. Add these branches:
   - `development`
   - `main`
6. Click **Save**

**Result**: Each branch gets its own preview URL:
- `production` → `wecelebrate.netlify.app` (main URL)
- `main` → `main--wecelebrate.netlify.app`
- `development` → `development--wecelebrate.netlify.app`

### Step 3: Enable Deploy Previews (Optional)

1. Still in **Branch deploys** section
2. Find **Deploy previews**
3. Select **Any pull request against your production branch**
4. Click **Save**

**Result**: Pull requests get preview URLs for testing.

### Step 4: Configure Environment Variables

You need to set different Supabase credentials per branch.

#### Method A: Branch-Specific Variables (Recommended)

1. Go to **Site Settings** → **Environment Variables**
2. Click **Add a variable**

**For Development Branch:**
```
Key: VITE_SUPABASE_URL
Value: https://wjfcqqrlhwdvvjmefxky.supabase.co
Scopes: Select "development" branch only
```

```
Key: VITE_SUPABASE_ANON_KEY
Value: [your-dev-anon-key]
Scopes: Select "development" branch only
```

**For Main Branch (Staging):**
```
Key: VITE_SUPABASE_URL
Value: https://wjfcqqrlhwdvvjmefxky.supabase.co
Scopes: Select "main" branch only
```

```
Key: VITE_SUPABASE_ANON_KEY
Value: [your-staging-anon-key]
Scopes: Select "main" branch only
```

**For Production Branch:**
```
Key: VITE_SUPABASE_URL
Value: https://[production-project-id].supabase.co
Scopes: Select "production" branch only
```

```
Key: VITE_SUPABASE_ANON_KEY
Value: [your-prod-anon-key]
Scopes: Select "production" branch only
```

#### Method B: Same Variables for All (Simpler, for now)

If you're using the same Supabase project for all environments:

1. Go to **Site Settings** → **Environment Variables**
2. Add these variables with scope **All**:

```
VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
NODE_VERSION=20
```

### Step 5: Verify Build Settings

1. Go to **Site Settings** → **Build & Deploy** → **Build Settings**
2. Verify:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: Set in environment variables (20)

### Step 6: Test the Setup

1. Push to development branch:
   ```bash
   git push origin development
   ```

2. Go to **Deploys** tab in Netlify
3. You should see a new deploy starting
4. Wait for it to complete (2-5 minutes)
5. Click on the deploy to see the preview URL
6. Test the site at the preview URL

---

## Option 2: Multiple Sites (Advanced)

If you want complete isolation between environments:

### Create Development Site

1. Go to **Netlify Dashboard** → **Add new site**
2. Choose **Import an existing project**
3. Connect to your GitHub repository
4. Configure:
   - **Branch to deploy**: `development`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Set environment variables for development
6. Click **Deploy site**
7. Rename site to `wecelebrate-dev`

### Create Staging Site

1. Repeat above steps with:
   - **Branch to deploy**: `main`
   - **Site name**: `wecelebrate-staging`
   - Environment variables for staging

### Keep Production Site

1. Your existing site stays as production
2. Change production branch to `production`
3. Set production environment variables

**Result**: Three completely separate sites with their own URLs and settings.

---

## Current Recommended Setup

For now, I recommend **Option 1** with **Method B** (same variables):

1. ✅ Change production branch to `production`
2. ✅ Add `development` and `main` to branch deploys
3. ✅ Set environment variables (same for all branches for now)
4. ✅ Push to development and test

Later, you can:
- Add branch-specific environment variables
- Or create separate sites for complete isolation

---

## Quick Setup Checklist

- [ ] Change production branch to `production`
- [ ] Add `development` branch to branch deploys
- [ ] Add `main` branch to branch deploys
- [ ] Verify environment variables are set
- [ ] Push to development branch
- [ ] Check deploy succeeds
- [ ] Test preview URL
- [ ] Verify admin login works

---

## URLs After Setup

With Option 1 (Single Site):
- **Production**: `https://wecelebrate.netlify.app`
- **Staging**: `https://main--wecelebrate.netlify.app`
- **Development**: `https://development--wecelebrate.netlify.app`

With Option 2 (Multiple Sites):
- **Production**: `https://wecelebrate.netlify.app`
- **Staging**: `https://wecelebrate-staging.netlify.app`
- **Development**: `https://wecelebrate-dev.netlify.app`

---

## Troubleshooting

### Deploy Fails with "Branch not found"

**Solution**: Make sure you've pushed the branch to GitHub:
```bash
git push origin development
git push origin main
git push origin production
```

### Environment Variables Not Working

**Solution**: 
1. Check they're set in Netlify UI
2. Verify scope is correct (All or specific branch)
3. Redeploy after changing variables

### Wrong Branch Deploying to Production

**Solution**:
1. Go to Site Settings → Build & Deploy
2. Verify Production branch is set to `production`
3. Clear cache and redeploy

### Preview URL Not Working

**Solution**:
1. Verify branch deploys are enabled
2. Check the branch is in the allowed list
3. Wait a few minutes for DNS propagation

---

## Next Steps

After Netlify is configured:

1. **Push to development**:
   ```bash
   git push origin development
   ```

2. **Wait for deploy** (check Netlify dashboard)

3. **Test the preview URL**:
   - Visit `https://development--wecelebrate.netlify.app`
   - Try admin login
   - Check browser console for token algorithm

4. **If successful**, merge to main for staging testing

5. **If staging passes**, merge to production for release

---

## Support

If you get stuck:
1. Check Netlify deploy logs for errors
2. Verify environment variables are set
3. Test build locally: `npm run build`
4. Check GitHub branch exists: `git branch -a`

---

## Related Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Branching Strategy](./BRANCHING_STRATEGY.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
