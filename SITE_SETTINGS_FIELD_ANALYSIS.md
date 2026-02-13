# Site Settings Field Analysis & Gap Assessment

**Date:** February 12, 2026  
**Purpose:** Evaluate existing site fields vs. required ERP/management fields  
**Source:** Site Settings Spreadsheet Analysis

---

## 📋 Field Comparison Matrix

### ✅ **EXISTING Fields (Already Implemented)**

| Field Name | Current Location | Status |
|-----------|-----------------|--------|
| Site_Name | `site.name` | ✅ EXISTS |
| Site_URL | `site.domain` OR custom field | ⚠️ PARTIAL |
| Site_Type | `site.settings.siteType` | ✅ EXISTS |
| Site_Region | `site.settings.defaultCountry` | ⚠️ PARTIAL (country, not region) |
| Site_Country | `site.settings.defaultCountry` | ✅ EXISTS |
| Site_Currency | `site.settings.defaultCurrency` | ✅ EXISTS |
| Authentication_Method | `site.settings.validationMethod` | ✅ EXISTS |
| Site_Hide_Landing_Page | `site.settings.skipLandingPage` | ✅ EXISTS |

### ❌ **MISSING Fields (Need to Add)**

#### **Core Site Management:**
1. **Site_Drop_Down_Name** (No) - Display name in multi-site dropdown
2. **Site_Code** (No) - Unique code for ERP sync
3. **Site_Custom_Domain_URL** (No) - Custom domain if configured
4. **Site_Ship_From_Country** (Yes) - Country products shipped from
5. **Site_ERP_Integration** (Yes) - Which ERP system (NAJ, Fourgen, Netsuite, GRS)

#### **Site Features:**
6. **Site_Celebrations_Enabled** (Yes) - Show/hide celebration feature
7. **Allow_Session_TimeOut_Extend** (Yes, defaults off) - Extend timeout to 4 hours
8. **Enable_Employee_Log_Report** (Yes, defaults off) - Employee activity logging

#### **Account Management:**
9. **Site_Account_Manager** (No) - HALO account manager name
10. **Site_Account_Manager_Email** (No) - AM email for notifications

#### **Authentication:**
11. **Disable_Direct_Access_Authentication** (Yes, defaults off) - SSO-only mode

#### **Integrations:**
12. **Site_ERP_Instance** (Yes) - Specific ERP instance (NAJ, Fourgen, Netsuite, GRS)
13. **Site_HRIS_System** (No) - HR system integration
14. **SSO** (No) - SSO provider
15. **Site_SSO_Client_Office_Name** (No) - SSO configuration name

#### **Regional Client Information:**
16. **Region_Client_Office_Name** (No) - Regional office name
17. **Region_Client_Contact_Name** (No) - Regional contact
18. **Region_Client_Contact_Email** (No) - Regional contact email
19. **Region_Client_Contact_Phone** (No) - Regional contact phone
20. **Region_Client_Address_Line_1** (No) - Office address
21. **Region_Client_Address_Line_2** (No)
22. **Region_Client_Address_Line_3** (No)
23. **Region_Client_City** (No)
24. **Region_Client_Country/State** (No)
25. **Region_Client_Tax_ID** (No) - Tax/VAT ID

---

## 📊 Summary Statistics

- **Total Fields in Spreadsheet:** 40
- **Existing/Partial:** 8 fields (20%)
- **Missing:** 25 fields (63%)
- **N/A or Redundant:** 7 fields (17%)

---

## 🎯 Recommended Implementation Strategy

### **Phase 1: Critical ERP Integration Fields (HIGH PRIORITY)**

Add these immediately for ERP integration:

```typescript
interface SiteERPIntegration {
  site_code: string;                    // Unique ERP sync code
  site_erp_integration: string;         // System name: NAJ, Fourgen, Netsuite, GRS
  site_erp_instance: string;            // Specific instance identifier
  site_ship_from_country: string;       // Warehouse country
  site_hris_system?: string;            // HR system
}
```

### **Phase 2: Site Management Fields (MEDIUM PRIORITY)**

Add for admin management:

```typescript
interface SiteManagement {
  site_drop_down_name?: string;         // Multi-site dropdown display name
  site_custom_domain_url?: string;      // Custom domain if configured
  site_account_manager?: string;        // HALO AM name
  site_account_manager_email?: string;  // AM email
  site_celebrations_enabled: boolean;   // Enable celebrations feature
  allow_session_timeout_extend: boolean; // 4-hour timeout option
  enable_employee_log_report: boolean;  // Employee activity logging
}
```

