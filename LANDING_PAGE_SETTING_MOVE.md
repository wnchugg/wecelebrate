# Landing Page Setting Reorganization

## Change Summary

Moved the landing page enable/disable setting from the General Settings tab to the Landing Page tab, matching the pattern used for the Welcome Page configuration.

## Changes Made

### 1. Removed from General Settings Tab
- Removed "Skip Home Page" toggle from General Settings tab
- This setting was confusing as it used negative logic (skip = true means hide)

### 2. Added to Landing Page Tab
- Added "Enable Landing Page" toggle to Landing Page tab
- Uses positive logic (enable = true means show)
- Matches the pattern used for Welcome Page configuration
- Includes Card with header and description
- Landing Page Editor only shows when landing page is enabled

### 3. State Management
- Added `enableLandingPage` state variable (inverted from `skipLandingPage`)
- Kept `skipLandingPage` for backward compatibility with backend
- Conversion happens in save functions: `skipLandingPage: !enableLandingPage`
- Both states are synced when site data loads

### 4. Backend Integration
- Setting is properly saved to backend as `skipLandingPage`
- Frontend converts between `enableLandingPage` (UI) and `skipLandingPage` (backend)
- No backend changes required - maintains compatibility

## Files Changed

1. **src/app/pages/admin/SiteConfiguration.tsx**
   - Line 76: Added `enableLandingPage` state
   - Line 166: Sync `enableLandingPage` from backend data
   - Line 293, 460: Convert `enableLandingPage` to `skipLandingPage` when saving
   - Line 1087-1105: Removed "Skip Home Page" from General tab
   - Line 3103-3153: Added "Enable Landing Page" to Landing Page tab with conditional editor display

## User Experience Improvements

1. **Better Organization**: Landing page settings are now on the Landing Page tab
2. **Consistent Pattern**: Matches Welcome Page tab structure
3. **Positive Logic**: "Enable" is more intuitive than "Skip"
4. **Conditional Display**: Landing Page Editor only shows when enabled
5. **Clear Labels**: "Enable Landing Page" with description "Show landing page before authentication"

## Testing Checklist

- [ ] Navigate to Admin → Site Configuration
- [ ] Go to Landing Page tab
- [ ] Verify "Enable Landing Page" toggle is present
- [ ] Toggle off - verify Landing Page Editor is hidden
- [ ] Toggle on - verify Landing Page Editor is shown
- [ ] Save configuration
- [ ] Reload page - verify setting persists
- [ ] Test public site - verify landing page shows/hides correctly
- [ ] Go to General Settings tab - verify "Skip Home Page" is removed

## Backward Compatibility

- Backend still uses `skipLandingPage` field
- Frontend converts between UI state and backend state
- Existing sites will work correctly:
  - `skipLandingPage: true` → `enableLandingPage: false`
  - `skipLandingPage: false` → `enableLandingPage: true`
  - `skipLandingPage: undefined` → `enableLandingPage: true` (default)
