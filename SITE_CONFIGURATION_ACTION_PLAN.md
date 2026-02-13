# Site Configuration - Production Readiness Action Plan

**Date:** February 12, 2026  
**Version:** 1.0  
**Priority:** P0 - CRITICAL PATH TO LAUNCH

---

## 🎯 Executive Summary

This document provides a step-by-step action plan to make the Site Configuration system fully production-ready. Based on the comprehensive assessment, we need **20-24 hours of focused work** across **4 critical areas** before launch.

### Current Status: 78/100 (Good but needs hardening)

### Launch Blockers (4 items):
1. ❌ Backend API Verification
2. ❌ Error Handling & User Feedback
3. ❌ Input Validation
4. ❌ TypeScript Types

---

## 📋 Critical Path - Must Complete Before Launch

### Phase 1: Backend Verification (P0 - BLOCKING)
**Duration:** 4 hours  
**Owner:** Backend + Frontend  
**Risk if skipped:** 🔴 CRITICAL - Data loss, save failures

#### Tasks:

**Task 1.1: Test Backend Endpoints (2 hours)**

```bash
# Test save endpoint with all 37+ fields
curl -X PUT https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3/sites/test-site-id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Site",
    "domain": "https://test.example.com",
    "type": "event-gifting",
    "branding": {
      "primaryColor": "#D91C81",
      "secondaryColor": "#1B2A5E",
      "tertiaryColor": "#00B4CC"
    },
    "settings": {
      "validationMethod": "email",
      "allowQuantitySelection": true,
      "showPricing": true,
      "skipLandingPage": false,
      "giftsPerUser": 3,
      "defaultLanguage": "en",
      "defaultCurrency": "USD",
      "defaultCountry": "US",
      "availabilityStartDate": "2026-03-01T00:00:00Z",
      "availabilityEndDate": "2026-03-31T23:59:59Z",
      "expiredMessage": "Test message",
      "defaultGiftId": "gift-123",
      "defaultGiftDaysAfterClose": 7,
      "showHeader": true,
      "showFooter": true,
      "headerLayout": "split",
      "showLanguageSelector": true,
      "companyName": "Test Corp",
      "footerText": "© 2026 Test",
      "enableSearch": true,
      "enableFilters": true,
      "gridColumns": 3,
      "showDescription": true,
      "sortOptions": ["name", "price", "popularity"]
    }
  }'

# Verify response includes all fields
# Check database to confirm persistence
```

**Task 1.2: Fix Backend if Needed (2 hours)**

If fields are missing or not persisting, update backend:

```typescript
// In supabase/functions/server/index.tsx or sites_api.ts
// Update PUT /sites/:id endpoint

app.put('/make-server-6fcaeea3/sites/:id', async (c) => {
  const siteId = c.req.param('id');
  const updates = await c.req.json();
  
  // Ensure all fields are whitelisted
  const allowedFields = {
    name: updates.name,
    domain: updates.domain,
    type: updates.type,
    branding: updates.branding,
    settings: {
      // Existing settings
      validationMethod: updates.settings?.validationMethod,
      allowQuantitySelection: updates.settings?.allowQuantitySelection,
      showPricing: updates.settings?.showPricing,
      skipLandingPage: updates.settings?.skipLandingPage,
      giftsPerUser: updates.settings?.giftsPerUser,
      defaultLanguage: updates.settings?.defaultLanguage,
      defaultCurrency: updates.settings?.defaultCurrency,
      defaultCountry: updates.settings?.defaultCountry,
      availabilityStartDate: updates.settings?.availabilityStartDate,
      availabilityEndDate: updates.settings?.availabilityEndDate,
      expiredMessage: updates.settings?.expiredMessage,
      
      // NEW: Default Gift Configuration
      defaultGiftId: updates.settings?.defaultGiftId,
      defaultGiftDaysAfterClose: updates.settings?.defaultGiftDaysAfterClose,
      
      // NEW: Header/Footer Configuration
      showHeader: updates.settings?.showHeader,
      showFooter: updates.settings?.showFooter,
      headerLayout: updates.settings?.headerLayout,
      showLanguageSelector: updates.settings?.showLanguageSelector,
      companyName: updates.settings?.companyName,
      footerText: updates.settings?.footerText,
      
      // NEW: Gift Selection UX Configuration
      enableSearch: updates.settings?.enableSearch,
      enableFilters: updates.settings?.enableFilters,
      gridColumns: updates.settings?.gridColumns,
      showDescription: updates.settings?.showDescription,
      sortOptions: updates.settings?.sortOptions,
    }
  };
  
  // Save to database
  await kv.set(`site:${siteId}`, allowedFields);
  
  return c.json({ success: true, data: allowedFields });
});
```

