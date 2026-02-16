# Deployment Guide

## Overview

This project uses a multi-environment deployment strategy with Git branches mapped to different Netlify deployments.

## Branch → Environment Mapping

| Branch | Environment | Netlify Site | Purpose |
|--------|-------------|--------------|---------|
| `production` | Production | wecelebrate.netlify.app | Live users |
| `main` | Staging | wecelebrate-staging.netlify.app | Pre-production testing |
| `development` | Development | wecelebrate-dev.netlify.app | Active development |

## Prerequisites

- Node.js 20+
- Git access to repository
- Netlify account with site access
- Supabase project credentials

## Environment Variables

Each Netlify site needs these environment variables configured:

### Required for All Environments
```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
NODE_VERSION=20
```

### Development Environment
```
VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=[dev-anon-key]
NODE_ENV=development
```

### Staging Environment (main branch)
```
VITE_SUPABASE_URL=https://wjfcqqrlhwdvvjmefxky.supabase.co
VITE_SUPABASE_ANON_KEY=[staging-anon-key]
NODE_ENV=staging
```

### Production Environment
```
VITE_SUPABASE_URL=https://[prod-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[prod-anon-key]
NODE_ENV=production
```

## Deployment Workflows

### 1. Development Deployment (Continuous)

Development branch auto-deploys on every push:

```bash
# Switch to development branch
git checkout development

# Make changes
git add .
git commit -m "feat: description"

# Push to trigger deployment
git push origin development
```

**Result**: Automatically deploys to development site within 2-5 minutes.

### 2. Staging Deployment (Weekly/As Needed)

Merge development to main for staging testing:

```bash
# Ensure development is up to date
git checkout development
git pull origin development

# Switch to main and merge
git checkout main
git pull origin main
git merge development

# Push to trigger staging deployment
git push origin main
```

**Result**: Automatically deploys to staging site for QA testing.

### 3. Production Deployment (Release)

Merge main to production after thorough testing:

```bash
# Ensure main is tested and ready
git checkout main
git pull origin main

# Switch to production and merge
git checkout production
git pull origin production
git merge main

# Tag the release
git tag -a v1.0.0 -m "Release v1.0.0"

# Push to trigger production deployment
git push origin production
git push origin --tags
```

**Result**: Automatically deploys to production site.

## Netlify Configuration

### Site Settings

1. **Go to Netlify Dashboard** → Your Site → Site Settings

2. **Build & Deploy** → **Deploy Contexts**:
   - Production branch: `production`
   - Branch deploys: `development`, `main`
   - Deploy previews: All pull requests

3. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `20`

4. **Environment Variables**:
   - Configure per branch (see above)
   - Use "Scoped to branch" feature for branch-specific values

### Branch Protection (GitHub)

Protect important branches:

1. **Go to GitHub** → Settings → Branches → Add rule

2. **For `production` branch**:
   - ✅ Require pull request reviews (2 approvals)
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators

3. **For `main` branch**:
   - ✅ Require pull request reviews (1 approval)
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

## Rollback Procedures

### Quick Rollback (Netlify UI)

1. Go to Netlify Dashboard → Deploys
2. Find the last working deployment
3. Click "Publish deploy"

### Git Rollback

```bash
# Find the commit to rollback to
git log --oneline

# Revert to specific commit
git checkout production
git revert [bad-commit-hash]
git push origin production
```

### Emergency Rollback

```bash
# Hard reset to previous commit (use with caution)
git checkout production
git reset --hard [good-commit-hash]
git push origin production --force
```

## Monitoring

### Post-Deployment Checks

After each deployment, verify:

1. **Build Success**: Check Netlify deploy log
2. **Site Loads**: Visit the deployed URL
3. **Admin Login**: Test with test credentials
4. **API Connectivity**: Check browser console for errors
5. **Key Features**: Test critical user flows

### Health Check Endpoints

```bash
# Backend health check
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

# Expected response:
# {"status":"ok","message":"JALA2 Backend is running"}
```

## Troubleshooting

### Build Fails

1. Check Netlify build log for errors
2. Verify Node version is 20
3. Check for missing environment variables
4. Test build locally: `npm run build`

### Site Loads But Blank Page

1. Check browser console for errors
2. Verify environment variables are set
3. Check CSP headers in netlify.toml
4. Verify Supabase URL is correct

### API Errors (401/403)

1. Verify Supabase anon key is correct
2. Check backend Edge Function is deployed
3. Verify JWT keys are set in Supabase secrets
4. Check CORS configuration

### Token Validation Errors

1. Check browser console for token algorithm
2. Verify backend is using Ed25519 (EdDSA)
3. Ensure frontend accepts EdDSA tokens
4. Clear browser cache and sessionStorage

## Backend Deployment

The backend (Supabase Edge Functions) must be deployed separately:

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref wjfcqqrlhwdvvjmefxky

# Set secrets (Ed25519 keys)
supabase secrets set JWT_PRIVATE_KEY="[base64-encoded-private-key]"
supabase secrets set JWT_PUBLIC_KEY="[base64-encoded-public-key]"

# Deploy Edge Function
supabase functions deploy make-server-6fcaeea3

# Verify deployment
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health
```

## CI/CD Pipeline (Future)

Consider adding GitHub Actions for:

- Automated testing on PR
- Automated deployment to staging
- Manual approval for production
- Automated rollback on failure

Example workflow location: `.github/workflows/deploy.yml`

## Support

For deployment issues:
1. Check Netlify deploy logs
2. Check Supabase Edge Function logs
3. Review browser console errors
4. Contact DevOps team

## Related Documentation

- [Branching Strategy](./BRANCHING_STRATEGY.md)
- [Backend Deployment](./BACKEND_DEPLOYMENT_SOLUTION.md)
- [Environment Configuration](./ADMIN_ENVIRONMENT_CONFIG_GUIDE.md)
