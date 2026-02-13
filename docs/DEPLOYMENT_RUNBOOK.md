# Deployment Runbook

This runbook provides step-by-step instructions for deploying and managing the wecelebrate platform.

---

## 🚀 Deployment Overview

### Deployment Environments

| Environment | URL | Branch | Trigger | Approval |
|------------|-----|--------|---------|----------|
| **Staging** | https://staging.wecelebrate.app | develop | Auto on push | None |
| **Production** | https://wecelebrate.app | main | Version tag | Required |

### Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                 DEPLOYMENT FLOW                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Code → CI Tests → Build → Deploy Backend →        │
│         Deploy Frontend → Tests → Health Check     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Pre-Deployment Checklist

### Before Every Deployment

- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] CHANGELOG.md updated
- [ ] Version number bumped (production only)
- [ ] Database migrations tested (if any)
- [ ] Feature flags configured
- [ ] Monitoring dashboards ready
- [ ] Team notified of deployment window

### Production Specific

- [ ] Staging deployment successful
- [ ] Smoke tests passed on staging
- [ ] Performance validated on staging
- [ ] Customer-facing changes documented
- [ ] Rollback plan prepared
- [ ] On-call engineer available

---

## 🎯 Staging Deployment

### Automatic Deployment

**Trigger:** Push to `develop` branch

```bash
# 1. Ensure you're on develop branch
git checkout develop

# 2. Pull latest changes
git pull origin develop

# 3. Merge your feature branch
git merge feature/your-feature

# 4. Push to trigger deployment
git push origin develop
```

**What Happens:**
1. ✅ Pre-deployment checks (lint, typecheck, tests)
2. 🏗️ Build application
3. 🚀 Deploy Supabase Edge Functions
4. 🌐 Deploy frontend to Cloudflare Pages
5. 🗄️ Run database migrations (if any)
6. 🧪 Run smoke tests
7. ❤️ Health check
8. 📢 Team notification

**Timeline:** ~8-12 minutes

### Manual Deployment

```bash
# Trigger staging deployment manually
gh workflow run deploy-staging.yml
```

### Monitoring Staging Deployment

1. Go to GitHub Actions tab
2. Select "Deploy to Staging" workflow
3. Monitor real-time logs
4. Check deployment summary

**Success Indicators:**
- ✅ All jobs green
- ✅ Health check passed
- ✅ Smoke tests passed
- ✅ Slack notification sent

---

## 🏭 Production Deployment

### Step 1: Prepare Release

```bash
# 1. Ensure staging is stable
# Check staging: https://staging.wecelebrate.app

# 2. Create release branch from main
git checkout main
git pull origin main
git checkout -b release/v1.0.0

# 3. Update version in package.json
npm version 1.0.0 --no-git-tag-version

# 4. Update CHANGELOG.md
# Add release notes for v1.0.0

# 5. Commit changes
git add package.json CHANGELOG.md
git commit -m "chore: prepare release v1.0.0"

# 6. Create PR to main
gh pr create --base main --title "Release v1.0.0" --body "Release notes..."
```

### Step 2: Create Version Tag

```bash
# After PR is merged to main

# 1. Checkout main and pull
git checkout main
git pull origin main

# 2. Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0

- Feature: New admin dashboard
- Feature: Enhanced reporting
- Fix: Performance improvements
- Fix: Security updates"

# 3. Push tag to trigger deployment
git push origin v1.0.0
```

### Step 3: Monitor Deployment

**Automatic Steps:**
1. ✅ Release validation
2. ⏸️ Approval required (wait for manual approval)
3. 🔍 Pre-deployment checks
4. 🏗️ Build application
5. 💾 Create backup
6. 🚀 Deploy Supabase
7. 🌐 Deploy frontend
8. 🧪 Smoke tests
9. ❤️ Health check
10. ⚡ Performance check
11. 📦 Create GitHub release
12. 📢 Team notification

**Timeline:** ~15-25 minutes (including approval)

### Step 4: Approve Deployment

