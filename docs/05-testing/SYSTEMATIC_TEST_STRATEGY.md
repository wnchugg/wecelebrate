# Systematic Testing Strategy
## Test Execution Plan for wecelebrate Platform

**Date:** February 12, 2026  
**Purpose:** Execute targeted tests systematically to identify and fix issues efficiently

---

## 🎯 Testing Philosophy

Instead of running all 566 tests at once (`npm test`), we'll:
1. **Test by category** - UI, services, pages, contexts, utils
2. **Fix issues immediately** - One category at a time
3. **Verify fixes** - Re-run category after fixes
4. **Track progress** - Document what's passing

---

## 📊 Test Categories & Scripts

### **Category 1: UI Components** ✅ PRIORITY
**Why First:** Foundation of the app, most isolated, easiest to fix  
**Test Count:** ~25 test files

```bash
# Run ALL UI component tests
npm run test:ui-components

# Run individual UI component tests
npm test src/app/components/ui/__tests__/button.test.tsx
npm test src/app/components/ui/__tests__/select.test.tsx
npm test src/app/components/ui/__tests__/tooltip.test.tsx
npm test src/app/components/ui/__tests__/dialog.test.tsx
npm test src/app/components/ui/__tests__/dropdown-menu.test.tsx
npm test src/app/components/ui/__tests__/form.test.tsx
npm test src/app/components/ui/__tests__/input.test.tsx
npm test src/app/components/ui/__tests__/checkbox.test.tsx
npm test src/app/components/ui/__tests__/radio-group.test.tsx
npm test src/app/components/ui/__tests__/switch.test.tsx
npm test src/app/components/ui/__tests__/tabs.test.tsx
npm test src/app/components/ui/__tests__/table.test.tsx
npm test src/app/components/ui/__tests__/badge.test.tsx
npm test src/app/components/ui/__tests__/card.test.tsx
npm test src/app/components/ui/__tests__/alert.test.tsx
npm test src/app/components/ui/__tests__/alert-dialog.test.tsx
npm test src/app/components/ui/__tests__/popover.test.tsx
npm test src/app/components/ui/__tests__/sheet.test.tsx
npm test src/app/components/ui/__tests__/progress.test.tsx
npm test src/app/components/ui/__tests__/skeleton.test.tsx
npm test src/app/components/ui/__tests__/textarea.test.tsx
npm test src/app/components/ui/__tests__/label.test.tsx
npm test src/app/components/ui/__tests__/breadcrumb.test.tsx
npm test src/app/components/ui/__tests__/navigation-menu.test.tsx
npm test src/app/components/ui/__tests__/pagination.test.tsx
```

**Expected Issues:**
- Radix UI accessibility (duplicate elements)
- jsdom missing APIs (scrollIntoView, pointerCapture)
- Mock issues with portal rendering

---

### **Category 2: Utility Functions** ✅ HIGH PRIORITY
**Why Second:** Core logic, no DOM dependencies  
**Test Count:** ~20 test files

```bash
# Run ALL utility tests
npm test src/app/utils/__tests__/

# Run individual utility tests
npm test src/app/utils/__tests__/bulkImport.test.tsx          # ✅ ExcelJS migration
npm test src/app/utils/__tests__/api.test.ts
npm test src/app/utils/__tests__/apiCache.test.ts
npm test src/app/utils/__tests__/availability.test.ts
npm test src/app/utils/__tests__/catalog-validation.test.ts
npm test src/app/utils/__tests__/clientConfigValidation.test.ts
npm test src/app/utils/__tests__/clipboard.test.ts
npm test src/app/utils/__tests__/configImportExport.test.ts
npm test src/app/utils/__tests__/countries.test.ts
npm test src/app/utils/__tests__/currency.test.ts
npm test src/app/utils/__tests__/emailTemplates.test.ts
npm test src/app/utils/__tests__/errorHandling.test.ts
npm test src/app/utils/__tests__/fileSecurityHelpers.test.ts
npm test src/app/utils/__tests__/logger.test.ts
npm test src/app/utils/__tests__/performanceMonitor.test.ts
npm test src/app/utils/__tests__/rateLimiter.test.ts
npm test src/app/utils/__tests__/reactOptimizations.test.ts
npm test src/app/utils/__tests__/routePreloader.test.ts
npm test src/app/utils/__tests__/security.test.optimized.ts
npm test src/app/utils/__tests__/sessionManager.test.ts
npm test src/app/utils/__tests__/siteConfigValidation.test.ts
npm test src/app/utils/__tests__/storage.test.ts
npm test src/app/utils/__tests__/tokenManager.test.ts
npm test src/app/utils/__tests__/url.test.ts
npm test src/app/utils/__tests__/validators.test.optimized.ts
```

