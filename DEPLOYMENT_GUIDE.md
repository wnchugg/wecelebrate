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

**Debug token in browser console:**
```javascript
// Paste this in browser console
const token = sessionStorage.getItem('jala_access_token');
if (token) {
  const parts = token.split('.');
  const header = JSON.parse(atob(parts[0]));
  const payload = JSON.parse(atob(parts[1]));
  console.log('Token Header:', header);
  console.log('Token Payload:', payload);
  console.log('Algorithm:', header.alg); // Should be "EdDSA"
}
```

### Ed25519 Key Issues

**Error**: `JWT Ed25519 private key not initialized`

**Solutions**:
1. Verify keys are set in Supabase secrets:
   ```bash
   supabase secrets list
   ```
2. Check keys are valid base64-encoded JWK format
3. Regenerate keys if corrupted
4. Redeploy Edge Function after setting keys

**Error**: `Invalid or expired token`

**Solutions**:
1. Check token expiration (24 hour default)
2. Verify frontend and backend are using same keys
3. Clear browser sessionStorage and login again
4. Check backend logs for verification errors

## Backend Deployment

The backend (Supabase Edge Functions) must be deployed separately and requires Ed25519 JWT keys.

### Step 1: Generate Ed25519 Keys (First Time Only)

The backend uses Ed25519 asymmetric keys for JWT authentication (more secure than HS256).

#### Option A: Browser Tool (Easiest)

1. Open `generate_ed25519_keys.html` in your browser
2. Click "Generate Ed25519 Key Pair"
3. Copy the `JWT_PUBLIC_KEY` and `JWT_PRIVATE_KEY` values

#### Option B: Command Line

```bash
cd supabase/functions/server
deno run --allow-all generate_ed25519_keys.ts
```

#### Option C: Online Tool

Visit https://mkjwk.org/
- Key Use: Signature
- Algorithm: EdDSA
- Curve: Ed25519
- Click "Generate"
- Copy the keys in JWK format

**Important**: Generate separate keys for each environment (dev, staging, production).

### Step 2: Configure Supabase Secrets

Add the generated keys to Supabase:

```bash
# Login to Supabase
supabase login

# Link to project (Development)
supabase link --project-ref wjfcqqrlhwdvvjmefxky

# Set Ed25519 keys (paste the base64-encoded values from Step 1)
supabase secrets set JWT_PRIVATE_KEY="eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5..."
supabase secrets set JWT_PUBLIC_KEY="eyJrdHkiOiJPS1AiLCJjcnYiOiJFZDI1NTE5..."

# Also set Supabase keys (if not already set)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set SUPABASE_ANON_KEY="your-anon-key"
```

**For Production**: Repeat with production project ID and different keys:
```bash
supabase link --project-ref [production-project-id]
supabase secrets set JWT_PRIVATE_KEY="[production-private-key]"
supabase secrets set JWT_PUBLIC_KEY="[production-public-key]"
```

### Step 3: Deploy Edge Function

```bash
# Deploy to development
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt

# Or deploy to production (after linking to prod project)
supabase functions deploy make-server-6fcaeea3 --no-verify-jwt
```

### Step 4: Verify Deployment

Check the Supabase logs for successful key loading:

```bash
# In Supabase Dashboard → Edge Functions → make-server-6fcaeea3 → Logs
# Look for:
✅ JWT Ed25519 private key loaded
✅ JWT Ed25519 public key loaded
```

Test the health endpoint:
```bash
curl https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/health

# Expected response:
# {"status":"ok","message":"JALA2 Backend is running"}
```

Test admin login:
```bash
curl -X POST https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Environment-ID: development" \
  -d '{"identifier": "test-admin@wecelebrate.test", "password": "TestPassword123!"}'

# Should return access_token and user object
```

### Ed25519 Security Benefits

- ✅ **Cryptographically secure**: Can't be guessed from public project ID
- ✅ **Asymmetric**: Private key signs, public key verifies
- ✅ **Performance**: 4x faster than HS256 (40k ops/sec vs 10k ops/sec)
- ✅ **Industry standard**: Used by GitHub, SSH, Signal, etc.

### Key Rotation (Every 90 Days)

1. Generate new Ed25519 keys
2. Add new keys to Supabase secrets
3. Deploy backend
4. Old tokens remain valid for 24 hours (grace period)
5. Remove old keys after grace period

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
