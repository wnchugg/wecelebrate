# Resource Management Analysis - Mac Crash Prevention

**Date:** February 15, 2026  
**Incident:** Mac crash due to excessive resource usage during test execution

## What Likely Happened

### Primary Cause: Test Suite Resource Exhaustion
Running the full test suite (`npm test`) with 126 test files and 2,764 tests simultaneously likely caused:

1. **Memory Exhaustion**
   - 126 test files running in parallel
   - Each test file spawning its own environment
   - JSDOM instances for each test (heavy memory usage)
   - React component rendering in memory
   - Mock data accumulation

2. **CPU Overload**
   - Vitest running tests in parallel by default
   - Multiple Node.js processes
   - Babel/TypeScript transpilation
   - Test environment setup/teardown

3. **File System Stress**
   - Reading 126+ test files
   - Source file imports
   - Mock file operations
   - Temporary file creation

## Resource Usage Estimates

### Per Test File (Approximate)
- **Memory:** 50-100 MB per test file
- **CPU:** 1-2 cores during execution
- **Total for 126 files:** 6-12 GB RAM, 100%+ CPU

### Your Mac Likely Hit
- Memory pressure → Swap usage → Disk thrashing → System freeze
- CPU saturation → Thermal throttling → System instability

## Prevention Strategies

### 1. Limit Parallel Test Execution ✅ RECOMMENDED

**Add to `vitest.config.ts`:**
```typescript
export default defineConfig({
  test: {
    // Limit concurrent test files
    maxConcurrency: 4,        // Max 4 test files at once
    pool: 'forks',            // Use process pool
    poolOptions: {
      forks: {
        maxForks: 4,          // Max 4 worker processes
        minForks: 1,
      }
    },
    // Limit threads per test file
    maxWorkers: 4,
    minWorkers: 1,
  }
});
```

### 2. Run Tests in Batches

**Instead of:**
```bash
npm test  # Runs ALL 126 test files
```

**Do this:**
```bash
# Run specific test suites
npm test src/app/components/  # Just component tests
npm test src/app/hooks/       # Just hook tests
npm test src/services/        # Just service tests

# Or run one file at a time
npm test src/app/components/__tests__/Layout.test.tsx
```

### 3. Use Test Filtering

**Run only changed tests:**
```bash
npm test -- --changed  # Only tests for changed files
npm test -- --related src/app/components/Layout.tsx  # Related tests
```

**Run by pattern:**
```bash
npm test -- --grep "Layout"  # Only tests matching "Layout"
npm test -- src/app/components/__tests__/*.test.tsx  # Specific pattern
```

### 4. Monitor Resources During Tests

**Before running tests:**
```bash
# Check available memory
vm_stat | grep "Pages free"

# Monitor during tests (in another terminal)
top -o mem  # Sort by memory
```

**Safe thresholds:**
- Available RAM > 4 GB before starting
- CPU usage < 80% before starting
- Disk space > 10 GB free

### 5. Optimize Test Configuration

**Add to `vitest.config.ts`:**
```typescript
export default defineConfig({
  test: {
    // Reduce memory usage
    isolate: false,           // Share environment between tests
    globals: false,           // Don't inject globals
    
    // Faster execution
    cache: {
      dir: '.vitest/cache'    // Cache test results
    },
    
    // Timeout protection
    testTimeout: 10000,       // 10s max per test
    hookTimeout: 10000,       // 10s max per hook
    
    // Cleanup
    clearMocks: true,
    restoreMocks: true,
    
    // Reduce output
    reporters: ['basic'],     // Less verbose output
  }
});
```

### 6. Skip Heavy Tests During Development

**Mark expensive tests:**
```typescript
// In test files
describe.skip('Heavy E2E Tests', () => {
  // These tests are skipped by default
});

// Or use environment variable
const runExpensiveTests = process.env.RUN_EXPENSIVE_TESTS === 'true';

(runExpensiveTests ? describe : describe.skip)('Expensive Tests', () => {
  // Only run when explicitly enabled
});
```

### 7. Use Test Sharding for CI/CD

**Split tests across multiple runs:**
```bash
# Run 1/4 of tests
npm test -- --shard=1/4

# Run 2/4 of tests
npm test -- --shard=2/4

# etc.
```

## Recommended Test Workflow

### For Development (Safe)
```bash
# 1. Run only the tests you're working on
npm test src/app/components/__tests__/MyComponent.test.tsx

# 2. Run related tests
npm test -- --related src/app/components/MyComponent.tsx

# 3. Run in watch mode (auto-runs on changes)
npm test -- --watch
```

### For Pre-Commit (Moderate)
```bash
# Run changed tests only
npm test -- --changed

# Or run specific suites
npm test src/app/components/
npm test src/app/hooks/
```

