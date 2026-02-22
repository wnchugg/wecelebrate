# Draft/Live Architecture - Frontend Integration Complete

## Overview
Successfully integrated the frontend with the new draft/live backend architecture. The system now properly separates draft changes from live data, allowing administrators to make changes without affecting the public site until they explicitly publish.

## Changes Made

### 1. SiteContext.tsx - New Draft/Live Functions

Added four new functions to the SiteContext:

#### `saveSiteDraft(id: string, updates: Partial<Site>): Promise<void>`
- Saves changes to the `draft_settings` JSONB column
- Does NOT affect live columns
- Endpoint: `PATCH /v2/sites/:id/draft`
- Updates local state with merged draft data

#### `publishSite(id: string): Promise<void>`
- Merges `draft_settings` into live columns
- Clears the `draft_settings` column
- Endpoint: `POST /v2/sites/:id/publish`
- Updates local state with published data

#### `discardSiteDraft(id: string): Promise<void>`
- Clears the `draft_settings` column
- Reverts to live data only
- Endpoint: `DELETE /v2/sites/:id/draft`
- Updates local state with live-only data

#### `getSiteLive(id: string): Promise<Site>`
- Fetches only live data (no draft merged)
- Used for comparison in publish modal
- Endpoint: `GET /v2/sites/:id/live`
- Returns live site data

### 2. SiteConfiguration.tsx - Updated to Use Draft Endpoints

#### Updated `handleSave()`
- Changed from `updateSite()` to `saveSiteDraft()`
- Now saves to `draft_settings` column instead of live columns
- Changes are isolated from public site

#### Updated `handleAutoSave()`
- Changed from `updateSite()` to `saveSiteDraft()`
- Auto-saves now go to draft, not live

#### Updated `handleConfirmPublish()`
- Changed from `updateSite()` with status change to `publishSite()`
- Now properly merges draft to live and clears draft

#### Added `handleDiscardDraft()`
- New function to discard all draft changes
- Confirms with user before discarding
- Reloads page to show live data after discard

#### Updated `originalSiteData` Loading
- Now fetches from `getSiteLive()` endpoint
- Ensures publish modal compares draft vs live (not draft vs draft)
- Falls back to current site data if live fetch fails

### 3. UI Updates

#### Added "Discard Draft" Button
- Appears next to "Publish Site" button
- Only visible when there are saved draft changes
- Red outline styling to indicate destructive action
- Includes History icon for visual clarity

#### Button Visibility Logic
```tsx
{/* Publish Button - when in draft mode */}
{configMode === 'draft' && (currentSite.status === 'draft' || hasChanges) && (
  <>
    <Button onClick={handlePublish}>Publish Site</Button>
    
    {/* Discard Draft - only if saved draft exists */}
    {!hasChanges && currentSite.status === 'active' && (
      <Button onClick={handleDiscardDraft}>Discard Draft</Button>
    )}
  </>
)}
```

## How It Works

### Workflow 1: Making Changes
1. User edits configuration fields
2. `hasChanges` becomes true
3. Auto-save triggers after 30 seconds → calls `saveSiteDraft()`
4. Changes saved to `draft_settings` column
5. Live site remains unchanged

### Workflow 2: Publishing Changes
1. User clicks "Save" → calls `saveSiteDraft()`
2. User clicks "Publish Site" → shows publish modal
3. Modal fetches live data via `getSiteLive()`
4. Modal compares current state (draft) vs live data
5. User confirms → calls `publishSite()`
6. Backend merges `draft_settings` into live columns
7. Backend clears `draft_settings`
8. Live site now shows the changes

### Workflow 3: Discarding Changes
1. User has saved draft changes
2. User clicks "Discard Draft"
3. Confirmation dialog appears
4. User confirms → calls `discardSiteDraft()`
5. Backend clears `draft_settings` column
6. Page reloads to show live data only

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN EDITS SITE                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              saveSiteDraft() → draft_settings               │
│                    (Live columns unchanged)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN CLICKS PUBLISH                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         getSiteLive() → Fetch live data for comparison     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Show Publish Modal with Changes                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│    publishSite() → Merge draft_settings to live columns    │
│                   Clear draft_settings                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  LIVE SITE UPDATED ✅                       │
└─────────────────────────────────────────────────────────────┘
```

## Benefits

1. **Safe Editing**: Changes don't affect live site until published
2. **Preview Changes**: Publish modal shows exactly what will change
3. **Discard Option**: Can revert all draft changes if needed
4. **Auto-Save**: Draft changes auto-saved every 30 seconds
5. **No False Positives**: Publish modal compares draft vs live (not draft vs draft)

## Testing Checklist

- [ ] Make changes to site configuration
- [ ] Verify changes are saved to draft (not live)
- [ ] Verify live site doesn't show changes
- [ ] Click "Publish Site"
- [ ] Verify publish modal shows correct changes
- [ ] Confirm publish
- [ ] Verify live site now shows changes
- [ ] Make new changes and save
- [ ] Click "Discard Draft"
- [ ] Verify draft changes are removed
- [ ] Verify live site unchanged

## Next Steps

1. **Run Migration**: Execute `add_draft_settings_column.sql` on production database
2. **Deploy Backend**: Backend is already deployed with draft/live endpoints
3. **Deploy Frontend**: Deploy this frontend code
4. **Test End-to-End**: Test complete workflow in production
5. **Monitor**: Watch for any errors in draft/live operations

## Files Modified

- `src/app/context/SiteContext.tsx` - Added 4 new draft/live functions
- `src/app/pages/admin/SiteConfiguration.tsx` - Updated to use draft endpoints, added discard button

## API Endpoints Used

- `PATCH /v2/sites/:id/draft` - Save draft changes
- `POST /v2/sites/:id/publish` - Publish draft to live
- `DELETE /v2/sites/:id/draft` - Discard draft changes
- `GET /v2/sites/:id/live` - Get live data for comparison

---

**Status**: ✅ Frontend integration complete and ready for testing
**Date**: 2026-02-17
