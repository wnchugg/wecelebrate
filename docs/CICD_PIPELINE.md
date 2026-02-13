# CI/CD Pipeline Documentation

Complete documentation for the wecelebrate CI/CD pipeline implementation.

---

## 📊 Overview

The wecelebrate platform uses a comprehensive CI/CD pipeline built with GitHub Actions, covering testing, quality assurance, security, performance, deployment, and monitoring.

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE OVERVIEW                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Code Push                                                  │
│       │                                                      │
│       ├──> Tests (Unit, Integration, E2E)                   │
│       ├──> Quality (Coverage, Linting, SonarCloud)         │
│       ├──> Security (CodeQL, Snyk, OWASP, Gitleaks)       │
│       ├──> Performance (Lighthouse, Bundle Size)           │
│       │                                                      │
│       ├──> Staging Deploy (Auto on develop)                │
│       │    ├──> Backend (Supabase Functions)               │
│       │    ├──> Frontend (Cloudflare Pages)                │
│       │    └──> Tests (Smoke, Health)                      │
│       │                                                      │
│       └──> Production Deploy (Tag-based)                    │
│            ├──> Approval Required                           │
│            ├──> Backup Created                              │
│            ├──> Backend Deployed                            │
│            ├──> Frontend Deployed                           │
│            ├──> Tests (Smoke, Health, Performance)         │
│            └──> Release Created                             │
│                                                              │
│  Monitoring (Every 15 min)                                  │
│       ├──> Health Checks                                    │
│       ├──> Uptime Monitoring                                │
│       ├──> Performance Metrics                              │
│       └──> Error Tracking                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflows

### 1. Test Workflows

#### **test.yml** - Main Testing
**Trigger:** Push, Pull Request, Schedule (daily)

**Jobs:**
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)
- Test reporting

**Duration:** ~5-8 minutes

#### **test-integration.yml** - Backend Testing
**Trigger:** Push, Pull Request

**Jobs:**
- Supabase Edge Function tests
- API integration tests
- Database tests

**Duration:** ~3-5 minutes

---

### 2. Quality Workflows

#### **quality.yml** - Code Quality
**Trigger:** Push, Pull Request

**Jobs:**
- ESLint checking
- Prettier formatting
- TypeScript compilation
- Code metrics

**Duration:** ~2-3 minutes

#### **codecov.yml** - Coverage Tracking
**Trigger:** Push, Pull Request

**Jobs:**
- Generate coverage report
- Upload to Codecov
- Comment on PR with coverage

**Duration:** ~4-6 minutes

#### **sonarcloud.yml** - Code Analysis
**Trigger:** Push, Pull Request

**Jobs:**
- SonarCloud analysis
- Quality gate enforcement
- Technical debt tracking

**Duration:** ~3-5 minutes

---

### 3. Security Workflows

#### **security.yml** - Security Scanning
**Trigger:** Push, Pull Request, Schedule (daily)

**Jobs:**
- CodeQL analysis
- npm audit
- Snyk scanning
- Gitleaks secret detection
- Semgrep SAST
- Dependency review

**Duration:** ~10-15 minutes

**Tools:**
- CodeQL (Static analysis)
- Snyk (Vulnerabilities)
- Gitleaks (Secrets)
- Semgrep (SAST)

#### **vulnerability-scan.yml** - Comprehensive Scanning
**Trigger:** Push, Pull Request, Schedule (daily)

**Jobs:**
- OWASP dependency check
- Trivy scanning
- NPM audit
- License compliance
- Security headers check

**Duration:** ~12-18 minutes

---

### 4. Performance Workflows

#### **performance.yml** - Performance Monitoring
**Trigger:** Push, Pull Request, Schedule (daily)

**Jobs:**
- Lighthouse CI
- Bundle size analysis
- Web Vitals monitoring
- Performance regression detection
- Load testing (k6)

**Duration:** ~8-12 minutes

**Metrics:**
- Performance: 90+
- Accessibility: 95+
- FCP: < 2s
- LCP: < 2.5s
- CLS: < 0.1

---

### 5. Deployment Workflows

#### **deploy-staging.yml** - Staging Deployment
**Trigger:** Push to develop

