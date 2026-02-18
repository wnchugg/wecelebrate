# Draft/Live Architecture for Site Configuration

## Problem Statement

**Current Issue:**
- "Save Changes" writes directly to database columns
- "Publish" only changes the `status` field
- Result: No actual changes to show in publish modal because changes are already live in the database

**User Expectation:**
- Save Changes = Save draft (not visible to end users)
- Publish = Make draft changes live (visible to end users)

## Proposed Solution: Draft Settings Column

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Sites Table                                                 │
├─────────────────────────────────────────────────────────────┤
│ id                    UUID                                  │
│ status                TEXT (draft/active)                   │
│                                                             │
│ -- LIVE COLUMNS (what end users see) --                    │
│ name                  TEXT                                  │
│ slug                  TEXT                                  │
│ default_currency      TEXT                                  │
│ default_country       TEXT                                  │
│ gifts_per_user        INTEGER                               │
│ ... (all other settings)                                    │
│                                                             │
│ -- DRAFT COLUMN (unpublished changes) --                   │
│ draft_settings        JSONB (nullable)                      │
│   {                                                         │
│     "name": "New Name",                                     │
│     "default_currency": "EUR",                              │
│     "gifts_per_user": 3                                     │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
```

### How It Works

#### State 1: No Draft Changes
```json
{
  "id": "abc-123",
  "status": "active",
  "name": "TechCorp US",
  "default_currency": "USD",
  "gifts_per_user": 1,
  "draft_settings": null  // No draft changes
}
```
- End users see: TechCorp US, USD, 1 gift
- Admin sees: Same as end users (no draft)

#### State 2: Draft Changes Saved
```json
{
  "id": "abc-123",
  "status": "active",
  "name": "TechCorp US",           // Live value
  "default_currency": "USD",        // Live value
  "gifts_per_user": 1,              // Live value
  "draft_settings": {               // Draft changes
    "name": "TechCorp United States",
    "default_currency": "EUR",
    "gifts_per_user": 3
  }
}
```
- End users see: TechCorp US, USD, 1 gift (live values)
- Admin sees: TechCorp United States, EUR, 3 gifts (draft values)
- Publish modal shows: 3 changes

#### State 3: After Publishing
```json
{
  "id": "abc-123",
  "status": "active",
  "name": "TechCorp United States", // Updated from draft
  "default_currency": "EUR",         // Updated from draft
  "gifts_per_user": 3,               // Updated from draft
  "draft_settings": null             // Cleared after publish
}
```
- End users see: TechCorp United States, EUR, 3 gifts
- Admin sees: Same as end users
- Publish modal shows: No changes

## Implementation Plan

### Phase 1: Database Migration ✅
```sql
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS draft_settings JSONB DEFAULT NULL;
```

### Phase 2: Backend Changes

#### 2.1 Update `getSiteById()` and `getSites()`
```typescript
// When loading site for admin
function getSiteForAdmin(siteId: string) {
  const site = await db.sites.findById(siteId);
  
  // Merge draft settings over live settings for admin view
  if (site.draft_settings) {
    return {
      ...site,
      ...site.draft_settings,  // Draft values override live values
      _hasUnpublishedChanges: true
    };
  }
  
  return {
    ...site,
    _hasUnpublishedChanges: false
  };
}

// When loading site for end users (public)
function getSiteForPublic(siteId: string) {
  const site = await db.sites.findById(siteId);
  
  // NEVER include draft_settings for public
  // Only return live column values
  return {
    ...site,
    draft_settings: undefined  // Remove from response
  };
}
```

#### 2.2 Update `updateSite()` - Save as Draft
```typescript
async function updateSite(siteId: string, updates: any) {
  // When saving changes (not publishing)
  // Store changes in draft_settings column
  
  const currentSite = await db.sites.findById(siteId);
  const currentDraft = currentSite.draft_settings || {};
  
  // Merge new changes into draft
  const newDraft = {
    ...currentDraft,
    ...updates  // New changes
  };
  
  // Save to draft_settings column only
  await db.sites.update(siteId, {
    draft_settings: newDraft,
    updated_at: new Date()
  });
  
  // Don't touch live columns yet
}
```

#### 2.3 Update `publishSite()` - Publish Draft
```typescript
async function publishSite(siteId: string) {
  const site = await db.sites.findById(siteId);
  
  if (!site.draft_settings) {
    // No draft changes, just update status
    await db.sites.update(siteId, {
      status: 'active',
      updated_at: new Date()
    });
    return;
  }
  
  // Merge draft settings into live columns
  const updates = {
    ...site.draft_settings,  // All draft changes
    status: 'active',
    draft_settings: null,    // Clear draft after publishing
    updated_at: new Date()
  };
  
  await db.sites.update(siteId, updates);
}
```

#### 2.4 New Endpoint: `discardDraft()`
```typescript
async function discardDraft(siteId: string) {
  // Discard all draft changes
  await db.sites.update(siteId, {
    draft_settings: null,
    updated_at: new Date()
  });
}
```

### Phase 3: Frontend Changes

#### 3.1 Update `SiteContext.tsx`
```typescript
// When loading site
const loadSite = async (siteId: string) => {
  const site = await apiRequest(`/v2/sites/${siteId}`);
  
  // Backend already merged draft over live for admin
  setCurrentSite(site);
  setHasUnpublishedChanges(site._hasUnpublishedChanges);
};

// When saving changes
const updateSite = async (siteId: string, updates: any) => {
  // This now saves to draft_settings, not live columns
  await apiRequest(`/v2/sites/${siteId}`, {
    method: 'PATCH',
    body: updates
  });
  
  setHasUnpublishedChanges(true);
};

// When publishing
const publishSite = async (siteId: string) => {
  // This merges draft_settings into live columns
  await apiRequest(`/v2/sites/${siteId}/publish`, {
    method: 'POST'
  });
  
  setHasUnpublishedChanges(false);
};
```

#### 3.2 Update `SiteConfiguration.tsx`
```typescript
// Load original site data (live columns only)
useEffect(() => {
  if (currentSite) {
    // Fetch live version for comparison
    const fetchLiveVersion = async () => {
      const liveVersion = await apiRequest(
        `/v2/sites/${currentSite.id}/live`
      );
      setOriginalSiteData(liveVersion);
    };
    
    fetchLiveVersion();
  }
}, [currentSite]);

// Publish modal now compares:
// - originalSiteData (live columns)
// - currentState (draft values from form)
```

#### 3.3 Add "Discard Draft" Button
```typescript
<Button
  onClick={handleDiscardDraft}
  variant="outline"
  className="text-red-600"
>
  <X className="w-4 h-4 mr-2" />
  Discard Draft
</Button>
```

### Phase 4: Public Site Loading

#### 4.1 Update `PublicSiteContext.tsx`
```typescript
// When loading site for end users
const loadPublicSite = async (siteId: string) => {
  // Use public endpoint that only returns live values
  const site = await apiRequest(`/v2/public/sites/${siteId}`);
  
  // This will NEVER include draft_settings
  // Only live column values
  setSite(site);
};
```

## Benefits

### 1. True Draft/Live Separation
- Draft changes stored separately from live data
- End users never see draft changes
- Admin can preview draft before publishing

### 2. Accurate Change Detection
- Publish modal compares live columns vs draft_settings
- Shows exactly what will change when published
- No false positives

### 3. Flexible Workflow
- Save draft multiple times
- Discard draft if needed
- Publish when ready

### 4. Backward Compatible
- `draft_settings = null` means no draft (uses live columns)
- Existing sites continue to work
- No data migration needed

## Migration Path

### Step 1: Run Migration
```bash
# Add draft_settings column
psql -f supabase/migrations/add_draft_settings_column.sql
```

### Step 2: Update Backend
- Modify `crud_db.ts` functions
- Add `/publish` endpoint
- Add `/live` endpoint for fetching live version
- Add `/discard-draft` endpoint

### Step 3: Update Frontend
- Modify `SiteContext.tsx`
- Modify `SiteConfiguration.tsx`
- Update change detection logic
- Add "Discard Draft" button

### Step 4: Test
- Create new site (draft)
- Make changes and save (draft_settings populated)
- Verify end users don't see changes
- Publish (draft_settings merged to live columns)
- Verify end users see changes

## Alternative: Simpler Approach

If the above is too complex, we could simplify:

### Option A: Remove "Save Changes" Button
- Only save when publishing
- Simpler but less flexible
- Lose work if browser crashes

### Option B: Auto-Save to Draft
- Remove manual "Save Changes" button
- Auto-save to draft_settings every 30 seconds
- Publish merges draft to live
- Best user experience

## Recommendation

Implement **Option B** (Auto-Save to Draft):
1. Add `draft_settings` column ✅
2. Auto-save form changes to `draft_settings`
3. Remove manual "Save Changes" button
4. "Publish" merges `draft_settings` to live columns
5. Add "Discard Draft" button for safety

This provides:
- ✅ True draft/live separation
- ✅ Accurate change detection
- ✅ No lost work (auto-save)
- ✅ Simple user experience
- ✅ Flexible workflow

## Next Steps

1. ✅ Create migration (done)
2. Update backend CRUD functions
3. Update frontend context
4. Update site configuration component
5. Test thoroughly
6. Deploy

Would you like me to proceed with implementing Option B (Auto-Save to Draft)?