**Success Criteria:**
- ✅ All 37+ fields save correctly
- ✅ All fields retrieve correctly
- ✅ No data loss
- ✅ Backend validates input

---

### Phase 2: Error Handling (P0 - BLOCKING)
**Duration:** 8 hours  
**Owner:** Frontend  
**Risk if skipped:** 🔴 CRITICAL - Silent failures, data loss

#### Implementation:

**File:** `/src/app/pages/admin/SiteConfiguration.tsx`

**Step 1: Add Error Handling to handleSave (2 hours)**

```typescript
// Add imports at top
import { toast } from 'sonner';

// Replace existing handleSave with:
const handleSave = async () => {
  if (!currentSite) {
    toast.error('No site selected');
    return;
  }
  
  // Validate before saving
  const validation = validateConfiguration();
  if (!validation.valid) {
    toast.error('Please fix the following errors:', {
      description: validation.errors.slice(0, 3).join(', ') + 
                   (validation.errors.length > 3 ? '...' : '')
    });
    setErrors(validation.fieldErrors);
    return;
  }
  
  setSaveStatus('saving');
  
  try {
    // Attempt save
    await updateSite(currentSite.id, {
      name: siteName,
      domain: siteUrl,
      type: siteType,
      branding: {
        ...currentSite.branding,
        primaryColor,
        secondaryColor,
        tertiaryColor,
      },
      settings: {
        ...currentSite.settings,
        allowQuantitySelection,
        showPricing,
        skipLandingPage,
        giftsPerUser,
        validationMethod,
        defaultLanguage,
        defaultCurrency,
        defaultCountry,
        availabilityStartDate,
        availabilityEndDate,
        expiredMessage,
        defaultGiftId,
        defaultGiftDaysAfterClose,
        // Header/Footer settings
        showHeader,
        showFooter,
        headerLayout,
        showLanguageSelector,
        companyName,
        footerText,
        // Gift Selection UX settings
        enableSearch,
        enableFilters,
        gridColumns,
        showDescription,
        sortOptions,
      }
    });
    
    // Success!
    setSaveStatus('saved');
    setHasChanges(false);
    setErrors({});
    
    toast.success('Configuration saved successfully', {
      description: 'All changes have been saved to the database'
    });
    
    // Clear saved status after 3 seconds
    setTimeout(() => {
      if (saveStatus === 'saved') {
        setSaveStatus('idle');
      }
    }, 3000);
    
  } catch (error: any) {
    console.error('[SiteConfiguration] Save failed:', error);
    setSaveStatus('error');
    
    // Determine error type and show appropriate message
    let errorMessage = 'Failed to save configuration';
    let errorDescription = 'Please try again';
    
    if (error.message?.toLowerCase().includes('network')) {
      errorMessage = 'Network error';
      errorDescription = 'Please check your internet connection';
    } else if (error.message?.toLowerCase().includes('unauthorized')) {
      errorMessage = 'Authentication error';
      errorDescription = 'Your session may have expired. Please log in again';
    } else if (error.message?.toLowerCase().includes('duplicate')) {
      errorMessage = 'Duplicate entry';
      errorDescription = 'A site with this URL already exists';
    } else if (error.message) {
      errorDescription = error.message;
    }
    
    toast.error(errorMessage, {
      description: errorDescription,
      action: {
        label: 'Retry',
        onClick: () => handleSave()
      },
      duration: 5000
    });
    
    // Clear error status after 5 seconds
    setTimeout(() => {
      if (saveStatus === 'error') {
        setSaveStatus('idle');
      }
    }, 5000);
  }
};
```

**Step 2: Add Unsaved Changes Warning (1 hour)**

```typescript
// Add near other useEffects
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasChanges && configMode === 'draft') {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasChanges, configMode]);

// Also add navigation blocker (if using React Router)
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    hasChanges &&
    configMode === 'draft' &&
    currentLocation.pathname !== nextLocation.pathname
);

useEffect(() => {
  if (blocker.state === 'blocked') {
    const shouldLeave = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?'
    );
    
    if (shouldLeave) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }
}, [blocker]);
```

**Step 3: Add Publish Confirmation (1 hour)**