**Expected Issues:**
- Mock setup for fetch
- localStorage/sessionStorage issues
- Date/time mocking

---

### **Category 3: Application Components** 🔶 MEDIUM PRIORITY
**Why Third:** Higher-level components, depends on UI  
**Test Count:** ~15 test files

```bash
# Run ALL app component tests
npm test src/app/components/__tests__/

# Run individual component tests
npm test src/app/components/__tests__/CopyButton.test.tsx
npm test src/app/components/__tests__/CurrencyDisplay.test.tsx
npm test src/app/components/__tests__/ErrorBoundary.test.tsx
npm test src/app/components/__tests__/EventCard.test.tsx
npm test src/app/components/__tests__/Footer.test.tsx
npm test src/app/components/__tests__/Header.test.tsx
npm test src/app/components/__tests__/LanguageSelector.test.tsx
npm test src/app/components/__tests__/Layout.test.tsx
npm test src/app/components/__tests__/Navigation.test.tsx
npm test src/app/components/__tests__/ProductCard.test.tsx
npm test src/app/components/__tests__/ProgressSteps.test.tsx
npm test src/app/components/__tests__/RichTextEditor.test.tsx
npm test src/app/components/__tests__/SessionTimeoutWarning.test.tsx
npm test src/app/components/__tests__/SiteSwitcher.test.tsx
npm test src/app/components/__tests__/protectedRoutes.test.tsx
```

**Expected Issues:**
- Context provider mocks
- Router mocks
- API call mocks

---

### **Category 4: Admin Components** 🔶 MEDIUM PRIORITY
**Why Fourth:** Admin-specific, complex state  
**Test Count:** ~7 test files

```bash
# Run ALL admin component tests
npm test src/app/components/admin/__tests__/

# Run individual admin component tests
npm test src/app/components/admin/__tests__/BrandModal.test.tsx
npm test src/app/components/admin/__tests__/ConfirmDialog.test.tsx
npm test src/app/components/admin/__tests__/CreateGiftModal.test.tsx
npm test src/app/components/admin/__tests__/CreateSiteModal.test.tsx
npm test src/app/components/admin/__tests__/DataTable.test.tsx
npm test src/app/components/admin/__tests__/Modal.test.tsx
npm test src/app/components/admin/__tests__/StatusBadge.test.tsx
```

**Expected Issues:**
- Form validation mocks
- Admin context mocks
- Complex modal interactions

---

### **Category 5: Context Providers** 🔶 MEDIUM PRIORITY
**Why Fifth:** State management, integration points  
**Test Count:** ~8 test files

```bash
# Run ALL context tests
npm test src/app/context/__tests__/

# Run individual context tests
npm test src/app/context/__tests__/AdminContext.test.tsx
npm test src/app/context/__tests__/AuthContext.test.tsx
npm test src/app/context/__tests__/AuthContext.integration.test.tsx
npm test src/app/context/__tests__/CartContext.test.tsx
npm test src/app/context/__tests__/CartContext.integration.test.tsx
npm test src/app/context/__tests__/GiftContext.test.tsx
npm test src/app/context/__tests__/LanguageContext.test.tsx
npm test src/app/context/__tests__/OrderContext.test.tsx
npm test src/app/context/__tests__/SiteContext.test.tsx
```

**Expected Issues:**
- Provider nesting
- useEffect timing
- State update batching

---

### **Category 6: Pages - User-Facing** ⚠️ LOWER PRIORITY
**Why Sixth:** Complex, depends on everything  
**Test Count:** ~4 test files

```bash
# Run ALL page tests
npm test src/app/pages/__tests__/

# Run individual page tests
npm test src/app/pages/__tests__/Cart.test.tsx
npm test src/app/pages/__tests__/Home.test.tsx
npm test src/app/pages/__tests__/ProductDetail.test.tsx
npm test src/app/pages/__tests__/Products.test.tsx
```

**Expected Issues:**
- Full component tree
- Multiple context providers
- Complex routing