### **Phase 3: Regional Client Info (LOW PRIORITY)**

Add for international operations:

```typescript
interface RegionalClientInfo {
  region_client_office_name?: string;
  region_client_contact_name?: string;
  region_client_contact_email?: string;
  region_client_contact_phone?: string;
  region_client_address_line_1?: string;
  region_client_address_line_2?: string;
  region_client_address_line_3?: string;
  region_client_city?: string;
  region_client_country_state?: string;
  region_client_tax_id?: string;
}
```

### **Phase 4: Authentication & SSO (MEDIUM PRIORITY)**

```typescript
interface SiteAuthentication {
  disable_direct_access_auth: boolean;  // SSO-only mode
  sso_provider?: string;                // SSO provider name
  sso_client_office_name?: string;      // SSO configuration
}
```

---

## 🔧 Implementation Plan

### Step 1: Update Backend Types
**File:** `/supabase/functions/server/types.ts`
**File:** `/supabase/functions/server/resources/sites.ts`

Add new fields to `Site` interface:

```typescript
export interface Site {
  // ... existing fields ...
  
  // Phase 1: ERP Integration (CRITICAL)
  site_code?: string;
  site_erp_integration?: string;
  site_erp_instance?: string;
  site_ship_from_country?: string;
  site_hris_system?: string;
  
  // Phase 2: Site Management
  site_drop_down_name?: string;
  site_custom_domain_url?: string;
  site_account_manager?: string;
  site_account_manager_email?: string;
  site_celebrations_enabled?: boolean;
  allow_session_timeout_extend?: boolean;
  enable_employee_log_report?: boolean;
  
  // Phase 3: Regional Info
  regional_client_info?: {
    office_name?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    address_line_1?: string;
    address_line_2?: string;
    address_line_3?: string;
    city?: string;
    country_state?: string;
    tax_id?: string;
  };
  
  // Phase 4: Authentication
  disable_direct_access_auth?: boolean;
  sso_provider?: string;
  sso_client_office_name?: string;
}
```

### Step 2: Update Frontend Types
**File:** `/src/app/types/index.ts`

Mirror the backend types in frontend.

### Step 3: Update Site Configuration UI
**File:** `/src/app/pages/admin/SiteConfiguration.tsx`

Add new tab or expand existing tabs:
- **General Tab:** Add ERP fields
- **New "Integrations" Tab:** ERP, HRIS, SSO config
- **New "Regional Info" Tab:** Regional client details

### Step 4: Update Validation
**File:** `/src/app/utils/siteConfigValidation.ts`

Add validation rules for new fields.

### Step 5: Update API Endpoints
**File:** `/supabase/functions/server/resources/sites.ts`

Ensure CRUD operations handle new fields.

---

## ⚠️ Important Notes

### Fields That Are Required (Yes):
These must have default values or be required in creation:
- `site_ship_from_country` ✅ Required
- `site_erp_integration` ✅ Required
- `site_celebrations_enabled` ✅ Required (default: false)
- `allow_session_timeout_extend` ✅ Required (default: false)
- `enable_employee_log_report` ✅ Required (default: false)
- `disable_direct_access_auth` ✅ Required (default: false)
- `site_erp_instance` ✅ Required
- `site_currency` ✅ Already exists

### Fields That Are Optional (No):
These can be null/undefined:
- `site_drop_down_name`
- `site_code`
- `site_custom_domain_url`
- `site_account_manager`
- `site_account_manager_email`
- `site_hris_system`
- `sso_provider`
- `sso_client_office_name`
- All regional client fields

---

## 🚀 Next Steps

1. ✅ Review this analysis with you
2. ⬜ Add Phase 1 fields (ERP Integration) - CRITICAL
3. ⬜ Add Phase 2 fields (Site Management) - MEDIUM
4. ⬜ Update Site Configuration UI with new fields
5. ⬜ Add validation for new required fields
6. ⬜ Test ERP sync with new `site_code` field
7. ⬜ Update seed data to include new fields

---

**Status:** Ready for implementation  
**Priority:** HIGH - Needed for ERP integration  
**Estimated Time:** 2-3 hours for Phase 1, 4-5 hours total