```typescript
const handlePublish = async () => {
  if (!currentSite) return;
  
  // Check for unsaved changes
  if (hasChanges) {
    toast.warning('You have unsaved changes', {
      description: 'Please save your changes before publishing',
      action: {
        label: 'Save Now',
        onClick: () => handleSave()
      }
    });
    return;
  }
  
  // Confirm with user
  const confirmed = window.confirm(
    '⚠️  Are you sure you want to publish this site to production?\n\n' +
    'This will:\n' +
    '✓ Make the site accessible to all users\n' +
    '✓ Lock the configuration from further edits\n' +
    '✓ Change the site status to "Active"\n\n' +
    'You can still make changes by switching to Draft mode.'
  );
  
  if (!confirmed) return;
  
  setIsPublishing(true);
  
  try {
    await updateSite(currentSite.id, { status: 'active' });
    
    setConfigMode('live');
    setIsPublishing(false);
    
    toast.success('Site published successfully!', {
      description: 'Your site is now live and accessible to users',
      icon: '🎉'
    });
    
  } catch (error: any) {
    console.error('[SiteConfiguration] Publish failed:', error);
    setIsPublishing(false);
    
    toast.error('Failed to publish site', {
      description: error.message || 'Please try again',
      action: {
        label: 'Retry',
        onClick: () => handlePublish()
      }
    });
  }
};
```

**Step 4: Add Error State (1 hour)**

```typescript
// Add state for errors
const [errors, setErrors] = useState<Record<string, string>>({});

// Display errors under fields
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Site Name <span className="text-red-600">*</span>
  </label>
  <Input
    value={siteName}
    onChange={(e) => {
      setSiteName(e.target.value);
      setHasChanges(true);
      // Clear error when user types
      if (errors.siteName) {
        setErrors(prev => ({ ...prev, siteName: '' }));
      }
    }}
    disabled={configMode === 'live'}
    className={errors.siteName ? 'border-red-500' : ''}
  />
  {errors.siteName && (
    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      {errors.siteName}
    </p>
  )}
</div>
```

**Step 5: Add Auto-Save (3 hours)**

```typescript
// Add state
const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
const [isAutoSaving, setIsAutoSaving] = useState(false);

// Auto-save effect
useEffect(() => {
  // Only auto-save in draft mode with changes
  if (hasChanges && configMode === 'draft' && !isAutoSaving) {
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 30000); // 30 seconds
    
    return () => clearTimeout(timer);
  }
}, [hasChanges, configMode, isAutoSaving]);

// Auto-save function
const handleAutoSave = async () => {
  if (!currentSite || !hasChanges || configMode === 'live') return;
  
  setIsAutoSaving(true);
  console.log('[SiteConfiguration] Auto-saving draft...');
  
  try {
    await updateSite(currentSite.id, {
      name: siteName,
      domain: siteUrl,
      type: siteType,
      branding: {
        ...currentSite.branding,
        primaryColor,
        secondaryColor,
        tertiaryColor,
      },
      settings: {
        ...currentSite.settings,
        // ... all settings
      }
    });
    
    setLastAutoSave(new Date());
    setHasChanges(false);
    setIsAutoSaving(false);
    
    // Subtle notification (don't interrupt user)
    toast.success('Draft auto-saved', {
      duration: 2000,
      position: 'bottom-right'
    });
    
  } catch (error: any) {
    console.error('[SiteConfiguration] Auto-save failed:', error);
    setIsAutoSaving(false);
    // Don't show error toast for auto-save failures
  }
};

// Show auto-save indicator
{isAutoSaving && (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <Loader2 className="w-4 h-4 animate-spin" />
    Auto-saving...
  </div>
)}

{lastAutoSave && !isAutoSaving && !hasChanges && (
  <div className="text-sm text-gray-500">
    Last auto-saved: {formatDistanceToNow(lastAutoSave, { addSuffix: true })}
  </div>
)}
```

**Success Criteria:**
- ✅ Save errors show toast notification
- ✅ User can retry failed saves
- ✅ Unsaved changes warning works
- ✅ Publish requires confirmation
- ✅ Field errors displayed inline
- ✅ Auto-save works in draft mode

---

### Phase 3: Input Validation (P1 - HIGH)
**Duration:** 6 hours  
**Owner:** Frontend  
**Risk if skipped:** 🟡 MEDIUM - Bad UX, data corruption

#### Implementation:

**File:** `/src/app/pages/admin/SiteConfiguration.tsx`

