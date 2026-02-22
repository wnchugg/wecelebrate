# Draft/Live Architecture - Backend Implementation COMPLETE

## Summary

Successfully implemented the backend infrastructure for true draft/live separation in site configuration. Changes are now saved to `draft_settings` column and only merged to live columns on publish.

## What Was Implemented

### 1. Database Migration ✅
**File:** `supabase/migrations/add_draft_settings_column.sql`

```sql
ALTER TABLE sites
  ADD COLUMN IF NOT EXISTS draft_settings JSONB DEFAULT NULL;
```

- Adds `draft_settings` column to store unpublished changes
- NULL means no draft changes exist
- JSONB format allows flexible storage of any settings

### 2. Helper Functions ✅
**File:** `supabase/functions/server/helpers.ts`

Added three new helper functions:

**`mergeDraftSettings(site)`**
- Merges draft_settings over live columns for admin view
- Returns site with `_hasUnpublishedChanges` flag
- Used when loading site for editing

**`extractLiveData(site)`**
- Removes draft_settings for public view
- Returns only live column values
- Used for end-user facing endpoints

**`buildDraftSettings(currentDraft, updates)`**
- Builds new draft settings object
- Merges updates into existing draft
- Filters out system fields (status, etc.)

### 3. New CRUD Functions ✅
**File:** `supabase/functions/server/crud_db.ts`

Added five new functions:

#### `getSiteWithDraft(id)`
- Returns site with draft merged over live
- For admin view in configuration UI
- Shows unpublished changes

#### `getSiteLive(id)`
- Returns only live column values
- For comparison in publish modal
- For public site loading

#### `saveSiteDraft(id, input)`
- Saves changes to `draft_settings` column
- Does NOT touch live columns
- End users don't see changes

#### `publishSite(id)`
- Merges `draft_settings` into live columns
- Clears `draft_settings` after publish
- Changes become visible to end users

#### `discardSiteDraft(id)`
- Clears `draft_settings` column
- Discards all unpublished changes
- Reverts to live version

### 4. New API Endpoints ✅
**File:** `supabase/functions/server/endpoints_v2.ts`

Added five new endpoints:

```typescript
// Get site with draft merged (admin view)
GET /v2/sites/:id/with-draft

// Get live site data only (for comparison)
GET /v2/sites/:id/live

// Save changes to draft
PATCH /v2/sites/:id/draft

// Publish draft to live
POST /v2/sites/:id/publish

// Discard draft changes
DELETE /v2/sites/:id/draft
```

### 5. Route Registration ✅
**File:** `supabase/functions/server/index.tsx`

Registered all new routes with admin authentication:

```typescript
app.get("/make-server-6fcaeea3/v2/sites/:id/with-draft", verifyAdmin, v2.getSiteWithDraftV2);
app.get("/make-server-6fcaeea3/v2/sites/:id/live", verifyAdmin, v2.getSiteLiveV2);
app.patch("/make-server-6fcaeea3/v2/sites/:id/draft", verifyAdmin, v2.saveSiteDraftV2);
app.post("/make-server-6fcaeea3/v2/sites/:id/publish", verifyAdmin, v2.publishSiteV2);
app.delete("/make-server-6fcaeea3/v2/sites/:id/draft", verifyAdmin, v2.discardSiteDraftV2);
```

## How It Works

### Scenario 1: Loading Site for Admin
```
Request: GET /v2/sites/:id/with-draft
↓
getSiteWithDraft()
↓
mergeDraftSettings() - Merges draft over live
↓
Response: Site with draft values + _hasUnpublishedChanges flag
```

### Scenario 2: Saving Changes (Draft)
```
Request: PATCH /v2/sites/:id/draft
Body: { defaultCurrency: "EUR", giftsPerUser: 3 }
↓
saveSiteDraft()
↓
buildDraftSettings() - Merges into existing draft
↓
UPDATE sites SET draft_settings = {...} WHERE id = :id
↓
Response: Site with draft merged
```

**Database State After Save:**
```json
{
  "id": "abc-123",
  "default_currency": "USD",  // Live (end users see this)
  "gifts_per_user": 1,         // Live
  "draft_settings": {          // Draft (only admin sees this)
    "default_currency": "EUR",
    "gifts_per_user": 3
  }
}
```

### Scenario 3: Publishing Changes
```
Request: POST /v2/sites/:id/publish
↓
publishSite()
↓
Merge draft_settings into live columns
↓
UPDATE sites SET 
  default_currency = 'EUR',
  gifts_per_user = 3,
  draft_settings = NULL,
  status = 'active'
WHERE id = :id
↓
Response: Published site
```

**Database State After Publish:**
```json
{
  "id": "abc-123",
  "default_currency": "EUR",  // Updated from draft
  "gifts_per_user": 3,         // Updated from draft
  "draft_settings": null       // Cleared
}
```

