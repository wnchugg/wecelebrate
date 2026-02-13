# Header Logo Navigation Fix

## Change Summary

Updated header logo click behavior to respect the landing page setting, ensuring users are directed to the appropriate page based on site configuration.

## Business Logic

### When Landing Page is Enabled
- Logo click navigates to: `/site/:siteId` (landing page)
- User sees the landing page with branding and content

### When Landing Page is Disabled
- Logo click navigates to: `/site/:siteId/access` (authentication page)
- User goes directly to authentication, skipping the landing page

### Default Behavior (Non-Site Routes)
- Logo click navigates to: `/` (root)
- Maintains backward compatibility for non-site-specific routes

## Implementation Details

### 1. ConfigurableHeader Component
**File**: `src/app/components/layout/ConfigurableHeader.tsx`

**Changes**:
- Added `useParams` import to get `siteId` from route
- Added `useMemo` import for memoization
- Added `homeLink` calculation using `useMemo`:
  ```typescript
  const homeLink = useMemo(() => {
    if (siteId) {
      const isLandingPageEnabled = !currentSite?.settings?.skipLandingPage;
      
      if (isLandingPageEnabled) {
        return `/site/${siteId}`;
      } else {
        return `/site/${siteId}/access`;
      }
    }
    
    return config?.logo?.link || '/';
  }, [siteId, currentSite?.settings?.skipLandingPage, config?.logo?.link]);
  ```
- Updated `headerConfig.logo.link` to use dynamic `homeLink`

**Dependencies**:
- `siteId` from route params
- `currentSite.settings.skipLandingPage` from SiteContext
- `config.logo.link` from props (fallback)

### 2. Header Component
**File**: `src/app/components/Header.tsx`

**Changes**:
- Added `useParams` import to get `siteId` from route
- Added `useSite` import to access site context
- Added `useMemo` import for memoization
- Added same `homeLink` calculation logic
- Updated logo Link `to` prop to use `homeLink`

**Note**: This is the legacy header component, but updated for consistency.

## Logic Flow

```
User clicks logo
    ↓
Check if in site-specific route (siteId exists)
    ↓
    Yes → Check landing page setting
        ↓
        Landing enabled (skipLandingPage: false)
            → Navigate to /site/:siteId
        ↓
        Landing disabled (skipLandingPage: true)
            → Navigate to /site/:siteId/access
    ↓
    No → Navigate to configured link or '/'
```

## Test Scenarios

### Scenario 1: Landing Page Enabled
**Setup**:
- Site-001 has `enableLandingPage: true` (skipLandingPage: false)
- User is on `/site/site-001/gift-selection`

**Test**:
1. Click logo in header
2. Verify navigation to `/site/site-001`
3. Verify landing page displays

### Scenario 2: Landing Page Disabled
**Setup**:
- Site-001 has `enableLandingPage: false` (skipLandingPage: true)
- User is on `/site/site-001/gift-selection`

**Test**:
1. Click logo in header
2. Verify navigation to `/site/site-001/access`
3. Verify access/authentication page displays

### Scenario 3: Different Pages
**Test from multiple pages**:
- [ ] From `/site/site-001/gift-selection`
- [ ] From `/site/site-001/gift-detail/:giftId`
- [ ] From `/site/site-001/welcome`
- [ ] From `/site/site-001/shipping-information`
- [ ] From `/site/site-001/review-order`

All should navigate to the correct home page based on landing page setting.

### Scenario 4: Multiple Sites
**Setup**:
- Site-001: Landing page enabled
- Site-002: Landing page disabled

**Test**:
1. Navigate to `/site/site-001/gift-selection`
2. Click logo → should go to `/site/site-001` (landing)
3. Navigate to `/site/site-002/gift-selection`
4. Click logo → should go to `/site/site-002/access`

### Scenario 5: Non-Site Routes
**Test**:
- Navigate to `/admin/dashboard`
- Click logo → should go to `/` (root)
- Maintains default behavior for admin routes

## Performance Considerations

### useMemo Optimization
- `homeLink` is memoized to prevent unnecessary recalculations
- Only recalculates when dependencies change:
  - `siteId` changes (route change)
  - `currentSite.settings.skipLandingPage` changes (setting update)
  - `config.logo.link` changes (config update)

### Dependency Array
```typescript
[siteId, currentSite?.settings?.skipLandingPage, config?.logo?.link]
```

## Edge Cases

### Edge Case 1: Site Loading
**Scenario**: Site data is still loading

**Behavior**:
- `currentSite` is undefined
- `skipLandingPage` is undefined
- Falls back to configured link or '/'
- After site loads, `useMemo` recalculates with correct value

### Edge Case 2: No Site ID
**Scenario**: User is on a non-site-specific route

**Behavior**:
- `siteId` is undefined
- Returns configured link or '/'
- Maintains backward compatibility

### Edge Case 3: Custom Logo Link
**Scenario**: Admin has configured a custom logo link

**Behavior**:
- If not in site-specific route, uses custom link
- If in site-specific route, overrides with dynamic link
- Site-specific behavior takes precedence

## Files Changed

1. **src/app/components/layout/ConfigurableHeader.tsx**
   - Added imports: `useParams`, `useMemo`
   - Added `homeLink` calculation
   - Updated `headerConfig.logo.link`

2. **src/app/components/Header.tsx**
   - Added imports: `useParams`, `useSite`, `useMemo`
   - Added `homeLink` calculation
   - Updated logo Link `to` prop

## Benefits

1. **Consistent Navigation**: Logo always takes users to the appropriate home page
2. **Respects Configuration**: Honors the landing page enable/disable setting
3. **Better UX**: Users can easily return to the start of their journey
4. **Site Isolation**: Each site's logo behaves according to its own settings
5. **Backward Compatible**: Non-site routes maintain default behavior

## Testing Checklist

- [ ] Landing page enabled - logo goes to landing page
- [ ] Landing page disabled - logo goes to access page
- [ ] Multiple sites with different settings work correctly
- [ ] Non-site routes maintain default behavior
- [ ] Logo navigation works from all pages
- [ ] No console errors
- [ ] Type check passes
- [ ] Performance is acceptable (no unnecessary re-renders)