```typescript
// Add validation function
interface ValidationResult {
  valid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

function validateConfiguration(): ValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  
  // ========== CRITICAL VALIDATIONS ==========
  
  // 1. Site Name (REQUIRED)
  if (!siteName?.trim()) {
    errors.push('Site name is required');
    fieldErrors.siteName = 'This field is required';
  } else if (siteName.length < 3) {
    errors.push('Site name must be at least 3 characters');
    fieldErrors.siteName = 'Minimum 3 characters required';
  } else if (siteName.length > 100) {
    errors.push('Site name must not exceed 100 characters');
    fieldErrors.siteName = 'Maximum 100 characters allowed';
  }
  
  // 2. Site URL (REQUIRED)
  if (!siteUrl?.trim()) {
    errors.push('Site URL is required');
    fieldErrors.siteUrl = 'This field is required';
  } else {
    // Validate URL format
    try {
      const url = new URL(siteUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('Site URL must use HTTP or HTTPS protocol');
        fieldErrors.siteUrl = 'Must start with http:// or https://';
      }
    } catch {
      errors.push('Site URL must be a valid URL');
      fieldErrors.siteUrl = 'Invalid URL format (e.g., https://example.com)';
    }
    
    // Check for reserved URLs
    const reservedUrls = ['admin', 'api', 'auth', 'dashboard', 'system'];
    const urlLower = siteUrl.toLowerCase();
    if (reservedUrls.some(reserved => urlLower.includes(reserved))) {
      errors.push('Site URL cannot contain reserved words');
      fieldErrors.siteUrl = 'Cannot use reserved words: ' + reservedUrls.join(', ');
    }
  }
  
  // 3. Date Range Validation
  if (availabilityStartDate && availabilityEndDate) {
    const start = new Date(availabilityStartDate);
    const end = new Date(availabilityEndDate);
    
    if (start >= end) {
      errors.push('Start date must be before end date');
      fieldErrors.availabilityStartDate = 'Must be before end date';
      fieldErrors.availabilityEndDate = 'Must be after start date';
    }
    
    // Check if dates are in the past (for new campaigns)
    const now = new Date();
    if (end < now && !currentSite?.settings.availabilityEndDate) {
      // Only check for new campaigns, not existing ones
      errors.push('End date cannot be in the past');
      fieldErrors.availabilityEndDate = 'Cannot select a past date';
    }
  }
  
  // ========== IMPORTANT VALIDATIONS ==========
  
  // 4. Color Hex Values
  const hexColorRegex = /^#[0-9A-F]{6}$/i;
  
  if (!hexColorRegex.test(primaryColor)) {
    errors.push('Primary color must be a valid hex color');
    fieldErrors.primaryColor = 'Invalid format (use #RRGGBB, e.g., #D91C81)';
  }
  
  if (!hexColorRegex.test(secondaryColor)) {
    errors.push('Secondary color must be a valid hex color');
    fieldErrors.secondaryColor = 'Invalid format (use #RRGGBB)';
  }
  
  if (!hexColorRegex.test(tertiaryColor)) {
    errors.push('Tertiary color must be a valid hex color');
    fieldErrors.tertiaryColor = 'Invalid format (use #RRGGBB)';
  }
  
  // 5. Numeric Bounds
  if (giftsPerUser < 1) {
    errors.push('Gifts per user must be at least 1');
    fieldErrors.giftsPerUser = 'Minimum value is 1';
  } else if (giftsPerUser > 100) {
    errors.push('Gifts per user cannot exceed 100');
    fieldErrors.giftsPerUser = 'Maximum value is 100';
  }
  
  if (defaultGiftDaysAfterClose < 0) {
    errors.push('Days after close cannot be negative');
    fieldErrors.defaultGiftDaysAfterClose = 'Must be 0 or greater';
  } else if (defaultGiftDaysAfterClose > 365) {
    errors.push('Days after close cannot exceed 365');
    fieldErrors.defaultGiftDaysAfterClose = 'Maximum is 365 days';
  }
  
  // 6. Grid Columns
  const validGridColumns = [2, 3, 4, 6];
  if (!validGridColumns.includes(gridColumns)) {
    errors.push('Grid columns must be 2, 3, 4, or 6');
    fieldErrors.gridColumns = 'Invalid value';
  }
  
  // 7. Sort Options (at least one)
  if (sortOptions.length === 0) {
    errors.push('At least one sort option must be enabled');
    fieldErrors.sortOptions = 'Enable at least one sort option';
  }
  
  // ========== TEXT LENGTH VALIDATIONS ==========
  
  if (companyName && companyName.length > 100) {
    errors.push('Company name must not exceed 100 characters');
    fieldErrors.companyName = 'Maximum 100 characters';
  }
  
  if (footerText && footerText.length > 500) {
    errors.push('Footer text must not exceed 500 characters');
    fieldErrors.footerText = 'Maximum 500 characters';
  }
  
  if (expiredMessage && expiredMessage.length > 1000) {
    errors.push('Expired message must not exceed 1000 characters');
    fieldErrors.expiredMessage = 'Maximum 1000 characters';
  }
  
  return {
    valid: errors.length === 0,
    errors,
    fieldErrors
  };
}

// Add helper function for URL validation
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Call validation before save
const handleSave = async () => {
  // ... existing code
  
  const validation = validateConfiguration();
  if (!validation.valid) {
    // Show errors
    setErrors(validation.fieldErrors);
    
    // Show summary toast
    toast.error(`Please fix ${validation.errors.length} error${validation.errors.length > 1 ? 's' : ''}`, {
      description: validation.errors.slice(0, 3).join(', ') + 
                   (validation.errors.length > 3 ? ` and ${validation.errors.length - 3} more...` : '')
    });
    
    return; // Don't save
  }
  
  // Clear errors
  setErrors({});
  
  // ... continue with save
};
```

