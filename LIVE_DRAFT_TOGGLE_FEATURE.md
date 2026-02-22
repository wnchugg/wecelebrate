# Live/Draft Mode Toggle Feature

## Overview
Implemented a toggle feature that allows administrators to switch between viewing live (published) configuration and draft (unpublished) configuration.

## How It Works

### Draft Mode (Default)
- Shows configuration with draft changes merged over live data
- All fields are editable
- Changes can be saved to draft
- Auto-save enabled (every 30 seconds)

### Live Mode
- Shows only published configuration (what end users see)
- Fetches live data from `/v2/sites/:id/live` endpoint
- Fields are still editable (will auto-switch to draft mode on change)
- No auto-save in this mode

## User Experience

### Switching to Live Mode
1. User clicks "Live" button
2. System fetches live data from backend
3. All form fields update to show live values
4. Toast notification: "Viewing Live Configuration"
5. User can see exactly what end users see

### Switching to Draft Mode
1. User clicks "Draft" button
2. System reloads data from currentSite (which has draft merged)
3. All form fields update to show draft values
4. Toast notification: "Switched to Draft Mode"
5. User can continue editing

### Auto-Switch Behavior
- If user makes changes while in Live mode
- System automatically switches to Draft mode
- Toast notification: "Switched to Draft mode - Your changes will be saved as a draft"

## Implementation Details

### New Function: `handleModeToggle(newMode: 'live' | 'draft')`

**When switching to Live:**
1. Calls `getSiteLive(currentSite.id)` to fetch live data
2. Updates all 50+ form state variables with live values
3. Sets `configMode = 'live'`
4. Clears `hasChanges` flag
5. Shows toast notification

**When switching to Draft:**
1. Reloads data from `currentSite` (already has draft merged)
2. Updates all form state variables with draft values
3. Sets `configMode = 'draft'`
4. Clears `hasChanges` flag
5. Shows toast notification

### Updated Components

**Toggle Buttons:**
```tsx
<button onClick={() => handleModeToggle('live')}>
  <Eye /> Live
</button>
<button onClick={() => handleModeToggle('draft')}>
  <Edit3 /> Draft
</button>
```

## Benefits

### For Administrators
- ✅ Can preview exactly what end users see (live mode)
- ✅ Can see their draft changes (draft mode)
- ✅ Easy comparison between live and draft
- ✅ No confusion about what's published vs what's not

### For End Users
- ✅ Never see incomplete/draft changes
- ✅ Site remains stable during admin edits
- ✅ Changes appear atomically on publish

## Testing Checklist

- [ ] Switch to Live mode → see live data
- [ ] Switch to Draft mode → see draft data
- [ ] Make changes in Live mode → auto-switches to Draft
- [ ] Save changes in Draft mode → data persists
- [ ] Switch to Live mode → changes not visible
- [ ] Publish changes → Live mode shows new data
- [ ] Toggle between modes multiple times → no data loss

## Example Workflow

1. **Admin opens site configuration** → Draft mode (shows draft if exists)
2. **Admin clicks "Live"** → Sees published configuration
3. **Admin notices site name is "Old Name"** → This is what users see
4. **Admin clicks "Draft"** → Sees "New Name" (their draft change)
5. **Admin clicks "Publish"** → Merges draft to live
6. **Admin clicks "Live"** → Now sees "New Name" in live mode

## Code Changes

### Files Modified
- `src/app/pages/admin/SiteConfiguration.tsx`
  - Added `handleModeToggle()` function
  - Updated toggle button onClick handlers
  - Added live data fetching logic
  - Added draft data reloading logic

### Dependencies
- Uses `getSiteLive()` from SiteContext
- Uses `currentSite` (which has draft merged)
- Uses toast notifications for user feedback

## Future Enhancements

Potential improvements:
1. **Visual Diff**: Show side-by-side comparison of live vs draft
2. **Field-Level Indicators**: Highlight which fields have draft changes
3. **Quick Preview**: Preview button to see how changes look on public site
4. **Keyboard Shortcuts**: Ctrl+L for Live, Ctrl+D for Draft
5. **Confirmation Dialog**: Warn if switching modes with unsaved changes

---

**Status**: ✅ Complete and ready for testing
**Date**: 2026-02-17
