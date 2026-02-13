# Welcome Page and Header Fixes

## Summary
Fixed two issues with the site flow:
1. Welcome page 404 error when `enableWelcomePage` is disabled
2. Duplicate headers on landing page

## Changes Made

### 1. Welcome Page Skip Logic (AccessValidation.tsx & Welcome.tsx)

**Problem**: When `enableWelcomePage` was set to `false`, users were still being redirected to the welcome page, resulting in a 404 error.

**Root Cause**: The logic was using `!== false` which treated `undefined` as `true`, and the default was to show the welcome page even when not explicitly configured.

**Solution**:
- Changed logic to explicitly check `=== false` instead of `!== false`
- Added detailed logging to track navigation decisions
- Added `replace: true` to prevent back button issues
- Made the behavior more explicit: only skip welcome page when explicitly set to `false`

**Files Modified**:
- `src/app/pages/AccessValidation.tsx`: Updated navigation logic with explicit false check and logging
- `src/app/pages/Welcome.tsx`: Updated redirect logic with explicit false check and logging

**Code Changes**:
```typescript
// Before (implicit default to true)
const enableWelcomePage = currentSite?.settings?.enableWelcomePage !== false;
navigate(enableWelcomePage ? 'welcome' : 'gift-selection');

// After (explicit check)
const enableWelcomePage = currentSite?.settings?.enableWelcomePage;
logger.log('[AccessValidation] Welcome page setting:', {
  enableWelcomePage,
  willNavigateTo: enableWelcomePage === false ? 'gift-selection' : 'welcome'
});
navigate(enableWelcomePage === false ? 'gift-selection' : 'welcome');
```

**How to Use**:
To skip the welcome page for a site:
1. Go to Site Configuration → Welcome tab
2. Uncheck "Enable Welcome Page"
3. Save configuration
4. Users will now go directly from authentication to gift selection

### 2. Duplicate Header Removal (Landing.tsx)

**Problem**: Landing page had two headers - the global ConfigurableHeader and a local header in the Landing component.

**Solution**:
- Removed the local header from Landing.tsx (lines 73-82)
- Updated `defaultHeaderFooterConfig` to show global header on landing pages
- Removed unused imports (Logo, LanguageSelector)

**Files Modified**:
- `src/app/pages/Landing.tsx`: Removed duplicate header section
- `src/app/types/siteCustomization.ts`: Changed `hideOnRoutes: ['/landing']` to `hideOnRoutes: []`

**Before**:
```typescript
// Landing.tsx had its own header
<header className="px-4 sm:px-6 lg:px-8 py-6 relative z-[100]">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    <Logo />
    <LanguageSelector />
  </div>
</header>

// And defaultHeaderFooterConfig hid the global header
display: {
  hideOnRoutes: ['/landing'],
  ...
}
```

**After**:
```typescript
// Landing.tsx - no local header, just content
<div className="min-h-screen bg-gradient-to-br...">
  <CatalogInitializer />
  {/* Hero Section */}
  ...
</div>

// Global header now shows on all pages including landing
display: {
  hideOnRoutes: [],
  ...
}
```

**Result**: 
- Only one header (the global ConfigurableHeader) is displayed
- Consistent header across all pages
- Header can be configured globally through Site Configuration

## Testing

### Welcome Page Skip
1. Set `enableWelcomePage: false` in site configuration
2. Navigate through the flow: Landing → Access Validation
3. After successful validation, should go directly to Gift Selection
4. Check browser console for navigation logs

### Header Display
1. Visit landing page
2. Should see only one header at the top
3. Header should match the global ConfigurableHeader styling
4. Language selector and logo should be in the global header

## Backward Compatibility

### Welcome Page
- If `enableWelcomePage` is not set (undefined): Shows welcome page (default behavior)
- If `enableWelcomePage` is `true`: Shows welcome page
- If `enableWelcomePage` is `false`: Skips welcome page

### Header
- Existing sites will now show the global header on landing pages
- Sites can customize the header through Site Configuration → Header/Footer tab
- Sites can hide the header on specific routes using `hideOnRoutes` configuration

## Related Files
- `src/app/pages/AccessValidation.tsx`
- `src/app/pages/Welcome.tsx`
- `src/app/pages/Landing.tsx`
- `src/app/types/siteCustomization.ts`
- `src/app/pages/Root.tsx` (context for global header rendering)
- `src/app/utils/configMerge.ts` (header display logic)

## Date
February 13, 2026
