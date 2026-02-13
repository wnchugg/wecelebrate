# Quick Reference: Systematic Testing

## 🚀 Quick Start

### Option 1: Interactive Script (Recommended)
```bash
# Linux/Mac
./run-systematic-tests.sh

# Windows
run-systematic-tests.bat
```

### Option 2: npm Scripts (Fast)
```bash
# Run by category
npm run test:type-tests        # Type definition tests
npm run test:utils             # Utility function tests ✅ ExcelJS
npm run test:ui-components     # UI component tests
npm run test:app-components    # App component tests
npm run test:admin-components  # Admin component tests
npm run test:contexts          # Context provider tests
npm run test:services          # Service layer tests
npm run test:hooks             # Custom hooks tests
npm run test:pages-user        # User-facing pages
npm run test:pages-admin       # Admin pages
npm run test:backend           # Backend tests

# Specific test files
npm run test:bulkimport        # BulkImport (ExcelJS) ✅
npm run test:dashboard         # Dashboard component
npm run test:dashboard-integration  # Dashboard integration

# All tests (traditional)
npm test                       # Run all 566 tests
```

---

## 📋 Recommended Testing Order

### Phase 1: Foundation (Start Here!)
```bash
# 1. Quick wins - Type tests (2 min)
npm run test:type-tests

# 2. Core logic - Utils (includes ExcelJS) (5 min)
npm run test:utils

# 3. UI foundation - Components (10 min)
npm run test:ui-components
```

### Phase 2: Application Layer
```bash
# 4. App components (5 min)
npm run test:app-components

# 5. Admin components (5 min)
npm run test:admin-components

# 6. Contexts (5 min)
npm run test:contexts
```

### Phase 3: Integration
```bash
# 7. Services (3 min)
npm run test:services

# 8. Hooks (3 min)
npm run test:hooks

# 9. User pages (8 min)
npm run test:pages-user

# 10. Admin pages (8 min) - Known issues
npm run test:pages-admin
```

---

## ⚡ Common Commands

### Single Test File
```bash
# Run specific file
npm test src/app/utils/__tests__/bulkImport.test.tsx

# Watch mode for development
npm test src/app/utils/__tests__/bulkImport.test.tsx -- --watch
```

### Pattern Matching
```bash
# Run all tests matching pattern
npm test -- bulkImport
npm test -- Dashboard
npm test -- Context
```

### Coverage
```bash
# Run with coverage
npm run test:coverage

# Run specific category with coverage
npm run test:utils -- --coverage
```

---

## 🔍 Test Status Quick Check

### Check ExcelJS Migration (Should Pass ✅)
```bash
npm run test:bulkimport
```

### Check UI Components (May need fixes)
```bash
npm run test:ui-components
```

### Check Dashboard (Known issues ⚠️)
```bash
npm run test:dashboard
```

---

## 🛠️ When Tests Fail

### Step 1: Identify the Issue
```bash
# Run the failing category
npm run test:ui-components

# Look for:
# - "scrollIntoView is not a function" → Need polyfill
# - "Found multiple elements" → Use getAllByText()
# - "Test timed out" → Check async/mock setup
# - "Cannot read properties of undefined" → Check mock data
```

### Step 2: Apply Common Fixes

**Fix 1: jsdom Missing API**
```typescript
// Add to /src/setupTests.ts
Element.prototype.scrollIntoView = vi.fn();
```

**Fix 2: Duplicate Elements**
```typescript
// Change from:
const element = screen.getByText('Label');

// To:
const elements = screen.getAllByText('Label');
expect(elements.length).toBeGreaterThan(0);
```

**Fix 3: Mock Setup**
```typescript
beforeEach(() => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({ data: mockData }),
  } as Response);
});
```

### Step 3: Verify Fix
```bash
# Re-run the same category
npm run test:ui-components
```

---

## 📊 Progress Tracking

### Mark as Complete
After fixing a category, update `/SYSTEMATIC_TEST_STRATEGY.md`:

```markdown
| Category | Status | Pass | Fail | Notes |
|----------|--------|------|------|-------|
| Utils | ✅ | 38 | 0 | Complete! |
```

---

## 🎯 Success Metrics

- [ ] **Type Tests** - Should pass easily
- [ ] **Utils** - ✅ 38/38 passing (ExcelJS migration done!)
- [ ] **UI Components** - Target: 100% passing
- [ ] **App Components** - Target: 100% passing
- [ ] **Contexts** - Target: 100% passing
- [ ] **Services** - Target: 100% passing
- [ ] **Hooks** - Target: 100% passing
- [ ] **Pages** - Target: 95%+ passing
- [ ] **Overall Coverage** - Target: 90%+

---

## 📚 Documentation

- **Full Strategy:** `/SYSTEMATIC_TEST_STRATEGY.md`
- **UI Test Fixes:** `/UI_TEST_FIXES.md`
- **Test Status:** `/TEST_STATUS_SUMMARY.md`
- **ExcelJS Migration:** `/EXCELJS_MIGRATION_SUMMARY.md`

---

## 💡 Pro Tips

1. **Start Small:** Begin with one category, don't run all tests at once
2. **Fix Patterns:** Group similar errors and fix them together
3. **Document:** Note solutions in comments for future reference
4. **Iterate:** Run → Fix → Verify → Move to next category
5. **Skip Known Issues:** Dashboard tests have known issues, document and move on

---

## 🆘 Help

### Test is Too Slow
```bash
# Run with fewer workers
npm test -- --pool=forks --poolOptions.forks.singleFork

# Or just run specific file
npm test path/to/test.tsx
```

### Can't Find Test File
```bash
# List all test files
find src -name "*.test.tsx" -o -name "*.test.ts"
```

### Mock Not Working
```bash
# Check setupTests.ts is being loaded
cat src/setupTests.ts

# Verify vitest.config.ts includes setupFiles
cat vitest.config.ts | grep setupFiles
```

---

**Last Updated:** February 12, 2026  
**Status:** Ready to use! 🚀
