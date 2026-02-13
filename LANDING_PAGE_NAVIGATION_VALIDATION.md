# Landing Page Navigation Business Logic Validation

## Business Logic Summary

When the landing page is **disabled** (`skipLandingPage: true` / `enableLandingPage: false`):
- Users accessing the site root are **immediately redirected** to the access/authentication page
- No landing page content is shown
- User flow: `/site/:siteId` → `/site/:siteId/access`

When the landing page is **enabled** (`skipLandingPage: false` / `enableLandingPage: true`):
- Users see the landing page with branding, features, and call-to-action
- Users must click "Get Started" or similar button to proceed to access page
- User flow: `/site/:siteId` → (Landing Page) → `/site/:siteId/access`

## Implementation Details

### 1. Landing Page Component (`src/app/pages/Landing.tsx`)

**Lines 16-22**: Redirect Logic
```typescript
useEffect(() => {
  // Check if landing page should be skipped after site loads
  if (!isLoading && currentSite?.settings?.skipLandingPage) {
    console.log('[Landing] Landing page is disabled, redirecting to access page');
    setShouldRedirect(true);
  } else if (!isLoading && currentSite) {
    console.log('[Landing] Landing page is enabled, showing landing page');
  }
}, [currentSite, isLoading]);
```

**Lines 24-26**: Redirect Execution
```typescript
if (shouldRedirect) {
  return <Navigate to="access" replace />;
}
```

### 2. Route Configuration (`src/app/routes.tsx`)

**Line 232**: Landing page is the index route for site-specific paths
```typescript
{ index: true, Component: Landing, HydrateFallback: LoadingFallback }
```

This means:
- `/site/site-001` loads the Landing component
- Landing component checks `skipLandingPage` setting
- If true, redirects to `access` (relative path → `/site/site-001/access`)

### 3. Admin Configuration (`src/app/pages/admin/SiteConfiguration.tsx`)

**Landing Page Tab** (Lines 3103-3153):
- Toggle: "Enable Landing Page"
- Description: "Show landing page before authentication"
- When disabled: Landing Page Editor is hidden
- When enabled: Landing Page Editor is shown for customization

**State Management**:
- UI State: `enableLandingPage` (boolean, default: true)
- Backend State: `skipLandingPage` (boolean, inverted)
- Conversion: `skipLandingPage: !enableLandingPage`

## Test Scenarios

### Scenario 1: Landing Page Enabled (Default)
**Configuration**: `enableLandingPage: true` → `skipLandingPage: false`

**Expected Flow**:
1. User navigates to `/site/site-001`
2. Landing page loads and displays
3. Console log: `[Landing] Landing page is enabled, showing landing page`
4. User sees branding, features, CTA button
5. User clicks "Get Started" button
6. User is taken to `/site/site-001/access`

**Test Steps**:
- [ ] Go to Admin → Site Configuration → Landing Page tab
- [ ] Verify "Enable Landing Page" toggle is ON
- [ ] Save configuration
- [ ] Open new browser tab
- [ ] Navigate to `https://wecelebrate.netlify.app/site/site-001`
- [ ] Verify landing page displays
- [ ] Check browser console for log message
- [ ] Click "Get Started" button
- [ ] Verify navigation to access page

### Scenario 2: Landing Page Disabled
**Configuration**: `enableLandingPage: false` → `skipLandingPage: true`

**Expected Flow**:
1. User navigates to `/site/site-001`
2. Landing component loads briefly
3. Console log: `[Landing] Landing page is disabled, redirecting to access page`
4. Immediate redirect to `/site/site-001/access`
5. User sees access/authentication page
6. No landing page content is visible

**Test Steps**:
- [ ] Go to Admin → Site Configuration → Landing Page tab
- [ ] Toggle "Enable Landing Page" to OFF
- [ ] Verify Landing Page Editor is hidden
- [ ] Save configuration
- [ ] Open new browser tab
- [ ] Navigate to `https://wecelebrate.netlify.app/site/site-001`
- [ ] Verify immediate redirect to access page (no landing page flash)
- [ ] Check browser console for log message
- [ ] Verify URL is `/site/site-001/access`