---

### **Category 7: Pages - Admin** ⚠️ LOWER PRIORITY  
**Why Seventh:** Most complex, many dependencies  
**Test Count:** ~3 test files

```bash
# Run ALL admin page tests
npm test src/app/pages/admin/__tests__/

# Run individual admin page tests
npm test src/app/pages/admin/__tests__/AdminLogin.test.tsx
npm test src/app/pages/admin/__tests__/Dashboard.test.tsx              # ⚠️ Known issues
npm test src/app/pages/admin/__tests__/Dashboard.integration.test.tsx  # ⚠️ Known issues
```

**Expected Issues:**
- Mock data structure mismatches
- Async timing issues
- State management complexity

---

### **Category 8: Services** 🔶 MEDIUM PRIORITY
**Why Eighth:** API integration, depends on mocks  
**Test Count:** ~3 test files

```bash
# Run ALL service tests
npm test src/app/services/__tests__/

# Run individual service tests
npm test src/app/services/__tests__/dashboardService.test.ts
npm test src/services/__tests__/catalogApi.test.ts
```

**Expected Issues:**
- Fetch mock setup
- Response data structure
- Error handling

---

### **Category 9: Hooks** 🔶 MEDIUM PRIORITY
**Why Ninth:** Custom logic, React-specific  
**Test Count:** ~4 test files

```bash
# Run ALL hook tests
npm test src/app/hooks/__tests__/

# Run individual hook tests
npm test src/app/hooks/__tests__/useApi.test.ts
npm test src/app/hooks/__tests__/useAuth.test.ts
npm test src/app/hooks/__tests__/useSite.test.ts
npm test src/app/hooks/__tests__/useSites.test.ts
```

**Expected Issues:**
- renderHook setup
- useEffect timing
- Context dependencies

---

### **Category 10: Integration & E2E** ⚠️ LOWEST PRIORITY
**Why Last:** Full-stack, slowest, most complex  
**Test Count:** ~10 test files

```bash
# Run ALL integration tests
npm run test:integration

# Run individual integration tests
npm test src/app/__tests__/completeShoppingFlow.e2e.test.tsx
npm test src/app/__tests__/complexScenarios.e2e.test.tsx
npm test src/app/__tests__/configurationFeatures.integration.test.tsx
npm test src/app/__tests__/crossComponentIntegration.test.tsx
npm test src/app/__tests__/demoSiteConfigurations.test.tsx
npm test src/app/__tests__/multiCatalogArchitecture.test.tsx
npm test src/app/__tests__/navigationFlow.test.tsx
npm test src/app/__tests__/performance.benchmark.test.tsx
npm test src/app/__tests__/routes.test.tsx
npm test src/app/__tests__/siteConfigurationTabs.test.tsx
npm test src/app/__tests__/userJourney.e2e.test.tsx
```

**Expected Issues:**
- Full environment setup
- Multiple API calls
- Complex user flows

---

### **Category 11: Type Tests** ✅ HIGHEST PRIORITY (Quick Win)
**Why Anytime:** Fast, no runtime, just TypeScript  
**Test Count:** ~3 test files

```bash
# Run ALL type tests
npm test src/app/types/__tests__/
npm test src/types/__tests__/

# Run individual type tests
npm test src/app/types/__tests__/celebration.test.ts
npm test src/app/types/__tests__/emailTemplates.test.ts
npm test src/app/types/__tests__/shippingConfig.test.ts
npm test src/types/__tests__/catalog.test.ts
```

**Expected Issues:**
- Type definition mismatches
- Should be quick fixes

---

### **Category 12: Backend Tests** 🔶 MEDIUM PRIORITY
**Why Separate:** Deno environment, different setup  
**Test Count:** ~5 test files

```bash
# Run backend tests (if Deno available)
npm test supabase/functions/server/tests/

# Individual backend tests
npm test supabase/functions/server/tests/client_config.backend.test.ts
npm test supabase/functions/server/tests/dashboard_api.test.ts
npm test supabase/functions/server/tests/helpers.test.ts
npm test supabase/functions/server/tests/site_config.backend.test.ts
npm test supabase/functions/server/tests/validation.test.ts
```

**Expected Issues:**
- Deno vs Node differences
- Supabase mocks
- Environment variables

---

## 🎯 Execution Strategy

