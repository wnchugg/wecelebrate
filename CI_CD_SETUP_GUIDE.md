# 🚀 CI/CD Setup Guide - wecelebrate Platform

## 📋 Overview

This guide will help you set up a complete CI/CD pipeline with automated testing for the wecelebrate platform. The pipeline includes:

- ✅ Automated testing (4,158+ tests)
- ✅ Code quality checks (lint, type checking)
- ✅ Coverage reporting
- ✅ Build verification
- ✅ Security scanning
- ✅ Automated deployments

---

## 📁 Files Created

### GitHub Actions Workflows

1. **`.github/workflows/ci-cd.yml`** - Main CI/CD pipeline
   - Runs on: Push to main/develop/staging, Pull Requests
   - Jobs: Lint, Type Check, Unit Tests, Coverage, Integration Tests, E2E, Build, Security, Deploy

2. **`.github/workflows/pull-request.yml`** - PR-specific checks
   - Runs on: Pull Request events
   - Jobs: Quick checks, Full test suite, Coverage with PR comments, Build verification, Demo site tests

3. **`.github/workflows/nightly-tests.yml`** - Comprehensive nightly testing
   - Runs on: Schedule (2 AM UTC daily) + Manual trigger
   - Jobs: Multi-version testing, Full coverage, E2E on all browsers, Performance benchmarks

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Repository Setup

```bash
# Ensure you're in the project root
cd /path/to/wecelebrate-app

# Check if .github/workflows exists
ls -la .github/workflows/

# You should see:
# - ci-cd.yml
# - pull-request.yml
# - nightly-tests.yml
```

### Step 2: GitHub Repository Configuration

1. **Go to your GitHub repository**
2. **Settings → Secrets and variables → Actions**
3. **Add these secrets (if needed):**

```
CODECOV_TOKEN          # For coverage reporting (optional)
DEPLOY_TOKEN           # For deployment (if using automated deploy)
SLACK_WEBHOOK_URL      # For notifications (optional)
```

### Step 3: Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. Click **"I understand my workflows, go ahead and enable them"**
3. Workflows will now run automatically!

### Step 4: Test the Pipeline

```bash
# Create a test branch
git checkout -b test-ci-cd

# Make a small change
echo "# Testing CI/CD" >> README.md

# Commit and push
git add .
git commit -m "test: CI/CD pipeline setup"
git push origin test-ci-cd

# Create a Pull Request on GitHub
# Watch the workflows run automatically! 🎉
```

---

## 📊 What Gets Tested

### On Every Push to Main/Develop/Staging:

1. **Code Quality (5 min)**
   - ✅ ESLint checks
   - ✅ TypeScript type checking
   - ✅ Prettier formatting

2. **Unit Tests (15 min)**
   - ✅ 4,158+ tests
   - ✅ Utils, hooks, contexts, pages
   - ✅ Demo site configurations (216 tests)

3. **Coverage (15 min)**
   - ✅ Generate coverage report
   - ✅ Upload to Codecov
   - ✅ Enforce 80%+ coverage

4. **Integration Tests (15 min)**
   - ✅ Component integration
   - ✅ Context integration
   - ✅ Cross-feature flows

5. **E2E Tests (20 min)**
   - ✅ Playwright tests
   - ✅ Critical user journeys
   - ✅ Shopping flows

6. **Build Verification (10 min)**
   - ✅ Staging build
   - ✅ Production build
   - ✅ Bundle size analysis

7. **Security Scan (10 min)**
   - ✅ npm audit
   - ✅ Dependency vulnerabilities
   - ✅ Security best practices

8. **Deploy (5 min)**
   - ✅ Auto-deploy to staging (on develop)
   - ✅ Auto-deploy to production (on main)

**Total Time: ~30-40 minutes**

### On Every Pull Request:

1. **Quick Checks (5 min)**
   - ✅ Lint
   - ✅ Type check