1. GitHub will pause at approval step
2. Reviewers receive notification
3. Review deployment request
4. Click "Review deployments"
5. Select "production-approval"
6. Click "Approve and deploy"

**Approval Requirements:**
- Minimum 1 admin approval
- 5-minute wait timer
- All pre-checks must pass

### Step 5: Post-Deployment Verification

```bash
# 1. Check application health
curl https://wecelebrate.app/health

# 2. Check API health
curl -H "Authorization: Bearer <token>" \
  https://<project-ref>.supabase.co/functions/v1/make-server-6fcaeea3/health

# 3. Run manual smoke tests
npm run test:e2e:production

# 4. Check monitoring dashboards
# - Application metrics
# - Error rates
# - Response times
# - Database performance
```

**Success Criteria:**
- ✅ All health checks passing
- ✅ No increase in error rate
- ✅ Response times within SLA
- ✅ No critical alerts
- ✅ User reports normal

---

## 🔄 Rollback Procedures

### When to Rollback

**Immediate Rollback Required:**
- 🔴 Critical security vulnerability
- 🔴 Data loss or corruption
- 🔴 Complete service outage
- 🔴 Critical functionality broken

**Consider Rollback:**
- 🟡 Significant increase in errors
- 🟡 Performance degradation >50%
- 🟡 Major feature not working
- 🟡 Database issues

**Monitor Before Deciding:**
- 🟢 Minor UI glitches
- 🟢 Edge case bugs
- 🟢 Low-impact features
- 🟢 Cosmetic issues

### Rollback Process

#### Step 1: Initiate Rollback

```bash
# Rollback staging
gh workflow run rollback.yml \
  -f environment=staging \
  -f reason="Critical bug in user authentication"

# Rollback production (requires approval)
gh workflow run rollback.yml \
  -f environment=production \
  -f reason="Service outage in payment processing"
```

#### Step 2: Approve Rollback (Production)

1. GitHub will pause for approval
2. Incident commander reviews
3. Click "Review deployments"
4. Select environment rollback
5. Approve rollback

**Approval Requirements:**
- Minimum 2 admin approvals for production
- Document incident details
- Notify team

#### Step 3: Monitor Rollback

**Automatic Steps:**
1. ✅ Validate rollback request
2. ⏸️ Approval required
3. 📸 Create snapshot (current state)
4. 🔍 Identify previous version
5. 🔄 Rollback Supabase
6. 🔄 Rollback frontend
7. ❤️ Health check
8. 🧪 Smoke tests
9. 📋 Create incident issue
10. 📢 Team notification

**Timeline:** ~10-15 minutes

#### Step 4: Post-Rollback Actions

1. **Verify Service Restored:**
   ```bash
   # Check health
   curl https://wecelebrate.app/health
   
   # Run smoke tests
   npm run test:e2e -- --grep @smoke
   ```

2. **Investigate Root Cause:**
   - Review error logs
   - Analyze metrics
   - Identify failure point
   - Document findings

3. **Create Incident Report:**
   - Timeline of events
   - Impact assessment
   - Root cause analysis
   - Prevention measures

4. **Plan Fix:**
   - Create hotfix branch
   - Implement fix
   - Test thoroughly
   - Deploy to staging first

---

## 🔍 Monitoring & Verification

### Health Check Endpoints

```bash
# Frontend health
curl https://wecelebrate.app/health
# Expected: 200 OK

# API health
curl -H "Authorization: Bearer $ANON_KEY" \
  $SUPABASE_URL/functions/v1/make-server-6fcaeea3/health
# Expected: 200 OK
```

### Key Metrics to Monitor

**Application Metrics:**
- Response time (p50, p95, p99)
- Error rate
- Request rate
- Active users

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Database connections
- Edge function invocations

**Business Metrics:**
- User sign-ups
- Active sessions
- Feature usage
- Transaction success rate

### Monitoring Tools

1. **Supabase Dashboard**
   - Database performance
   - Edge function logs
   - API usage
   - Authentication metrics

2. **Cloudflare Analytics**
   - Traffic patterns
   - Cache hit rate
   - Geographic distribution
   - Security events

