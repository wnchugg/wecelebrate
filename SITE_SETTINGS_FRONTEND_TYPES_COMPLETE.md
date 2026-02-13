# Site Settings - Frontend Types & Validation Complete ✅

**Date:** February 12, 2026  
**Status:** Frontend Types & Validation Ready - UI Implementation Next

---

## ✅ What Was Completed

### 1. Frontend Type Definitions Updated ✅

Added **25 new fields** to frontend type system:
- ✅ `/src/app/types/api.types.ts` - Site, CreateSiteRequest, UpdateSiteRequest interfaces

### 2. Validation System Enhanced ✅  

Added comprehensive validation for all new fields:
- ✅ `/src/app/utils/siteConfigValidation.ts` - SiteConfigData interface
- ✅ Added 4 validation sections (ERP, Management, Regional, SSO)
- ✅ Email validation for manager/regional contacts
- ✅ Phone number validation for regional contacts
- ✅ Country code validation (ISO 3166-1 alpha-2)
- ✅ ERP system validation (NAJ, Fourgen, Netsuite, GRS, SAP, Oracle, Manual)
- ✅ Site code format validation (alphanumeric + hyphens)
- ✅ URL validation for custom domains

---

## 📋 Complete Type System

### **Site Interface** (Frontend)

```typescript
export interface Site {
  // ... existing fields ...
  
  // Phase 1: ERP Integration (CRITICAL)
  siteCode?: string;
  siteErpIntegration?: string;
  siteErpInstance?: string;
  siteShipFromCountry?: string;
  siteHrisSystem?: string;
  
  // Phase 2: Site Management
  siteDropDownName?: string;
  siteCustomDomainUrl?: string;
  siteAccountManager?: string;
  siteAccountManagerEmail?: string;
  siteCelebrationsEnabled?: boolean;
  allowSessionTimeoutExtend?: boolean;
  enableEmployeeLogReport?: boolean;
  
  // Phase 3: Regional Client Info
  regionalClientInfo?: {
    officeName?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    city?: string;
    countryState?: string;
    taxId?: string;
  };
  
  // Phase 4: Advanced Authentication
  disableDirectAccessAuth?: boolean;
  ssoProvider?: string;
  ssoClientOfficeName?: string;
}
```

---

## 🔍 Validation Rules Added

### **Phase 1: ERP Integration**

```typescript
// Site Code: Alphanumeric + hyphens, max 50 chars
if (!/^[a-zA-Z0-9\-]+$/.test(siteCode)) {
  return 'Invalid format (alphanumeric and hyphens only)';
}

// ERP System: Must be valid system
const validErpSystems = ['NAJ', 'Fourgen', 'Netsuite', 'GRS', 'SAP', 'Oracle', 'Manual'];

// Ship From Country: ISO 3166-1 alpha-2 (2-letter code)
if (!/^[A-Z]{2}$/.test(siteShipFromCountry)) {
  return 'Use 2-letter ISO code (e.g., US, CA, GB)';
}
```

### **Phase 2: Site Management**

```typescript
// Site Dropdown Name: Max 100 characters
if (siteDropDownName.length > 100) {
  return 'Maximum 100 characters';
}

// Custom Domain URL: Must be valid URL
if (!isValidUrl(siteCustomDomainUrl)) {
  return 'Invalid URL format';
}

// Account Manager Email: Valid email format
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siteAccountManagerEmail)) {
  return 'Invalid email format';
}
```

### **Phase 3: Regional Client Info**

```typescript
// Regional Contact Email: Valid email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regional Contact Phone: Numbers, spaces, common punctuation
const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
```

### **Phase 4: Authentication**

```typescript
// Warning if SSO-only mode without SSO provider
if (disableDirectAccessAuth && !ssoProvider) {
  warnings.push('Direct access disabled but no SSO provider configured');
}
```

---

## 📊 Validation Summary

| Validation Type | Fields Covered | Severity |
|----------------|----------------|----------|
| **Format** | Site Code, Country Code | Error |
| **Email** | Manager Email, Regional Email | Error |
| **Phone** | Regional Phone | Error |
| **URL** | Custom Domain | Error |
| **Enum** | ERP System | Error |
| **Length** | Dropdown Name | Error |
| **Logic** | SSO Configuration | Warning |

---

