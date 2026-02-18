# Site Configuration Comprehensive Fix

## Summary

Completed a comprehensive audit and fix of site configuration field mapping between frontend, backend, and database.

## What Was Done

### 1. Field Audit
Created `SITE_CONFIGURATION_FIELD_AUDIT.md` documenting:
- All frontend state variables in `SiteConfiguration.tsx`
- Database columns in the `sites` table
- Field mapping status for each field
- Recommendations for missing columns

### 2. Database Migration
Created `add_critical_site_settings_columns.sql` adding Phase 1 critical columns:
- `gifts_per_user` INTEGER
- `default_language` TEXT
- `default_currency` TEXT
- `default_country` TEXT
- `allow_quantity_selection` BOOLEAN
- `show_pricing` BOOLEAN
- `default_gift_id` UUID (with FK to products)
- `skip_review_page` BOOLEAN
- `expired_message` TEXT
- `default_gift_days_after_close` INTEGER

### 3. Backend Field Mapping Updates

#### Updated `mapSiteFieldsToDatabase()` in `helpers.ts`:
- Extracts all Phase 1 settings fields from `settings` object
- Maps them to dedicated database columns
- Maps `availabilityStartDate` → `selection_start_date` (existing column!)
- Maps `availabilityEndDate` → `selection_end_date` (existing column!)
- Added comprehensive logging

#### Updated `getSiteById()` in `crud_db.ts`:
- Reconstructs `settings` object from database columns
- Moves all Phase 1 fields from top-level to `settings` object
- Maps `selectionStartDate` → `settings.availabilityStartDate` for frontend compatibility
- Maps `selectionEndDate` → `settings.availabilityEndDate` for frontend compatibility

#### Updated `getSiteBySlug()` in `crud_db.ts`:
- Same reconstruction logic as `getSiteById()`
- Ensures consistent settings structure

#### Updated `updateSite()` in `crud_db.ts`:
- Reconstructs settings after update
- Returns properly formatted data to frontend

## Fields Now Properly Mapped

### ✅ Phase 1 Critical Fields (DONE)
1. `skipLandingPage` → `skip_landing_page`
2. `giftsPerUser` → `gifts_per_user`
3. `defaultLanguage` → `default_language`
4. `defaultCurrency` → `default_currency`
5. `defaultCountry` → `default_country`
6. `allowQuantitySelection` → `allow_quantity_selection`
7. `showPricing` → `show_pricing`
8. `defaultGiftId` → `default_gift_id`
9. `skipReviewPage` → `skip_review_page`
10. `expiredMessage` → `expired_message`
11. `defaultGiftDaysAfterClose` → `default_gift_days_after_close`
12. `availabilityStartDate` → `selection_start_date` (existing column!)
13. `availabilityEndDate` → `selection_end_date` (existing column!)

## Key Discoveries

### Selection Dates Already Exist!
The database already has `selection_start_date` and `selection_end_date` columns, but the frontend was using `settings.availabilityStartDate` and `settings.availabilityEndDate` instead. This is now properly mapped.

### Settings Object Pattern
The fix establishes a pattern for handling settings:
1. Frontend sends settings in `settings` object
2. Backend extracts fields with database columns
3. Backend saves to dedicated columns
4. Backend reconstructs `settings` object when reading
5. Frontend receives properly structured data

## Testing Checklist

### Before Running Migration
- [ ] Backup development database
- [ ] Review migration SQL

### After Running Migration
- [ ] Verify all new columns exist
- [ ] Check constraints are applied
- [ ] Verify indexes are created

### After Backend Deployment
- [ ] Test site configuration save
- [ ] Verify all Phase 1 fields persist
- [ ] Check browser console for mapping logs
- [ ] Test site loading with new fields
- [ ] Verify availability dates work correctly

### Specific Tests
- [ ] Change gifts per user → Save → Reload → Verify persisted
- [ ] Change default language → Save → Reload → Verify persisted
- [ ] Change default currency → Save → Reload → Verify persisted
- [ ] Set availability dates → Save → Reload → Verify persisted
- [ ] Toggle show pricing → Save → Reload → Verify persisted
- [ ] Toggle skip review page → Save → Reload → Verify persisted

## Deployment Steps

1. **Run Migration on Development Database**
   ```bash
   # Connect to development Supabase
   # Run: supabase/migrations/add_critical_site_settings_columns.sql
   ```

2. **Deploy Backend**
   ```bash
   ./deploy-backend.sh dev
   ```

3. **Test in Development**
   - Edit site configuration
   - Save changes
   - Reload page
   - Verify all fields persist

4. **Deploy to Production** (when ready)
   ```bash
   # Run migration on production database
   ./deploy-backend.sh prod
   ```

## Future Work

### Phase 2: Medium Priority Fields
- `company_name`
- `shipping_mode`
- `default_shipping_address`
- `enable_welcome_page`
- `allowed_countries` (JSONB)

### Phase 3: Low Priority UX Fields
- Header/Footer settings
- Gift selection UX settings
- Welcome page content (JSONB)
- Address validation (JSONB)

## Files Modified

### Backend
- `supabase/functions/server/helpers.ts` - Updated `mapSiteFieldsToDatabase()`
- `supabase/functions/server/crud_db.ts` - Updated `getSiteById()`, `getSiteBySlug()`, `updateSite()`

### Database
- `supabase/migrations/add_critical_site_settings_columns.sql` - New migration

### Documentation
- `SITE_CONFIGURATION_FIELD_AUDIT.md` - Comprehensive field audit
- `SITE_CONFIGURATION_COMPREHENSIVE_FIX.md` - This file

## Notes

- Debug logging is still active in backend functions
- Can be removed after confirming everything works
- Frontend logging in `SiteContext.tsx`, `PublicSiteContext.tsx`, and `Landing.tsx` can also be cleaned up
- The pattern established here can be used for Phase 2 and Phase 3 fields
