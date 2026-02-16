# Environment Configuration Guide

This document outlines the environment variables and secrets required for the wecelebrate platform across different environments.

---

## 🔐 Required Secrets

### GitHub Repository Secrets

All secrets should be configured in GitHub Settings → Secrets and variables → Actions

#### **General Secrets**
```
SUPABASE_ACCESS_TOKEN          # Supabase personal access token
CODECOV_TOKEN                  # Codecov upload token
SONAR_TOKEN                    # SonarCloud authentication token
CC_TEST_REPORTER_ID            # Code Climate reporter ID
SLACK_WEBHOOK_URL              # Slack webhook for notifications
CLOUDFLARE_API_TOKEN           # Cloudflare Pages API token
CLOUDFLARE_ACCOUNT_ID          # Cloudflare account ID
LHCI_GITHUB_APP_TOKEN          # Lighthouse CI token
RESEND_API_KEY                 # Resend email API key
```

#### **Staging Environment Secrets**
```
STAGING_PROJECT_REF            # Supabase project reference
STAGING_SUPABASE_URL           # Supabase project URL
STAGING_SUPABASE_ANON_KEY      # Supabase anonymous key
STAGING_API_URL                # API base URL
STAGING_ALLOWED_ORIGINS        # CORS allowed origins
STAGING_JWT_SECRET             # JWT secret for auth
```

#### **Production Environment Secrets**
```
PRODUCTION_PROJECT_REF         # Supabase project reference
PRODUCTION_SUPABASE_URL        # Supabase project URL
PRODUCTION_SUPABASE_ANON_KEY   # Supabase anonymous key
PRODUCTION_API_URL             # API base URL
PRODUCTION_ALLOWED_ORIGINS     # CORS allowed origins
PRODUCTION_JWT_SECRET          # JWT secret for auth
```

---

## 🌍 Environment Configuration

### Staging Environment

**Purpose:** Testing and validation before production
**URL:** https://staging.wecelebrate.app
**Branch:** develop

**Configuration:**
```env
VITE_ENVIRONMENT=staging
VITE_API_URL=https://staging-project-ref.supabase.co/functions/v1/make-server-6fcaeea3
VITE_SUPABASE_URL=https://staging-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=<staging-anon-key>
```

**Features:**
- Automatic deployment on push to `develop`
- Full test suite execution
- Smoke tests after deployment
- Health checks
- Team notifications

### Production Environment

**Purpose:** Live application serving real users
**URL:** https://wecelebrate.app
**Branch:** main (via tags)

**Configuration:**
```env
NODE_ENV=production
VITE_ENVIRONMENT=production
VITE_API_URL=https://production-project-ref.supabase.co/functions/v1/make-server-6fcaeea3
VITE_SUPABASE_URL=https://production-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=<production-anon-key>
```

**Features:**
- Manual approval required
- Deployment on version tags (v*.*.*)
- Pre-deployment backup
- Full test suite execution
- Smoke tests + health checks
- Performance validation
- GitHub release creation
- Team notifications

---

## 📋 Environment Setup Checklist

### Initial Setup

- [ ] Create Supabase projects (staging & production)
- [ ] Create Cloudflare Pages projects
- [ ] Configure GitHub repository secrets
- [ ] Set up Codecov project
- [ ] Configure SonarCloud
- [ ] Set up Code Climate
- [ ] Create Slack webhook
- [ ] Configure environment protections

### GitHub Environment Protection Rules

#### Staging Environment
```yaml
Name: staging
Protection rules:
  - No required reviewers
  - Deployment branches: develop
```

#### Production Environment
```yaml
Name: production
Protection rules:
  - Required reviewers: 2
  - Deployment branches: main
  - Wait timer: 5 minutes
```

#### Production Approval Environment
```yaml
Name: production-approval
Protection rules:
  - Required reviewers: 1 (admin)
  - Deployment branches: main
```

#### Rollback Environments
```yaml
Name: staging-rollback
Protection rules:
  - Required reviewers: 1
  
Name: production-rollback
Protection rules:
  - Required reviewers: 2 (admins only)
```

---

## 🔧 Supabase Configuration

### Edge Function Environment Variables

Set these in Supabase Dashboard → Edge Functions → Settings

