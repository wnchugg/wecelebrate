# 🎯 Run Demo Tests - Quick Commands

## Copy-Paste Commands

### Run All Demo Tests
```bash
npm test -- demoSiteConfigurations multiCatalogArchitecture siteConfigurationTabs --run
```

### Run Individual Test Files

**Demo Site Configurations:**
```bash
npm test -- demoSiteConfigurations.test.tsx --run
```

**Multi-Catalog Architecture:**
```bash
npm test -- multiCatalogArchitecture.test.tsx --run
```

**Site Configuration Tabs:**
```bash
npm test -- siteConfigurationTabs.test.tsx --run
```

### Run with Coverage
```bash
npm test -- --coverage demoSiteConfigurations multiCatalogArchitecture siteConfigurationTabs
```

### Watch Mode (auto-rerun on changes)
```bash
npm test -- --watch demoSiteConfigurations
```

---

## Expected Results

✅ **3 test files**  
✅ **240+ tests**  
✅ **~15-20 seconds**  
✅ **All passing**

---

## Test Breakdown

- **demoSiteConfigurations.test.tsx:** ~100 tests
- **multiCatalogArchitecture.test.tsx:** ~80 tests  
- **siteConfigurationTabs.test.tsx:** ~60 tests

---

## Quick Verification

After running, you should see:
```
Test Files  3 passed (3)
     Tests  240+ passed (240+)
  Duration  ~18s
```

✅ = **Success!** All demo configurations validated.

---

## Files Location

All test files are in:
```
/src/app/__tests__/
  ├── demoSiteConfigurations.test.tsx
  ├── multiCatalogArchitecture.test.tsx
  └── siteConfigurationTabs.test.tsx
```

---

## What Gets Tested

✅ All 5 demo sites  
✅ All validation methods  
✅ Shipping options  
✅ RecHUB branding  
✅ Multi-language support  
✅ Multi-catalog architecture  
✅ Smart UI controls  
✅ Configuration tabs  
✅ Business rules  
✅ Data integrity

---

**Ready to run!** 🚀
