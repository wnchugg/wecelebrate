# 🚀 Netlify Deployment & CI/CD Setup Guide

## Overview

This guide will help you deploy your front-end to Netlify and set up automated CI/CD deployments from GitHub.

## Prerequisites

- ✅ GitHub repository with your code
- ✅ Netlify account (free tier works)
- ✅ Code is building successfully locally (`npm run build`)

---

## Part 1: Initial Netlify Deployment (10 minutes)

### Step 1: Create Netlify Account

1. Go to [https://netlify.com](https://netlify.com)
2. Click "Sign up" → Choose "Sign up with GitHub"
3. Authorize Netlify to access your GitHub account

### Step 2: Connect Your Repository

1. Click "Add new site" → "Import an existing project"
2. Choose "Deploy with GitHub"
3. Select your repository (e.g., `your-username/jala2-app`)
4. Authorize Netlify to access the repository

### Step 3: Configure Build Settings

Netlify should auto-detect your settings from `netlify.toml`, but verify:

```
Build command: npm run build
Publish directory: dist
```

### Step 4: Add Environment Variables

1. In Netlify dashboard, go to **Site settings → Environment variables**
2. Add these variables:

```bash
# Required
NODE_VERSION=20

# Supabase Configuration (from your .env file)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Environment identifier
VITE_ENVIRONMENT=production
```

### Step 5: Deploy!

1. Click "Deploy site"
2. Wait 2-5 minutes for build to complete
3. Your site will be live at: `https://random-name-123.netlify.app`

### Step 6: Custom Domain (Optional)

1. Go to **Site settings → Domain management**
2. Click "Add custom domain"
3. Follow DNS configuration instructions

---

## Part 2: Set Up GitHub Actions CI/CD (15 minutes)

### Step 1: Move Workflows to Correct Location

Your workflows are currently in `/workflows/` but need to be in `.github/workflows/`:

```bash
# Create .github directory if it doesn't exist
mkdir -p .github/workflows

# Move workflow files
mv workflows/*.yml .github/workflows/

# Verify
ls -la .github/workflows/
```

### Step 2: Update Netlify Deployment Workflow

Create a new workflow specifically for Netlify deployment:

```bash
# Create the file
touch .github/workflows/deploy-netlify.yml
```

I'll create this file for you with the proper configuration.

### Step 3: Get Netlify Deploy Token

1. Go to [https://app.netlify.com/user/applications](https://app.netlify.com/user/applications)
2. Click "New access token"
3. Name it: "GitHub Actions Deploy"
4. Copy the token (you'll only see it once!)

### Step 4: Get Netlify Site ID

1. Go to your site in Netlify dashboard
2. Go to **Site settings → General**
3. Copy the "Site ID" (looks like: `abc123-def456-ghi789`)

### Step 5: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings → Secrets and variables → Actions**
3. Click "New repository secret"
4. Add these secrets:

```
Name: NETLIFY_AUTH_TOKEN
Value: [paste your Netlify access token]

Name: NETLIFY_SITE_ID
Value: [paste your site ID]

Name: PRODUCTION_SUPABASE_URL
Value: https://your-project.supabase.co

Name: PRODUCTION_SUPABASE_ANON_KEY
Value: [your anon key]
```

### Step 6: Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. If prompted, click "I understand my workflows, go ahead and enable them"
3. Workflows are now active!

---

## Part 3: Test the CI/CD Pipeline (5 minutes)

### Test Automatic Deployment

```bash
# Create a test branch
git checkout -b test-netlify-deploy

# Make a small change
echo "# Testing Netlify CI/CD" >> README.md

# Commit and push
git add .
git commit -m "test: Netlify CI/CD deployment"
git push origin test-netlify-deploy

# Create Pull Request on GitHub
# Watch the CI/CD run automatically!
```

### What Happens:

1. **On Pull Request:**
   - ✅ Runs linting
   - ✅ Runs type checking
   - ✅ Runs all tests
   - ✅ Builds the app
   - ✅ Creates preview deployment on Netlify

2. **On Merge to Main:**
   - ✅ Runs full CI/CD pipeline
   - ✅ Deploys to production Netlify site
   - ✅ Runs smoke tests

### View Deployment Status

1. **GitHub:** Go to Actions tab to see workflow progress
2. **Netlify:** Go to Deploys tab to see deployment status
3. **Preview:** Each PR gets a unique preview URL

---

## Part 4: Deployment Workflow Explained

### Automatic Triggers

```yaml
# Deploys to production on push to main
on:
  push:
    branches: [main]

# Creates preview deployment on PRs
on:
  pull_request:
    branches: [main]
```

### Deployment Process

1. **Checkout code** from GitHub
2. **Install dependencies** (`npm ci`)
3. **Run tests** (optional, can skip for faster deploys)
4. **Build application** (`npm run build`)
5. **Deploy to Netlify** using Netlify CLI
6. **Run smoke tests** on deployed site

### Build Time

- **With tests:** ~15-20 minutes
- **Without tests:** ~3-5 minutes

---

## Part 5: Advanced Configuration

### Deploy Previews for PRs

Already configured in your `netlify.toml`:

```toml
[context.deploy-preview]
  command = "npm run build"
  
[context.branch-deploy]
  command = "npm run build"
```

Every PR automatically gets a preview URL like:
`https://deploy-preview-123--your-site.netlify.app`

### Environment-Specific Builds

Create different build commands for different environments:

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production"
  }
}
```

### Rollback Deployments

If something goes wrong:

1. Go to Netlify dashboard → **Deploys**
2. Find the last working deployment
3. Click "..." → "Publish deploy"
4. Site instantly rolls back!

---

## Part 6: Monitoring & Notifications

### Netlify Deploy Notifications

1. Go to **Site settings → Build & deploy → Deploy notifications**
2. Add notifications for:
   - Deploy started
   - Deploy succeeded
   - Deploy failed

Options:
- Email
- Slack
- Webhook

### GitHub Status Checks

Add status badge to README.md:

```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
```

### Slack Integration

1. Create Slack webhook
2. Add to GitHub Secrets as `SLACK_WEBHOOK_URL`
3. Workflow will send notifications on deploy success/failure

---

## Part 7: Troubleshooting

### Build Fails on Netlify

**Check build logs:**
1. Go to Deploys tab
2. Click failed deploy
3. View deploy log

**Common issues:**

1. **Missing environment variables**
   ```
   Solution: Add to Site settings → Environment variables
   ```

2. **Node version mismatch**
   ```
   Solution: Set NODE_VERSION=20 in environment variables
   ```

3. **Build command fails**
   ```
   Solution: Test locally with: npm run build
   ```

### Deploy Succeeds but Site Broken

**Check browser console:**
- Look for API errors
- Check network tab for failed requests

**Common issues:**

1. **Wrong Supabase URL**
   ```
   Solution: Verify VITE_SUPABASE_URL in environment variables
   ```

2. **CORS errors**
   ```
   Solution: Add Netlify URL to Supabase allowed origins
   ```

3. **404 on routes**
   ```
   Solution: Verify netlify.toml has redirect rules (already configured)
   ```

### Slow Builds

**Optimization tips:**

1. **Enable build cache:**
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [build.processing]
     skip_processing = false
   ```

2. **Use pnpm instead of npm:**
   ```toml
   [build.environment]
     NPM_FLAGS = "--prefer-offline --no-audit"
   ```

3. **Skip tests in deploy workflow:**
   ```yaml
   # Comment out test steps for faster deploys
   # - name: Run tests
   #   run: npm test
   ```

---

## Part 8: Security Best Practices

### Environment Variables

✅ **DO:**
- Store all secrets in Netlify environment variables
- Use different keys for staging/production
- Rotate keys regularly

❌ **DON'T:**
- Commit secrets to Git
- Share secrets in plain text
- Use production keys in development

### Access Control

1. **Netlify site access:**
   - Go to Site settings → Access control
   - Add password protection for staging sites
   - Use Netlify Identity for user authentication

2. **GitHub repository:**
   - Enable branch protection on `main`
   - Require PR reviews
   - Require status checks to pass

---

## Part 9: Cost Optimization

### Netlify Free Tier Includes:

- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ Deploy previews
- ✅ HTTPS
- ✅ Custom domains

### Tips to Stay Within Free Tier:

1. **Optimize build time:**
   - Cache dependencies
   - Skip unnecessary steps
   - Use incremental builds

2. **Optimize bandwidth:**
   - Enable compression (already configured)
   - Use CDN caching (automatic)
   - Optimize images

3. **Monitor usage:**
   - Check Netlify dashboard → Usage
   - Set up alerts for 80% usage

---

## Part 10: Verification Checklist

After setup, verify everything works:

### Deployment Checklist

- [ ] Site deploys successfully to Netlify
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enabled (automatic)
- [ ] Environment variables set correctly
- [ ] Site loads without errors
- [ ] All routes work (no 404s)
- [ ] API calls succeed
- [ ] Login/authentication works

### CI/CD Checklist

- [ ] GitHub Actions workflows in `.github/workflows/`
- [ ] Netlify secrets added to GitHub
- [ ] Push to `main` triggers deployment
- [ ] PRs create preview deployments
- [ ] Status checks pass before merge
- [ ] Deploy notifications working
- [ ] Rollback tested and working

### Performance Checklist

- [ ] Build time < 5 minutes
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Mobile responsive

---

## Quick Commands Reference

```bash
# Test build locally
npm run build

# Test production build
npm run build:production

# Preview build locally
npm run preview

# Check for errors
npm run lint
npm run type-check

# Run tests
npm test

# Deploy manually (if needed)
netlify deploy --prod --dir=dist
```

---

## Next Steps

1. ✅ Complete initial Netlify deployment
2. ✅ Set up GitHub Actions CI/CD
3. ✅ Test with a pull request
4. ✅ Configure custom domain (optional)
5. ✅ Set up monitoring and alerts
6. ✅ Document deployment process for team

---

## Support Resources

- **Netlify Docs:** https://docs.netlify.com
- **GitHub Actions Docs:** https://docs.github.com/actions
- **Your existing guides:**
  - `NETLIFY_DEPLOYMENT_GUIDE.md` - Detailed Netlify setup
  - `CI_CD_SETUP_GUIDE.md` - Complete CI/CD configuration
  - `DEPLOYMENT_GUIDE.md` - General deployment instructions

---

## Success! 🎉

You now have:
- ✅ Automated deployments to Netlify
- ✅ Preview deployments for every PR
- ✅ Continuous integration testing
- ✅ One-click rollbacks
- ✅ Production-ready infrastructure

**Your site is live and automatically deploying!** 🚀
