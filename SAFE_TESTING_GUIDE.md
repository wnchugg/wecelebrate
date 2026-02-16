# Safe Testing Guide - Prevent Mac Crashes

**CRITICAL:** Always use safe test commands to prevent system crashes!

## ⚠️ NEVER DO THIS
```bash
npm test  # ❌ BLOCKED - Will try to run all 126 test files and crash your Mac!
```

## ✅ SAFE COMMANDS

### For Daily Development (RECOMMENDED)
```bash
# Run tests safely with resource limits
npm run test:safe

# Run only changed tests (fastest)
npm run test:changed

# Run tests related to a specific file
npm run test:related src/app/components/Layout.tsx

# Watch mode for active development
npm run test:watch
```

### For Specific Test Suites
```bash
# Component tests
npm run test:app-components

# UI component tests
npm run test:ui-components

# Utility tests
npm run test:utils

# Integration tests
npm run test:integration
```

### For Single Test Files
```bash
# Run one specific test file
npm run test:safe src/app/components/__tests__/Layout.test.tsx

# Watch a specific test file
npm run test:watch src/app/components/__tests__/Layout.test.tsx
```

### For CI/CD Only
```bash
# Full test suite with limits (use in CI/CD, not locally)
npm run test:full
```

## Resource Limits Applied

### Vitest Configuration
- **Max Concurrent Files:** 4 (instead of unlimited)
- **Max Workers:** 4 (instead of all CPU cores)
- **Test Timeout:** 10 seconds
- **Pool:** Forks (better isolation)

### What This Means
- Only 4 test files run at once
- Uses max 4 CPU cores
- Memory usage capped at ~400-800 MB
- Tests take longer but won't crash your Mac

## Before Running Tests

### Check System Resources
```bash
# Check available RAM (should be > 4 GB)
vm_stat | grep "Pages free"

# Check CPU usage (should be < 80%)
top -l 1 | grep "CPU usage"

# Check disk space (should be > 10 GB)
df -h
```

### Close Heavy Applications
- Chrome/Safari with many tabs
- Docker Desktop
- IDEs (except the one you're using)
- Video/audio apps
- Virtual machines

## Test Workflow

### 1. Development Workflow (Safest)
```bash
# Step 1: Run only the test you're working on
npm run test:safe src/app/components/__tests__/MyComponent.test.tsx

# Step 2: Run related tests
npm run test:related src/app/components/MyComponent.tsx

# Step 3: Run changed tests before commit
npm run test:changed
```

### 2. Pre-Commit Workflow
```bash
# Run only changed tests
npm run test:changed

# Or run specific suite
npm run test:app-components
```

### 3. Full Test Suite (CI/CD Only)
```bash
# Only run this in CI/CD or when you have time to wait
npm run test:full
```

## Emergency: If Tests Start Consuming Too Much

### Stop Tests Immediately
```bash
# Press Ctrl+C in terminal

# If that doesn't work, force quit:
# 1. Cmd+Option+Esc
# 2. Select Terminal
# 3. Click Force Quit

# Or kill all Node processes:
killall node
```

### Clear Test Cache
```bash
# Clear Vitest cache
rm -rf .vitest node_modules/.vite

# Restart terminal
```

## Test Script Reference

| Command | Use Case | Safety | Speed |
|---------|----------|--------|-------|
| `npm run test:safe` | Daily development | ✅ Safe | Medium |
| `npm run test:changed` | Pre-commit | ✅ Safe | Fast |
| `npm run test:related` | Specific file work | ✅ Safe | Fast |
| `npm run test:watch` | Active development | ✅ Safe | Fast |
| `npm run test:app-components` | Component testing | ✅ Safe | Medium |
| `npm run test:ui-components` | UI testing | ✅ Safe | Fast |
| `npm run test:utils` | Utility testing | ✅ Safe | Fast |
| `npm run test:full` | CI/CD only | ⚠️ Caution | Slow |
| `npm test` | BLOCKED | ❌ Unsafe | N/A |

## Mac-Specific Recommendations

### For 8 GB RAM Macs
```bash
# Use even more conservative limits
npm run test:safe  # Already configured for 8 GB
```

### For 16 GB RAM Macs
```bash
# Can use standard limits
npm run test:safe  # Works well
npm run test:full  # OK for full suite
```

### For 32 GB+ RAM Macs
```bash
# Can handle more parallel tests
npm run test:full  # No problem
```

## Monitoring During Tests

### Watch Resource Usage
```bash
# In another terminal, monitor:
top -o mem  # Sort by memory usage

# Look for:
# - Node processes using > 500 MB each
# - Total memory pressure
# - Swap usage (should be minimal)
```

### Warning Signs
- 🔴 **Memory pressure:** Yellow or red in Activity Monitor
- 🔴 **Swap usage:** > 1 GB
- 🔴 **CPU usage:** > 90% sustained
- 🔴 **Fan noise:** Loud and constant
- 🔴 **System lag:** UI becomes sluggish

### If You See Warning Signs
1. Stop tests immediately (Ctrl+C)
2. Close other applications
3. Wait for system to cool down
4. Run smaller test batches

## Best Practices

### DO ✅
- Use `test:safe` for local testing
- Run specific test files when possible
- Use `test:changed` before commits
- Monitor system resources
- Close heavy applications before testing
- Use watch mode for active development

### DON'T ❌
- Run `npm test` (blocked for safety)
- Run full test suite locally
- Run tests with < 4 GB free RAM
- Run tests with > 80% CPU usage
- Run tests while compiling/building
- Run multiple test commands simultaneously

## Quick Start

```bash
# 1. Check resources
vm_stat | grep "Pages free"  # Should show > 4 GB

# 2. Run safe tests
npm run test:safe

# 3. Or run specific tests
npm run test:safe src/app/components/__tests__/Layout.test.tsx

# 4. Watch mode for development
npm run test:watch
```

## Summary

- ✅ **Always use `test:safe`** for local testing
- ✅ **Run specific test files** when possible
- ✅ **Monitor system resources** before testing
- ✅ **Use `test:changed`** before commits
- ❌ **Never run `npm test`** (blocked)
- ❌ **Never run full suite** on low-resource Macs

---

**Remember:** It's better to run tests slowly and safely than to crash your Mac!

**Default command:** `npm run test:safe`
