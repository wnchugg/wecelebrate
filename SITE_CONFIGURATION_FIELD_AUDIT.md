# Site Configuration Field Audit

## Overview
This document provides a comprehensive audit of all site configuration fields, comparing:
1. Frontend state variables in `SiteConfiguration.tsx`
2. Database columns in the `sites` table
3. Field mapping in `mapSiteFieldsToDatabase()` function

## Field Categories

### ✅ Category 1: Direct Database Columns (Properly Mapped)

These fields have dedicated database columns and proper field mapping:

| Frontend Field | Database Column | Mapping Status | Notes |
|---------------|-----------------|----------------|-------|
| `siteName` | `name` | ✅ Mapped | Direct mapping |
| `siteUrl` | `slug` | ✅ Mapped | Direct mapping |
| `siteCode` | `site_code` | ✅ Mapped | ERP integration |
| `siteErpIntegration` | `site_erp_integration` | ✅ Mapped | ERP integration |
| `siteErpInstance` | `site_erp_instance` | ✅ Mapped | ERP integration |
| `siteShipFromCountry` | `site_ship_from_country` | ✅ Mapped | ERP integration |
| `siteHrisSystem` | `site_hris_system` | ✅ Mapped | ERP integration |
| `siteDropDownName` | `site_drop_down_name` | ✅ Mapped | Site management |
| `siteCustomDomainUrl` | `site_custom_domain_url` | ✅ Mapped | Site management |
| `siteAccountManager` | `site_account_manager` | ✅ Mapped | Site management |
| `siteAccountManagerEmail` | `site_account_manager_email` | ✅ Mapped | Site management |
| `siteCelebrationsEnabled` | `site_celebrations_enabled` | ✅ Mapped | Site management |
| `allowSessionTimeoutExtend` | `allow_session_timeout_extend` | ✅ Mapped | Site management |
| `enableEmployeeLogReport` | `enable_employee_log_report` | ✅ Mapped | Site management |
| `disableDirectAccessAuth` | `disable_direct_access_auth` | ✅ Mapped | Authentication |
| `ssoProvider` | `sso_provider` | ✅ Mapped | Authentication |
| `ssoClientOfficeName` | `sso_client_office_name` | ✅ Mapped | Authentication |

### ✅ Category 2: JSONB Columns (Properly Mapped)

These fields are stored in JSONB columns:

| Frontend Field | Database Column | Mapping Status | Notes |
|---------------|-----------------|----------------|-------|
| `primaryColor` | `branding` (JSONB) | ✅ Mapped | Stored in branding.primaryColor |
| `secondaryColor` | `branding` (JSONB) | ✅ Mapped | Stored in branding.secondaryColor |
| `tertiaryColor` | `branding` (JSONB) | ✅ Mapped | Stored in branding.tertiaryColor |
| `regionalClientInfo.*` | `regional_client_info` (JSONB) | ✅ Mapped | All regional fields stored as JSONB |
| `validationMethod` | `validation_methods` (JSONB) | ✅ Mapped | Stored as array in JSONB |

### ⚠️ Category 3: Settings Object Fields (Needs Database Columns)

These fields are currently stored in the `settings` object but should have dedicated database columns for better performance and querying:

| Frontend Field | Current Storage | Recommended Action | Priority |
|---------------|-----------------|-------------------|----------|
| `skipLandingPage` | `settings` object | ✅ **DONE** - Added `skip_landing_page` column | High |
| `allowQuantitySelection` | `settings` object | ⚠️ Add `allow_quantity_selection` column | Medium |
| `showPricing` | `settings` object | ⚠️ Add `show_pricing` column | Medium |
| `giftsPerUser` | `settings` object | ⚠️ Add `gifts_per_user` column | High |
| `defaultLanguage` | `settings` object | ⚠️ Add `default_language` column | High |
| `defaultCurrency` | `settings` object | ⚠️ Add `default_currency` column | High |
| `defaultCountry` | `settings` object | ⚠️ Add `default_country` column | High |
| `availabilityStartDate` | `settings` object | ⚠️ Use existing `selection_start_date` | High |
| `availabilityEndDate` | `settings` object | ⚠️ Use existing `selection_end_date` | High |
| `expiredMessage` | `settings` object | ⚠️ Add `expired_message` column | Low |
| `defaultGiftId` | `settings` object | ⚠️ Add `default_gift_id` column | Medium |
| `defaultGiftDaysAfterClose` | `settings` object | ⚠️ Add `default_gift_days_after_close` column | Low |
| `skipReviewPage` | `settings` object | ⚠️ Add `skip_review_page` column | Medium |

### ⚠️ Category 4: Header/Footer Settings (Needs Database Columns)

| Frontend Field | Current Storage | Recommended Action | Priority |
|---------------|-----------------|-------------------|----------|
| `showHeader` | `settings` object | ⚠️ Add `show_header` column | Low |
| `showFooter` | `settings` object | ⚠️ Add `show_footer` column | Low |
| `headerLayout` | `settings` object | ⚠️ Add `header_layout` column | Low |
| `showLanguageSelector` | `settings` object | ⚠️ Add `show_language_selector` column | Low |
| `companyName` | `settings` object | ⚠️ Add `company_name` column | Medium |
| `footerText` | `settings` object | ⚠️ Add `footer_text` column | Low |

### ⚠️ Category 5: Gift Selection UX Settings (Needs Database Columns)