3. **GitHub Actions**
   - Deployment history
   - Test results
   - Build times
   - Workflow status

---

## 🚨 Incident Response

### Severity Levels

**P0 - Critical (Immediate Response)**
- Complete service outage
- Data loss or corruption
- Security breach
- Response time: <15 minutes

**P1 - High (Urgent Response)**
- Partial service degradation
- Core features broken
- Significant performance issues
- Response time: <1 hour

**P2 - Medium (Standard Response)**
- Non-critical feature issues
- Minor performance degradation
- Cosmetic bugs
- Response time: <4 hours

**P3 - Low (Scheduled Response)**
- Enhancement requests
- Minor bugs
- Documentation updates
- Response time: Next sprint

### Incident Response Flow

```
Incident Detected → Assess Severity → Notify Team →
Roll back (if needed) → Investigate → Fix → Deploy → 
Post-mortem
```

### Communication Templates

**Incident Notification:**
```
🚨 INCIDENT: [P0/P1/P2/P3]
Service: wecelebrate [staging/production]
Issue: [Brief description]
Impact: [User impact]
Status: [Investigating/Identified/Fixing/Monitoring]
ETA: [Expected resolution time]
Incident Commander: [Name]
```

**Resolution Notification:**
```
✅ RESOLVED: [Incident title]
Resolution: [What was done]
Root Cause: [Brief explanation]
Duration: [Time from detection to resolution]
Follow-up: [Issue/ticket link]
```

---

## 📊 Deployment Metrics

### Track These Metrics

**Deployment Frequency:**
- Staging: ~5-10 per week
- Production: ~1-2 per week

**Lead Time:**
- Code commit to production: <1 week
- PR merge to staging: <1 hour

**Deployment Success Rate:**
- Target: >95%
- Track failures and root causes

**Mean Time to Recovery (MTTR):**
- Target: <30 minutes
- Includes rollback time

**Change Failure Rate:**
- Target: <5%
- Track issues requiring rollback

---

## 🎓 Training & Onboarding

### New Team Member Checklist

- [ ] Read this runbook
- [ ] Access to GitHub repository
- [ ] Access to Supabase projects
- [ ] Access to Cloudflare account
- [ ] Access to monitoring dashboards
- [ ] Access to Slack channels
- [ ] Perform test staging deployment
- [ ] Shadow production deployment
- [ ] Lead staging deployment
- [ ] Lead production deployment (with supervision)

### Practice Exercises

1. **Staging Deployment:**
   - Deploy a trivial change to staging
   - Monitor the deployment
   - Verify health checks

2. **Rollback Drill:**
   - Initiate rollback on staging
   - Monitor the process
   - Verify service restoration

3. **Incident Response:**
   - Participate in incident simulation
   - Practice communication
   - Execute rollback procedures

---

## 📝 Deployment Log Template

```markdown
## Deployment: [Version] to [Environment]

**Date:** [YYYY-MM-DD HH:MM UTC]
**Deployed by:** [Name]
**Duration:** [X minutes]

### Changes Included:
- [Feature/Fix description]
- [Feature/Fix description]

### Pre-Deployment:
- [x] Tests passed
- [x] Code reviewed
- [x] Staging validated

### Deployment Steps:
- [x] Build completed
- [x] Backend deployed
- [x] Frontend deployed
- [x] Tests passed
- [x] Health checks passed

### Post-Deployment:
- [x] Monitoring normal
- [x] No errors detected
- [x] Team notified

### Issues:
- None / [Description of any issues]

### Rollback:
- Not required / [Rollback details if performed]
```

---

## 🔗 Quick Links

- **GitHub Actions:** https://github.com/[org]/wecelebrate/actions
- **Staging Site:** https://staging.wecelebrate.app
- **Production Site:** https://wecelebrate.app
- **Supabase Dashboard:** https://app.supabase.com
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Monitoring:** [Your monitoring URL]
- **Incident Tracking:** [Your issue tracker]

---

**Document Version:** 1.0  
**Last Updated:** February 12, 2026  
**Maintained by:** DevOps Team  
**Review Frequency:** Quarterly