### Scenario 4: Loading Site for End Users
```
Request: GET /v2/public/sites/slug/:slug
↓
getSiteBySlug() or getSiteLive()
↓
extractLiveData() - Removes draft_settings
↓
Response: Only live column values
```

## API Usage Examples

### Save Draft Changes
```typescript
// Frontend calls this when user clicks "Save Changes"
const response = await fetch('/v2/sites/abc-123/draft', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    defaultCurrency: 'EUR',
    giftsPerUser: 3,
    settings: {
      showPricing: false
    }
  })
});

// Response includes merged draft
const { data } = await response.json();
console.log(data._hasUnpublishedChanges); // true
```

### Get Live Version for Comparison
```typescript
// Frontend calls this to get baseline for publish modal
const response = await fetch('/v2/sites/abc-123/live');
const { data: liveVersion } = await response.json();

// Compare with current draft to show changes
const changes = detectSiteChanges(liveVersion, currentDraftState);
```

### Publish Draft
```typescript
// Frontend calls this when user confirms publish
const response = await fetch('/v2/sites/abc-123/publish', {
  method: 'POST'
});

const { data } = await response.json();
console.log(data._hasUnpublishedChanges); // false
console.log(data.status); // 'active'
```

### Discard Draft
```typescript
// Frontend calls this when user clicks "Discard Draft"
const response = await fetch('/v2/sites/abc-123/draft', {
  method: 'DELETE'
});

const { data } = await response.json();
// Site reverted to live version
```

## Database Schema

### Before (Single Version)
```
sites table:
- id
- name (live only)
- default_currency (live only)
- gifts_per_user (live only)
- status
```

### After (Draft + Live)
```
sites table:
- id
- name (live)
- default_currency (live)
- gifts_per_user (live)
- status
- draft_settings (JSONB, nullable)
  {
    "name": "draft value",
    "default_currency": "draft value",
    "gifts_per_user": draft value
  }
```

## Benefits

### 1. True Draft/Live Separation
- Draft changes stored separately from live data
- End users never see draft changes
- Admin can preview draft before publishing

### 2. Accurate Change Detection
- Publish modal compares live columns vs draft_settings
- Shows exactly what will change
- No false positives

### 3. Flexible Workflow
- Save draft multiple times
- Discard draft if needed
- Publish when ready

### 4. Backward Compatible
- `draft_settings = null` means no draft
- Existing sites continue to work
- No data migration needed

## Next Steps: Frontend Integration

Now that the backend is complete, the frontend needs to be updated to use the new endpoints:

1. Update `SiteContext.tsx` to use new endpoints
2. Update `SiteConfiguration.tsx` to save to draft
3. Update publish modal to compare live vs draft
4. Add "Discard Draft" button
5. Update public site loading to use live endpoint

See `DRAFT_LIVE_FRONTEND_IMPLEMENTATION.md` for frontend integration guide.

## Testing the Backend

### Test 1: Save Draft
```bash
# Save changes to draft
curl -X PATCH http://localhost:54321/make-server-6fcaeea3/v2/sites/abc-123/draft \
  -H "Content-Type: application/json" \
  -d '{"defaultCurrency": "EUR", "giftsPerUser": 3}'

# Verify draft_settings column is populated
psql -c "SELECT draft_settings FROM sites WHERE id = 'abc-123';"
```

### Test 2: Get With Draft
```bash
# Get site with draft merged
curl http://localhost:54321/make-server-6fcaeea3/v2/sites/abc-123/with-draft

# Should show EUR and 3 (draft values)
```

### Test 3: Get Live
```bash
# Get live version only
curl http://localhost:54321/make-server-6fcaeea3/v2/sites/abc-123/live

# Should show USD and 1 (live values)
```

### Test 4: Publish
```bash
# Publish draft to live
curl -X POST http://localhost:54321/make-server-6fcaeea3/v2/sites/abc-123/publish

# Verify live columns updated and draft_settings cleared
psql -c "SELECT default_currency, gifts_per_user, draft_settings FROM sites WHERE id = 'abc-123';"
```

### Test 5: Discard
```bash
# Save draft first
curl -X PATCH http://localhost:54321/make-server-6fcaeea3/v2/sites/abc-123/draft \
  -H "Content-Type: application/json" \
  -d '{"defaultCurrency": "GBP"}'

# Discard draft
curl -X DELETE http://localhost:54321/make-server-6fcaeea3/v2/sites/abc-123/draft

# Verify draft_settings is null
psql -c "SELECT draft_settings FROM sites WHERE id = 'abc-123';"
```

## Files Modified

1. ✅ `supabase/migrations/add_draft_settings_column.sql` (created)
2. ✅ `supabase/functions/server/helpers.ts` (appended)
3. ✅ `supabase/functions/server/crud_db.ts` (appended)
4. ✅ `supabase/functions/server/endpoints_v2.ts` (modified)
5. ✅ `supabase/functions/server/index.tsx` (modified)

## Status: ✅ BACKEND COMPLETE

The backend infrastructure for draft/live workflow is fully implemented and ready for frontend integration.
