---
inclusion: always
---
---
inclusion: always
---

# CI/CD & Quality Gates

## Pipeline Overview

### GitHub Actions Workflows
- `playwright.yml` - E2E tests on push/PR to main/master
- `test.yml.example` - Comprehensive test suite template (not active)

### Test Execution Strategy
- Local development: `npm run test:safe` (1 worker, 1 max concurrency, single-threaded)
- CI environment: `npm run test:full` (6 workers, 6 max concurrency via command-line overrides)
- Comprehensive: `npm run test:all` (runs all test categories sequentially)
- Kill lingering processes: `npm run test:kill` (terminates all Vitest processes)

## Pre-Commit Quality Gates

### Required Checks (run these before committing)
1. Type checking: `npm run type-check`
2. Linting: `npm run lint`
3. Lint validation: `npm run lint:validate` (checks against baseline)
4. Tests: `npm run test:safe` (local) or `npm run test:full` (CI)

### Lint Baseline System
- Baseline file: `.kiro/specs/lint-warnings-cleanup/baseline.json`
- Create baseline: `npm run lint:baseline`
- Validate changes: `npm run lint:validate`
- Category-specific: `npm run lint:validate -- --category @typescript-eslint/no-explicit-any`
- Validation rules:
  - Warning counts MUST NOT increase
  - New warning categories MUST NOT be introduced
  - Improvements (decreased warnings) are encouraged
  - Exit code 0 = passed, 1 = failed (CI-friendly)

## Build & Deployment

### Frontend Builds
- Development: `npm run build` (uses default env)
- Staging: `npm run build:staging` (sets VITE_APP_ENV=staging)
- Production: `npm run build:production` (sets VITE_APP_ENV=production)
- Preview builds: `npm run preview`, `npm run preview:staging`, `npm run preview:production`

### Backend Deployment (Supabase Edge Functions)
- Development: `./deploy-backend.sh dev`
- Production: `./deploy-backend.sh prod` (requires confirmation)
- Deployment process:
  1. Validates function directory structure
  2. Deploys to Supabase project (dev: wjfcqqrlhwdvjmefxky, prod: lmffeqwhrnbsbhdztwyv)
  3. Runs health check at `/health` endpoint
  4. Displays logs command for troubleshooting
- Health check must return `{"status":"ok"}` for successful deployment

### Environment Variables
- Client-side variables MUST be prefixed with `VITE_`
- Never commit `.env` files (use `.env.example` as template)
- Production credentials MUST NOT be exposed in code

## Test Organization

### Test Categories (npm scripts)
- `test:ui-components` - Shadcn/ui component tests
- `test:app-components` - Application component tests
- `test:admin-components` - Admin dashboard component tests
- `test:integration` - Integration tests
- `test:contexts` - Context provider tests
- `test:services` - Service layer tests
- `test:hooks` - Custom hook tests
- `test:utils` - Utility function tests
- `test:pages-user` - User-facing page tests
- `test:pages-admin` - Admin page tests
- `test:backend` - Backend Edge Function tests (Deno)
- `test:e2e` - Playwright E2E tests (separate from Vitest)

### Test Execution Rules
- Unit tests: Co-located with source files (`.test.tsx` or `.test.ts`)
- Max timeout: 10 seconds per test/hook
- Property-based tests: MUST annotate with `**Validates: Requirements X.Y**`
- Backend tests: Run with Deno in `supabase/functions/server/tests/`
- E2E tests: Run with Playwright in `e2e/` directory
- Bugfix tests: Include both exploration tests (verify bug exists) and preservation tests (verify no regressions)

### Preservation Testing for Configuration Changes

When modifying test configuration (vitest.config.ts, package.json scripts), create preservation tests to ensure:

1. **CI Performance Preserved**: Verify `test:full` maintains high resource limits via command-line overrides
2. **Watch Mode Preserved**: Verify watch commands omit `--run` flag
3. **Single-Run Behavior Preserved**: Verify non-watch commands include `--run` flag
4. **Coverage Generation Preserved**: Verify coverage commands have proper flags
5. **Configuration Structure Preserved**: Verify config file maintains expected structure