## 🎯 Next Step: UI Implementation

Now we need to add these fields to the Site Configuration page UI.

### **Recommended Tab Structure:**

#### **Option 1: Integrate into Existing Tabs**
- ✅ **General Tab** - Add ERP fields (Site Code, ERP System, Ship From Country)
- ✅ **Header/Footer Tab** - Add Account Manager fields
- ✅ **New "Integrations" Tab** - ERP Instance, HRIS, SSO config
- ✅ **New "Regional Info" Tab** - All regional client fields

#### **Option 2: Single "Advanced Settings" Tab**
- ✅ Section 1: ERP Integration
- ✅ Section 2: Site Management
- ✅ Section 3: Regional Client Info
- ✅ Section 4: Authentication & SSO

---

## 💻 UI Implementation Preview

### **Example: ERP Integration Section (General Tab)**

```tsx
{/* ERP Integration Section */}
<div className="space-y-4 pt-6 border-t border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900">ERP Integration</h3>
  
  <div className="grid grid-cols-2 gap-4">
    {/* Site Code */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Site Code <span className="text-gray-400">(Optional)</span>
      </label>
      <Input
        value={siteCode}
        onChange={(e) => setSiteCode(e.target.value)}
        placeholder="e.g., TC-EG-2026"
        disabled={configMode === 'live'}
        className={errors.siteCode ? 'border-red-500' : ''}
      />
      {errors.siteCode && (
        <p className="text-sm text-red-600 mt-1">{errors.siteCode}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Unique identifier for ERP synchronization
      </p>
    </div>
    
    {/* ERP System */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        ERP System
      </label>
      <select
        value={siteErpIntegration}
        onChange={(e) => setSiteErpIntegration(e.target.value)}
        disabled={configMode === 'live'}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="">Select System</option>
        <option value="NAJ">NAJ</option>
        <option value="Fourgen">Fourgen</option>
        <option value="Netsuite">Netsuite</option>
        <option value="GRS">GRS</option>
        <option value="SAP">SAP</option>
        <option value="Oracle">Oracle</option>
        <option value="Manual">Manual</option>
      </select>
    </div>
    
    {/* Ship From Country */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Ship From Country *
      </label>
      <Input
        value={siteShipFromCountry}
        onChange={(e) => setSiteShipFromCountry(e.target.value.toUpperCase())}
        placeholder="US"
        maxLength={2}
        disabled={configMode === 'live'}
        className={errors.siteShipFromCountry ? 'border-red-500' : ''}
      />
      {errors.siteShipFromCountry && (
        <p className="text-sm text-red-600 mt-1">{errors.siteShipFromCountry}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        2-letter country code (e.g., US, CA, GB)
      </p>
    </div>
  </div>
</div>
```

### **Example: Account Manager Section**

```tsx
{/* Account Manager Section */}
<div className="space-y-4 pt-6 border-t border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900">Account Management</h3>
  
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Account Manager
      </label>
      <Input
        value={siteAccountManager}
        onChange={(e) => setSiteAccountManager(e.target.value)}
        placeholder="Sarah Williams"
        disabled={configMode === 'live'}
      />
      <p className="text-xs text-gray-500 mt-1">
        HALO account manager assigned to this site
      </p>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Account Manager Email
      </label>
      <Input
        type="email"
        value={siteAccountManagerEmail}
        onChange={(e) => setSiteAccountManagerEmail(e.target.value)}
        placeholder="sarah@halo.com"
        disabled={configMode === 'live'}
        className={errors.siteAccountManagerEmail ? 'border-red-500' : ''}
      />
      {errors.siteAccountManagerEmail && (
        <p className="text-sm text-red-600 mt-1">{errors.siteAccountManagerEmail}</p>
      )}
    </div>
  </div>
</div>
```

---

## 🚀 Implementation Checklist

### ✅ **Completed:**
- [x] Backend type definitions (snake_case)
- [x] Frontend type definitions (camelCase)
- [x] Validation rules for all new fields
- [x] Email validation
- [x] Phone validation  
- [x] Country code validation
- [x] ERP system validation
- [x] URL validation

