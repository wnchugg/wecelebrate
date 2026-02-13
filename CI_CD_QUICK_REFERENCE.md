# 🚀 CI/CD Quick Reference

## 📋 Workflows Overview

| Workflow | Trigger | Duration | Purpose |
|----------|---------|----------|---------|
| **CI/CD Pipeline** | Push to main/develop/staging, PRs | 30-40 min | Complete testing & deployment |
| **Pull Request Checks** | PR opened/updated | 20-25 min | PR validation & coverage |
| **Nightly Tests** | 2 AM UTC daily | 2-3 hours | Comprehensive testing |

---

## ⚡ Quick Commands

### Run Tests Locally (Like CI Does)

```bash
# All tests
pnpm test --run

# With coverage
pnpm test:coverage --run

# Specific test files
pnpm test -- demoSiteConfigurations --run

# Demo site tests only (216 tests)
pnpm test -- demoSiteConfigurations multiCatalogArchitecture siteConfigurationTabs --run

# Integration tests
pnpm test:integration --run

# E2E tests
pnpm test:e2e
```

### Code Quality Checks

```bash
# Lint
pnpm lint

# Type check
pnpm type-check

# Format
pnpm format

# All checks
pnpm lint && pnpm type-check && pnpm test --run
```

### Build Checks

```bash
# Staging build
pnpm build:staging

# Production build
pnpm build:production

# Check build size
du -sh dist/
```

---

## 🎯 CI/CD Pipeline Stages

### 1️⃣ Code Quality (5 min)
```
Lint → Type Check → Format Check
```

### 2️⃣ Unit Tests (15 min)
```
4,158+ tests → Demo Sites (216 tests) → Test Report
```

### 3️⃣ Coverage (15 min)
```
Generate Coverage → Upload to Codecov → Comment on PR
```

### 4️⃣ Integration (15 min)
```
Component Integration → Context Integration → Flow Tests
```

### 5️⃣ E2E Tests (20 min)
```
Build App → Playwright Tests → Upload Artifacts
```

### 6️⃣ Build (10 min)
```
Staging Build → Production Build → Size Analysis
```

### 7️⃣ Security (10 min)
```
npm audit → Vulnerability Scan → Report
```

### 8️⃣ Deploy (5 min)
```
Deploy to Staging/Production (if on main/develop)
```

---

## 📊 What Gets Tested

### Demo Site Tests (216 tests)
- ✅ All 5 demo sites
- ✅ All validation methods
- ✅ Multi-catalog architecture
- ✅ Smart UI controls
- ✅ RecHUB branding
- ✅ Configuration tabs

### Full Test Suite (4,158+ tests)
- ✅ Utils & Hooks (1,289 tests)
- ✅ Contexts (1,483 tests)
- ✅ Pages & Routes (1,170 tests)
- ✅ Demo Sites (216 tests)

### E2E Tests
- ✅ Shopping flow
- ✅ User journeys
- ✅ Complex scenarios

---

## 🔧 Troubleshooting

### Tests Pass Locally but Fail in CI?

**Check:**
```bash
# Environment variables
echo $NODE_ENV  # Should be 'test' in CI

# Node version
node --version  # Should be v20 in CI

# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm test --run
```

### CI Running Too Slow?

**Optimization checklist:**
- ✅ Caching enabled (pnpm cache)
- ✅ Parallel execution (4 shards)
- ✅ Skip unnecessary workflows
- ✅ Use `--run` flag (no watch mode)

### Coverage Not Uploading?

**Fix:**
```yaml
# Add CODECOV_TOKEN to GitHub Secrets
CODECOV_TOKEN: your-token-here

# Or check file exists
ls -la coverage/coverage-final.json
```

---

## 🚦 Status Checks

### Required Checks for PRs:
- ✅ lint-and-typecheck
- ✅ unit-tests
- ✅ coverage-tests
- ✅ build-check
- ✅ demo-site-tests

### Optional Checks:
- 🔶 e2e-tests
- 🔶 security-scan
- 🔶 performance-tests

---

## 📱 Workflow Statuses

| Status | Meaning |
|--------|---------|
| ✅ Success | All checks passed |
| ⚠️ Warning | Some optional checks failed |
| ❌ Failure | Required checks failed |
| 🔄 In Progress | Running... |
| ⏭️ Skipped | Not required for this change |
| ❓ Pending | Waiting to run |