**Jobs:**
1. Pre-deployment checks
2. Build application
3. Deploy Supabase functions
4. Deploy frontend
5. Database migrations
6. Smoke tests
7. Health checks
8. Deployment summary
9. Team notification

**Duration:** ~8-12 minutes

#### **deploy-production.yml** - Production Deployment
**Trigger:** Version tag (v*.*.*)

**Jobs:**
1. Validate release
2. **Approval required** ⏸️
3. Pre-deployment checks
4. Build application
5. Create backup
6. Deploy Supabase functions
7. Deploy frontend
8. Smoke tests
9. Health checks
10. Performance validation
11. Create GitHub release
12. Deployment summary
13. Team notification

**Duration:** ~15-25 minutes (with approval)

#### **rollback.yml** - Rollback Mechanism
**Trigger:** Manual workflow dispatch

**Jobs:**
1. Validate rollback
2. **Approval required** ⏸️
3. Create snapshot
4. Identify previous version
5. Rollback Supabase
6. Rollback frontend
7. Health checks
8. Smoke tests
9. Create incident issue
10. Team notification

**Duration:** ~10-15 minutes

---

### 6. Monitoring Workflows

#### **monitoring.yml** - Application Monitoring
**Trigger:** Schedule (every 15 minutes)

**Jobs:**
- Health check (staging & production)
- Uptime monitoring
- Performance metrics
- Database health
- API endpoint monitoring
- SSL certificate check
- Dependency health

**Duration:** ~3-5 minutes

#### **error-tracking.yml** - Error Tracking
**Trigger:** Push, Pull Request

**Jobs:**
- Sentry setup
- Source map upload
- Error rate analysis
- Deployment notification

**Duration:** ~2-4 minutes

---

## 📈 Workflow Triggers

### Event-Based Triggers

| Event | Workflows Triggered |
|-------|---------------------|
| **Push to develop** | test, quality, codecov, sonarcloud, security, performance, deploy-staging |
| **Push to main** | test, quality, codecov, sonarcloud, security, performance |
| **Pull Request** | test, quality, codecov, sonarcloud, security, performance, vulnerability-scan |
| **Tag (v*.*.*)** | deploy-production |
| **Manual** | rollback, any workflow |

### Scheduled Triggers

| Schedule | Workflow | Purpose |
|----------|----------|---------|
| **Daily 2 AM** | vulnerability-scan | Regular security check |
| **Daily 3 AM** | security | CodeQL analysis |
| **Daily 4 AM** | performance | Performance baseline |
| **Every 15 min** | monitoring | Health monitoring |
| **Weekly Monday** | dependabot | Dependency updates |

---

## 🔐 Required Secrets

### GitHub Secrets Configuration

```bash
# Supabase
SUPABASE_ACCESS_TOKEN          # Supabase CLI auth
STAGING_PROJECT_REF            # Staging project
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY
STAGING_JWT_SECRET
PRODUCTION_PROJECT_REF         # Production project
PRODUCTION_SUPABASE_URL
PRODUCTION_SUPABASE_ANON_KEY
PRODUCTION_JWT_SECRET

# Cloudflare
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID

# Quality & Security
CODECOV_TOKEN
SONAR_TOKEN
CC_TEST_REPORTER_ID
SNYK_TOKEN
GITLEAKS_LICENSE

# Error Tracking
SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT

# Notifications
SLACK_WEBHOOK_URL

# Other
RESEND_API_KEY
LHCI_GITHUB_APP_TOKEN
```

---

## 🎯 Quality Gates

### Required for Merge

- ✅ All tests passing
- ✅ Code coverage ≥ 90%
- ✅ No linting errors
- ✅ TypeScript compilation successful
- ✅ SonarCloud quality gate passed
- ✅ No critical/high vulnerabilities
- ✅ Performance budget met

### Production Deployment Requirements

- ✅ All staging tests passed
- ✅ Manual approval from admin
- ✅ Code coverage ≥ 90%
- ✅ No security vulnerabilities
- ✅ Performance score ≥ 90
- ✅ Accessibility score ≥ 95

---

## 📊 Metrics & Monitoring

### Test Coverage Metrics

