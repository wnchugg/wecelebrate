# Environment Variables - Deployment Checklist

Use this checklist when deploying to staging or production environments.

## Pre-Deployment Checklist

### 1. Environment Variables Review

- [ ] All required `VITE_*` variables are defined
- [ ] No hardcoded secrets remain in code
- [ ] `.env.local` is in `.gitignore` and not committed
- [ ] `.env.example` is up to date with all variables
- [ ] TypeScript types in `src/env.d.ts` match available variables

### 2. Staging Environment

- [ ] `VITE_APP_ENV=staging` is set
- [ ] `VITE_API_URL` points to staging API
- [ ] Staging Supabase credentials are configured
- [ ] Analytics keys are set (if using analytics)
- [ ] Error monitoring is configured
- [ ] Test build runs successfully: `VITE_APP_ENV=staging npm run build`
- [ ] Environment validation passes

### 3. Production Environment

- [ ] `VITE_APP_ENV=production` is set
- [ ] `VITE_API_URL` points to production API
- [ ] Production Supabase credentials are configured
- [ ] All analytics integrations are configured
- [ ] Error monitoring is fully configured
- [ ] Debug logging is disabled (`VITE_ENABLE_DEBUG_LOGGING=false`)
- [ ] Production build runs successfully: `VITE_APP_ENV=production npm run build`
- [ ] Environment validation passes
- [ ] All production credentials are different from staging/dev

### 4. Security Review

- [ ] No API keys or secrets in source code
- [ ] No credentials in git history
- [ ] Environment variables follow naming convention (VITE_*)
- [ ] Sensitive variables are only in hosting platform, not in repo
- [ ] API keys are properly scoped (read-only where possible)
- [ ] Rate limiting is configured for public API keys
- [ ] CORS settings are properly configured

### 5. CI/CD Configuration

- [ ] All `VITE_*` variables are set in CI/CD platform
- [ ] Secrets are stored in platform's secret management
- [ ] Build command includes environment variables
- [ ] Deploy previews use staging environment
- [ ] Production deployments use production environment

## Platform-Specific Checklists

### Vercel

1. Go to **Project Settings → Environment Variables**
2. Add variables for each environment:
   - Production
   - Preview (Staging)
   - Development

Required variables:
```
VITE_APP_ENV
VITE_API_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GA_ID (optional)
VITE_SENTRY_DSN (optional)
```

3. Test deployment:
   - [ ] Production URL works correctly
   - [ ] Preview deployments work
   - [ ] Environment detection is correct

### Netlify

1. Go to **Site settings → Build & deploy → Environment**
2. Add variables per deploy context:
   - Production
   - Deploy previews
   - Branch deploys

3. Configure build settings:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  VITE_APP_ENV = "production"

[context.deploy-preview]
  [context.deploy-preview.environment]
    VITE_APP_ENV = "staging"
```

4. Test deployment:
   - [ ] Production site works
   - [ ] Deploy previews use staging config
   - [ ] Environment variables load correctly

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build (Production)
        if: github.ref == 'refs/heads/main'
        env:
          VITE_APP_ENV: production
          VITE_API_URL: ${{ secrets.PRODUCTION_API_URL }}
          VITE_SUPABASE_URL: ${{ secrets.PRODUCTION_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.PRODUCTION_SUPABASE_ANON_KEY }}
          VITE_GA_ID: ${{ secrets.PRODUCTION_GA_ID }}
          VITE_SENTRY_DSN: ${{ secrets.PRODUCTION_SENTRY_DSN }}
        run: npm run build
      
      - name: Build (Staging)
        if: github.ref == 'refs/heads/staging'
        env:
          VITE_APP_ENV: staging
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
          VITE_GA_ID: ${{ secrets.STAGING_GA_ID }}
          VITE_SENTRY_DSN: ${{ secrets.STAGING_SENTRY_DSN }}
        run: npm run build
      
      - name: Deploy
        # Your deployment step here
        run: echo "Deploy to your hosting platform"
```

Checklist:
- [ ] Repository secrets are configured
- [ ] Separate secrets for staging and production
- [ ] Build succeeds in CI
- [ ] Environment variables are correctly substituted

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Build arguments for environment variables
ARG VITE_APP_ENV
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GA_ID
ARG VITE_SENTRY_DSN

# Set environment variables for build
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_GA_ID=$VITE_GA_ID
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build command:
```bash
docker build \
  --build-arg VITE_APP_ENV=production \
  --build-arg VITE_API_URL=https://api.jala.com \
  --build-arg VITE_SUPABASE_URL=your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-key \
  -t jala-app .
```

Checklist:
- [ ] Build args are properly passed
- [ ] Environment variables are set during build
- [ ] Container builds successfully
- [ ] App works in container

## Post-Deployment Verification

### Automated Checks

```bash
# Build the app
npm run build

# Serve and test
npm run preview

# Check console for:
# - Environment validation report
# - No error messages
# - Correct environment detected
```

### Manual Verification

- [ ] Open browser console
- [ ] Check environment validation report shows correct environment
- [ ] Verify no errors about missing variables
- [ ] Test key features:
  - [ ] API calls work
  - [ ] Analytics tracking (if enabled)
  - [ ] Error reporting (if enabled)
  - [ ] All integrations function correctly

### Environment-Specific Tests

**Staging:**
- [ ] Debug logging is visible in console
- [ ] Can test beta features
- [ ] Analytics sends to staging/test property
- [ ] Uses staging database/API

**Production:**
- [ ] No debug logs in console
- [ ] Beta features are disabled
- [ ] Analytics sends to production property
- [ ] Uses production database/API
- [ ] Error reporting captures issues
- [ ] Performance is acceptable

## Rollback Plan

If deployment fails due to environment issues:

1. **Immediate**: Revert to previous deployment
2. **Identify**: Check which environment variable is causing issues
3. **Fix**: Update the variable in hosting platform
4. **Test**: Deploy to staging first
5. **Deploy**: Re-deploy to production

## Troubleshooting

### Build Fails

```
Error: Required environment variable VITE_API_URL is not set
```

**Solution**: Add the variable to your build environment

### Runtime Errors

```
Environment validation failed: VITE_SUPABASE_URL is required
```

**Solution**: 
1. Check hosting platform environment variables
2. Ensure variables are set for correct environment
3. Rebuild and redeploy

### Wrong Environment Detected

**Issue**: App shows "development" in production

**Solution**:
1. Verify `VITE_APP_ENV=production` is set
2. Check hostname detection in `environment.ts`
3. Rebuild with correct environment variable

## Security Incident Response

If credentials are leaked:

1. **Immediately**: Rotate all exposed keys/secrets
2. **Update**: Change all environment variables
3. **Rebuild**: Trigger new deployment with new credentials
4. **Monitor**: Watch for unusual API activity
5. **Review**: Audit git history for other exposed secrets
6. **Document**: Record incident and response

## Regular Maintenance

- [ ] Review environment variables quarterly
- [ ] Rotate credentials every 90 days
- [ ] Update `.env.example` when adding new variables
- [ ] Keep documentation in sync with actual variables
- [ ] Audit who has access to production credentials

## Resources

- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Complete documentation
- [ENVIRONMENT_QUICK_REFERENCE.md](./ENVIRONMENT_QUICK_REFERENCE.md) - Quick reference
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html) - Official docs

---

**Remember**: Never commit secrets. Always use your hosting platform's secret management for sensitive credentials.