### For CI/CD (Full Suite)
```bash
# Run all tests with resource limits
npm test -- --maxConcurrency=4 --maxWorkers=4

# Or use sharding
npm test -- --shard=1/4
npm test -- --shard=2/4
npm test -- --shard=3/4
npm test -- --shard=4/4
```

## Immediate Actions to Take

### 1. Update Vitest Config (CRITICAL)
```bash
# Edit vitest.config.ts and add resource limits
```

### 2. Create Test Scripts (RECOMMENDED)
Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    
    "test:components": "vitest run src/app/components/",
    "test:hooks": "vitest run src/app/hooks/",
    "test:services": "vitest run src/services/",
    "test:pages": "vitest run src/app/pages/",
    
    "test:changed": "vitest run --changed",
    "test:related": "vitest run --related",
    
    "test:safe": "vitest run --maxConcurrency=2 --maxWorkers=2",
    "test:full": "vitest run --maxConcurrency=4 --maxWorkers=4"
  }
}
```

### 3. Monitor System Resources
```bash
# Before running tests, check:
# 1. Available RAM (should be > 4 GB)
# 2. CPU usage (should be < 80%)
# 3. Disk space (should be > 10 GB)

# Use Activity Monitor or:
top -l 1 | grep PhysMem
```

## Mac-Specific Considerations

### Memory Pressure
- macOS uses memory compression and swap
- When RAM is full, it swaps to disk (slow)
- This causes disk thrashing → system freeze

### Thermal Management
- MacBooks throttle CPU when hot
- Running all tests generates heat
- Throttling + high load = system instability

### Recommended Limits for Mac
- **8 GB RAM:** maxConcurrency=2, maxWorkers=2
- **16 GB RAM:** maxConcurrency=4, maxWorkers=4
- **32 GB RAM:** maxConcurrency=8, maxWorkers=8

## Emergency Recovery

### If Tests Start Consuming Too Much
1. **Force quit terminal:** Cmd+Option+Esc → Terminal → Force Quit
2. **Kill Node processes:** `killall node`
3. **Clear test cache:** `rm -rf .vitest node_modules/.vite`
4. **Restart terminal**

### If Mac Becomes Unresponsive
1. **Force restart:** Hold Power button for 10 seconds
2. **Safe mode:** Hold Shift during startup
3. **Check disk:** Disk Utility → First Aid

## Long-Term Solutions

### 1. Reduce Test Count
- Combine similar tests
- Remove redundant tests
- Focus on critical paths

### 2. Optimize Test Performance
- Use shallow rendering where possible
- Mock heavy dependencies
- Reduce test data size

### 3. Use Remote Testing
- Run heavy tests in CI/CD only
- Use GitHub Actions or similar
- Local development = fast tests only

### 4. Upgrade Hardware (if possible)
- More RAM = more parallel tests
- SSD = faster test execution
- Better cooling = sustained performance

## Monitoring Script

Create `scripts/check-resources.sh`:
```bash
#!/bin/bash

# Check available resources before running tests
echo "🔍 Checking system resources..."

# Check available RAM (in GB)
FREE_RAM=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
FREE_RAM_GB=$((FREE_RAM * 4096 / 1024 / 1024 / 1024))

echo "💾 Available RAM: ${FREE_RAM_GB} GB"

if [ $FREE_RAM_GB -lt 4 ]; then
  echo "⚠️  WARNING: Low memory! Close some applications before running tests."
  exit 1
fi

# Check CPU usage
CPU_USAGE=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')

echo "🔥 CPU Usage: ${CPU_USAGE}%"

if [ $(echo "$CPU_USAGE > 80" | bc) -eq 1 ]; then
  echo "⚠️  WARNING: High CPU usage! Wait for other processes to complete."
  exit 1
fi

echo "✅ System resources OK. Safe to run tests."
```

Usage:
```bash
chmod +x scripts/check-resources.sh
./scripts/check-resources.sh && npm test
```

## Summary

### DO ✅
- Limit parallel test execution (maxConcurrency=4)
- Run tests in batches by directory
- Use test filtering (--changed, --related)
- Monitor system resources before testing
- Use test:safe script for development

### DON'T ❌
- Run full test suite on local machine
- Run tests with unlimited parallelism
- Run tests when RAM < 4 GB available
- Run tests when CPU > 80% usage
- Ignore memory warnings

### Quick Fix (Do This Now)
```bash
# 1. Update vitest.config.ts with resource limits
# 2. Add test:safe script to package.json
# 3. Use: npm run test:safe instead of npm test
```

---

**Status:** Analysis Complete  
**Priority:** CRITICAL - Implement resource limits immediately  
**Impact:** Prevents system crashes, enables safe testing