**Staging:**
```
ALLOWED_ORIGINS=https://staging.wecelebrate.app
RESEND_API_KEY=<resend-key>
JWT_SECRET=<staging-jwt-secret>
SEED_ON_STARTUP=true
```

**Production:**
```
ALLOWED_ORIGINS=https://wecelebrate.app
RESEND_API_KEY=<resend-key>
JWT_SECRET=<production-jwt-secret>
SEED_ON_STARTUP=false
```

### Database Configuration

Both environments use the pre-configured `kv_store_6fcaeea3` table. No migrations required.

---

## 🚀 Deployment Triggers

### Staging Deployment
```bash
# Automatic on push to develop
git push origin develop

# Manual trigger
gh workflow run deploy-staging.yml
```

### Production Deployment
```bash
# Create and push version tag
git tag v1.0.0
git push origin v1.0.0

# Manual trigger with version
gh workflow run deploy-production.yml -f version=v1.0.0
```

### Rollback
```bash
# Rollback staging
gh workflow run rollback.yml \
  -f environment=staging \
  -f reason="Critical bug in feature X"

# Rollback production (requires approval)
gh workflow run rollback.yml \
  -f environment=production \
  -f reason="Critical security issue"
```

---

## 📊 Monitoring & Notifications

### Slack Notifications

Notifications are sent for:
- ✅ Successful deployments
- ❌ Failed deployments
- 🔄 Rollbacks
- ⚠️ Critical issues

**Webhook Setup:**
1. Create Slack app
2. Enable Incoming Webhooks
3. Add webhook URL to GitHub secrets as `SLACK_WEBHOOK_URL`

### GitHub Notifications

Automatic notifications via:
- PR comments (coverage, bundle size)
- Commit comments (deployment summary)
- GitHub releases (production deployments)
- Issues (rollback tracking)

---

## 🔒 Security Best Practices

### Secret Management
- ✅ Never commit secrets to repository
- ✅ Rotate secrets regularly (quarterly)
- ✅ Use different secrets per environment
- ✅ Limit secret access to necessary workflows
- ✅ Use GitHub environment secrets for sensitive data

### Access Control
- ✅ Require 2FA for all team members
- ✅ Use branch protection rules
- ✅ Require PR reviews
- ✅ Require status checks before merge
- ✅ Limit direct pushes to main/develop

### Deployment Safety
- ✅ Always require approval for production
- ✅ Run full test suite before deploy
- ✅ Create backups before production deploys
- ✅ Have rollback plan ready
- ✅ Monitor health after deployment

---

## 🧪 Testing Configuration

### Test Environments

**Local Development:**
```env
VITE_ENVIRONMENT=development
VITE_API_URL=http://localhost:54321/functions/v1/make-server-6fcaeea3
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<local-anon-key>
```

**CI/CD:**
```env
CI=true
NODE_ENV=test
```

---

## 📝 Maintenance

### Regular Tasks

**Weekly:**
- [ ] Review dependency updates
- [ ] Check error logs
- [ ] Review performance metrics

**Monthly:**
- [ ] Rotate JWT secrets
- [ ] Review and update environment variables
- [ ] Audit access controls
- [ ] Review deployment metrics

**Quarterly:**
- [ ] Rotate all API keys
- [ ] Update Node.js version
- [ ] Review and optimize workflows
- [ ] Disaster recovery drill

---

## 🆘 Troubleshooting

### Common Issues

**Deployment fails with "unauthorized":**
- Check `SUPABASE_ACCESS_TOKEN` is valid
- Verify project ref matches environment

**Health check fails:**
- Verify API URL is correct
- Check CORS configuration
- Confirm Edge Functions are deployed

**Tests fail in CI:**
- Check environment variables are set
- Verify secrets are accessible
- Review test timeout settings

**Rollback fails:**
- Verify backup exists
- Check previous version exists
- Confirm permissions

---

## 📞 Support

**Emergency Contacts:**
- DevOps Lead: [contact info]
- Platform Admin: [contact info]
- On-call: [rotation schedule]

**Resources:**
- Supabase Dashboard: https://app.supabase.com
- Cloudflare Pages: https://dash.cloudflare.com
- GitHub Actions: https://github.com/[org]/wecelebrate/actions
- Monitoring: [monitoring dashboard URL]

---

**Last Updated:** February 12, 2026
**Maintained by:** DevOps Team