---

## 🎯 When to Use Manual Trigger

### Nightly Tests:
```
Actions → Nightly Test Suite → Run workflow
```

**Use when:**
- Testing major changes before merge
- Validating on multiple browsers
- Need comprehensive coverage report
- Want performance benchmarks

### Main CI/CD:
```
Actions → CI/CD Pipeline → Run workflow
```

**Use when:**
- Re-running failed workflow
- Testing without pushing commits
- Validating hotfix quickly

---

## 📈 Coverage Goals

| Type | Target | Current |
|------|--------|---------|
| Overall | 85%+ | ✅ 85%+ |
| Utils | 90%+ | ✅ 90%+ |
| Hooks | 90%+ | ✅ 90%+ |
| Contexts | 85%+ | ✅ 85%+ |
| Components | 80%+ | ✅ 82%+ |
| Pages | 75%+ | ✅ 78%+ |
| Demo Sites | 100% | ✅ 100% |

---

## 🔔 Notifications

### GitHub (Automatic):
- Email on workflow failure
- In-app notifications
- PR status checks

### Slack (Optional):
```yaml
# Add to workflow
- uses: 8398a7/action-slack@v3
  with:
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 🚀 Deployment Environments

| Environment | Branch | Auto-Deploy | URL |
|-------------|--------|-------------|-----|
| **Production** | main | ✅ Yes | https://wecelebrate.app |
| **Staging** | develop | ✅ Yes | https://staging.wecelebrate.app |
| **Preview** | PR branches | ✅ Yes | https://pr-123.wecelebrate.app |

---

## 📊 Artifacts Available

After each workflow run:

- 📦 **Build artifacts** (staging/production)
- 📊 **Coverage reports** (HTML + JSON)
- 🎭 **Playwright reports** (if E2E ran)
- 📸 **Screenshots** (on E2E failure)
- 📋 **Test results** (JUnit XML)

**Download from:**
Actions → Workflow Run → Artifacts section

---

## ⏱️ Typical Timeline

### Feature Branch → PR:
```
0:00  Create PR
0:01  Quick checks start (lint, type check)
0:05  ✅ Quick checks pass
0:06  Full test suite starts
0:26  ✅ All 4,158+ tests pass
0:27  Coverage report comments on PR
0:30  ✅ PR ready for review!
```

### PR → Merge → Deploy:
```
0:00  Merge to main
0:01  CI/CD pipeline starts
0:30  ✅ All tests pass
0:35  ✅ Build complete
0:40  ✅ Deployed to production!
```

---

## 🎯 Best Practices

### Before Creating PR:
```bash
# Run these locally first
pnpm lint
pnpm type-check
pnpm test --run
pnpm build:staging
```

### After CI Fails:
1. Read error logs carefully
2. Reproduce locally
3. Fix the issue
4. Test locally
5. Push fix
6. CI re-runs automatically

### For Flaky Tests:
1. Run locally 10x: `for i in {1..10}; do pnpm test --run || break; done`
2. Add retry logic if needed
3. Increase timeouts
4. Use proper `waitFor` patterns

---

## 📚 Useful Links

- **Actions Tab:** See all workflow runs
- **Codecov:** View coverage reports
- **Artifacts:** Download build/test results
- **Settings → Secrets:** Manage CI secrets
- **Settings → Branches:** Branch protection rules

---

## 🆘 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout in workflow |
| Out of memory | Add `max-old-space-size` flag |
| Flaky tests | Use retry logic + waitFor |
| Slow CI | Enable caching + parallel execution |
| Coverage drop | Check new code has tests |
| Build fails | Check environment variables |

---

## ✅ Quick Validation

After any changes, verify:

```bash
# 1. Tests pass
pnpm test --run

# 2. Demo sites work
pnpm test -- demoSite multiCatalog siteConfig --run

# 3. Build succeeds
pnpm build:staging

# 4. Coverage good
pnpm test:coverage --run

# All green? ✅ Ready to push!
```

---

**Last Updated:** February 12, 2026  
**Pipeline Version:** 1.0  
**Total Tests:** 4,158+  
**Coverage:** 85%+