### Phase 1: Foundation (Day 1)
1. ✅ **Type Tests** - Quick wins (5 min)
2. ✅ **Utility Tests** - Core logic (30 min)
3. ✅ **UI Components** - Foundation (45 min)

### Phase 2: Application Layer (Day 1-2)
4. **App Components** - Business logic (30 min)
5. **Admin Components** - Admin-specific (30 min)
6. **Contexts** - State management (30 min)

### Phase 3: Integration (Day 2)
7. **Services** - API layer (20 min)
8. **Hooks** - Custom logic (20 min)
9. **Pages (User)** - User-facing (40 min)
10. **Pages (Admin)** - Admin pages (40 min)

### Phase 4: Full Coverage (Day 2-3)
11. **Integration Tests** - End-to-end (60 min)
12. **Backend Tests** - Server-side (30 min)

---

## 📝 Test Execution Template

For each category:

```bash
# 1. RUN TESTS
npm test <category-path>

# 2. IDENTIFY FAILURES
# - Note test names
# - Note error messages
# - Group similar errors

# 3. FIX ISSUES
# - One error type at a time
# - Update mocks
# - Fix implementations
# - Add polyfills if needed

# 4. VERIFY FIX
npm test <category-path>

# 5. DOCUMENT
# - Update progress tracker
# - Note solutions for future reference
```

---

## 📊 Progress Tracker

| Category | Status | Pass | Fail | Time | Notes |
|----------|--------|------|------|------|-------|
| **Type Tests** | ⏳ Pending | - | - | - | - |
| **Utility Tests** | ✅ Complete | 38 | 0 | 5ms | ExcelJS migration ✅ |
| **UI Components** | ⏳ Pending | - | - | - | Select polyfill added |
| **App Components** | ⏳ Pending | - | - | - | - |
| **Admin Components** | ⏳ Pending | - | - | - | - |
| **Contexts** | ⏳ Pending | - | - | - | - |
| **Pages (User)** | ⏳ Pending | - | - | - | - |
| **Pages (Admin)** | ⏳ Pending | - | - | - | Dashboard issues known |
| **Services** | ⏳ Pending | - | - | - | - |
| **Hooks** | ⏳ Pending | - | - | - | - |
| **Integration** | ⏳ Pending | - | - | - | - |
| **Backend** | ⏳ Pending | - | - | - | - |

---

## 🛠️ Common Fixes Reference

### Fix 1: Radix UI Duplicate Elements
```typescript
// Instead of getByText (expects 1)
const element = screen.getByText('Label');

// Use getAllByText (allows multiple)
const elements = screen.getAllByText('Label');
expect(elements.length).toBeGreaterThan(0);
```

### Fix 2: jsdom Missing APIs
```typescript
// Add to setupTests.ts
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn(() => false);
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
```

### Fix 3: Mock Fetch
```typescript
vi.mocked(global.fetch).mockResolvedValue({
  ok: true,
  json: async () => ({ data: mockData }),
} as Response);
```

### Fix 4: Async Timing
```typescript
await waitFor(() => {
  expect(screen.getByText('Expected')).toBeInTheDocument();
}, { timeout: 3000 });
```

### Fix 5: Context Providers
```typescript
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider value={mockAuthValue}>
    <SiteContext.Provider value={mockSiteValue}>
      {children}
    </SiteContext.Provider>
  </AuthContext.Provider>
);

render(<Component />, { wrapper });
```

---

## 🎯 Success Criteria

- [ ] All UI Component tests passing
- [ ] All Utility tests passing  
- [ ] All Context tests passing
- [ ] All Page tests passing (or documented issues)
- [ ] All Service tests passing
- [ ] All Hook tests passing
- [ ] Integration tests passing (critical flows)
- [ ] Overall coverage ≥ 90%
- [ ] No security vulnerabilities
- [ ] Production ready

---

## 📚 Resources

- [UI Test Fixes Documentation](/UI_TEST_FIXES.md)
- [Test Status Summary](/TEST_STATUS_SUMMARY.md)
- [ExcelJS Migration Summary](/EXCELJS_MIGRATION_SUMMARY.md)
- [Complete Testing Overview](/COMPLETE_TESTING_OVERVIEW.md)

---

**Status:** Ready to Execute  
**Last Updated:** February 12, 2026  
**Next Action:** Start with Category 1 (UI Components)