Example preservation test location: `src/app/__tests__/bugfix/[feature].preservation.test.ts`

See `docs/05-testing/property-based-tests.md` for detailed patterns and examples.

### Coverage
- Generate coverage: `npm run test:coverage` or `npm run test:all:coverage`
- Coverage reports: `coverage/` directory
- Upload to Codecov in CI (see test.yml.example)

## CI/CD Best Practices

### Pull Request Workflow
1. Run `npm run type-check` locally
2. Run `npm run lint:validate` to ensure no regressions
3. Run `npm run test:safe` to verify tests pass
4. Push changes and create PR
5. GitHub Actions runs Playwright E2E tests automatically
6. Review test results and coverage reports

### Deployment Workflow
1. Test changes in development environment first
2. Run full test suite: `npm run test:all`
3. Validate lint baseline: `npm run lint:validate`
4. Deploy backend to dev: `./deploy-backend.sh dev`
5. Test deployed backend health check
6. If successful, deploy to production: `./deploy-backend.sh prod`
7. Monitor logs: `supabase functions logs make-server-6fcaeea3`

### Cross-Platform Considerations
- Scripts support both Unix (Mac/Linux) and Windows
- Use `npm run` commands (cross-platform) over direct bash commands
- Backend deployment: `deploy-backend.sh` (Unix) or `deploy-backend.bat` (Windows)
- Clean artifacts: `npm run clean` or `npm run clean:all`

## Continuous Integration Setup (Example)

### Recommended CI Jobs
1. **Quality Checks** - Type check, lint, format validation
2. **Vitest Tests** - Fast unit/integration tests
3. **E2E Tests** - Playwright browser tests
4. **Backend Tests** - Deno tests for Edge Functions
5. **Cross-Platform Tests** - Run on Ubuntu, Windows, macOS
6. **Test Summary** - Aggregate results and fail if any job fails

### Matrix Strategy
- Node versions: 18.x, 20.x
- Operating systems: ubuntu-latest, windows-latest, macos-latest
- Use `npm ci` for reproducible installs in CI

### Artifact Retention
- Test results: 30 days
- Coverage reports: Upload to Codecov
- Playwright reports: Upload on failure for debugging

## Database Migrations

### Performance Optimization
- Analyze queries: `npm run db-optimizer:analyze`
- Generate migrations: `npm run db-optimizer:generate`
- Analyze indexes: `npm run db-optimizer:analyze-indexes`
- Generate index migrations: `npm run db-optimizer:generate-index-migrations`

### Migration Testing
1. Test migrations in development environment first
2. Verify performance improvements with analyzer
3. Review generated migration files before applying
4. Apply to production only after thorough testing

## Troubleshooting

### Common CI Failures
- **Type check fails**: Run `npm run type-check` locally and fix errors
- **Lint validation fails**: Check `npm run lint:validate:verbose` for details
- **Tests timeout**: Reduce concurrency or increase timeout in vitest.config
- **Backend health check fails**: Wait 30s for cold start, check logs
- **E2E tests flaky**: Review Playwright report artifacts

### Debug Commands
- Kill all Vitest processes: `npm run test:kill` (use when tests hang or spawn too many processes)
- Verbose lint validation: `npm run lint:validate:verbose`
- Verbose test output: `npm run test:all:verbose`
- Watch mode for tests: `npm run test:watch`
- E2E debug mode: `npm run test:e2e:debug`
- E2E UI mode: `npm run test:e2e:ui`

## Anti-Patterns to Avoid

- Don't skip type checking before committing
- Don't bypass lint validation (it catches regressions)
- Don't deploy to production without testing in dev first
- Don't commit with increased warning counts
- Don't run `npm test` directly (use test:safe or test:full)
- Don't mix Vitest and Playwright tests (separate directories)
- Don't hardcode environment-specific values in code
- Don't deploy backend without verifying health check
- Don't ignore CI failures (they indicate real issues)