**Success Criteria:**
- ✅ All required fields validated
- ✅ URL format checked
- ✅ Date ranges validated
- ✅ Hex colors validated
- ✅ Numeric bounds enforced
- ✅ At least one sort option required
- ✅ Text length limits enforced

---

### Phase 4: TypeScript Types (P1 - HIGH)
**Duration:** 2 hours  
**Owner:** Frontend  
**Risk if skipped:** 🟡 MEDIUM - Type safety compromised

#### Implementation:

**File:** `/src/app/context/SiteContext.tsx`

```typescript
// Update Site interface
export interface Site {
  id: string;
  name: string;
  clientId: string;
  brandId?: string;
  domain: string;
  status: 'active' | 'inactive' | 'draft';
  templateId?: string;
  type?: 'event-gifting' | 'onboarding-kit' | 'service-awards' | 'incentives' | 'custom';
  branding: {
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    logo?: string;
  };
  settings: {
    // ========== EXISTING SETTINGS ==========
    validationMethod: 'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso';
    ssoProvider?: 'google' | 'microsoft' | 'okta' | 'azure';
    allowQuantitySelection: boolean;
    showPricing: boolean;
    giftsPerUser: number;
    shippingMode: 'company' | 'employee' | 'store';
    defaultShippingAddress?: string;
    defaultLanguage: string;
    enableLanguageSelector: boolean;
    welcomeMessage?: string;
    skipLandingPage?: boolean;
    enableWelcomePage?: boolean;
    welcomePageContent?: {
      title?: string;
      message?: string;
      imageUrl?: string;
      authorName?: string;
      authorTitle?: string;
      videoUrl?: string;
      ctaText?: string;
    };
    defaultCurrency: string;
    allowedCountries: string[];
    defaultCountry: string;
    availabilityStartDate?: string;
    availabilityEndDate?: string;
    expiredMessage?: string;
    
    // ========== NEW: DEFAULT GIFT CONFIGURATION ==========
    /**
     * ID of gift to be automatically sent if user doesn't make a selection
     * @example "gift-abc123"
     */
    defaultGiftId?: string;
    
    /**
     * Number of days after site closes to send the default gift
     * @minimum 0
     * @maximum 365
     * @default 0 (send immediately when site closes)
     */
    defaultGiftDaysAfterClose?: number;
    
    // ========== NEW: HEADER/FOOTER CONFIGURATION ==========
    /**
     * Display header on all pages
     * @default true
     */
    showHeader?: boolean;
    
    /**
     * Display footer on all pages
     * @default true
     */
    showFooter?: boolean;
    
    /**
     * Header layout style
     * - left: Logo and nav left-aligned
     * - center: Logo centered, nav below
     * - split: Logo left, nav right
     * @default "left"
     */
    headerLayout?: 'left' | 'center' | 'split';
    
    /**
     * Show language selector in header
     * @default true
     */
    showLanguageSelector?: boolean;
    
    /**
     * Company name displayed in header next to logo
     * @maxLength 100
     */
    companyName?: string;
    
    /**
     * Footer text (copyright, legal notice, etc.)
     * @maxLength 500
     * @default "© 2026 All rights reserved."
     */
    footerText?: string;
    
    // ========== NEW: GIFT SELECTION UX CONFIGURATION ==========
    /**
     * Enable search functionality for gifts
     * @default true
     */
    enableSearch?: boolean;
    
    /**
     * Enable category and price range filters
     * @default true
     */
    enableFilters?: boolean;
    
    /**
     * Number of columns in gift grid (desktop)
     * @enum 2 | 3 | 4 | 6
     * @default 3
     */
    gridColumns?: 2 | 3 | 4 | 6;
    
    /**
     * Show gift description text on cards
     * @default true
     */
    showDescription?: boolean;
    
    /**
     * Available sort options for users
     * @minItems 1
     * @default ["name", "price", "popularity"]
     */
    sortOptions?: ('name' | 'price' | 'popularity' | 'newest')[];
    
    // ... other existing settings (ssoConfig, addressValidation, etc.)
  };
  
  createdAt: string;
  updatedAt: string;
}
```