2. **Full Test Suite (20 min)**
   - ✅ All 4,158+ tests
   - ✅ Coverage report with PR comment
   - ✅ Build verification
   - ✅ Demo site tests

3. **Changed Files Analysis**
   - ✅ List changed files
   - ✅ Analyze impact

**Total Time: ~20-25 minutes**

### Nightly (Comprehensive):

1. **Multi-Version Testing (60 min)**
   - ✅ Node 18, 20, 22
   - ✅ Parallel execution (4 shards)

2. **E2E All Browsers (45 min)**
   - ✅ Chromium
   - ✅ Firefox
   - ✅ WebKit (Safari)

3. **Performance Benchmarks (20 min)**
   - ✅ Load time benchmarks
   - ✅ Memory usage
   - ✅ Bundle size tracking

4. **Full Coverage Analysis (30 min)**
   - ✅ Detailed coverage report
   - ✅ Coverage trends

**Total Time: ~2-3 hours (runs overnight)**

---

## 🎯 Workflow Triggers

### Automatic Triggers:

```yaml
# Main CI/CD Pipeline
on:
  push:
    branches: [main, develop, staging]
  pull_request:
    branches: [main, develop, staging]

# Pull Request Checks
on:
  pull_request:
    types: [opened, synchronize, reopened]

# Nightly Tests
on:
  schedule:
    - cron: '0 2 * * *'  # Every night at 2 AM UTC
  workflow_dispatch:      # Manual trigger button
```

### Manual Triggers:

1. Go to **Actions** tab
2. Select workflow (e.g., "Nightly Test Suite")
3. Click **"Run workflow"** button
4. Select branch and click **"Run workflow"**

---

## 📈 Coverage Reporting

### Codecov Setup (Optional but Recommended):

