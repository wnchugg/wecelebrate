interface Change {
  field: string;
  category: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'modified' | 'removed';
}

interface SiteData {
  name?: string;
  slug?: string;
  type?: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    tertiaryColor?: string;
  };
  settings?: Record<string, any>;
  [key: string]: any;
}

const FIELD_CATEGORIES: Record<string, string> = {
  // General
  name: 'General Settings',
  slug: 'General Settings',
  type: 'General Settings',
  
  // Branding
  'branding.primaryColor': 'Branding',
  'branding.secondaryColor': 'Branding',
  'branding.tertiaryColor': 'Branding',
  
  // Internationalization
  'settings.defaultLanguage': 'Internationalization',
  'settings.defaultCurrency': 'Internationalization',
  'settings.defaultCountry': 'Internationalization',
  
  // Availability
  'settings.availabilityStartDate': 'Availability Period',
  'settings.availabilityEndDate': 'Availability Period',
  'settings.expiredMessage': 'Availability Period',
  
  // Products & Gifts
  'settings.giftsPerUser': 'Products & Gifts',
  'settings.defaultGiftId': 'Products & Gifts',
  'settings.defaultGiftDaysAfterClose': 'Products & Gifts',
  'settings.allowQuantitySelection': 'Products & Gifts',
  'settings.showPricing': 'Products & Gifts',
  
  // Header/Footer
  'settings.showHeader': 'Header & Footer',
  'settings.showFooter': 'Header & Footer',
  'settings.headerLayout': 'Header & Footer',
  'settings.showLanguageSelector': 'Header & Footer',
  'settings.companyName': 'Header & Footer',
  'settings.footerText': 'Header & Footer',
  
  // Gift Selection UX
  'settings.enableSearch': 'Gift Selection UX',
  'settings.enableFilters': 'Gift Selection UX',
  'settings.gridColumns': 'Gift Selection UX',
  'settings.showDescription': 'Gift Selection UX',
  'settings.sortOptions': 'Gift Selection UX',
  
  // Landing Page
  'settings.skipLandingPage': 'Landing Page',
  'settings.enableLandingPage': 'Landing Page',
  
  // Welcome Page
  'settings.enableWelcomePage': 'Welcome Page',
  'settings.welcomeMessage': 'Welcome Page',
  'settings.welcomePageContent': 'Welcome Page',
  
  // Access & Authentication
  'settings.validationMethod': 'Access & Authentication',
  disableDirectAccessAuth: 'Access & Authentication',
  ssoProvider: 'Access & Authentication',
  
  // Shipping
  'settings.shippingMode': 'Shipping',
  'settings.defaultShippingAddress': 'Shipping',
  'settings.allowedCountries': 'Shipping',
  'settings.addressValidation': 'Shipping',
  
  // Review & Confirmation
  'settings.skipReviewPage': 'Review & Confirmation',
  
  // ERP Integration
  siteCode: 'ERP Integration',
  siteErpIntegration: 'ERP Integration',
  siteErpInstance: 'ERP Integration',
  siteShipFromCountry: 'ERP Integration',
  siteHrisSystem: 'ERP Integration',
  
  // Site Management
  siteDropDownName: 'Site Management',
  siteCustomDomainUrl: 'Site Management',
  siteAccountManager: 'Site Management',
  siteAccountManagerEmail: 'Site Management',
  siteCelebrationsEnabled: 'Site Management',
  allowSessionTimeoutExtend: 'Site Management',
  enableEmployeeLogReport: 'Site Management',
  
  // Regional Info
  regionalClientInfo: 'Regional Client Info',
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Site Name',
  slug: 'Site URL Slug',
  type: 'Site Type',
  'branding.primaryColor': 'Primary Color',
  'branding.secondaryColor': 'Secondary Color',
  'branding.tertiaryColor': 'Tertiary Color',
  'settings.defaultLanguage': 'Default Language',
  'settings.defaultCurrency': 'Default Currency',
  'settings.defaultCountry': 'Default Country',
  'settings.availabilityStartDate': 'Availability Start Date',
  'settings.availabilityEndDate': 'Availability End Date',
  'settings.expiredMessage': 'Expired Message',
  'settings.giftsPerUser': 'Gifts Per User',
  'settings.defaultGiftId': 'Default Gift',
  'settings.defaultGiftDaysAfterClose': 'Default Gift Days After Close',
  'settings.allowQuantitySelection': 'Allow Quantity Selection',
  'settings.showPricing': 'Show Pricing',
  'settings.showHeader': 'Show Header',
  'settings.showFooter': 'Show Footer',
  'settings.headerLayout': 'Header Layout',
  'settings.showLanguageSelector': 'Show Language Selector',
  'settings.companyName': 'Company Name',
  'settings.footerText': 'Footer Text',
  'settings.enableSearch': 'Enable Search',
  'settings.enableFilters': 'Enable Filters',
  'settings.gridColumns': 'Grid Columns',
  'settings.showDescription': 'Show Description',
  'settings.sortOptions': 'Sort Options',
  'settings.skipLandingPage': 'Skip Landing Page',
  'settings.enableWelcomePage': 'Enable Welcome Page',
  'settings.welcomeMessage': 'Welcome Message',
  'settings.validationMethod': 'Validation Method',
  'settings.shippingMode': 'Shipping Mode',
  'settings.skipReviewPage': 'Skip Review Page',
  siteCode: 'Site Code',
  siteErpIntegration: 'ERP Integration',
  siteErpInstance: 'ERP Instance',
  siteShipFromCountry: 'Ship From Country',
  siteHrisSystem: 'HRIS System',
  siteDropDownName: 'Site Dropdown Name',
  siteCustomDomainUrl: 'Custom Domain URL',
  siteAccountManager: 'Account Manager',
  siteAccountManagerEmail: 'Account Manager Email',
  siteCelebrationsEnabled: 'Celebrations Enabled',
  allowSessionTimeoutExtend: 'Allow Session Timeout Extension',
  enableEmployeeLogReport: 'Enable Employee Log Report',
  disableDirectAccessAuth: 'Disable Direct Access Auth',
  ssoProvider: 'SSO Provider',
};