**Success Criteria:**
- ✅ All new fields in Site interface
- ✅ Proper types for each field
- ✅ JSDoc comments for documentation
- ✅ No TypeScript errors
- ✅ IDE autocomplete works

---

## 🧪 Testing Plan

### Manual Testing Checklist

Before considering ready for production:

#### Save Functionality:
- [ ] Save with all fields filled → Success
- [ ] Save with required fields empty → Validation error
- [ ] Save with invalid URL → Validation error
- [ ] Save with network disconnected → Error handling
- [ ] Save with invalid date range → Validation error
- [ ] Save in live mode → Disabled

#### Live/Draft Mode:
- [ ] Switch to draft → All inputs enabled
- [ ] Switch to live → All inputs disabled
- [ ] Publish site → Status changes to active
- [ ] Publish shows confirmation dialog
- [ ] Live mode shows warning banner

#### Error Handling:
- [ ] Save failure shows toast
- [ ] Retry button works
- [ ] Field errors display inline
- [ ] Unsaved changes warning works
- [ ] Browser refresh with changes → Warning

#### Auto-Save:
- [ ] Wait 30 seconds with changes → Auto-save
- [ ] Auto-save indicator shows
- [ ] Last saved timestamp updates
- [ ] Auto-save doesn't interrupt typing

#### Data Persistence:
- [ ] All 37+ fields save correctly
- [ ] All fields load correctly on refresh
- [ ] Site selection persists
- [ ] Changes sync with SiteContext

---

## 📊 Success Metrics

After implementation, verify:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Save Success Rate | >99% | Monitor error logs |
| Validation Error Rate | <5% | Track validation failures |
| User Satisfaction | >4/5 | Post-implementation survey |
| Support Tickets | <5/week | Track support requests |
| Average Save Time | <2 seconds | Performance monitoring |

---

## 🚀 Deployment Checklist

Before deploying to production:

### Backend:
- [ ] Backend endpoints tested with all fields
- [ ] Database schema supports all fields
- [ ] API validation added
- [ ] Error handling tested

### Frontend:
- [ ] All validations implemented
- [ ] All error handling added
- [ ] TypeScript types updated
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Auto-save working

### Documentation:
- [ ] User guide created
- [ ] Field descriptions added
- [ ] Troubleshooting section written
- [ ] Release notes prepared

### Monitoring:
- [ ] Error tracking configured
- [ ] Performance monitoring setup
- [ ] User analytics enabled
- [ ] Support ticketing ready

---

## 📞 Support & Contact

**For Questions:**
- Frontend Lead: [Name]
- Backend Lead: [Name]
- Product Owner: [Name]

**Escalation:**
- P0 (Critical): Immediate response
- P1 (High): Within 24 hours
- P2 (Medium): Within 1 week

---

## 📅 Timeline Summary

| Phase | Duration | Priority | Blocker? |
|-------|----------|----------|----------|
| Backend Verification | 4 hours | P0 | YES |
| Error Handling | 8 hours | P0 | YES |
| Input Validation | 6 hours | P1 | NO |
| TypeScript Types | 2 hours | P1 | NO |
| **Total** | **20 hours** | | |

**Target Completion:** Within 3 working days  
**Launch Date:** After all P0 items complete

---

**Document Status:** ✅ READY FOR IMPLEMENTATION  
**Next Steps:** Begin Phase 1 (Backend Verification)  
**Version:** 1.0  
**Created:** February 12, 2026