```
Overall Coverage: 91%
- Unit Tests: 4,585 tests
- Integration Tests: 156 tests
- E2E Tests: 48 tests
- Total: 4,789 tests
```

### Performance Metrics

```
Lighthouse Scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

Web Vitals:
- FCP: < 1.8s
- LCP: < 2.5s
- CLS: < 0.1
- TTI: < 3.5s
- TBT: < 300ms
```

### Security Metrics

```
Scans Per Day: 3
Tools: 8 security scanners
Coverage: Static + Dynamic + Dependencies
Response Time: < 24 hours for critical
```

---

## 🚀 Deployment Flow

### Staging Deployment Flow

```
1. Developer pushes to develop branch
2. CI runs all tests & checks
3. Build succeeds
4. Deploy to staging automatically
5. Run smoke tests
6. Health checks
7. Notify team
8. Ready for validation
```

### Production Deployment Flow

```
1. Create version tag (v1.0.0)
2. CI validates release
3. Manual approval required
4. Create backup
5. Run full test suite
6. Deploy to production
7. Run smoke + health + performance tests
8. Create GitHub release
9. Notify team
10. Monitor for issues
```

### Rollback Flow

```
1. Issue detected in production
2. Trigger rollback workflow
3. Manual approval required
4. Create snapshot of current state
5. Identify previous stable version
6. Rollback backend + frontend
7. Run health checks
8. Create incident issue
9. Notify team
10. Investigate root cause
```

---

## 🛠️ Tools & Technologies

### CI/CD Platform
- **GitHub Actions** - Workflow orchestration

### Testing
- **Vitest** - Unit & integration testing
- **Playwright** - E2E testing
- **Testing Library** - Component testing

### Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Codecov** - Coverage tracking
- **SonarCloud** - Code quality
- **Code Climate** - Maintainability

### Security
- **CodeQL** - Static analysis
- **Snyk** - Vulnerability scanning
- **Gitleaks** - Secret detection
- **Semgrep** - SAST
- **OWASP** - Dependency check
- **Trivy** - Container scanning

### Performance
- **Lighthouse CI** - Performance audits
- **k6** - Load testing
- **Bundle Analyzer** - Size tracking
- **Web Vitals** - User metrics

### Deployment
- **Cloudflare Pages** - Frontend hosting
- **Supabase** - Backend & database

### Monitoring
- **Sentry** - Error tracking
- **Custom monitoring** - Health checks
- **Slack** - Notifications

---

## 📚 Documentation

### Quick Links

- [Environment Configuration](./ENVIRONMENT_CONFIG.md)
- [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md)
- [Security Policy](../SECURITY.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)
- [Testing Strategy](./TESTING_STRATEGY.md)

### Workflow Documentation

Each workflow includes:
- Purpose and trigger conditions
- Job descriptions
- Success/failure criteria
- Troubleshooting guide
- Required secrets

---

## 🔧 Troubleshooting

### Common Issues

#### Tests Failing in CI
```bash
# Check test logs
gh run view --log-failed

# Run tests locally
npm run test

# Update snapshots
npm run test -- -u
```

#### Deployment Failure
```bash
# Check deployment logs
gh workflow view deploy-production

# Verify secrets are set
gh secret list

# Manual deployment
gh workflow run deploy-staging.yml
```

#### Quality Gate Failure
```bash
# Check coverage
npm run test:coverage

# Run linter
npm run lint

# Fix formatting
npm run format
```

---

## 📞 Support

**CI/CD Issues:** devops@wecelebrate.app  
**Security Issues:** security@wecelebrate.app  
**General Support:** support@wecelebrate.app

**On-Call Rotation:** [See internal wiki]

---

## 🔄 Maintenance

### Weekly Tasks
- Review failed workflows
- Update dependencies via Dependabot
- Check security alerts

### Monthly Tasks
- Review performance metrics
- Update documentation
- Audit access controls
- Review deployment metrics

### Quarterly Tasks
- Major dependency updates
- CI/CD optimization
- Security audit
- Disaster recovery drill

---

**Last Updated:** February 12, 2026  
**Version:** 1.0  
**Maintained by:** DevOps Team
