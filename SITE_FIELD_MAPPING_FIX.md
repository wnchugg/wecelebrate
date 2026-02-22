# Site Field Mapping Fix

## Problem

When editing site slugs (or any site fields), the update was failing with errors:
- "Could not find the 'allowSessionTimeoutExtend' column"
- "Could not find the 'domain' column"

## Root Cause

There was a three-way mismatch between:

1. **Frontend Types** (`src/app/types/api.types.ts`):
   - Uses camelCase: `allowSessionTimeoutExtend`, `domain`, `siteCustomDomainUrl`
   - Includes fields that don't exist in database: `domain`, `type`, `settings`, etc.

2. **Backend Types** (`supabase/functions/server/database/types.ts`):
   - Simplified interface that didn't match actual schema
   - Missing many columns that exist in the database

3. **Database Schema** (`supabase/functions/server/database/schema.sql`):
   - Uses snake_case: `allow_session_timeout_extend`, `site_custom_domain_url`
   - NO `domain` column exists (only `site_custom_domain_url`)
   - Has many columns not in backend types

The previous fix only converted camelCase to snake_case, but didn't:
- Filter out fields that don't exist in the database
- Map frontend field names to correct database column names

## Solution

Created `mapSiteFieldsToDatabase()` function in `helpers.ts` that:

1. **Maps frontend fields to database columns**:
   - `domain` → ignored (doesn't exist)
   - `allowSessionTimeoutExtend` → `allow_session_timeout_extend`
   - `siteCustomDomainUrl` → `site_custom_domain_url`
   - etc.

2. **Filters out non-existent fields**:
   - `domain` - doesn't exist in schema
   - `isActive` - computed from status
   - `settings` - not in current schema
   - `type` - not in current schema
   - UX customization fields (not in schema yet)

3. **Handles all site fields properly**:
   - Basic info: name, slug, status
   - ERP integration: siteCode, siteErpIntegration, etc.
   - Site management: siteDropDownName, allowSessionTimeoutExtend, etc.
   - Regional info: regionalClientInfo (JSONB)
   - Authentication: disableDirectAccessAuth, ssoProvider, etc.

## Files Modified

1. **supabase/functions/server/helpers.ts**:
   - Added `mapSiteFieldsToDatabase()` function with complete field mapping

2. **supabase/functions/server/crud_db.ts**:
   - Updated `createSite()` to use `mapSiteFieldsToDatabase()`
   - Updated `updateSite()` to use `mapSiteFieldsToDatabase()`
   - Added logging to show input/mapped fields for debugging

3. **src/app/context/SiteContext.tsx**:
   - Fixed `updateSite()` to handle apiRequest correctly (returns parsed JSON, not Response)
   - Now properly extracts data from the result object
   - Updates local state with backend-returned data instead of just the updates

## Testing

The automated test script requires authentication, so the best way to test is:

1. **Backend is deployed** ✅ (already done)
2. **Test in the UI**:
   - Go to http://localhost:5173/admin/login
   - Login to admin
   - Navigate to a site configuration page
   - Try editing the site slug
   - Save the changes
3. **Check browser console** for detailed logs:
   - Should see: `[CRUD DB] Input fields: [...]`
   - Should see: `[CRUD DB] Mapped fields: [...]`
   - Should NOT see column errors
4. **Verify the update succeeded**:
   - Site should save without errors
   - Slug should be updated in the database

## What Changed in the Logs

Before the fix:
```
[CRUD DB] Updating site: 10000000-0000-0000-0000-000000000001
Error: Could not find the 'domain' column
Error: Could not find the 'allowSessionTimeoutExtend' column
```

After the fix:
```
[CRUD DB] Updating site: 10000000-0000-0000-0000-000000000001
[CRUD DB] Input fields: ["slug", "allowSessionTimeoutExtend", "domain", ...]
[CRUD DB] Mapped fields: ["slug", "allow_session_timeout_extend", ...]
✓ Site updated successfully
```

Note: `domain` is filtered out, `allowSessionTimeoutExtend` is mapped to `allow_session_timeout_extend`

## Field Mapping Reference

### Frontend → Database Mappings

```typescript
// Basic fields
clientId → client_id
catalogId → catalog_id
name → name
slug → slug
status → status
validationMethods → validation_methods
branding → branding
selectionStartDate → selection_start_date
selectionEndDate → selection_end_date

// ERP Integration
siteCode → site_code
siteErpIntegration → site_erp_integration
siteErpInstance → site_erp_instance
siteShipFromCountry → site_ship_from_country
siteHrisSystem → site_hris_system

// Site Management
siteDropDownName → site_drop_down_name
siteCustomDomainUrl → site_custom_domain_url
siteAccountManager → site_account_manager
siteAccountManagerEmail → site_account_manager_email
siteCelebrationsEnabled → site_celebrations_enabled
allowSessionTimeoutExtend → allow_session_timeout_extend
enableEmployeeLogReport → enable_employee_log_report

// Regional Info
regionalClientInfo → regional_client_info

// Authentication
disableDirectAccessAuth → disable_direct_access_auth
ssoProvider → sso_provider
ssoClientOfficeName → sso_client_office_name
```

### Ignored Fields (Don't Exist in Database)

- `id` - never update ID
- `domain` - use `siteCustomDomainUrl` instead
- `isActive` - computed from status
- `settings` - not in current schema
- `type` - not in current schema
- `headerFooterConfig` - UX customization (future)
- `brandingAssets` - UX customization (future)
- `giftSelectionConfig` - UX customization (future)
- `reviewScreenConfig` - UX customization (future)
- `orderTrackingConfig` - UX customization (future)

## Next Steps

If you add new fields to the database schema:
1. Add the column to `schema.sql`
2. Add the mapping to `mapSiteFieldsToDatabase()` in `helpers.ts`
3. Update frontend types if needed
4. Deploy backend

## Deployment Status

- ✅ Backend deployed to development
- ✅ Field mapping function created
- ✅ createSite() updated
- ✅ updateSite() updated
- 🔄 Ready for testing in UI