### ⬜ **Next (UI Implementation):**
- [ ] Add state variables to SiteConfiguration.tsx
- [ ] Add UI fields to existing tabs
- [ ] Create new "Integrations" tab (optional)
- [ ] Create new "Regional Info" tab (optional)
- [ ] Wire up onChange handlers
- [ ] Test validation in UI
- [ ] Test save/load functionality
- [ ] Update seed data with new fields

---

## 📝 State Variables to Add

Add these to `/src/app/pages/admin/SiteConfiguration.tsx`:

```typescript
// Phase 1: ERP Integration State
const [siteCode, setSiteCode] = useState(currentSite?.siteCode || '');
const [siteErpIntegration, setSiteErpIntegration] = useState(currentSite?.siteErpIntegration || '');
const [siteErpInstance, setSiteErpInstance] = useState(currentSite?.siteErpInstance || '');
const [siteShipFromCountry, setSiteShipFromCountry] = useState(currentSite?.siteShipFromCountry || 'US');
const [siteHrisSystem, setSiteHrisSystem] = useState(currentSite?.siteHrisSystem || '');

// Phase 2: Site Management State
const [siteDropDownName, setSiteDropDownName] = useState(currentSite?.siteDropDownName || '');
const [siteCustomDomainUrl, setSiteCustomDomainUrl] = useState(currentSite?.siteCustomDomainUrl || '');
const [siteAccountManager, setSiteAccountManager] = useState(currentSite?.siteAccountManager || '');
const [siteAccountManagerEmail, setSiteAccountManagerEmail] = useState(currentSite?.siteAccountManagerEmail || '');
const [siteCelebrationsEnabled, setSiteCelebrationsEnabled] = useState(currentSite?.siteCelebrationsEnabled ?? false);
const [allowSessionTimeoutExtend, setAllowSessionTimeoutExtend] = useState(currentSite?.allowSessionTimeoutExtend ?? false);
const [enableEmployeeLogReport, setEnableEmployeeLogReport] = useState(currentSite?.enableEmployeeLogReport ?? false);

// Phase 3: Regional Client Info State
const [regionalOfficeName, setRegionalOfficeName] = useState(currentSite?.regionalClientInfo?.officeName || '');
const [regionalContactName, setRegionalContactName] = useState(currentSite?.regionalClientInfo?.contactName || '');
const [regionalContactEmail, setRegionalContactEmail] = useState(currentSite?.regionalClientInfo?.contactEmail || '');
const [regionalContactPhone, setRegionalContactPhone] = useState(currentSite?.regionalClientInfo?.contactPhone || '');
const [regionalAddressLine1, setRegionalAddressLine1] = useState(currentSite?.regionalClientInfo?.addressLine1 || '');
const [regionalAddressLine2, setRegionalAddressLine2] = useState(currentSite?.regionalClientInfo?.addressLine2 || '');
const [regionalAddressLine3, setRegionalAddressLine3] = useState(currentSite?.regionalClientInfo?.addressLine3 || '');
const [regionalCity, setRegionalCity] = useState(currentSite?.regionalClientInfo?.city || '');
const [regionalCountryState, setRegionalCountryState] = useState(currentSite?.regionalClientInfo?.countryState || '');
const [regionalTaxId, setRegionalTaxId] = useState(currentSite?.regionalClientInfo?.taxId || '');

// Phase 4: Authentication State
const [disableDirectAccessAuth, setDisableDirectAccessAuth] = useState(currentSite?.disableDirectAccessAuth ?? false);
const [ssoProvider, setSsoProvider] = useState(currentSite?.ssoProvider || '');
const [ssoClientOfficeName, setSsoClientOfficeName] = useState(currentSite?.ssoClientOfficeName || '');
```

---

## 🎯 Estimated Time

- **State variables:** 15 minutes
- **General tab ERP section:** 30 minutes
- **Account Manager section:** 20 minutes
- **Regional Info tab/section:** 45 minutes
- **SSO/Auth section:** 20 minutes
- **Testing:** 30 minutes

**Total:** ~2.5 hours

---

## ✅ Summary

**Frontend Types:** ✅ Complete  
**Validation Rules:** ✅ Complete  
**Backend Types:** ✅ Complete (from previous step)  
**UI Implementation:** ⬜ Pending  

**Status:** Ready for UI implementation  
**Next:** Add fields to Site Configuration page

---

**Created:** February 12, 2026  
**Phase:** Frontend Types & Validation Complete  
**Ready For:** UI Implementation