1. **Sign up at [codecov.io](https://codecov.io)**
2. **Connect your GitHub repository**
3. **Get your Codecov token**
4. **Add token to GitHub Secrets:**
   ```
   Name: CODECOV_TOKEN
   Value: your-codecov-token-here
   ```

5. **Coverage will now be tracked:**
   - 📊 Coverage badge in README
   - 📈 Coverage trends over time
   - 💬 Coverage reports on PRs

### Without Codecov:

- Coverage reports still generated
- Available as artifacts in GitHub Actions
- Download from workflow run details

---

## 🔔 Notifications Setup (Optional)

### Slack Notifications:

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
    text: 'CI/CD Pipeline Failed!'
```

**Setup:**
1. Create Slack webhook at https://api.slack.com/messaging/webhooks
2. Add `SLACK_WEBHOOK_URL` to GitHub Secrets
3. Uncomment notification steps in workflows

### Email Notifications:

- **Automatic:** GitHub sends emails on workflow failures (to committer)
- **Custom:** Add email action to workflows if needed

---

## 🚦 Status Badges

Add these to your README.md:

```markdown
![CI/CD Pipeline](https://github.com/your-org/wecelebrate-app/actions/workflows/ci-cd.yml/badge.svg)
![Tests](https://github.com/your-org/wecelebrate-app/actions/workflows/pull-request.yml/badge.svg)
[![codecov](https://codecov.io/gh/your-org/wecelebrate-app/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/wecelebrate-app)
```

---

## 🛡️ Branch Protection Rules

### Recommended Settings:

1. Go to **Settings → Branches**
2. Add rule for `main` branch:

```
✅ Require pull request reviews before merging (1 approval)
✅ Require status checks to pass before merging:
   - lint-and-typecheck
   - unit-tests
   - coverage-tests
   - build-check
   - demo-site-tests
✅ Require branches to be up to date before merging
✅ Require conversation resolution before merging
✅ Do not allow bypassing the above settings
```

3. Add rule for `develop` branch (same settings)

---

## 🎛️ Advanced Configuration

### Parallel Test Execution:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]

steps:
  - run: pnpm test --run --shard=${{ matrix.shard }}/4
```

**Benefits:**
- 4x faster test execution
- Runs 4 test jobs in parallel
- Reduces total CI time

### Caching:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'  # Caches node_modules

- uses: actions/cache@v4
  with:
    path: ~/.cache/Playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('**/pnpm-lock.yaml') }}
```

**Benefits:**
- Faster dependency installation
- Reduced CI time by 2-3 minutes

---

## 🚀 Deployment Setup

### Option 1: Vercel

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
```

**Setup:**
1. Install Vercel GitHub app
2. Add secrets to GitHub
3. Uncomment deploy steps

### Option 2: Netlify

```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2
  with:
    publish-dir: './dist'
    production-branch: main
    github-token: ${{ secrets.GITHUB_TOKEN }}
    deploy-message: "Deploy from GitHub Actions"
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Option 3: Custom Deploy

```yaml
- name: Deploy to Custom Server
  run: |
    # Your custom deployment script
    ./scripts/deploy.sh
  env:
    DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

---

## 📊 Monitoring & Analytics

### Test Results Dashboard:

1. **GitHub Actions Tab** - View all workflow runs
2. **Codecov Dashboard** - Coverage trends
3. **Artifacts** - Download detailed reports

### What to Monitor:

- ✅ Test pass rate (should be 100%)
- ✅ Test duration (watch for slowdowns)
- ✅ Coverage percentage (maintain 85%+)
- ✅ Build size (watch for bloat)
- ✅ Security vulnerabilities (should be 0 high/critical)

---

## 🔧 Troubleshooting

### Tests Failing in CI but Pass Locally?

**Common causes:**
1. **Missing environment variables** - Add to GitHub Secrets
2. **Different Node version** - Check CI uses Node 20
3. **Timezone issues** - Tests use UTC in CI
4. **File system differences** - Windows vs Linux paths

**Fix:**
```yaml
env:
  TZ: UTC
  NODE_ENV: test
```

### CI Running Too Slow?

**Optimizations:**
1. **Enable parallel execution** (sharding)
2. **Cache dependencies** properly
3. **Skip unnecessary steps** for certain changes
4. **Use GitHub Actions larger runners** (if needed)

### Flaky Tests?

**Solutions:**
1. Add retry logic:
```yaml
- name: Run tests with retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: pnpm test --run
```

2. Increase timeouts in tests
3. Use `waitFor` properly in async tests

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Push to `main` triggers CI/CD
- [ ] PR to `main` runs PR checks
- [ ] All 4,158+ tests pass in CI
- [ ] Coverage report generates
- [ ] Build artifacts created
- [ ] Status checks required on PRs
- [ ] Branch protection rules active
- [ ] Notifications working (if configured)
- [ ] Deployment working (if configured)
- [ ] Nightly tests scheduled

---

## 🎉 Success!

You now have a complete CI/CD pipeline with:

✅ **Automated Testing** - 4,158+ tests run on every change  
✅ **Code Quality** - Lint and type checks enforced  
✅ **Coverage Tracking** - 85%+ coverage maintained  
✅ **Build Verification** - Both staging and production  
✅ **Security Scanning** - Vulnerabilities detected early  
✅ **Demo Site Protection** - 216 tests ensure demos work  
✅ **Multi-Browser Testing** - E2E on Chromium, Firefox, WebKit  
✅ **Parallel Execution** - Fast feedback (20-40 min)  
✅ **Nightly Comprehensive** - Full testing suite overnight  

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Codecov Documentation](https://docs.codecov.com)

---

## 🆘 Need Help?

Common commands:

```bash
# Run tests locally like CI does
pnpm test --run

# Check coverage locally
pnpm test:coverage --run

# Lint check
pnpm lint

# Type check
pnpm type-check

# Build check
pnpm build:staging
```

---

**Status:** ✅ CI/CD Setup Complete!  
**Next Steps:** Create a PR and watch the magic happen! 🚀