| Frontend Field | Current Storage | Recommended Action | Priority |
|---------------|-----------------|-------------------|----------|
| `enableSearch` | `settings` object | ⚠️ Add `enable_search` column | Low |
| `enableFilters` | `settings` object | ⚠️ Add `enable_filters` column | Low |
| `gridColumns` | `settings` object | ⚠️ Add `grid_columns` column | Low |
| `showDescription` | `settings` object | ⚠️ Add `show_description` column | Low |
| `sortOptions` | `settings` object | ⚠️ Add `sort_options` JSONB column | Low |

### ⚠️ Category 6: Shipping & Welcome Page Settings (Needs Database Columns)

| Frontend Field | Current Storage | Recommended Action | Priority |
|---------------|-----------------|-------------------|----------|
| `shippingMode` | `settings` object | ⚠️ Add `shipping_mode` column | Medium |
| `defaultShippingAddress` | `settings` object | ⚠️ Add `default_shipping_address` TEXT column | Medium |
| `welcomeMessage` | `settings` object | ⚠️ Add `welcome_message` TEXT column | Low |
| `enableWelcomePage` | `settings` object | ⚠️ Add `enable_welcome_page` column | Medium |
| `welcomePageTitle` | `settings.welcomePageContent` | ⚠️ Add `welcome_page_content` JSONB column | Low |
| `welcomePageMessage` | `settings.welcomePageContent` | ⚠️ Add `welcome_page_content` JSONB column | Low |
| `welcomePageAuthorName` | `settings.welcomePageContent` | ⚠️ Add `welcome_page_content` JSONB column | Low |
| `welcomePageAuthorTitle` | `settings.welcomePageContent` | ⚠️ Add `welcome_page_content` JSONB column | Low |
| `welcomePageImageUrl` | `settings.welcomePageContent` | ⚠️ Add `welcome_page_content` JSONB column | Low |
| `allowedCountries` | `settings` object | ⚠️ Add `allowed_countries` JSONB column | Medium |
| `enableAddressValidation` | `settings.addressValidation` | ⚠️ Add `address_validation` JSONB column | Low |
| `addressValidationProvider` | `settings.addressValidation` | ⚠️ Add `address_validation` JSONB column | Low |

### ❌ Category 7: Fields Not in Database (Ignored)

These fields are used in the frontend but intentionally not stored in the database:

| Frontend Field | Reason | Status |
|---------------|--------|--------|
| `siteType` | Not in current schema | ❌ Ignored in mapping |
| `domain` | Replaced by `siteCustomDomainUrl` | ❌ Ignored in mapping |
| `isActive` | Computed from `status` | ❌ Ignored in mapping |
| `type` | Not in current schema | ❌ Ignored in mapping |

## Current Field Mapping Function

The `mapSiteFieldsToDatabase()` function in `helpers.ts` currently handles:

### ✅ Properly Mapped Fields:
- All direct database columns (Category 1)
- JSONB columns (Category 2)
- `skipLandingPage` extracted from settings

### ⚠️ Issues:
- Most settings fields (Categories 3-6) are stored in a generic `settings` object
- No extraction logic for other settings fields besides `skipLandingPage`
- Settings object is filtered out entirely, so most settings are lost

## Recommendations

### Phase 1: Critical Fields (High Priority)
Add database columns and mapping for:
1. `gifts_per_user` INTEGER
2. `default_language` TEXT
3. `default_currency` TEXT
4. `default_country` TEXT
5. Map `availabilityStartDate` → `selection_start_date` (already exists!)
6. Map `availabilityEndDate` → `selection_end_date` (already exists!)

### Phase 2: Important Fields (Medium Priority)
Add database columns and mapping for:
1. `allow_quantity_selection` BOOLEAN
2. `show_pricing` BOOLEAN
3. `default_gift_id` UUID
4. `skip_review_page` BOOLEAN
5. `company_name` TEXT
6. `shipping_mode` TEXT
7. `default_shipping_address` TEXT
8. `enable_welcome_page` BOOLEAN
9. `allowed_countries` JSONB

### Phase 3: UX Customization Fields (Low Priority)
Add database columns for UI/UX settings:
1. `show_header`, `show_footer`, `header_layout`, etc.
2. `enable_search`, `enable_filters`, `grid_columns`, etc.
3. `welcome_page_content` JSONB
4. `address_validation` JSONB

## Migration Strategy

### Option A: Gradual Migration (Recommended)
1. Add columns one phase at a time
2. Update field mapping for each phase
3. Test thoroughly between phases
4. Keep settings object as fallback during transition

### Option B: Big Bang Migration
1. Add all columns at once
2. Update all field mapping
3. Migrate existing settings data
4. Remove settings object entirely

## Next Steps

1. ✅ **COMPLETED**: Add `skip_landing_page` column and mapping
2. Review and prioritize which fields need dedicated columns
3. Create migration scripts for Phase 1 fields
4. Update `mapSiteFieldsToDatabase()` to extract Phase 1 fields
5. Update `getSiteById()` and `getSiteBySlug()` to reconstruct settings from database fields
6. Test and deploy Phase 1
7. Repeat for Phase 2 and Phase 3

## Notes

- The `selection_start_date` and `selection_end_date` columns already exist but are not being used by the frontend
- The frontend uses `availabilityStartDate` and `availabilityEndDate` in settings instead
- This should be fixed to use the existing database columns
- Many settings are currently lost when saving because they're in the settings object which is filtered out