### Scenario 3: Toggle Between States
**Test Dynamic Behavior**:

**Test Steps**:
- [ ] Start with landing page enabled
- [ ] Navigate to site, verify landing page shows
- [ ] Go to Admin, disable landing page
- [ ] Save configuration
- [ ] Navigate to site again (new tab or refresh)
- [ ] Verify redirect to access page
- [ ] Go to Admin, enable landing page
- [ ] Save configuration
- [ ] Navigate to site again
- [ ] Verify landing page shows again

### Scenario 4: Multiple Sites
**Test Site Isolation**:

**Test Steps**:
- [ ] Configure Site-001 with landing page enabled
- [ ] Configure Site-002 with landing page disabled
- [ ] Navigate to `/site/site-001` → should show landing page
- [ ] Navigate to `/site/site-002` → should redirect to access
- [ ] Verify each site respects its own configuration

## Edge Cases

### Edge Case 1: Undefined Setting
**Scenario**: Site has no `skipLandingPage` setting (undefined)

**Expected Behavior**: 
- Default to `false` (landing page enabled)
- User sees landing page

**Code Reference**: 
```typescript
const [skipLandingPage, setSkipLandingPage] = useState(
  currentSite?.settings.skipLandingPage ?? false
);
```

### Edge Case 2: Loading State
**Scenario**: Site data is still loading

**Expected Behavior**:
- Show loading spinner
- Don't redirect until site data is loaded
- Prevents incorrect redirects

**Code Reference**:
```typescript
if (!isLoading && currentSite?.settings?.skipLandingPage) {
  setShouldRedirect(true);
}
```

### Edge Case 3: Direct Access Page Navigation
**Scenario**: User directly navigates to `/site/site-001/access`

**Expected Behavior**:
- Access page loads directly
- Landing page setting doesn't affect this
- User can always access authentication page directly

## Console Logging

The following console logs help debug navigation:

1. **Landing.tsx**: 
   - `[Landing] Landing page is disabled, redirecting to access page`
   - `[Landing] Landing page is enabled, showing landing page`

2. **AccessValidation.tsx**:
   - `[AccessValidation] Welcome page setting: {...}`

3. **Welcome.tsx**:
   - `[Welcome] Welcome page setting: {...}`
   - `[Welcome] Redirecting to gift-selection because welcome page is disabled`

## Backend Integration

### Storage
- Field: `settings.skipLandingPage` (boolean)
- Stored in: Site configuration in KV store
- Key pattern: `site:${environmentId}:${siteId}`

### API Endpoints
- GET `/sites/:siteId` - Returns site with settings
- PUT `/sites/:siteId` - Updates site settings including `skipLandingPage`

### Data Flow
1. Admin changes "Enable Landing Page" toggle in UI
2. Frontend converts: `enableLandingPage: false` → `skipLandingPage: true`
3. PUT request saves to backend
4. Backend stores `skipLandingPage: true` in site settings
5. Public site loads, reads `skipLandingPage: true`
6. Landing component redirects to access page

## Validation Checklist

- [x] Landing page redirect logic implemented
- [x] Relative path used for redirect (works with site-specific routes)
- [x] Loading state handled (no premature redirects)
- [x] Console logging added for debugging
- [x] Admin UI toggle added to Landing Page tab
- [x] State conversion between UI and backend
- [x] Backend integration maintained
- [x] Default behavior defined (landing page enabled)
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Multiple sites tested

## Summary

✅ **Business logic is correctly implemented**:
- Landing page checks `skipLandingPage` setting on load
- If true, immediately redirects to access page
- If false, displays landing page content
- Redirect uses relative path for site-specific routes
- Loading state prevents premature redirects
- Console logging aids debugging