function getNestedValue(obj: any, path: string): unknown {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function areValuesEqual(val1: any, val2: any): boolean {
  // Handle null/undefined/empty string as equivalent
  const isEmptyValue = (val: any) => val === null || val === undefined || val === '';
  
  if (isEmptyValue(val1) && isEmptyValue(val2)) return true;
  if (val1 === val2) return true;
  if (isEmptyValue(val1) || isEmptyValue(val2)) return false;
  
  // Handle arrays
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false;
    return val1.every((item, idx) => areValuesEqual(item, val2[idx]));
  }
  
  // Handle objects
  if (typeof val1 === 'object' && typeof val2 === 'object') {
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every(key => areValuesEqual(val1[key], val2[key]));
  }
  
  // Handle dates - compare ISO strings
  if (val1 instanceof Date && val2 instanceof Date) {
    return val1.getTime() === val2.getTime();
  }
  
  // Handle date strings (ISO format)
  if (typeof val1 === 'string' && typeof val2 === 'string') {
    // Try parsing as dates first
    const date1 = new Date(val1);
    const date2 = new Date(val2);
    if (!isNaN(date1.getTime()) && !isNaN(date2.getTime())) {
      // Both are valid dates, compare timestamps
      return date1.getTime() === date2.getTime();
    }
    // Otherwise compare as strings (trim whitespace)
    return val1.trim() === val2.trim();
  }
  
  // Handle boolean vs string boolean
  if (typeof val1 === 'boolean' && typeof val2 === 'string') {
    return val1 === (val2 === 'true');
  }
  if (typeof val1 === 'string' && typeof val2 === 'boolean') {
    return (val1 === 'true') === val2;
  }
  
  // Handle number vs string number
  if (typeof val1 === 'number' && typeof val2 === 'string') {
    return val1 === Number(val2);
  }
  if (typeof val1 === 'string' && typeof val2 === 'number') {
    return Number(val1) === val2;
  }
  
  return val1 === val2;
}

export function detectSiteChanges(
  originalSite: SiteData,
  currentState: SiteData
): Change[] {
  const changes: Change[] = [];
  
  // Fields to check
  const fieldsToCheck = [
    'name',
    'slug',
    'type',
    'branding.primaryColor',
    'branding.secondaryColor',
    'branding.tertiaryColor',
    'settings.defaultLanguage',
    'settings.defaultCurrency',
    'settings.defaultCountry',
    'settings.availabilityStartDate',
    'settings.availabilityEndDate',
    'settings.expiredMessage',
    'settings.giftsPerUser',
    'settings.defaultGiftId',
    'settings.defaultGiftDaysAfterClose',
    'settings.allowQuantitySelection',
    'settings.showPricing',
    'settings.showHeader',
    'settings.showFooter',
    'settings.headerLayout',
    'settings.showLanguageSelector',
    'settings.companyName',
    'settings.footerText',
    'settings.enableSearch',
    'settings.enableFilters',
    'settings.gridColumns',
    'settings.showDescription',
    'settings.sortOptions',
    'settings.skipLandingPage',
    'settings.enableWelcomePage',
    'settings.welcomeMessage',
    'settings.validationMethod',
    'settings.shippingMode',
    'settings.skipReviewPage',
    'siteCode',
    'siteErpIntegration',
    'siteErpInstance',
    'siteShipFromCountry',
    'siteHrisSystem',
    'siteDropDownName',
    'siteCustomDomainUrl',
    'siteAccountManager',
    'siteAccountManagerEmail',
    'siteCelebrationsEnabled',
    'allowSessionTimeoutExtend',
    'enableEmployeeLogReport',
    'disableDirectAccessAuth',
    'ssoProvider',
  ];
  
  fieldsToCheck.forEach(fieldPath => {
    const oldValue = getNestedValue(originalSite, fieldPath);
    const newValue = getNestedValue(currentState, fieldPath);
    
    if (!areValuesEqual(oldValue, newValue)) {
      // Helper to check if value is truly empty
      const isEmptyValue = (val: any) => val === null || val === undefined || val === '';
      
      // Skip if both values are effectively empty (null, undefined, or empty string)
      if (isEmptyValue(oldValue) && isEmptyValue(newValue)) {
        return;
      }
      
      const type: 'added' | 'modified' | 'removed' = 
        isEmptyValue(oldValue) ? 'added' :
        isEmptyValue(newValue) ? 'removed' :
        'modified';
      
      changes.push({
        field: FIELD_LABELS[fieldPath] || fieldPath,
        category: FIELD_CATEGORIES[fieldPath] || 'Other Settings',
        oldValue,
        newValue,
        type
      });
    }
  });
  
  return changes;
}
