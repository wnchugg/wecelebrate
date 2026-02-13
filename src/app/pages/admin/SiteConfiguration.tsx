import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { 
  Save, Settings, Globe, Mail, Truck, Gift, Lock, 
  Check, AlertCircle, ChevronDown, Building2, ExternalLink,
  Layout, Package, Users, Clock, Calendar, CheckCircle, Palette, Shield, Loader2, Eye, FileEdit, Rocket, History, Edit3
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useGift } from '../../context/GiftContext';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { getPublicSiteUrl } from '../../utils/url';

// Lazy load the heavy components
const LandingPageEditor = lazy(() => import('./LandingPageEditor').then(m => ({ default: m.LandingPageEditor })));
const WelcomePageEditor = lazy(() => import('./WelcomePageEditor').then(m => ({ default: m.WelcomePageEditor })));
const SiteGiftConfiguration = lazy(() => import('./SiteGiftConfiguration'));
const ShippingConfiguration = lazy(() => import('./ShippingConfiguration').then(m => ({ default: m.ShippingConfiguration })));
const AccessManagement = lazy(() => import('./AccessManagement').then(m => ({ default: m.AccessManagement })));

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-[#D91C81] animate-spin" />
    </div>
  );
}

export function SiteConfiguration() {
  const { currentSite, currentClient, updateSite } = useSite();
  const { gifts } = useGift();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [configMode, setConfigMode] = useState<'live' | 'draft'>('draft');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Error handling and validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [lastManualSave, setLastManualSave] = useState<Date | null>(null);
  const [changeHistory, setChangeHistory] = useState<Array<{
    timestamp: Date;
    type: 'manual' | 'auto';
    fieldCount: number;
  }>>([]);

  // Handle tab query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['general', 'header-footer', 'branding', 'products', 'landing', 'welcome', 'shipping', 'access'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // General Settings State
  const [siteName, setSiteName] = useState(currentSite?.name || '');
  const [siteUrl, setSiteUrl] = useState(currentSite?.domain || '');
  const [siteType, setSiteType] = useState<'event-gifting' | 'onboarding-kit' | 'service-awards' | 'incentives' | 'custom'>(
    currentSite?.type || 'custom'
  );
  const [primaryColor, setPrimaryColor] = useState(currentSite?.branding.primaryColor || '#D91C81');
  const [secondaryColor, setSecondaryColor] = useState(currentSite?.branding.secondaryColor || '#1B2A5E');
  const [tertiaryColor, setTertiaryColor] = useState(currentSite?.branding.tertiaryColor || '#00B4CC');
  const [allowQuantitySelection, setAllowQuantitySelection] = useState(currentSite?.settings.allowQuantitySelection ?? false);
  const [showPricing, setShowPricing] = useState(currentSite?.settings.showPricing ?? true);
  const [skipLandingPage, setSkipLandingPage] = useState(currentSite?.settings.skipLandingPage ?? false);
  const [giftsPerUser, setGiftsPerUser] = useState(currentSite?.settings.giftsPerUser || 1);
  const [validationMethod, setValidationMethod] = useState<'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso'>(
    currentSite?.settings.validationMethod || 'email'
  );
  const [defaultLanguage, setDefaultLanguage] = useState(currentSite?.settings.defaultLanguage || 'en');
  const [defaultCurrency, setDefaultCurrency] = useState(currentSite?.settings.defaultCurrency || 'USD');
  const [defaultCountry, setDefaultCountry] = useState(currentSite?.settings.defaultCountry || 'US');
  const [availabilityStartDate, setAvailabilityStartDate] = useState(currentSite?.settings.availabilityStartDate || '');
  const [availabilityEndDate, setAvailabilityEndDate] = useState(currentSite?.settings.availabilityEndDate || '');
  const [expiredMessage, setExpiredMessage] = useState(
    currentSite?.settings.expiredMessage || 
    'Thank you for your interest. The gift selection period for this program has ended. If you have questions, please contact your program administrator.'
  );
  const [defaultGiftId, setDefaultGiftId] = useState(currentSite?.settings.defaultGiftId || '');
  const [defaultGiftDaysAfterClose, setDefaultGiftDaysAfterClose] = useState(currentSite?.settings.defaultGiftDaysAfterClose || 0);

  // Header/Footer Settings State
  const [showHeader, setShowHeader] = useState(currentSite?.settings.showHeader ?? true);
  const [showFooter, setShowFooter] = useState(currentSite?.settings.showFooter ?? true);
  const [headerLayout, setHeaderLayout] = useState<'left' | 'center' | 'split'>(currentSite?.settings.headerLayout || 'left');
  const [showLanguageSelector, setShowLanguageSelector] = useState(currentSite?.settings.showLanguageSelector ?? true);
  const [companyName, setCompanyName] = useState(currentSite?.settings.companyName || '');
  const [footerText, setFooterText] = useState(currentSite?.settings.footerText || '© 2026 All rights reserved.');

  // Gift Selection UX Settings State
  const [enableSearch, setEnableSearch] = useState(currentSite?.settings.enableSearch ?? true);
  const [enableFilters, setEnableFilters] = useState(currentSite?.settings.enableFilters ?? true);
  const [gridColumns, setGridColumns] = useState<number>(currentSite?.settings.gridColumns || 3);
  const [showDescription, setShowDescription] = useState(currentSite?.settings.showDescription ?? true);
  const [sortOptions, setSortOptions] = useState<string[]>(currentSite?.settings.sortOptions || ['name', 'price', 'popularity']);

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

  // Phase 5: Additional Optional Fields
  const [shippingMode, setShippingMode] = useState<'company' | 'employee' | 'store'>(currentSite?.settings.shippingMode || 'employee');
  const [defaultShippingAddress, setDefaultShippingAddress] = useState(currentSite?.settings.defaultShippingAddress || '');
  const [welcomeMessage, setWelcomeMessage] = useState(currentSite?.settings.welcomeMessage || '');
  const [enableWelcomePage, setEnableWelcomePage] = useState(currentSite?.settings.enableWelcomePage ?? false);
  const [welcomePageTitle, setWelcomePageTitle] = useState(currentSite?.settings.welcomePageContent?.title || '');
  const [welcomePageMessage, setWelcomePageMessage] = useState(currentSite?.settings.welcomePageContent?.message || '');
  const [welcomePageAuthorName, setWelcomePageAuthorName] = useState(currentSite?.settings.welcomePageContent?.authorName || '');
  const [welcomePageAuthorTitle, setWelcomePageAuthorTitle] = useState(currentSite?.settings.welcomePageContent?.authorTitle || '');
  const [welcomePageImageUrl, setWelcomePageImageUrl] = useState(currentSite?.settings.welcomePageContent?.imageUrl || '');
  const [allowedCountries, setAllowedCountries] = useState<string[]>(currentSite?.settings.allowedCountries || []);
  const [enableAddressValidation, setEnableAddressValidation] = useState(currentSite?.settings.addressValidation?.enabled ?? false);
  const [addressValidationProvider, setAddressValidationProvider] = useState(currentSite?.settings.addressValidation?.provider || 'none');

  // Sync state when currentSite changes
  useEffect(() => {
    if (currentSite) {
      setSiteName(currentSite.name || '');
      setSiteUrl(currentSite.domain || '');
      setSiteType(currentSite.type || 'custom');
      setPrimaryColor(currentSite.branding?.primaryColor || '#D91C81');
      setSecondaryColor(currentSite.branding?.secondaryColor || '#1B2A5E');
      setTertiaryColor(currentSite.branding?.tertiaryColor || '#00B4CC');
      setAllowQuantitySelection(currentSite.settings?.allowQuantitySelection ?? false);
      setShowPricing(currentSite.settings?.showPricing ?? true);
      setSkipLandingPage(currentSite.settings?.skipLandingPage ?? false);
      setGiftsPerUser(currentSite.settings?.giftsPerUser || 1);
      setValidationMethod(currentSite.settings?.validationMethod || 'email');
      setDefaultLanguage(currentSite.settings?.defaultLanguage || 'en');
      setDefaultCurrency(currentSite.settings?.defaultCurrency || 'USD');
      setDefaultCountry(currentSite.settings?.defaultCountry || 'US');
      setAvailabilityStartDate(currentSite.settings?.availabilityStartDate || '');
      setAvailabilityEndDate(currentSite.settings?.availabilityEndDate || '');
      setExpiredMessage(currentSite.settings?.expiredMessage || 'Thank you for your interest. The gift selection period for this program has ended. If you have questions, please contact your program administrator.');
      setDefaultGiftId(currentSite.settings?.defaultGiftId || '');
      setDefaultGiftDaysAfterClose(currentSite.settings?.defaultGiftDaysAfterClose || 0);
      
      // Header/Footer settings
      setShowHeader(currentSite.settings?.showHeader ?? true);
      setShowFooter(currentSite.settings?.showFooter ?? true);
      setHeaderLayout(currentSite.settings?.headerLayout || 'left');
      setShowLanguageSelector(currentSite.settings?.showLanguageSelector ?? true);
      setCompanyName(currentSite.settings?.companyName || '');
      setFooterText(currentSite.settings?.footerText || '© 2026 All rights reserved.');
      
      // Gift Selection UX settings
      setEnableSearch(currentSite.settings?.enableSearch ?? true);
      setEnableFilters(currentSite.settings?.enableFilters ?? true);
      setGridColumns(currentSite.settings?.gridColumns || 3);
      setShowDescription(currentSite.settings?.showDescription ?? true);
      setSortOptions(currentSite.settings?.sortOptions || ['name', 'price', 'popularity']);
      
      // ERP Integration settings
      setSiteCode((currentSite as any).siteCode || '');
      setSiteErpIntegration((currentSite as any).siteErpIntegration || '');
      setSiteErpInstance((currentSite as any).siteErpInstance || '');
      setSiteShipFromCountry((currentSite as any).siteShipFromCountry || 'US');
      setSiteHrisSystem((currentSite as any).siteHrisSystem || '');
      
      // Site Management settings
      setSiteDropDownName((currentSite as any).siteDropDownName || '');
      setSiteCustomDomainUrl((currentSite as any).siteCustomDomainUrl || '');
      setSiteAccountManager((currentSite as any).siteAccountManager || '');
      setSiteAccountManagerEmail((currentSite as any).siteAccountManagerEmail || '');
      setSiteCelebrationsEnabled((currentSite as any).siteCelebrationsEnabled ?? false);
      setAllowSessionTimeoutExtend((currentSite as any).allowSessionTimeoutExtend ?? false);
      setEnableEmployeeLogReport((currentSite as any).enableEmployeeLogReport ?? false);
      
      // Regional Client Info settings
      setRegionalOfficeName((currentSite as any).regionalClientInfo?.officeName || '');
      setRegionalContactName((currentSite as any).regionalClientInfo?.contactName || '');
      setRegionalContactEmail((currentSite as any).regionalClientInfo?.contactEmail || '');
      setRegionalContactPhone((currentSite as any).regionalClientInfo?.contactPhone || '');
      setRegionalAddressLine1((currentSite as any).regionalClientInfo?.addressLine1 || '');
      setRegionalAddressLine2((currentSite as any).regionalClientInfo?.addressLine2 || '');
      setRegionalAddressLine3((currentSite as any).regionalClientInfo?.addressLine3 || '');
      setRegionalCity((currentSite as any).regionalClientInfo?.city || '');
      setRegionalCountryState((currentSite as any).regionalClientInfo?.countryState || '');
      setRegionalTaxId((currentSite as any).regionalClientInfo?.taxId || '');
      
      // Authentication settings
      setDisableDirectAccessAuth((currentSite as any).disableDirectAccessAuth ?? false);
      setSsoProvider((currentSite as any).ssoProvider || '');
      setSsoClientOfficeName((currentSite as any).ssoClientOfficeName || '');
      
      // Additional Optional Fields
      setShippingMode(currentSite.settings.shippingMode || 'employee');
      setDefaultShippingAddress(currentSite.settings.defaultShippingAddress || '');
      setWelcomeMessage(currentSite.settings.welcomeMessage || '');
      setEnableWelcomePage(currentSite.settings.enableWelcomePage ?? false);
      setWelcomePageTitle(currentSite.settings.welcomePageContent?.title || '');
      setWelcomePageMessage(currentSite.settings.welcomePageContent?.message || '');
      setWelcomePageAuthorName(currentSite.settings.welcomePageContent?.authorName || '');
      setWelcomePageAuthorTitle(currentSite.settings.welcomePageContent?.authorTitle || '');
      setWelcomePageImageUrl(currentSite.settings.welcomePageContent?.imageUrl || '');
      setAllowedCountries(currentSite.settings.allowedCountries || []);
      setEnableAddressValidation(currentSite.settings.addressValidation?.enabled ?? false);
      setAddressValidationProvider(currentSite.settings.addressValidation?.provider || 'none');
      
      // Set configMode based on site status
      setConfigMode(currentSite.status === 'active' ? 'live' : 'draft');
    }
  }, [currentSite]);

  // Auto-save effect (only in draft mode)
  useEffect(() => {
    if (hasChanges && configMode === 'draft' && !isAutoSaving && currentSite) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [hasChanges, configMode, isAutoSaving, currentSite]);

  // Unsaved changes warning
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

  // Auto-save function
  const handleAutoSave = async () => {
    if (!currentSite || !hasChanges || configMode === 'live' || isAutoSaving) return;
    
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
          showHeader,
          showFooter,
          headerLayout,
          showLanguageSelector,
          companyName,
          footerText,
          enableSearch,
          enableFilters,
          gridColumns: gridColumns as 2 | 3 | 4 | 6,
          showDescription,
          sortOptions: sortOptions as ('name' | 'price' | 'popularity' | 'newest')[],
          // Additional Optional Fields
          shippingMode,
          defaultShippingAddress,
          welcomeMessage,
          enableWelcomePage,
          welcomePageContent: enableWelcomePage ? {
            title: welcomePageTitle,
            message: welcomePageMessage,
            authorName: welcomePageAuthorName,
            authorTitle: welcomePageAuthorTitle,
            imageUrl: welcomePageImageUrl,
          } : undefined,
          allowedCountries,
          addressValidation: enableAddressValidation ? {
            enabled: enableAddressValidation,
            provider: addressValidationProvider,
            validationLevel: 'moderate',
            autoCorrect: false,
            requireValidation: false,
          } : undefined,
        },
        // ERP Integration fields
        siteCode,
        siteErpIntegration,
        siteErpInstance,
        siteShipFromCountry,
        siteHrisSystem,
        // Site Management fields
        siteDropDownName,
        siteCustomDomainUrl,
        siteAccountManager,
        siteAccountManagerEmail,
        siteCelebrationsEnabled,
        allowSessionTimeoutExtend,
        enableEmployeeLogReport,
        // Regional Client Info
        regionalClientInfo: {
          officeName: regionalOfficeName,
          contactName: regionalContactName,
          contactEmail: regionalContactEmail,
          contactPhone: regionalContactPhone,
          addressLine1: regionalAddressLine1,
          addressLine2: regionalAddressLine2,
          addressLine3: regionalAddressLine3,
          city: regionalCity,
          countryState: regionalCountryState,
          taxId: regionalTaxId,
        },
        // Authentication
        disableDirectAccessAuth,
        ssoProvider,
        ssoClientOfficeName,
      });
      
      setLastAutoSave(new Date());
      setHasChanges(false);
      
      // Add to change history
      setChangeHistory(prev => [...prev, {
        timestamp: new Date(),
        type: 'auto' as const,
        fieldCount: 0
      }].slice(-10));
      
      // Subtle notification (don't interrupt user)
      toast.success('Draft auto-saved', {
        duration: 2000,
        position: 'bottom-right'
      });
      
    } catch (error: unknown) {
      console.error('[SiteConfiguration] Auto-save failed:', error);
      // Don't show error toast for auto-save failures - just log it
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleSave = async () => {
    if (!currentSite) {
      toast.error('No site selected');
      return;
    }
    
    // Import validation
    const { validateSiteConfiguration } = await import('../../utils/siteConfigValidation');
    
    // Validate before saving
    const validation = validateSiteConfiguration({
      siteName,
      siteUrl,
      siteType,
      primaryColor,
      secondaryColor,
      tertiaryColor,
      giftsPerUser,
      validationMethod,
      availabilityStartDate,
      availabilityEndDate,
      defaultGiftDaysAfterClose,
      companyName,
      footerText,
      expiredMessage,
      gridColumns,
      sortOptions,
      defaultGiftId
    } as any);
    
    if (!validation.valid) {
      setErrors(validation.fieldErrors);
      toast.error(`Please fix ${validation.errors.length} error${validation.errors.length > 1 ? 's' : ''}`, {
        description: validation.errors.slice(0, 3).join(', ') + 
                     (validation.errors.length > 3 ? ` and ${validation.errors.length - 3} more...` : ''),
        duration: 5000
      });
      return;
    }
    
    // Show warnings if any
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        toast.warning(warning, { duration: 4000 });
      });
    }
    
    // Clear errors
    setErrors({});
    setSaveStatus('saving');
    
    try {
      // Attempt save with all settings
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
          gridColumns: gridColumns as 2 | 3 | 4 | 6,
          showDescription,
          sortOptions: sortOptions as ('name' | 'price' | 'popularity' | 'newest')[],
          // Additional Optional Fields
          shippingMode,
          defaultShippingAddress,
          welcomeMessage,
          enableWelcomePage,
          welcomePageContent: enableWelcomePage ? {
            title: welcomePageTitle,
            message: welcomePageMessage,
            authorName: welcomePageAuthorName,
            authorTitle: welcomePageAuthorTitle,
            imageUrl: welcomePageImageUrl,
          } : undefined,
          allowedCountries,
          addressValidation: enableAddressValidation ? {
            enabled: enableAddressValidation,
            provider: addressValidationProvider,
            validationLevel: 'moderate',
            autoCorrect: false,
            requireValidation: false,
          } : undefined,
        },
        // ERP Integration fields (outside settings to match backend structure)
        siteCode,
        siteErpIntegration,
        siteErpInstance,
        siteShipFromCountry,
        siteHrisSystem,
        // Site Settings Tab - Additional fields
        siteDropDownName,
        siteCustomDomainUrl,
        siteAccountManager,
        siteAccountManagerEmail,
        siteCelebrationsEnabled,
        allowSessionTimeoutExtend,
        enableEmployeeLogReport,
        // Authentication settings
        disableDirectAccessAuth,
        ssoProvider,
        ssoClientOfficeName,
        // Regional Client Info
        regionalClientInfo: {
          officeName: regionalOfficeName,
          contactName: regionalContactName,
          contactEmail: regionalContactEmail,
          contactPhone: regionalContactPhone,
          addressLine1: regionalAddressLine1,
          addressLine2: regionalAddressLine2,
          addressLine3: regionalAddressLine3,
          city: regionalCity,
          countryState: regionalCountryState,
          taxId: regionalTaxId,
        },
      });
      
      // Success!
      setSaveStatus('saved');
      setHasChanges(false);
      setLastManualSave(new Date());
      
      // Add to change history
      setChangeHistory(prev => [...prev, {
        timestamp: new Date(),
        type: 'manual' as const,
        fieldCount: Object.keys(validation.fieldErrors).length
      }].slice(-10)); // Keep last 10
      
      toast.success('Configuration saved successfully', {
        description: 'All changes have been saved to the database',
        icon: '✅'
      });
      
      // Clear saved status after 3 seconds
      setTimeout(() => {
        if (saveStatus === 'saved') {
          setSaveStatus('idle');
        }
      }, 3000);
      
    } catch (error: unknown) {
      console.error('[SiteConfiguration] Save failed:', error);
      setSaveStatus('error');
      
      // Determine error type and show appropriate message
      let errorMessage = 'Failed to save configuration';
      let errorDescription = 'Please try again';
      
      const errorMsg = error instanceof Error ? error.message : '';
      
      if (errorMsg?.toLowerCase().includes('network') || errorMsg?.toLowerCase().includes('fetch')) {
        errorMessage = 'Network error';
        errorDescription = 'Please check your internet connection and try again';
      } else if (errorMsg?.toLowerCase().includes('unauthorized') || errorMsg?.toLowerCase().includes('401')) {
        errorMessage = 'Authentication error';
        errorDescription = 'Your session may have expired. Please log in again';
      } else if (errorMsg?.toLowerCase().includes('duplicate') || errorMsg?.toLowerCase().includes('already exists')) {
        errorMessage = 'Duplicate entry';
        errorDescription = 'A site with this URL already exists';
      } else if (errorMsg?.toLowerCase().includes('403') || errorMsg?.toLowerCase().includes('forbidden')) {
        errorMessage = 'Permission denied';
        errorDescription = 'You do not have permission to edit this site';
      } else if (errorMsg) {
        errorDescription = errorMsg;
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        action: {
          label: 'Retry',
          onClick: () => handleSave()
        },
        duration: 8000
      });
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        if (saveStatus === 'error') {
          setSaveStatus('idle');
        }
      }, 5000);
    }
  };

  const handlePublish = async () => {
    if (!currentSite) return;
    
    // Check for unsaved changes
    if (hasChanges) {
      toast.warning('You have unsaved changes', {
        description: 'Please save your changes before publishing',
        action: {
          label: 'Save Now',
          onClick: () => handleSave()
        },
        duration: 6000
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
      'You can still make changes by switching to Draft mode, but they won\'t be visible until you publish again.'
    );
    
    if (!confirmed) return;
    
    setIsPublishing(true);
    
    try {
      await updateSite(currentSite.id, { status: 'active' });
      
      setConfigMode('live');
      setSaveStatus('saved');
      
      toast.success('Site published successfully! 🎉', {
        description: 'Your site is now live and accessible to users',
        duration: 5000
      });
      
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error: unknown) {
      console.error('[SiteConfiguration] Error publishing site:', error);
      setSaveStatus('error');
      
      toast.error('Failed to publish site', {
        description: error instanceof Error ? error.message : 'Please try again',
        action: {
          label: 'Retry',
          onClick: () => handlePublish()
        },
        duration: 8000
      });
      
    } finally {
      setIsPublishing(false);
    }
  };

  if (!currentSite || !currentClient) {
    return (
      <div className="space-y-6">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div>
              <strong className="block mb-2">No Site Selected</strong>
              <p className="mb-3">
                Site configuration is site-specific. Please select a site first to configure its settings.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/admin/sites"
                  className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-all"
                >
                  Go to Site Management
                </Link>
                {!currentSite && (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Site Context Header - Sticky */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Site Info with Switcher */}
          <div className="flex items-center gap-4">
            {/* Site Logo/Icon */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ backgroundColor: currentSite.branding?.primaryColor || '#D91C81' }}
            >
              {currentClient.name.substring(0, 2).toUpperCase()}
            </div>
            
            {/* Site Details */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <Link to="/admin/sites" className="hover:text-[#D91C81] transition-colors">
                  {currentClient.name}
                </Link>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {currentSite.domain || 'No domain'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{currentSite.name}</h1>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                  currentSite.status === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : currentSite.status === 'draft'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {currentSite.status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Auto-save indicator */}
            {configMode === 'draft' && (
              <div className="flex flex-col items-end text-xs text-gray-500">
                {isAutoSaving && (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Auto-saving...</span>
                  </div>
                )}
                {!isAutoSaving && lastAutoSave && !hasChanges && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Auto-saved {formatDistanceToNow(lastAutoSave, { addSuffix: true })}</span>
                  </div>
                )}
                {!isAutoSaving && lastManualSave && !hasChanges && !lastAutoSave && (
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-green-600" />
                    <span>Saved {formatDistanceToNow(lastManualSave, { addSuffix: true })}</span>
                  </div>
                )}
                {hasChanges && (
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Unsaved changes</span>
                  </div>
                )}
              </div>
            )}
            
            {/* View Live Site */}
            {currentSite.status === 'active' && (
              <a
                href={getPublicSiteUrl(currentSite.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">View Live</span>
              </a>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saveStatus === 'saving'}
              className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#B71569] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live/Draft Mode Toggle */}
      <Card className={configMode === 'draft' ? 'border-2 border-amber-400' : 'border-2 border-green-600'}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setConfigMode('live')}
                  disabled={currentSite.status === 'draft'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                    configMode === 'live'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Live Site
                </button>
                <button
                  onClick={() => setConfigMode('draft')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                    configMode === 'draft'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FileEdit className="w-4 h-4" />
                  Draft Mode
                </button>
              </div>
              {configMode === 'live' && currentSite.status === 'active' && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <Eye className="w-3 h-3 mr-1" />
                  Viewing Live Configuration
                </Badge>
              )}
              {configMode === 'draft' && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                  <FileEdit className="w-3 h-3 mr-1" />
                  {currentSite.status === 'draft' ? 'Site Not Published' : 'Editing Draft'}
                </Badge>
              )}
            </div>
            {configMode === 'draft' && currentSite.status === 'draft' && (
              <Button
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin mr-2">
                      <Rocket className="w-4 h-4" />
                    </div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Publish Site
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            {configMode === 'live' ? (
              currentSite.status === 'active' ? (
                <p>👁️ You are viewing the <strong>live configuration</strong> that is currently active on the site. Switch to Draft Mode to make changes.</p>
              ) : (
                <p>ℹ️ This site has not been published yet. Publish the site to view the live configuration.</p>
              )
            ) : (
              currentSite.status === 'draft' ? (
                <p>✏️ This site is in <strong>draft mode</strong> and not visible to users yet. Configure your settings below, then click \"Publish Site\" when ready.</p>
              ) : (
                <p>✏️ You are editing the <strong>draft configuration</strong>. Changes won't affect the live site until you publish them.</p>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Mode Warning Banner */}
      {configMode === 'live' && currentSite.status === 'active' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Eye className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>🔒 Read-Only Mode:</strong> You are viewing the live configuration. All inputs are disabled. Switch to Draft Mode to make changes.
          </AlertDescription>
        </Alert>
      )}

      {hasChanges && saveStatus === 'idle' && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You have unsaved changes. Remember to save before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs Navigation - Horizontal Scroll */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <TabsList className="inline-flex min-w-full w-max gap-1 bg-transparent">
            <TabsTrigger 
              value="general" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger 
              value="header-footer" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Layout className="w-4 h-4 flex-shrink-0" />
              <span>Header/Footer</span>
            </TabsTrigger>
            <TabsTrigger 
              value="branding" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Palette className="w-4 h-4 flex-shrink-0" />
              <span>Branding</span>
            </TabsTrigger>
            <TabsTrigger 
              value="landing" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Rocket className="w-4 h-4 flex-shrink-0" />
              <span>Landing</span>
            </TabsTrigger>
            <TabsTrigger 
              value="welcome" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Welcome</span>
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Package className="w-4 h-4 flex-shrink-0" />
              <span>Products & Gifts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="shipping" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Truck className="w-4 h-4 flex-shrink-0" />
              <span>Shipping</span>
            </TabsTrigger>
            <TabsTrigger 
              value="access" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>Access</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Site Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#D91C81]" />
                Site Information
              </CardTitle>
              <CardDescription>Basic site identification and portal settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Name
                </label>
                <Input
                  type="text"
                  value={siteName}
                  onChange={(e) => {
                    setSiteName(e.target.value);
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  placeholder="Enter site name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site URL
                </label>
                <Input
                  type="text"
                  value={siteUrl}
                  onChange={(e) => {
                    setSiteUrl(e.target.value);
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  placeholder="Enter site URL"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Type
                </label>
                <select
                  value={siteType}
                  onChange={(e) => {
                    setSiteType(e.target.value as any);
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="event-gifting">🎉 Event Gifting</option>
                  <option value="onboarding-kit">👋 Employee Onboarding Kit</option>
                  <option value="service-awards">🏆 Service Awards</option>
                  <option value="incentives">💎 Incentives & Rewards</option>
                  <option value="custom">⚙️ Custom Configuration</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {siteType === 'event-gifting' && 'Perfect for corporate events, conferences, and celebrations'}
                  {siteType === 'onboarding-kit' && 'Streamline new hire onboarding with customizable welcome kits'}
                  {siteType === 'service-awards' && 'Recognize employee milestones and years of service'}
                  {siteType === 'incentives' && 'Drive performance with points-based rewards and incentives'}
                  {siteType === 'custom' && 'Fully customizable site with flexible configuration'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gift Selection Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Gift Selection Settings
              </CardTitle>
              <CardDescription>Configure how users interact with gifts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Allow Quantity Selection</p>
                  <p className="text-sm text-gray-600">Let users select multiple quantities of gifts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={allowQuantitySelection}
                    onChange={(e) => {
                      setAllowQuantitySelection(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Gift Prices</p>
                  <p className="text-sm text-gray-600">Display pricing information to users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={showPricing}
                    onChange={(e) => {
                      setShowPricing(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Skip Home Page</p>
                  <p className="text-sm text-gray-600">Redirect users directly to authentication page</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={skipLandingPage}
                    onChange={(e) => {
                      setSkipLandingPage(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gifts Per User
                </label>
                <Input
                  type="number"
                  value={giftsPerUser}
                  onChange={(e) => {
                    setGiftsPerUser(parseInt(e.target.value));
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  min="1"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of gifts each user can select
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Validation & Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1B2A5E]" />
                Validation Method
              </CardTitle>
              <CardDescription>Choose how users will access the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Validation Type
                </label>
                <select
                  value={validationMethod}
                  onChange={(e) => {
                    setValidationMethod(e.target.value as any);
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="email">Email Address Validation</option>
                  <option value="employeeId">Employee ID Validation</option>
                  <option value="serialCard">Serial Card Number</option>
                  <option value="magic_link">Magic Link (Email)</option>
                  <option value="sso">Single Sign-On (SSO)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {validationMethod === 'email' && 'Users verify their email address to access the portal'}
                  {validationMethod === 'employeeId' && 'Users enter their employee ID for verification'}
                  {validationMethod === 'serialCard' && 'Users enter a unique serial card number'}
                  {validationMethod === 'magic_link' && 'Users request a magic link sent to their email'}
                  {validationMethod === 'sso' && 'Users authenticate through your organization\'s SSO provider'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SSO Configuration - Only shown when SSO is selected */}
          {validationMethod === 'sso' && (
            <Card className="border-2 border-[#D91C81]">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#D91C81]" />
                  SSO Configuration
                </CardTitle>
                <CardDescription>Configure Single Sign-On authentication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SSO Provider *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    onChange={() => setHasChanges(true)}
                  >
                    <option value="">Select a provider...</option>
                    <option value="azure">Microsoft Azure AD / Entra ID</option>
                    <option value="okta">Okta</option>
                    <option value="google">Google Workspace</option>
                    <option value="saml">Generic SAML 2.0</option>
                    <option value="oauth2">Generic OAuth 2.0</option>
                    <option value="openid">OpenID Connect</option>
                    <option value="custom">Custom Provider</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select your organization's identity provider
                  </p>
                </div>

                {/* OAuth/OpenID Configuration */}
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15V17M12 7V13M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    OAuth 2.0 / OpenID Connect Settings
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Client ID *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., abc123xyz789"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Client Secret *
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter client secret"
                      onChange={() => setHasChanges(true)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Keep this secret secure. Never share it publicly.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Authorization URL *
                    </label>
                    <Input
                      type="url"
                      placeholder="https://login.provider.com/oauth/authorize"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Token URL *
                    </label>
                    <Input
                      type="url"
                      placeholder="https://login.provider.com/oauth/token"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      User Info URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://login.provider.com/oauth/userinfo"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Scope
                    </label>
                    <Input
                      type="text"
                      defaultValue="openid profile email"
                      placeholder="openid profile email"
                      onChange={() => setHasChanges(true)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Space-separated list of OAuth scopes
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Redirect URI (Callback URL) *
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        value={`https://${currentSite.domain}/auth/callback`}
                        readOnly
                        className="bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://${currentSite.domain}/auth/callback`);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Add this URL to your provider's allowed redirect URIs
                    </p>
                  </div>
                </div>

                {/* SAML Configuration */}
                <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    SAML 2.0 Settings
                  </h4>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      IdP Entry Point (SSO URL) *
                    </label>
                    <Input
                      type="url"
                      placeholder="https://sso.provider.com/saml/sso"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Issuer / Entity ID *
                    </label>
                    <Input
                      type="text"
                      placeholder="urn:your-app:entity-id"
                      onChange={() => setHasChanges(true)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      X.509 Certificate *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste your X.509 certificate here..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-xs"
                      onChange={() => setHasChanges(true)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Public certificate from your identity provider
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assertion Consumer Service URL *
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        value={`https://${currentSite.domain}/auth/saml/callback`}
                        readOnly
                        className="bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://${currentSite.domain}/auth/saml/callback`);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Configure this URL in your IdP as the ACS URL
                    </p>
                  </div>
                </div>

                {/* Attribute Mapping */}
                <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900">User Attribute Mapping</h4>
                  <p className="text-sm text-gray-600">
                    Map attributes from your SSO provider to user fields
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Attribute
                      </label>
                      <Input
                        type="text"
                        defaultValue="email"
                        placeholder="email"
                        onChange={() => setHasChanges(true)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name Attribute
                      </label>
                      <Input
                        type="text"
                        defaultValue="firstName"
                        placeholder="firstName"
                        onChange={() => setHasChanges(true)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name Attribute
                      </label>
                      <Input
                        type="text"
                        defaultValue="lastName"
                        placeholder="lastName"
                        onChange={() => setHasChanges(true)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Employee ID Attribute
                      </label>
                      <Input
                        type="text"
                        defaultValue="employeeId"
                        placeholder="employeeId"
                        onChange={() => setHasChanges(true)}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Auto-Provision Users</p>
                      <p className="text-sm text-gray-600">Automatically create accounts for new users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        defaultChecked
                        onChange={() => setHasChanges(true)}
                        disabled={configMode === 'live'}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Require Multi-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Enforce MFA at the provider level</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        onChange={() => setHasChanges(true)}
                        disabled={configMode === 'live'}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Allowed Email Domains (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="example.com, company.com"
                      onChange={() => setHasChanges(true)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Comma-separated list of allowed email domains. Leave empty to allow all.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <Input
                      type="number"
                      defaultValue="60"
                      min="5"
                      max="480"
                      onChange={() => setHasChanges(true)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How long users stay logged in (5-480 minutes)
                    </p>
                  </div>
                </div>

                {/* Test Connection */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#D91C81] to-purple-600 text-white rounded-lg font-semibold hover:from-[#B71569] hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Test SSO Connection
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Verify your SSO configuration is working correctly
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Internationalization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00B4CC]" />
                Internationalization
              </CardTitle>
              <CardDescription>Language, currency, and regional settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Language
                  </label>
                  <select
                    value={defaultLanguage}
                    onChange={(e) => {
                      setDefaultLanguage(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => {
                      setDefaultCurrency(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Country
                  </label>
                  <select
                    value={defaultCountry}
                    onChange={(e) => {
                      setDefaultCountry(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D91C81]" />
                Availability Period
              </CardTitle>
              <CardDescription>Control when users can select gifts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Control gift selection period</p>
                    <p>Set the date range when this site is available. Outside this period, visitors will see your custom message.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={availabilityStartDate}
                    onChange={(e) => {
                      setAvailabilityStartDate(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Gift selection becomes available on this date and time
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={availabilityEndDate}
                    onChange={(e) => {
                      setAvailabilityEndDate(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Gift selection ends on this date and time
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expired Period Message
                </label>
                <textarea
                  rows={4}
                  value={expiredMessage}
                  onChange={(e) => {
                    setExpiredMessage(e.target.value);
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  placeholder="Enter the message to display when the selection period has ended..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be shown to employees who try to access the site outside the availability period
                </p>
              </div>

              {/* Preview */}
              {(availabilityStartDate || availabilityEndDate) && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-900">
                      <p className="font-semibold mb-1">Availability Period Summary</p>
                      {availabilityStartDate && (
                        <p>• Opens: {new Date(availabilityStartDate).toLocaleString()}</p>
                      )}
                      {availabilityEndDate && (
                        <p>• Closes: {new Date(availabilityEndDate).toLocaleString()}</p>
                      )}
                      {availabilityStartDate && availabilityEndDate && (
                        <p className="mt-2 text-xs">
                          Duration: {Math.ceil((new Date(availabilityEndDate).getTime() - new Date(availabilityStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Default Gift Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#D91C81]" />
                Default Gift Configuration
              </CardTitle>
              <CardDescription>
                Configure a default gift to be sent to employees who haven't made a selection after the site closes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>How it works:</strong> After the site closes, if an employee hasn't selected a gift, 
                  the system will automatically send them the default gift after the specified number of days.
                </AlertDescription>
              </Alert>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Default Gift
                </label>
                <select
                  value={defaultGiftId}
                  onChange={(e) => {
                    setDefaultGiftId(e.target.value);
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">No default gift (employees must make a selection)</option>
                  {gifts.map((gift) => (
                    <option key={gift.id} value={gift.id}>
                      {gift.name} - ${gift.price.toFixed(2)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a gift to be automatically sent to employees who don't make a selection
                </p>
              </div>

              {defaultGiftId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Days After Site Closes
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="365"
                    value={defaultGiftDaysAfterClose}
                    onChange={(e) => {
                      setDefaultGiftDaysAfterClose(parseInt(e.target.value) || 0);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of days after the availability end date to send the default gift. Set to 0 to send immediately when the site closes.
                  </p>
                </div>
              )}

              {defaultGiftId && availabilityEndDate && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-900">
                      <p className="font-semibold mb-1">Default Gift Summary</p>
                      <p>• Gift: {gifts.find(g => g.id === defaultGiftId)?.name || 'Unknown Gift'}</p>
                      <p>• Site closes: {new Date(availabilityEndDate).toLocaleString()}</p>
                      <p>• Default gift will be sent: {(() => {
                        const closeDate = new Date(availabilityEndDate);
                        closeDate.setDate(closeDate.getDate() + defaultGiftDaysAfterClose);
                        return closeDate.toLocaleString();
                      })()}</p>
                      <p className="mt-2 text-xs">
                        {defaultGiftDaysAfterClose === 0 
                          ? 'The default gift will be sent immediately when the site closes.' 
                          : `The default gift will be sent ${defaultGiftDaysAfterClose} day${defaultGiftDaysAfterClose !== 1 ? 's' : ''} after the site closes.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {defaultGiftId && !availabilityEndDate && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    <strong>Note:</strong> You must set an availability end date for the default gift to be sent automatically.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
           {/* ========== ERP INTEGRATION (NEW) ========== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D91C81]" />
                ERP Integration
              </CardTitle>
              <CardDescription>
                Configure ERP system integration for product synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Site Code <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={siteCode}
                    onChange={(e) => {
                      setSiteCode(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="e.g., TC-EG-2026"
                    disabled={configMode === 'live'}
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier for ERP sync</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ERP System
                  </label>
                  <select
                    value={siteErpIntegration}
                    onChange={(e) => {
                      setSiteErpIntegration(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Select ERP System</option>
                    <option value="NAJ">NAJ</option>
                    <option value="Fourgen">Fourgen</option>
                    <option value="Netsuite">Netsuite</option>
                    <option value="GRS">GRS</option>
                    <option value="SAP">SAP</option>
                    <option value="Oracle">Oracle</option>
                    <option value="Manual">Manual</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select ERP system</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ERP Instance
                  </label>
                  <Input
                    value={siteErpInstance}
                    onChange={(e) => {
                      setSiteErpInstance(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="e.g., NAJ, Fourgen"
                    disabled={configMode === 'live'}
                  />
                  <p className="text-xs text-gray-500 mt-1">Specific ERP instance</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ship From Country *
                  </label>
                  <Input
                    value={siteShipFromCountry}
                    onChange={(e) => {
                      setSiteShipFromCountry(e.target.value.toUpperCase());
                      setHasChanges(true);
                    }}
                    placeholder="US"
                    maxLength={2}
                    disabled={configMode === 'live'}
                  />
                  <p className="text-xs text-gray-500 mt-1">2-letter ISO code (US, CA, GB)</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    HRIS System <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={siteHrisSystem}
                    onChange={(e) => {
                      setSiteHrisSystem(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="e.g., Workday, ADP"
                    disabled={configMode === 'live'}
                  />
                  <p className="text-xs text-gray-500 mt-1">HR information system</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ========== SITE MANAGEMENT (NEW) ========== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#00B4CC]" />
                Site Management
              </CardTitle>
              <CardDescription>
                Configure account management and site display settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dropdown Display Name <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={siteDropDownName}
                    onChange={(e) => {
                      setSiteDropDownName(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="US - 2026 Gift Program"
                    disabled={configMode === 'live'}
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">Multi-site dropdown (max 100 chars)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Custom Domain URL <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={siteCustomDomainUrl}
                    onChange={(e) => {
                      setSiteCustomDomainUrl(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="https://gifts.yourcompany.com"
                    disabled={configMode === 'live'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Manager <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={siteAccountManager}
                    onChange={(e) => {
                      setSiteAccountManager(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="Sarah Williams"
                    disabled={configMode === 'live'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Manager Email <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    type="email"
                    value={siteAccountManagerEmail}
                    onChange={(e) => {
                      setSiteAccountManagerEmail(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="sarah@halo.com"
                    disabled={configMode === 'live'}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-4">Feature Toggles</p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Enable Celebrations</p>
                      <p className="text-sm text-gray-600">Show celebration feature</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={siteCelebrationsEnabled}
                        onChange={(e) => {
                          setSiteCelebrationsEnabled(e.target.checked);
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">4-Hour Session Timeout</p>
                      <p className="text-sm text-gray-600">Extend timeout to 4 hours</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={allowSessionTimeoutExtend}
                        onChange={(e) => {
                          setAllowSessionTimeoutExtend(e.target.checked);
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Employee Activity Logging</p>
                      <p className="text-sm text-gray-600">Track employee interactions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={enableEmployeeLogReport}
                        onChange={(e) => {
                          setEnableEmployeeLogReport(e.target.checked);
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ========== SHIPPING & FULFILLMENT (NEW) ========== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Shipping & Fulfillment
              </CardTitle>
              <CardDescription>
                Configure shipping mode and address settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shipping Mode *
                </label>
                <select
                  value={shippingMode}
                  onChange={(e) => {
                    setShippingMode(e.target.value as 'company' | 'employee' | 'store');
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="employee">Ship to Employee</option>
                  <option value="company">Ship to Company</option>
                  <option value="store">Store Pickup</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Where gifts will be shipped</p>
              </div>

              {shippingMode === 'company' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Default Shipping Address <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <textarea
                    value={defaultShippingAddress}
                    onChange={(e) => {
                      setDefaultShippingAddress(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="123 Company St, Suite 100&#10;San Francisco, CA 94105&#10;USA"
                  />
                  <p className="text-xs text-gray-500 mt-1">Company address for bulk shipments</p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Enable Address Validation</p>
                  <p className="text-sm text-gray-600">Validate addresses before submission</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={enableAddressValidation}
                    onChange={(e) => {
                      setEnableAddressValidation(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              {enableAddressValidation && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Validation Provider
                  </label>
                  <select
                    value={addressValidationProvider}
                    onChange={(e) => {
                      setAddressValidationProvider(e.target.value as 'none' | 'usps' | 'google' | 'smartystreets' | 'loqate' | 'here');
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="none">None</option>
                    <option value="usps">USPS</option>
                    <option value="google">Google Maps</option>
                    <option value="smartystreets">SmartyStreets</option>
                    <option value="loqate">Loqate</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ========== WELCOME PAGE CONFIGURATION (NEW) ========== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Welcome Page Configuration
              </CardTitle>
              <CardDescription>
                Configure post-authentication welcome page (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Enable Welcome Page</p>
                  <p className="text-sm text-gray-600">Show welcome page after authentication</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={enableWelcomePage}
                    onChange={(e) => {
                      setEnableWelcomePage(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              {enableWelcomePage && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Welcome Message <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <Input
                      value={welcomeMessage}
                      onChange={(e) => {
                        setWelcomeMessage(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      placeholder="Welcome to our gift selection program!"
                    />
                    <p className="text-xs text-gray-500 mt-1">Short welcome message</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Page Title <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                      </label>
                      <Input
                        value={welcomePageTitle}
                        onChange={(e) => {
                          setWelcomePageTitle(e.target.value);
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        placeholder="Welcome!"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Image URL <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                      </label>
                      <Input
                        value={welcomePageImageUrl}
                        onChange={(e) => {
                          setWelcomePageImageUrl(e.target.value);
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Detailed Message <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <textarea
                      value={welcomePageMessage}
                      onChange={(e) => {
                        setWelcomePageMessage(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Thank you for your dedication and hard work..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Author Name <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                      </label>
                      <Input
                        value={welcomePageAuthorName}
                        onChange={(e) => {
                          setWelcomePageAuthorName(e.target.value);
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        placeholder="CEO John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Author Title <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                      </label>
                      <Input
                        value={welcomePageAuthorTitle}
                        onChange={(e) => {
                          setWelcomePageAuthorTitle(e.target.value);
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        placeholder="Chief Executive Officer"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ========== INTERNATIONAL SETTINGS (NEW) ========== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                International Settings
              </CardTitle>
              <CardDescription>
                Configure allowed countries and regional restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Allowed Countries <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <Input
                  value={allowedCountries.join(', ')}
                  onChange={(e) => {
                    const countries = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                    setAllowedCountries(countries);
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  placeholder="US, CA, GB, DE (leave empty for all countries)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated ISO country codes. Leave empty to allow all countries.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ========== REGIONAL CLIENT INFORMATION (NEW) ========== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Regional Client Information
              </CardTitle>
              <CardDescription>
                Regional office details, contact information, and address (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Regional Office Name <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={regionalOfficeName}
                    onChange={(e) => {
                      setRegionalOfficeName(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    placeholder="EMEA Office"
                  />
                  <p className="text-xs text-gray-500 mt-1">Name of regional office or branch</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Name <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={regionalContactName}
                    onChange={(e) => {
                      setRegionalContactName(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Email <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    type="email"
                    value={regionalContactEmail}
                    onChange={(e) => {
                      setRegionalContactEmail(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    placeholder="jane.smith@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Phone <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    type="tel"
                    value={regionalContactPhone}
                    onChange={(e) => {
                      setRegionalContactPhone(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    placeholder="+44 20 1234 5678"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-4">Regional Address</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Line 1 <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <Input
                      value={regionalAddressLine1}
                      onChange={(e) => {
                        setRegionalAddressLine1(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      placeholder="123 Business Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Line 2 <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <Input
                      value={regionalAddressLine2}
                      onChange={(e) => {
                        setRegionalAddressLine2(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      placeholder="Suite 400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address Line 3 <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <Input
                      value={regionalAddressLine3}
                      onChange={(e) => {
                        setRegionalAddressLine3(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      placeholder="Building B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                      </label>
                      <Input
                        value={regionalCity}
                        onChange={(e) => {
                          setRegionalCity(e.target.value);
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        placeholder="London"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country/State <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                      </label>
                      <Input
                        value={regionalCountryState}
                        onChange={(e) => {
                          setRegionalCountryState(e.target.value);
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        placeholder="United Kingdom"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tax ID / VAT Number <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <Input
                      value={regionalTaxId}
                      onChange={(e) => {
                        setRegionalTaxId(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      placeholder="GB123456789"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tax identification number for this region</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ========== ADVANCED AUTHENTICATION (NEW) ========== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D91C81]" />
                Advanced Authentication
              </CardTitle>
              <CardDescription>
                Additional authentication and access control settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Disable Direct Access Authentication</p>
                  <p className="text-sm text-gray-600">Require SSO/external authentication only</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={disableDirectAccessAuth}
                    onChange={(e) => {
                      setDisableDirectAccessAuth(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SSO Provider <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <select
                    value={ssoProvider}
                    onChange={(e) => {
                      setSsoProvider(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Select SSO Provider</option>
                    <option value="google">Google</option>
                    <option value="microsoft">Microsoft / Azure AD</option>
                    <option value="okta">Okta</option>
                    <option value="azure">Azure AD</option>
                    <option value="saml">SAML 2.0</option>
                    <option value="oauth2">OAuth 2.0</option>
                    <option value="custom">Custom</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Primary SSO authentication provider</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SSO Client/Office Name <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={ssoClientOfficeName}
                    onChange={(e) => {
                      setSsoClientOfficeName(e.target.value);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    placeholder="CompanyName - US Office"
                  />
                  <p className="text-xs text-gray-500 mt-1">Display name for SSO configuration</p>
                </div>
              </div>

              {disableDirectAccessAuth && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    <strong>Warning:</strong> Direct access authentication is disabled. Users will only be able to log in through the configured SSO provider. Make sure SSO is properly configured before enabling this option.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Header/Footer Configuration Tab */}
        <TabsContent value="header-footer" className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <Layout className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Header & Footer Configuration</h3>
                <p className="text-sm text-gray-700">
                  Customize your site's header navigation, logo, and footer content
                </p>
              </div>
            </div>
          </div>

          {/* Header Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#D91C81]" />
                Header Settings
              </CardTitle>
              <CardDescription>Configure your site's header navigation and layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Header</p>
                  <p className="text-sm text-gray-600">Display header navigation on all pages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={showHeader}
                    onChange={(e) => {
                      setShowHeader(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Header Layout
                </label>
                <select
                  value={headerLayout}
                  onChange={(e) => {
                    setHeaderLayout(e.target.value as any);
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="left">Left-aligned (Logo | Navigation)</option>
                  <option value="center">Center-aligned (Logo centered)</option>
                  <option value="split">Split (Logo left | Navigation right)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose how the header content is arranged
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Language Selector</p>
                  <p className="text-sm text-gray-600">Show language switcher in header</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={showLanguageSelector}
                    onChange={(e) => {
                      setShowLanguageSelector(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name
                </label>
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  placeholder="Enter company name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Displayed next to the logo in the header
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#D91C81]" />
                Footer Settings
              </CardTitle>
              <CardDescription>Configure your site's footer content and links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Footer</p>
                  <p className="text-sm text-gray-600">Display footer on all pages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={showFooter}
                    onChange={(e) => {
                      setShowFooter(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Footer Text
                </label>
                <Input
                  type="text"
                  value={footerText}
                  onChange={(e) => {
                    setFooterText(e.target.value);
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  placeholder="© 2026 All rights reserved."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Copyright or legal text displayed in footer
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Editor Link */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-600" />
                Advanced Header & Footer Options
              </CardTitle>
              <CardDescription>Navigation links, custom HTML, and more detailed configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <h4 className="font-medium text-gray-900 mb-2">Additional Options Available</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Navigation Menu:</strong> Custom navigation links and dropdown menus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Footer Columns:</strong> Multi-column layout with quick links</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Social Media:</strong> Add social media links and icons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Custom HTML:</strong> Insert custom content in header/footer</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-end">
                <Link
                  to="/admin/header-footer-configuration"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Layout className="w-5 h-5" />
                  Open Advanced Editor
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Configuration Tab */}
        <TabsContent value="branding" className="space-y-6">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-start gap-3">
              <Palette className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Branding Configuration</h3>
                <p className="text-sm text-gray-700">
                  Customize your site's colors, logos, and visual identity
                </p>
              </div>
            </div>
          </div>

          {/* Brand Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#D91C81]" />
                Brand Colors
              </CardTitle>
              <CardDescription>Define your site's primary color palette</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      className="flex-1 font-mono text-sm"
                      placeholder="#D91C81"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Main brand color for buttons, links, and accents
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => {
                        setSecondaryColor(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => {
                        setSecondaryColor(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      className="flex-1 font-mono text-sm"
                      placeholder="#1B2A5E"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supporting color for headers and navigation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tertiary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={tertiaryColor}
                      onChange={(e) => {
                        setTertiaryColor(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Input
                      type="text"
                      value={tertiaryColor}
                      onChange={(e) => {
                        setTertiaryColor(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      className="flex-1 font-mono text-sm"
                      placeholder="#00B4CC"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Additional accent color for highlights
                  </p>
                </div>
              </div>

              {/* Color Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Color Preview</h4>
                <div className="flex gap-4 items-center">
                  <div className="text-center">
                    <div 
                      className="w-20 h-20 rounded-lg shadow-md mb-2 border-2 border-white"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <p className="text-xs text-gray-600 font-medium">Primary</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-20 h-20 rounded-lg shadow-md mb-2 border-2 border-white"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <p className="text-xs text-gray-600 font-medium">Secondary</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-20 h-20 rounded-lg shadow-md mb-2 border-2 border-white"
                      style={{ backgroundColor: tertiaryColor }}
                    />
                    <p className="text-xs text-gray-600 font-medium">Tertiary</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D91C81]" />
                Brand Logos
              </CardTitle>
              <CardDescription>Upload your company logo and brand assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Primary Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={configMode === 'live'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: PNG or SVG format, transparent background, max 2MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Favicon
                </label>
                <input
                  type="file"
                  accept="image/x-icon,image/png"
                  disabled={configMode === 'live'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: ICO or PNG format, 32x32 or 64x64 pixels
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Branding Link */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-purple-600" />
                Advanced Branding Options
              </CardTitle>
              <CardDescription>Typography, custom CSS, and more detailed brand configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <h4 className="font-medium text-gray-900 mb-2">Additional Options Available</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Typography:</strong> Heading and body font customization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Custom CSS:</strong> Advanced styling and branding control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Brand Guidelines:</strong> Apply consistent styles site-wide</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-end">
                <Link
                  to="/admin/branding-configuration"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Palette className="w-5 h-5" />
                  Open Advanced Editor
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products & Gifts Configuration Tab - Combined */}
        <TabsContent value="products" className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Gift Selection UX Configuration</h3>
                <p className="text-sm text-gray-700">
                  Customize the gift browsing and selection experience
                </p>
              </div>
            </div>
          </div>

          {/* Search & Filter Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#D91C81]" />
                Search & Filter Settings
              </CardTitle>
              <CardDescription>Configure search and filtering capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Enable Search</p>
                  <p className="text-sm text-gray-600">Allow users to search for gifts by name or description</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={enableSearch}
                    onChange={(e) => {
                      setEnableSearch(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Enable Filters</p>
                  <p className="text-sm text-gray-600">Show category and price range filters</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={enableFilters}
                    onChange={(e) => {
                      setEnableFilters(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Layout Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#D91C81]" />
                Layout Settings
              </CardTitle>
              <CardDescription>Configure how gifts are displayed in the grid</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grid Columns
                </label>
                <select
                  value={gridColumns}
                  onChange={(e) => {
                    setGridColumns(parseInt(e.target.value));
                    setHasChanges(true);
                  }}
                  disabled={configMode === 'live'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value={2}>2 Columns (Large cards)</option>
                  <option value={3}>3 Columns (Standard)</option>
                  <option value={4}>4 Columns (Compact)</option>
                  <option value={6}>6 Columns (Dense)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Number of gift cards per row on desktop view
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Gift Descriptions</p>
                  <p className="text-sm text-gray-600">Display description text on gift cards</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={showDescription}
                    onChange={(e) => {
                      setShowDescription(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={configMode === 'live'}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Sort Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#D91C81]" />
                Sort Options
              </CardTitle>
              <CardDescription>Available sorting methods for users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['name', 'price', 'popularity', 'newest'].map((option) => (
                  <div key={option} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{option}</p>
                      <p className="text-xs text-gray-600">
                        {option === 'name' && 'Sort alphabetically A-Z'}
                        {option === 'price' && 'Sort by price low to high'}
                        {option === 'popularity' && 'Sort by most selected'}
                        {option === 'newest' && 'Sort by recently added'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={sortOptions.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSortOptions([...sortOptions, option]);
                          } else {
                            setSortOptions(sortOptions.filter(o => o !== option));
                          }
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Select which sort options users can choose from. At least one option should be enabled.
              </p>
            </CardContent>
          </Card>

          {/* Advanced Editor Link */}
          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-600" />
                Advanced Gift Selection Options
              </CardTitle>
              <CardDescription>Image ratios, hover effects, and detailed UX configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-emerald-200">
                <h4 className="font-medium text-gray-900 mb-2">Additional Options Available</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Image Settings:</strong> Aspect ratios, zoom effects, and image quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Hover Effects:</strong> Card animations and interactive elements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Quick View:</strong> Modal preview without leaving the page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Wishlist:</strong> Save favorite gifts for later</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-end">
                <Link
                  to="/admin/gift-selection-configuration"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Gift className="w-5 h-5" />
                  Open Advanced Editor
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Landing Page Tab */}
        <TabsContent value="landing" className="space-y-6">
          <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-start gap-3">
              <Layout className="w-5 h-5 text-[#D91C81] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Landing Page Configuration</h3>
                <p className="text-sm text-gray-700">
                  Customize your site's landing page with visual editor or custom HTML/CSS/JS
                </p>
              </div>
            </div>
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <LandingPageEditor />
          </Suspense>
        </TabsContent>

        {/* Welcome Page Tab */}
        <TabsContent value="welcome" className="space-y-6">
          <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-start gap-3">
              <Layout className="w-5 h-5 text-[#D91C81] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Welcome Page Configuration</h3>
                <p className="text-sm text-gray-700">
                  Customize your site's welcome page with visual editor or custom HTML/CSS/JS
                </p>
              </div>
            </div>
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <WelcomePageEditor />
          </Suspense>
        </TabsContent>

        {/* Product Assignment Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Product Assignment</h3>
                <p className="text-sm text-gray-700">
                  Assign and manage products available for this site
                </p>
              </div>
            </div>
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <SiteGiftConfiguration />
          </Suspense>
        </TabsContent>

        {/* Shipping Configuration Tab */}
        <TabsContent value="shipping" className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Shipping Configuration</h3>
                <p className="text-sm text-gray-700">
                  Configure shipping methods, addresses, and delivery options
                </p>
              </div>
            </div>
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <ShippingConfiguration />
          </Suspense>
        </TabsContent>

        {/* Access Management Tab */}
        <TabsContent value="access" className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Access Management</h3>
                <p className="text-sm text-gray-700">
                  Manage user access, validation methods, and permissions
                </p>
              </div>
            </div>
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <AccessManagement />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}