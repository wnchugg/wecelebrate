import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Settings, Globe, Mail, Truck, Gift, Lock, 
  Check, AlertCircle, Building2, ExternalLink,
  Layout, Package, Users, Clock, Calendar, CheckCircle, Palette, Shield, Loader2, Eye, Rocket, History, Edit3, Zap,
  ShoppingBag, CreditCard, ShoppingCart, FileText
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useGift } from '../../context/GiftContext';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { getPublicSiteUrlBySlug, getEnvironmentBaseUrl } from '../../utils/url';
import { PublishConfirmationModal } from '../../components/PublishConfirmationModal';
import { DiscardConfirmationModal } from '../../components/DiscardConfirmationModal';
import { UnpublishedChangesIndicator } from '../../components/UnpublishedChangesIndicator';
import { UnsavedChangesModal } from '../../components/UnsavedChangesModal';
import { detectSiteChanges } from '../../utils/siteChangesDetector';
import { CustomSelect } from '../../components/ui/select-custom';

// Lazy load the heavy components
const LandingPageEditor = lazy(() => import('./LandingPageEditorNew').then(m => ({ default: m.LandingPageEditorNew })));
const WelcomePageEditor = lazy(() => import('./WelcomePageEditorNew').then(m => ({ default: m.WelcomePageEditorNew })));
const SiteGiftConfiguration = lazy(() => import('./SiteGiftConfiguration'));
const ShippingConfiguration = lazy(() => import('./ShippingConfiguration').then(m => ({ default: m.ShippingConfiguration })));
const AccessManagement = lazy(() => import('./AccessManagement').then(m => ({ default: m.AccessManagement })));

// Import SSO components
import { SSOConfigCard } from '../../components/admin/SSOConfigCard';

// Import Multi-Language components
import { MultiLanguageSelector } from '../../components/admin/MultiLanguageSelector';
import { TranslationProgress } from '../../components/admin/TranslationProgress';
import { TranslatableInput } from '../../components/admin/TranslatableInput';
import { TranslatableTextarea } from '../../components/admin/TranslatableTextarea';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-[#D91C81] animate-spin" />
    </div>
  );
}

// SSO Helper Functions
const OAUTH_PROVIDERS = ['azure', 'okta', 'google', 'oauth2', 'openid', 'custom'];
const SAML_PROVIDERS = ['saml'];

function getProviderCategory(provider: string | null): 'oauth' | 'saml' | null {
  if (!provider) return null;
  if (OAUTH_PROVIDERS.includes(provider)) return 'oauth';
  if (SAML_PROVIDERS.includes(provider)) return 'saml';
  return null;
}

function getUIState(
  ssoProvider: string | null,
  ssoConfigured: boolean,
  ssoEditMode: boolean
): 'unconfigured' | 'initial' | 'configured' | 'edit' {
  if (!ssoProvider) return 'unconfigured';
  if (ssoConfigured && !ssoEditMode) return 'configured';
  if (ssoConfigured && ssoEditMode) return 'edit';
  return 'initial';
}

function getProviderDisplayName(provider: string | null): string {
  const providerNames: Record<string, string> = {
    azure: 'Microsoft Azure AD / Entra ID',
    okta: 'Okta',
    google: 'Google Workspace',
    saml: 'Generic SAML 2.0',
    oauth2: 'Generic OAuth 2.0',
    openid: 'OpenID Connect',
    custom: 'Custom Provider'
  };
  return provider ? providerNames[provider] || provider : '';
}

export function SiteConfiguration() {
  const { currentSite, currentClient, saveSiteDraft, publishSite, discardSiteDraft, getSiteLive } = useSite();
  const { gifts } = useGift();
  const [searchParams] = useSearchParams();
  
  // Debug logging
  useEffect(() => {
    console.warn('[SiteConfiguration] Component state:', {
      currentSite: currentSite ? { id: currentSite.id, name: currentSite.name } : null,
      currentClient: currentClient ? { id: currentClient.id, name: currentClient.name } : null,
      hasCurrentSite: !!currentSite
    });
    
    // Check currentSite for unpublished changes
    if (currentSite) {
      // Site data loaded with draft changes flag
    }
  }, [currentSite, currentClient]);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [configMode, setConfigMode] = useState<'live' | 'draft'>('live'); // Default to live for published sites
  const [initialModeSet, setInitialModeSet] = useState(false); // Track if we've set initial mode
  const [isUserInitiatedChange, setIsUserInitiatedChange] = useState(false); // Track user-initiated changes to prevent auto-reload
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingModeSwitch, setPendingModeSwitch] = useState<'live' | null>(null);
  const [originalSiteData, setOriginalSiteData] = useState<any>(null);
  
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
  const [siteUrl, setSiteUrl] = useState(currentSite?.slug || '');
  const [siteType, setSiteType] = useState<'event-gifting' | 'onboarding-kit' | 'service-awards' | 'incentives' | 'custom'>(
    currentSite?.type || 'custom'
  );
  const [primaryColor, setPrimaryColor] = useState(currentSite?.branding?.primaryColor || '#D91C81');
  const [secondaryColor, setSecondaryColor] = useState(currentSite?.branding?.secondaryColor || '#1B2A5E');
  const [tertiaryColor, setTertiaryColor] = useState(currentSite?.branding?.tertiaryColor || '#00B4CC');
  const [allowQuantitySelection, setAllowQuantitySelection] = useState(currentSite?.settings?.allowQuantitySelection ?? false);
  const [showPricing, setShowPricing] = useState(currentSite?.settings?.showPricing ?? true);
  const [skipLandingPage, setSkipLandingPage] = useState(currentSite?.settings?.skipLandingPage ?? false);
  const [enableLandingPage, setEnableLandingPage] = useState(currentSite?.settings?.skipLandingPage === false);
  const [giftsPerUser, setGiftsPerUser] = useState(currentSite?.settings?.giftsPerUser || 1);
  const [validationMethod, setValidationMethod] = useState<'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso'>(
    currentSite?.settings?.validationMethod || 'email'
  );
  const [defaultLanguage, setDefaultLanguage] = useState(currentSite?.settings?.defaultLanguage || 'en');
  const [defaultCurrency, setDefaultCurrency] = useState(currentSite?.settings?.defaultCurrency || 'USD');
  const [defaultCountry, setDefaultCountry] = useState(currentSite?.settings?.defaultCountry || 'US');
  
  // Multi-language state
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(currentSite?.availableLanguages || ['en']);
  const [draftAvailableLanguages, setDraftAvailableLanguages] = useState<string[]>(currentSite?.draftAvailableLanguages || currentSite?.availableLanguages || ['en']);
  
  // Translation state
  const [translations, setTranslations] = useState<Record<string, any>>(currentSite?.translations || {});
  
  const [availabilityStartDate, setAvailabilityStartDate] = useState(currentSite?.settings?.availabilityStartDate || '');
  const [availabilityEndDate, setAvailabilityEndDate] = useState(currentSite?.settings?.availabilityEndDate || '');
  const [expiredMessage, setExpiredMessage] = useState(
    currentSite?.settings?.expiredMessage || 
    'Thank you for your interest. The gift selection period for this program has ended. If you have questions, please contact your program administrator.'
  );
  const [defaultGiftId, setDefaultGiftId] = useState(currentSite?.settings?.defaultGiftId || null);
  const [defaultGiftDaysAfterClose, setDefaultGiftDaysAfterClose] = useState(currentSite?.settings?.defaultGiftDaysAfterClose || 0);

  // Header/Footer Settings State
  const [showHeader, setShowHeader] = useState(currentSite?.settings?.showHeader ?? true);
  const [showFooter, setShowFooter] = useState(currentSite?.settings?.showFooter ?? true);
  const [headerLayout, setHeaderLayout] = useState<'left' | 'center' | 'split'>(currentSite?.settings?.headerLayout || 'left');
  const [showLanguageSelector, setShowLanguageSelector] = useState(currentSite?.settings?.showLanguageSelector ?? true);
  const [companyName, setCompanyName] = useState(currentSite?.settings?.companyName || '');
  const [footerText, setFooterText] = useState(currentSite?.settings?.footerText || '© 2026 All rights reserved.');

  // Gift Selection UX Settings State
  const [enableSearch, setEnableSearch] = useState(currentSite?.settings?.enableSearch ?? true);
  const [enableFilters, setEnableFilters] = useState(currentSite?.settings?.enableFilters ?? true);
  const [gridColumns, setGridColumns] = useState<number>(currentSite?.settings?.gridColumns || 3);
  const [showDescription, setShowDescription] = useState(currentSite?.settings?.showDescription ?? true);
  const [sortOptions, setSortOptions] = useState<string[]>(currentSite?.settings?.sortOptions || ['name', 'price', 'popularity']);

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
  
  // SSO Configuration State
  const [ssoConfigured, setSsoConfigured] = useState(!!currentSite?.ssoProvider);
  const [ssoEditMode, setSsoEditMode] = useState(false);
  
  // SSO Field State Variables
  const ssoConfig = currentSite?.settings?.ssoConfig as any;
  const [ssoClientId, setSsoClientId] = useState(ssoConfig?.clientId || '');
  const [ssoClientSecret, setSsoClientSecret] = useState(ssoConfig?.clientSecret || '');
  const [ssoAuthUrl, setSsoAuthUrl] = useState(ssoConfig?.authUrl || '');
  const [ssoTokenUrl, setSsoTokenUrl] = useState(ssoConfig?.tokenUrl || '');
  const [ssoUserInfoUrl, setSsoUserInfoUrl] = useState(ssoConfig?.userInfoUrl || '');
  const [ssoScope, setSsoScope] = useState(ssoConfig?.scope || 'openid profile email');
  const [ssoIdpEntryPoint, setSsoIdpEntryPoint] = useState(ssoConfig?.idpEntryPoint || '');
  const [ssoEntityId, setSsoEntityId] = useState(ssoConfig?.entityId || '');
  const [ssoCertificate, setSsoCertificate] = useState(ssoConfig?.certificate || '');
  const [ssoAutoProvision, setSsoAutoProvision] = useState(ssoConfig?.autoProvision ?? true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Admin Bypass for SSO
  const [allowAdminBypass, setAllowAdminBypass] = useState(ssoConfig?.allowAdminBypass ?? false);
  const [bypassRequires2FA, setBypassRequires2FA] = useState(ssoConfig?.bypassRequires2FA ?? true);
  const [bypassAllowedIPs, setBypassAllowedIPs] = useState(ssoConfig?.bypassAllowedIPs?.join('\n') || '');

  // Phase 5: Additional Optional Fields
  const [shippingMode, setShippingMode] = useState<'company' | 'employee' | 'store'>(currentSite?.settings?.shippingMode || 'employee');
  const [defaultShippingAddress, setDefaultShippingAddress] = useState(currentSite?.settings?.defaultShippingAddress || '');
  const [welcomeMessage, setWelcomeMessage] = useState(currentSite?.settings?.welcomeMessage || '');
  const [enableWelcomePage, setEnableWelcomePage] = useState(currentSite?.settings?.enableWelcomePage ?? false);
  const [welcomePageTitle, setWelcomePageTitle] = useState(currentSite?.settings?.welcomePageContent?.title || '');
  const [welcomePageMessage, setWelcomePageMessage] = useState(currentSite?.settings?.welcomePageContent?.message || '');
  const [welcomePageAuthorName, setWelcomePageAuthorName] = useState(currentSite?.settings?.welcomePageContent?.authorName || '');
  const [welcomePageAuthorTitle, setWelcomePageAuthorTitle] = useState(currentSite?.settings?.welcomePageContent?.authorTitle || '');
  const [welcomePageImageUrl, setWelcomePageImageUrl] = useState(currentSite?.settings?.welcomePageContent?.imageUrl || '');
  const [allowedCountries, setAllowedCountries] = useState<string[]>(currentSite?.settings?.allowedCountries || []);
  const [enableAddressValidation, setEnableAddressValidation] = useState(currentSite?.settings?.addressValidation?.enabled ?? false);
  const [addressValidationProvider, setAddressValidationProvider] = useState(currentSite?.settings?.addressValidation?.provider || 'none');
  const [skipReviewPage, setSkipReviewPage] = useState(currentSite?.settings?.skipReviewPage ?? false);

  // Sync state when currentSite changes
  useEffect(() => {
    if (currentSite && !isUserInitiatedChange) {
      setSiteName(currentSite.name || '');
      setSiteUrl(currentSite.slug || '');
      setSiteType(currentSite.type || 'custom');
      setPrimaryColor(currentSite.branding?.primaryColor || '#D91C81');
      setSecondaryColor(currentSite.branding?.secondaryColor || '#1B2A5E');
      setTertiaryColor(currentSite.branding?.tertiaryColor || '#00B4CC');
      setAllowQuantitySelection(currentSite.settings?.allowQuantitySelection ?? false);
      setShowPricing(currentSite.settings?.showPricing ?? true);
      setSkipLandingPage(currentSite.settings?.skipLandingPage ?? false);
      setEnableLandingPage(currentSite.settings?.skipLandingPage === false);
      setGiftsPerUser(currentSite.settings?.giftsPerUser || 1);
      setValidationMethod(currentSite.settings?.validationMethod || 'email');
      setDefaultLanguage(currentSite.settings?.defaultLanguage || 'en');
      setDefaultCurrency(currentSite.settings?.defaultCurrency || 'USD');
      setDefaultCountry(currentSite.settings?.defaultCountry || 'US');
      
      // Multi-language settings
      setAvailableLanguages(currentSite.availableLanguages || ['en']);
      setDraftAvailableLanguages(currentSite.draftAvailableLanguages || currentSite.availableLanguages || ['en']);
      setTranslations(currentSite.translations || {});
      
      // Convert ISO 8601 to datetime-local format for inputs
      const formatDateForInput = (isoDate: string) => {
        if (!isoDate) return '';
        // ISO format: "2024-02-17T14:30:00.000Z"
        // datetime-local needs: "2024-02-17T14:30"
        return isoDate.slice(0, 16);
      };
      
      setAvailabilityStartDate(formatDateForInput(currentSite.settings?.availabilityStartDate || ''));
      setAvailabilityEndDate(formatDateForInput(currentSite.settings?.availabilityEndDate || ''));
      setExpiredMessage(currentSite.settings?.expiredMessage || 'Thank you for your interest. The gift selection period for this program has ended. If you have questions, please contact your program administrator.');
      setDefaultGiftId(currentSite.settings?.defaultGiftId || null);
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
      
      // SSO Configuration State
      const ssoConfigData = currentSite.settings?.ssoConfig as any;
      setSsoConfigured(!!(currentSite as any).ssoProvider);
      setSsoClientId(ssoConfigData?.clientId || '');
      setSsoClientSecret(ssoConfigData?.clientSecret || '');
      setSsoAuthUrl(ssoConfigData?.authUrl || '');
      setSsoTokenUrl(ssoConfigData?.tokenUrl || '');
      setSsoUserInfoUrl(ssoConfigData?.userInfoUrl || '');
      setSsoScope(ssoConfigData?.scope || 'openid profile email');
      setSsoIdpEntryPoint(ssoConfigData?.idpEntryPoint || '');
      setSsoEntityId(ssoConfigData?.entityId || '');
      setSsoCertificate(ssoConfigData?.certificate || '');
      setSsoAutoProvision(ssoConfigData?.autoProvision ?? true);
      setAllowAdminBypass(ssoConfigData?.allowAdminBypass ?? false);
      setBypassRequires2FA(ssoConfigData?.bypassRequires2FA ?? true);
      setBypassAllowedIPs(ssoConfigData?.bypassAllowedIPs?.join('\n') || '');
      
      // Additional Optional Fields
      setShippingMode(currentSite.settings?.shippingMode || 'employee');
      setDefaultShippingAddress(currentSite.settings?.defaultShippingAddress || '');
      setWelcomeMessage(currentSite.settings?.welcomeMessage || '');
      setEnableWelcomePage(currentSite.settings?.enableWelcomePage ?? false);
      setWelcomePageTitle(currentSite.settings?.welcomePageContent?.title || '');
      setWelcomePageMessage(currentSite.settings?.welcomePageContent?.message || '');
      setWelcomePageAuthorName(currentSite.settings?.welcomePageContent?.authorName || '');
      setWelcomePageAuthorTitle(currentSite.settings?.welcomePageContent?.authorTitle || '');
      setWelcomePageImageUrl(currentSite.settings?.welcomePageContent?.imageUrl || '');
      setAllowedCountries(currentSite.settings?.allowedCountries || []);
      setEnableAddressValidation(currentSite.settings?.addressValidation?.enabled ?? false);
      setAddressValidationProvider(currentSite.settings?.addressValidation?.provider || 'none');
      setSkipReviewPage(currentSite.settings?.skipReviewPage ?? false);
    }
    
    if (currentSite) {
      // Set configMode based on site status (only on initial load)
      if (!initialModeSet) {
        const initialMode = currentSite.status === 'active' ? 'live' : 'draft';
        setConfigMode(initialMode);
        setInitialModeSet(true);
        
        // Fetch appropriate data based on initial mode
        const loadInitialData = async () => {
        try {
          let dataToLoad = currentSite;
          
          // If starting in live mode, fetch live data only
          if (initialMode === 'live') {
            dataToLoad = await getSiteLive(currentSite.id);
          }
          // If starting in draft mode, currentSite already has draft merged
          
          // Update all form fields with the appropriate data
          setSiteName(dataToLoad.name || '');
          setSiteUrl(dataToLoad.slug || '');
          setSiteType(dataToLoad.type || 'custom');
          setPrimaryColor(dataToLoad.branding?.primaryColor || '#D91C81');
          setSecondaryColor(dataToLoad.branding?.secondaryColor || '#1B2A5E');
          setTertiaryColor(dataToLoad.branding?.tertiaryColor || '#00B4CC');
          setAllowQuantitySelection(dataToLoad.settings?.allowQuantitySelection ?? false);
          setShowPricing(dataToLoad.settings?.showPricing ?? true);
          setSkipLandingPage(dataToLoad.settings?.skipLandingPage ?? false);
          setEnableLandingPage(dataToLoad.settings?.skipLandingPage === false);
          setGiftsPerUser(dataToLoad.settings?.giftsPerUser || 1);
          setValidationMethod(dataToLoad.settings?.validationMethod || 'email');
          setDefaultLanguage(dataToLoad.settings?.defaultLanguage || 'en');
          setDefaultCurrency(dataToLoad.settings?.defaultCurrency || 'USD');
          setDefaultCountry(dataToLoad.settings?.defaultCountry || 'US');
          
          const formatDateForInput = (isoDate: string) => {
            if (!isoDate) return '';
            return isoDate.slice(0, 16);
          };
          
          setAvailabilityStartDate(formatDateForInput(dataToLoad.settings?.availabilityStartDate || ''));
          setAvailabilityEndDate(formatDateForInput(dataToLoad.settings?.availabilityEndDate || ''));
          setExpiredMessage(dataToLoad.settings?.expiredMessage || 'Thank you for your interest. The gift selection period for this program has ended. If you have questions, please contact your program administrator.');
          setDefaultGiftId(dataToLoad.settings?.defaultGiftId || null);
          setDefaultGiftDaysAfterClose(dataToLoad.settings?.defaultGiftDaysAfterClose || 0);
          
          // Header/Footer settings
          setShowHeader(dataToLoad.settings?.showHeader ?? true);
          setShowFooter(dataToLoad.settings?.showFooter ?? true);
          setHeaderLayout(dataToLoad.settings?.headerLayout || 'left');
          setShowLanguageSelector(dataToLoad.settings?.showLanguageSelector ?? true);
          setCompanyName(dataToLoad.settings?.companyName || '');
          setFooterText(dataToLoad.settings?.footerText || '© 2026 All rights reserved.');
          
          // Gift Selection UX settings
          setEnableSearch(dataToLoad.settings?.enableSearch ?? true);
          setEnableFilters(dataToLoad.settings?.enableFilters ?? true);
          setGridColumns(dataToLoad.settings?.gridColumns || 3);
          setShowDescription(dataToLoad.settings?.showDescription ?? true);
          setSortOptions(dataToLoad.settings?.sortOptions || ['name', 'price', 'popularity']);
          
          // ERP Integration settings
          setSiteCode((dataToLoad as any).siteCode || '');
          setSiteErpIntegration((dataToLoad as any).siteErpIntegration || '');
          setSiteErpInstance((dataToLoad as any).siteErpInstance || '');
          setSiteShipFromCountry((dataToLoad as any).siteShipFromCountry || 'US');
          setSiteHrisSystem((dataToLoad as any).siteHrisSystem || '');
          
          // Site Management settings
          setSiteDropDownName((dataToLoad as any).siteDropDownName || '');
          setSiteCustomDomainUrl((dataToLoad as any).siteCustomDomainUrl || '');
          setSiteAccountManager((dataToLoad as any).siteAccountManager || '');
          setSiteAccountManagerEmail((dataToLoad as any).siteAccountManagerEmail || '');
          setSiteCelebrationsEnabled((dataToLoad as any).siteCelebrationsEnabled ?? false);
          setAllowSessionTimeoutExtend((dataToLoad as any).allowSessionTimeoutExtend ?? false);
          setEnableEmployeeLogReport((dataToLoad as any).enableEmployeeLogReport ?? false);
          
          // Regional Client Info settings
          setRegionalOfficeName((dataToLoad as any).regionalClientInfo?.officeName || '');
          setRegionalContactName((dataToLoad as any).regionalClientInfo?.contactName || '');
          setRegionalContactEmail((dataToLoad as any).regionalClientInfo?.contactEmail || '');
          setRegionalContactPhone((dataToLoad as any).regionalClientInfo?.contactPhone || '');
          setRegionalAddressLine1((dataToLoad as any).regionalClientInfo?.addressLine1 || '');
          setRegionalAddressLine2((dataToLoad as any).regionalClientInfo?.addressLine2 || '');
          setRegionalAddressLine3((dataToLoad as any).regionalClientInfo?.addressLine3 || '');
          setRegionalCity((dataToLoad as any).regionalClientInfo?.city || '');
          setRegionalCountryState((dataToLoad as any).regionalClientInfo?.countryState || '');
          setRegionalTaxId((dataToLoad as any).regionalClientInfo?.taxId || '');
          
          // Authentication settings
          setDisableDirectAccessAuth((dataToLoad as any).disableDirectAccessAuth ?? false);
          setSsoProvider((dataToLoad as any).ssoProvider || '');
          setSsoClientOfficeName((dataToLoad as any).ssoClientOfficeName || '');
          
          // Additional Optional Fields
          setShippingMode(dataToLoad.settings?.shippingMode || 'employee');
          setDefaultShippingAddress(dataToLoad.settings?.defaultShippingAddress || '');
          setWelcomeMessage(dataToLoad.settings?.welcomeMessage || '');
          setEnableWelcomePage(dataToLoad.settings?.enableWelcomePage ?? false);
          setWelcomePageTitle(dataToLoad.settings?.welcomePageContent?.title || '');
          setWelcomePageMessage(dataToLoad.settings?.welcomePageContent?.message || '');
          setWelcomePageAuthorName(dataToLoad.settings?.welcomePageContent?.authorName || '');
          setWelcomePageAuthorTitle(dataToLoad.settings?.welcomePageContent?.authorTitle || '');
          setWelcomePageImageUrl(dataToLoad.settings?.welcomePageContent?.imageUrl || '');
          setAllowedCountries(dataToLoad.settings?.allowedCountries || []);
          setEnableAddressValidation(dataToLoad.settings?.addressValidation?.enabled ?? false);
          setAddressValidationProvider(dataToLoad.settings?.addressValidation?.provider || 'none');
          setSkipReviewPage(dataToLoad.settings?.skipReviewPage ?? false);
        } catch (error) {
          console.error('[SiteConfiguration] Failed to load initial data:', error);
        }
      };
      
      loadInitialData();
      }
      
      // Fetch live site data for comparison (used in publish modal)
      // This ensures we compare draft vs live, not draft vs draft
      const loadLiveData = async () => {
        try {
          const liveData = await getSiteLive(currentSite.id);
          
          setOriginalSiteData({
            name: liveData.name || '',
            slug: liveData.slug || '',
            type: liveData.type || 'custom',
            branding: {
              primaryColor: liveData.branding?.primaryColor || '#D91C81',
              secondaryColor: liveData.branding?.secondaryColor || '#1B2A5E',
              tertiaryColor: liveData.branding?.tertiaryColor || '#00B4CC',
            },
            settings: {
              allowQuantitySelection: liveData.settings?.allowQuantitySelection ?? false,
              showPricing: liveData.settings?.showPricing ?? true,
              skipLandingPage: liveData.settings?.skipLandingPage ?? false,
              giftsPerUser: liveData.settings?.giftsPerUser || 1,
              validationMethod: liveData.settings?.validationMethod || 'email',
              defaultLanguage: liveData.settings?.defaultLanguage || 'en',
              defaultCurrency: liveData.settings?.defaultCurrency || 'USD',
              defaultCountry: liveData.settings?.defaultCountry || 'US',
              availabilityStartDate: liveData.settings?.availabilityStartDate || null,
              availabilityEndDate: liveData.settings?.availabilityEndDate || null,
              expiredMessage: liveData.settings?.expiredMessage || '',
              defaultGiftId: liveData.settings?.defaultGiftId || null,
              defaultGiftDaysAfterClose: liveData.settings?.defaultGiftDaysAfterClose || 0,
              showHeader: liveData.settings?.showHeader ?? true,
              showFooter: liveData.settings?.showFooter ?? true,
              headerLayout: liveData.settings?.headerLayout || 'left',
              showLanguageSelector: liveData.settings?.showLanguageSelector ?? true,
              companyName: liveData.settings?.companyName || '',
              footerText: liveData.settings?.footerText || '',
              enableSearch: liveData.settings?.enableSearch ?? true,
              enableFilters: liveData.settings?.enableFilters ?? true,
              gridColumns: liveData.settings?.gridColumns || 3,
              showDescription: liveData.settings?.showDescription ?? true,
              sortOptions: liveData.settings?.sortOptions || ['name', 'price', 'popularity'],
              shippingMode: liveData.settings?.shippingMode || 'employee',
              defaultShippingAddress: liveData.settings?.defaultShippingAddress || '',
              welcomeMessage: liveData.settings?.welcomeMessage || '',
              enableWelcomePage: liveData.settings?.enableWelcomePage ?? false,
              skipReviewPage: liveData.settings?.skipReviewPage ?? false,
            },
            siteCode: (liveData as any).siteCode || '',
            siteErpIntegration: (liveData as any).siteErpIntegration || '',
            siteErpInstance: (liveData as any).siteErpInstance || '',
            siteShipFromCountry: (liveData as any).siteShipFromCountry || 'US',
            siteHrisSystem: (liveData as any).siteHrisSystem || '',
            siteDropDownName: (liveData as any).siteDropDownName || '',
            siteCustomDomainUrl: (liveData as any).siteCustomDomainUrl || '',
            siteAccountManager: (liveData as any).siteAccountManager || '',
            siteAccountManagerEmail: (liveData as any).siteAccountManagerEmail || '',
            siteCelebrationsEnabled: (liveData as any).siteCelebrationsEnabled ?? false,
            allowSessionTimeoutExtend: (liveData as any).allowSessionTimeoutExtend ?? false,
            enableEmployeeLogReport: (liveData as any).enableEmployeeLogReport ?? false,
            disableDirectAccessAuth: (liveData as any).disableDirectAccessAuth ?? false,
            ssoProvider: (liveData as any).ssoProvider || '',
          });
        } catch (error) {
          console.error('[SiteConfiguration] Failed to load live data for comparison:', error);
          // Fallback to current site data if live fetch fails
          setOriginalSiteData({
            name: currentSite.name || '',
            slug: currentSite.slug || '',
            type: currentSite.type || 'custom',
            branding: {
              primaryColor: currentSite.branding?.primaryColor || '#D91C81',
              secondaryColor: currentSite.branding?.secondaryColor || '#1B2A5E',
              tertiaryColor: currentSite.branding?.tertiaryColor || '#00B4CC',
            },
            settings: {
              allowQuantitySelection: currentSite.settings?.allowQuantitySelection ?? false,
              showPricing: currentSite.settings?.showPricing ?? true,
              skipLandingPage: currentSite.settings?.skipLandingPage ?? false,
              giftsPerUser: currentSite.settings?.giftsPerUser || 1,
              validationMethod: currentSite.settings?.validationMethod || 'email',
              defaultLanguage: currentSite.settings?.defaultLanguage || 'en',
              defaultCurrency: currentSite.settings?.defaultCurrency || 'USD',
              defaultCountry: currentSite.settings?.defaultCountry || 'US',
              availabilityStartDate: currentSite.settings?.availabilityStartDate || null,
              availabilityEndDate: currentSite.settings?.availabilityEndDate || null,
              expiredMessage: currentSite.settings?.expiredMessage || '',
              defaultGiftId: currentSite.settings?.defaultGiftId || null,
              defaultGiftDaysAfterClose: currentSite.settings?.defaultGiftDaysAfterClose || 0,
              showHeader: currentSite.settings?.showHeader ?? true,
              showFooter: currentSite.settings?.showFooter ?? true,
              headerLayout: currentSite.settings?.headerLayout || 'left',
              showLanguageSelector: currentSite.settings?.showLanguageSelector ?? true,
              companyName: currentSite.settings?.companyName || '',
              footerText: currentSite.settings?.footerText || '',
              enableSearch: currentSite.settings?.enableSearch ?? true,
              enableFilters: currentSite.settings?.enableFilters ?? true,
              gridColumns: currentSite.settings?.gridColumns || 3,
              showDescription: currentSite.settings?.showDescription ?? true,
              sortOptions: currentSite.settings?.sortOptions || ['name', 'price', 'popularity'],
              shippingMode: currentSite.settings?.shippingMode || 'employee',
              defaultShippingAddress: currentSite.settings?.defaultShippingAddress || '',
              welcomeMessage: currentSite.settings?.welcomeMessage || '',
              enableWelcomePage: currentSite.settings?.enableWelcomePage ?? false,
              skipReviewPage: currentSite.settings?.skipReviewPage ?? false,
            },
            siteCode: (currentSite as any).siteCode || '',
            siteErpIntegration: (currentSite as any).siteErpIntegration || '',
            siteErpInstance: (currentSite as any).siteErpInstance || '',
            siteShipFromCountry: (currentSite as any).siteShipFromCountry || 'US',
            siteHrisSystem: (currentSite as any).siteHrisSystem || '',
            siteDropDownName: (currentSite as any).siteDropDownName || '',
            siteCustomDomainUrl: (currentSite as any).siteCustomDomainUrl || '',
            siteAccountManager: (currentSite as any).siteAccountManager || '',
            siteAccountManagerEmail: (currentSite as any).siteAccountManagerEmail || '',
            siteCelebrationsEnabled: (currentSite as any).siteCelebrationsEnabled ?? false,
            allowSessionTimeoutExtend: (currentSite as any).allowSessionTimeoutExtend ?? false,
            enableEmployeeLogReport: (currentSite as any).enableEmployeeLogReport ?? false,
            disableDirectAccessAuth: (currentSite as any).disableDirectAccessAuth ?? false,
            ssoProvider: (currentSite as any).ssoProvider || '',
          });
        }
      };
      
      loadLiveData();
    }
  }, [currentSite, getSiteLive]);

  // Auto-save effect (only in draft mode)
  useEffect(() => {
    if (hasChanges && configMode === 'draft' && !isAutoSaving && currentSite) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 10000); // Auto-save every 10 seconds

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

  // Auto-switch to draft mode when changes are detected
  useEffect(() => {
    if (hasChanges && configMode === 'live') {
      setConfigMode('draft');
      toast.info('Switched to Draft mode', {
        description: 'Your changes will be saved as a draft. Publish when ready.',
        duration: 3000
      });
    }
  }, [hasChanges, configMode]);

  // Clear user-initiated change flag after mode switch completes
  useEffect(() => {
    if (configMode === 'draft' && isUserInitiatedChange) {
      // Use setTimeout to ensure this runs after the sync useEffect
      const timer = setTimeout(() => {
        setIsUserInitiatedChange(false);
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [configMode, isUserInitiatedChange]);

  // Helper function to update translations
  const updateTranslation = (path: string, language: string, value: string) => {
    setTranslations(prev => {
      const newTranslations = { ...prev };
      const pathParts = path.split('.');
      
      // Navigate to the correct nested object
      let current: any = newTranslations;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      
      // Set the language value
      const lastPart = pathParts[pathParts.length - 1];
      if (!current[lastPart]) {
        current[lastPart] = {};
      }
      current[lastPart][language] = value;
      
      return newTranslations;
    });
    setHasChanges(true);
  };

  // Handle mode toggle - fetch appropriate data
  const handleModeToggle = async (newMode: 'live' | 'draft') => {
    if (newMode === configMode) return; // Already in this mode
    
    // Check for unsaved changes when leaving draft mode
    if (configMode === 'draft' && newMode === 'live' && hasChanges) {
      setPendingModeSwitch('live');
      setShowUnsavedChangesModal(true);
      return;
    }
    
    if (newMode === 'live') {
      // Switching to live mode - fetch and display live data
      if (!currentSite) return;
      
      try {
        const liveData = await getSiteLive(currentSite.id);
        
        // Update all form fields with live data
        setSiteName(liveData.name || '');
        setSiteUrl(liveData.slug || '');
        setSiteType(liveData.type || 'custom');
        setPrimaryColor(liveData.branding?.primaryColor || '#D91C81');
        setSecondaryColor(liveData.branding?.secondaryColor || '#1B2A5E');
        setTertiaryColor(liveData.branding?.tertiaryColor || '#00B4CC');
        setAllowQuantitySelection(liveData.settings?.allowQuantitySelection ?? false);
        setShowPricing(liveData.settings?.showPricing ?? true);
        setSkipLandingPage(liveData.settings?.skipLandingPage ?? false);
        setEnableLandingPage(liveData.settings?.skipLandingPage === false);
        setGiftsPerUser(liveData.settings?.giftsPerUser || 1);
        setValidationMethod(liveData.settings?.validationMethod || 'email');
        setDefaultLanguage(liveData.settings?.defaultLanguage || 'en');
        setDefaultCurrency(liveData.settings?.defaultCurrency || 'USD');
        setDefaultCountry(liveData.settings?.defaultCountry || 'US');
        
        // Format dates for input
        const formatDateForInput = (isoDate: string) => {
          if (!isoDate) return '';
          return isoDate.slice(0, 16);
        };
        
        setAvailabilityStartDate(formatDateForInput(liveData.settings?.availabilityStartDate || ''));
        setAvailabilityEndDate(formatDateForInput(liveData.settings?.availabilityEndDate || ''));
        setExpiredMessage(liveData.settings?.expiredMessage || '');
        setDefaultGiftId(liveData.settings?.defaultGiftId || null);
        setDefaultGiftDaysAfterClose(liveData.settings?.defaultGiftDaysAfterClose || 0);
        
        // Header/Footer settings
        setShowHeader(liveData.settings?.showHeader ?? true);
        setShowFooter(liveData.settings?.showFooter ?? true);
        setHeaderLayout(liveData.settings?.headerLayout || 'left');
        setShowLanguageSelector(liveData.settings?.showLanguageSelector ?? true);
        setCompanyName(liveData.settings?.companyName || '');
        setFooterText(liveData.settings?.footerText || '© 2026 All rights reserved.');
        
        // Gift Selection UX settings
        setEnableSearch(liveData.settings?.enableSearch ?? true);
        setEnableFilters(liveData.settings?.enableFilters ?? true);
        setGridColumns(liveData.settings?.gridColumns || 3);
        setShowDescription(liveData.settings?.showDescription ?? true);
        setSortOptions(liveData.settings?.sortOptions || ['name', 'price', 'popularity']);
        
        // All other settings...
        setSiteCode((liveData as any).siteCode || '');
        setSiteErpIntegration((liveData as any).siteErpIntegration || '');
        setSiteErpInstance((liveData as any).siteErpInstance || '');
        setSiteShipFromCountry((liveData as any).siteShipFromCountry || 'US');
        setSiteHrisSystem((liveData as any).siteHrisSystem || '');
        setSiteDropDownName((liveData as any).siteDropDownName || '');
        setSiteCustomDomainUrl((liveData as any).siteCustomDomainUrl || '');
        setSiteAccountManager((liveData as any).siteAccountManager || '');
        setSiteAccountManagerEmail((liveData as any).siteAccountManagerEmail || '');
        setSiteCelebrationsEnabled((liveData as any).siteCelebrationsEnabled ?? false);
        setAllowSessionTimeoutExtend((liveData as any).allowSessionTimeoutExtend ?? false);
        setEnableEmployeeLogReport((liveData as any).enableEmployeeLogReport ?? false);
        setDisableDirectAccessAuth((liveData as any).disableDirectAccessAuth ?? false);
        setSsoProvider((liveData as any).ssoProvider || '');
        setSsoClientOfficeName((liveData as any).ssoClientOfficeName || '');
        
        // Additional optional fields
        setShippingMode(liveData.settings?.shippingMode || 'employee');
        setDefaultShippingAddress(liveData.settings?.defaultShippingAddress || '');
        setWelcomeMessage(liveData.settings?.welcomeMessage || '');
        setEnableWelcomePage(liveData.settings?.enableWelcomePage ?? false);
        setWelcomePageTitle(liveData.settings?.welcomePageContent?.title || '');
        setWelcomePageMessage(liveData.settings?.welcomePageContent?.message || '');
        setWelcomePageAuthorName(liveData.settings?.welcomePageContent?.authorName || '');
        setWelcomePageAuthorTitle(liveData.settings?.welcomePageContent?.authorTitle || '');
        setWelcomePageImageUrl(liveData.settings?.welcomePageContent?.imageUrl || '');
        setAllowedCountries(liveData.settings?.allowedCountries || []);
        setEnableAddressValidation(liveData.settings?.addressValidation?.enabled ?? false);
        setAddressValidationProvider(liveData.settings?.addressValidation?.provider || 'none');
        setSkipReviewPage(liveData.settings?.skipReviewPage ?? false);
        
        // Regional client info
        setRegionalOfficeName((liveData as any).regionalClientInfo?.officeName || '');
        setRegionalContactName((liveData as any).regionalClientInfo?.contactName || '');
        setRegionalContactEmail((liveData as any).regionalClientInfo?.contactEmail || '');
        setRegionalContactPhone((liveData as any).regionalClientInfo?.contactPhone || '');
        setRegionalAddressLine1((liveData as any).regionalClientInfo?.addressLine1 || '');
        setRegionalAddressLine2((liveData as any).regionalClientInfo?.addressLine2 || '');
        setRegionalAddressLine3((liveData as any).regionalClientInfo?.addressLine3 || '');
        setRegionalCity((liveData as any).regionalClientInfo?.city || '');
        setRegionalCountryState((liveData as any).regionalClientInfo?.countryState || '');
        setRegionalTaxId((liveData as any).regionalClientInfo?.taxId || '');
        
        setConfigMode('live');
        setHasChanges(false); // Clear changes flag when viewing live
        
        toast.info('Viewing Live Configuration', {
          description: 'Showing published settings. Switch to Draft to make changes.',
          duration: 3000
        });
      } catch (error) {
        console.error('[SiteConfiguration] Failed to load live data:', error);
        toast.error('Failed to load live configuration', {
          description: 'Could not fetch live data. Please try again.',
          duration: 5000
        });
      }
    } else {
      // Switching to draft mode - reload current site (which has draft merged)
      if (!currentSite) return;
      
      // Reload form fields from currentSite (which has draft merged)
      setSiteName(currentSite.name || '');
      setSiteUrl(currentSite.slug || '');
      setSiteType(currentSite.type || 'custom');
      setPrimaryColor(currentSite.branding?.primaryColor || '#D91C81');
      setSecondaryColor(currentSite.branding?.secondaryColor || '#1B2A5E');
      setTertiaryColor(currentSite.branding?.tertiaryColor || '#00B4CC');
      setAllowQuantitySelection(currentSite.settings?.allowQuantitySelection ?? false);
      setShowPricing(currentSite.settings?.showPricing ?? true);
      setSkipLandingPage(currentSite.settings?.skipLandingPage ?? false);
      setEnableLandingPage(currentSite.settings?.skipLandingPage === false);
      setGiftsPerUser(currentSite.settings?.giftsPerUser || 1);
      setValidationMethod(currentSite.settings?.validationMethod || 'email');
      setDefaultLanguage(currentSite.settings?.defaultLanguage || 'en');
      setDefaultCurrency(currentSite.settings?.defaultCurrency || 'USD');
      setDefaultCountry(currentSite.settings?.defaultCountry || 'US');
      
      const formatDateForInput = (isoDate: string) => {
        if (!isoDate) return '';
        return isoDate.slice(0, 16);
      };
      
      setAvailabilityStartDate(formatDateForInput(currentSite.settings?.availabilityStartDate || ''));
      setAvailabilityEndDate(formatDateForInput(currentSite.settings?.availabilityEndDate || ''));
      setExpiredMessage(currentSite.settings?.expiredMessage || '');
      setDefaultGiftId(currentSite.settings?.defaultGiftId || null);
      setDefaultGiftDaysAfterClose(currentSite.settings?.defaultGiftDaysAfterClose || 0);
      
      // All other settings (same as above)...
      setShowHeader(currentSite.settings?.showHeader ?? true);
      setShowFooter(currentSite.settings?.showFooter ?? true);
      setHeaderLayout(currentSite.settings?.headerLayout || 'left');
      setShowLanguageSelector(currentSite.settings?.showLanguageSelector ?? true);
      setCompanyName(currentSite.settings?.companyName || '');
      setFooterText(currentSite.settings?.footerText || '© 2026 All rights reserved.');
      setEnableSearch(currentSite.settings?.enableSearch ?? true);
      setEnableFilters(currentSite.settings?.enableFilters ?? true);
      setGridColumns(currentSite.settings?.gridColumns || 3);
      setShowDescription(currentSite.settings?.showDescription ?? true);
      setSortOptions(currentSite.settings?.sortOptions || ['name', 'price', 'popularity']);
      
      setConfigMode('draft');
      setHasChanges(false); // Clear changes flag when switching back
      
      toast.info('Switched to Draft Mode', {
        description: 'You can now edit and save changes.',
        duration: 3000
      });
    }
  };

  // Auto-save function
  const handleAutoSave = async () => {
    if (!currentSite || !hasChanges || configMode === 'live' || isAutoSaving) return;
    
    setIsAutoSaving(true);
    console.warn('[SiteConfiguration] Auto-saving draft...');
    
    // Helper to convert datetime-local to ISO 8601 with timezone
    const formatDateForDB = (dateStr: string) => {
      if (!dateStr) return null;
      // datetime-local format: "2024-02-17T14:30"
      // Convert to ISO 8601: "2024-02-17T14:30:00.000Z"
      return new Date(dateStr).toISOString();
    };
    
    try {
      // Save to draft_settings column (not live columns)
      await saveSiteDraft(currentSite.id, {
        name: siteName,
        slug: siteUrl,
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
          skipLandingPage: !enableLandingPage, // Invert for backend
          skipReviewPage,
          giftsPerUser: Math.max(1, giftsPerUser || 1), // Ensure at least 1
          validationMethod,
          defaultLanguage,
          defaultCurrency,
          defaultCountry,
          availabilityStartDate: formatDateForDB(availabilityStartDate),
          availabilityEndDate: formatDateForDB(availabilityEndDate),
          expiredMessage,
          defaultGiftId: defaultGiftId || null, // Convert empty string to null for UUID field
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
        // Multi-language settings
        draftAvailableLanguages: draftAvailableLanguages,
        translations: translations,
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
    const { validateTranslations } = await import('../../utils/translationValidation');
    
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
    
    // Validate translations (informational only, doesn't block save)
    const requiredFields = [
      'header.logoAlt',
      'header.homeLink',
      'welcomePage.title',
      'welcomePage.message',
      'landingPage.heroTitle',
      'catalogPage.title',
      'footer.text'
    ];
    
    const translationValidation = validateTranslations(
      translations,
      requiredFields,
      draftAvailableLanguages
    );
    
    // Display translation validation results
    if (!translationValidation.isComplete) {
      const missingCount = translationValidation.missingTranslations.length;
      toast.info('Translation status', {
        description: `${translationValidation.completionPercentage}% complete. ${missingCount} translation${missingCount > 1 ? 's' : ''} missing. You can continue editing and save with incomplete translations.`,
        duration: 5000
      });
    } else {
      toast.success('All translations complete! 🎉', {
        description: 'All required fields are translated for all languages.',
        duration: 3000
      });
    }
    
    // Clear errors
    setErrors({});
    setSaveStatus('saving');
    
    // Helper to convert datetime-local to ISO 8601 with timezone
    const formatDateForDB = (dateStr: string) => {
      if (!dateStr) return null;
      // datetime-local format: "2024-02-17T14:30"
      // Convert to ISO 8601: "2024-02-17T14:30:00.000Z"
      return new Date(dateStr).toISOString();
    };
    
    try {
      // Save changes to draft_settings (not live columns)
      await saveSiteDraft(currentSite.id, {
        name: siteName,
        slug: siteUrl,
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
          skipLandingPage: !enableLandingPage, // Invert for backend
          giftsPerUser: Math.max(1, giftsPerUser || 1), // Ensure at least 1
          validationMethod,
          defaultLanguage,
          defaultCurrency,
          defaultCountry,
          availabilityStartDate: formatDateForDB(availabilityStartDate),
          availabilityEndDate: formatDateForDB(availabilityEndDate),
          expiredMessage,
          defaultGiftId: defaultGiftId || null, // Convert empty string to null for UUID field
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
        // Multi-language settings
        draftAvailableLanguages: draftAvailableLanguages,
        translations: translations,
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
      
      // Update original site data to reflect the saved state
      // This prevents false positives in change detection
      setOriginalSiteData(buildCurrentStateForComparison());
      
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
      
      // Clear PublicSiteContext cache to ensure fresh data on next load
      sessionStorage.removeItem('selected_site_data');
      sessionStorage.removeItem(`site_${currentSite.id}_data`);
      
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
    
    // Import validation utilities
    const { canPublishTranslations, validateTranslations } = await import('../../utils/translationValidation');
    
    // Define required fields for translation validation
    const requiredFields = [
      'header.logoAlt',
      'header.homeLink',
      'welcomePage.title',
      'welcomePage.message',
      'landingPage.heroTitle',
      'catalogPage.title',
      'footer.text'
    ];
    
    // Validate default language translations
    const publishValidation = canPublishTranslations(
      translations,
      requiredFields,
      defaultLanguage
    );
    
    if (!publishValidation.canPublish) {
      toast.error('Cannot publish: Missing required translations', {
        description: publishValidation.reason,
        duration: 8000
      });
      return;
    }
    
    // Check for incomplete non-default language translations
    const completionValidation = validateTranslations(
      translations,
      requiredFields,
      draftAvailableLanguages
    );
    
    if (!completionValidation.isComplete) {
      const incompleteLanguages = new Set(
        completionValidation.missingTranslations.map(m => m.language)
      );
      const languageList = Array.from(incompleteLanguages).join(', ');
      
      toast.warning('Incomplete translations detected', {
        description: `Some translations are missing for: ${languageList}. You can still publish, but users may see fallback content.`,
        duration: 8000
      });
    }
    
    // Show publish confirmation modal
    setShowPublishModal(true);
  };

  const handleConfirmPublish = async () => {
    if (!currentSite) return;
    
    setIsPublishing(true);
    
    try {
      // Publish draft to live (merges draft_settings into live columns)
      await publishSite(currentSite.id);
      
      setConfigMode('live');
      setSaveStatus('saved');
      setShowPublishModal(false);
      
      // Update original site data to match the published state
      setOriginalSiteData(buildCurrentStateForComparison());
      
      toast.success('Site published successfully! 🎉', {
        description: 'Your site is now live and accessible to users',
        duration: 5000
      });
      
      // Clear PublicSiteContext cache to ensure fresh data on next load
      sessionStorage.removeItem('selected_site_data');
      sessionStorage.removeItem(`site_${currentSite.id}_data`);
      
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error: unknown) {
      console.error('[SiteConfiguration] Error publishing site:', error);
      setSaveStatus('error');
      
      toast.error('Failed to publish site', {
        description: error instanceof Error ? error.message : 'Please try again',
        action: {
          label: 'Retry',
          onClick: () => handleConfirmPublish()
        },
        duration: 8000
      });
      
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardDraft = async () => {
    setShowDiscardModal(true);
  };

  const handleConfirmDiscard = async () => {
    if (!currentSite) return;
    
    try {
      setIsDiscarding(true);
      
      // Clear draft_settings column
      await discardSiteDraft(currentSite.id);
      
      // Reload site data to show live values
      const liveData = await getSiteLive(currentSite.id);
      
      // Update all form fields with live values
      setSiteName(liveData.name || '');
      setSiteUrl(liveData.slug || '');
      setSiteType(liveData.type || 'custom');
      setPrimaryColor(liveData.branding?.primaryColor || '#D91C81');
      setSecondaryColor(liveData.branding?.secondaryColor || '#1B2A5E');
      setTertiaryColor(liveData.branding?.tertiaryColor || '#00B4CC');
      setAllowQuantitySelection(liveData.settings?.allowQuantitySelection ?? false);
      setShowPricing(liveData.settings?.showPricing ?? true);
      setSkipLandingPage(liveData.settings?.skipLandingPage ?? false);
      setEnableLandingPage(liveData.settings?.skipLandingPage === false);
      setGiftsPerUser(liveData.settings?.giftsPerUser || 1);
      setValidationMethod(liveData.settings?.validationMethod || 'email');
      setDefaultLanguage(liveData.settings?.defaultLanguage || 'en');
      setDefaultCurrency(liveData.settings?.defaultCurrency || 'USD');
      setDefaultCountry(liveData.settings?.defaultCountry || 'US');
      
      const formatDateForInput = (isoDate: string) => {
        if (!isoDate) return '';
        return isoDate.slice(0, 16);
      };
      
      setAvailabilityStartDate(formatDateForInput(liveData.settings?.availabilityStartDate || ''));
      setAvailabilityEndDate(formatDateForInput(liveData.settings?.availabilityEndDate || ''));
      setExpiredMessage(liveData.settings?.expiredMessage || 'Thank you for your interest. The gift selection period for this program has ended. If you have questions, please contact your program administrator.');
      setDefaultGiftId(liveData.settings?.defaultGiftId || null);
      setDefaultGiftDaysAfterClose(liveData.settings?.defaultGiftDaysAfterClose || 0);
      
      // Header/Footer settings
      setShowHeader(liveData.settings?.showHeader ?? true);
      setShowFooter(liveData.settings?.showFooter ?? true);
      setHeaderLayout(liveData.settings?.headerLayout || 'left');
      setShowLanguageSelector(liveData.settings?.showLanguageSelector ?? true);
      setCompanyName(liveData.settings?.companyName || '');
      setFooterText(liveData.settings?.footerText || '© 2026 All rights reserved.');
      
      // Gift Selection UX settings
      setEnableSearch(liveData.settings?.enableSearch ?? true);
      setEnableFilters(liveData.settings?.enableFilters ?? true);
      setGridColumns(liveData.settings?.gridColumns || 3);
      setShowDescription(liveData.settings?.showDescription ?? true);
      setSortOptions(liveData.settings?.sortOptions || ['name', 'price', 'popularity']);
      
      // ERP Integration settings
      setSiteCode((liveData as any).siteCode || '');
      setSiteErpIntegration((liveData as any).siteErpIntegration || '');
      setSiteErpInstance((liveData as any).siteErpInstance || '');
      setSiteShipFromCountry((liveData as any).siteShipFromCountry || 'US');
      setSiteHrisSystem((liveData as any).siteHrisSystem || '');
      
      // Site Management settings
      setSiteDropDownName((liveData as any).siteDropDownName || '');
      setSiteCustomDomainUrl((liveData as any).siteCustomDomainUrl || '');
      setSiteAccountManager((liveData as any).siteAccountManager || '');
      setSiteAccountManagerEmail((liveData as any).siteAccountManagerEmail || '');
      setSiteCelebrationsEnabled((liveData as any).siteCelebrationsEnabled ?? false);
      setAllowSessionTimeoutExtend((liveData as any).allowSessionTimeoutExtend ?? false);
      setEnableEmployeeLogReport((liveData as any).enableEmployeeLogReport ?? false);
      
      // Regional Client Info settings
      setRegionalOfficeName((liveData as any).regionalClientInfo?.officeName || '');
      setRegionalContactName((liveData as any).regionalClientInfo?.contactName || '');
      setRegionalContactEmail((liveData as any).regionalClientInfo?.contactEmail || '');
      setRegionalContactPhone((liveData as any).regionalClientInfo?.contactPhone || '');
      setRegionalAddressLine1((liveData as any).regionalClientInfo?.addressLine1 || '');
      setRegionalAddressLine2((liveData as any).regionalClientInfo?.addressLine2 || '');
      setRegionalAddressLine3((liveData as any).regionalClientInfo?.addressLine3 || '');
      setRegionalCity((liveData as any).regionalClientInfo?.city || '');
      setRegionalCountryState((liveData as any).regionalClientInfo?.countryState || '');
      setRegionalTaxId((liveData as any).regionalClientInfo?.taxId || '');
      
      // Authentication settings
      setDisableDirectAccessAuth((liveData as any).disableDirectAccessAuth ?? false);
      setSsoProvider((liveData as any).ssoProvider || '');
      setSsoClientOfficeName((liveData as any).ssoClientOfficeName || '');
      
      // Additional Optional Fields
      setShippingMode(liveData.settings?.shippingMode || 'employee');
      setDefaultShippingAddress(liveData.settings?.defaultShippingAddress || '');
      setWelcomeMessage(liveData.settings?.welcomeMessage || '');
      setEnableWelcomePage(liveData.settings?.enableWelcomePage ?? false);
      setWelcomePageTitle(liveData.settings?.welcomePageContent?.title || '');
      setWelcomePageMessage(liveData.settings?.welcomePageContent?.message || '');
      setWelcomePageAuthorName(liveData.settings?.welcomePageContent?.authorName || '');
      setWelcomePageAuthorTitle(liveData.settings?.welcomePageContent?.authorTitle || '');
      setWelcomePageImageUrl(liveData.settings?.welcomePageContent?.imageUrl || '');
      setAllowedCountries(liveData.settings?.allowedCountries || []);
      setEnableAddressValidation(liveData.settings?.addressValidation?.enabled ?? false);
      setAddressValidationProvider(liveData.settings?.addressValidation?.provider || 'none');
      setSkipReviewPage(liveData.settings?.skipReviewPage ?? false);
      
      // Reset change tracking
      setHasChanges(false);
      setShowDiscardModal(false);
      
      toast.success('Draft discarded', {
        description: 'All changes have been reverted to the published version.'
      });
      
    } catch (error: unknown) {
      console.error('[SiteConfiguration] Error discarding draft:', error);
      
      toast.error('Failed to discard draft', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setIsDiscarding(false);
    }
  };

  // Handle unsaved changes modal - Save and continue
  const handleSaveUnsavedChanges = async () => {
    await handleAutoSave();
    setShowUnsavedChangesModal(false);
    if (pendingModeSwitch) {
      await handleModeToggle(pendingModeSwitch);
      setPendingModeSwitch(null);
    }
  };

  // Handle unsaved changes modal - Discard and continue
  const handleDiscardUnsavedChanges = () => {
    setHasChanges(false);
    setShowUnsavedChangesModal(false);
    if (pendingModeSwitch) {
      handleModeToggle(pendingModeSwitch);
      setPendingModeSwitch(null);
    }
  };

  // SSO Validation Functions
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateOAuthFields = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!ssoClientId?.trim()) {
      errors.clientId = 'Client ID is required';
    }
    
    if (!ssoClientSecret?.trim()) {
      errors.clientSecret = 'Client Secret is required';
    }
    
    if (!ssoAuthUrl?.trim()) {
      errors.authUrl = 'Authorization URL is required';
    } else if (!isValidUrl(ssoAuthUrl)) {
      errors.authUrl = 'Please enter a valid URL';
    }
    
    if (!ssoTokenUrl?.trim()) {
      errors.tokenUrl = 'Token URL is required';
    } else if (!isValidUrl(ssoTokenUrl)) {
      errors.tokenUrl = 'Please enter a valid URL';
    }
    
    return errors;
  };

  const validateSAMLFields = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!ssoIdpEntryPoint?.trim()) {
      errors.idpEntryPoint = 'IdP Entry Point is required';
    } else if (!isValidUrl(ssoIdpEntryPoint)) {
      errors.idpEntryPoint = 'Please enter a valid URL';
    }
    
    if (!ssoEntityId?.trim()) {
      errors.entityId = 'Entity ID is required';
    }
    
    if (!ssoCertificate?.trim()) {
      errors.certificate = 'X.509 Certificate is required';
    }
    
    return errors;
  };

  // SSO State Transition Handlers
  const handleSaveConfiguration = () => {
    const providerCategory = getProviderCategory(ssoProvider);
    const errors = providerCategory === 'oauth' 
      ? validateOAuthFields()
      : validateSAMLFields();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix validation errors before saving');
      return;
    }
    
    setSsoConfigured(true);
    setSsoEditMode(false);
    setValidationErrors({});
    setHasChanges(true);
    toast.success('SSO configuration saved successfully');
  };

  const handleEditConfiguration = () => {
    setSsoEditMode(true);
  };

  const handleCancelEdit = () => {
    setSsoEditMode(false);
    setValidationErrors({});
    toast.info('Changes discarded');
  };

  const handleDisableSSO = () => {
    if (confirm('Are you sure you want to disable SSO? Users will no longer be able to authenticate through your identity provider.')) {
      setSsoProvider('');
      setSsoConfigured(false);
      setSsoEditMode(false);
      setSsoClientId('');
      setSsoClientSecret('');
      setSsoAuthUrl('');
      setSsoTokenUrl('');
      setSsoUserInfoUrl('');
      setSsoScope('openid profile email');
      setSsoIdpEntryPoint('');
      setSsoEntityId('');
      setSsoCertificate('');
      setValidationErrors({});
      setHasChanges(true);
      toast.success('SSO has been disabled');
    }
  };

  const handleProviderChange = (newProvider: string) => {
    setSsoProvider(newProvider);
    setValidationErrors({});
    setHasChanges(true);
  };

  // Helper function to build current state for comparison
  // This ensures consistent format between saves and comparisons
  const buildCurrentStateForComparison = () => {
    const formatDateForDB = (dateStr: string) => {
      if (!dateStr) return null;
      return new Date(dateStr).toISOString();
    };
    
    return {
      name: siteName,
      slug: siteUrl,
      type: siteType,
      branding: {
        primaryColor,
        secondaryColor,
        tertiaryColor,
      },
      settings: {
        allowQuantitySelection,
        showPricing,
        skipLandingPage: !enableLandingPage,
        giftsPerUser,
        validationMethod,
        defaultLanguage,
        defaultCurrency,
        defaultCountry,
        availabilityStartDate: formatDateForDB(availabilityStartDate),
        availabilityEndDate: formatDateForDB(availabilityEndDate),
        expiredMessage,
        defaultGiftId: defaultGiftId || null,
        defaultGiftDaysAfterClose,
        showHeader,
        showFooter,
        headerLayout,
        showLanguageSelector,
        companyName,
        footerText,
        enableSearch,
        enableFilters,
        gridColumns,
        showDescription,
        sortOptions,
        shippingMode,
        defaultShippingAddress,
        welcomeMessage,
        enableWelcomePage,
        skipReviewPage,
        ssoConfig: {
          clientId: ssoClientId,
          clientSecret: ssoClientSecret,
          authUrl: ssoAuthUrl,
          tokenUrl: ssoTokenUrl,
          userInfoUrl: ssoUserInfoUrl,
          scope: ssoScope,
          idpEntryPoint: ssoIdpEntryPoint,
          entityId: ssoEntityId,
          certificate: ssoCertificate,
          autoProvision: ssoAutoProvision,
          allowAdminBypass,
          bypassRequires2FA,
          bypassAllowedIPs: bypassAllowedIPs ? bypassAllowedIPs.split('\n').filter((ip: string) => ip.trim()) : []
        }
      },
      siteCode,
      siteErpIntegration,
      siteErpInstance,
      siteShipFromCountry,
      siteHrisSystem,
      siteDropDownName,
      siteCustomDomainUrl,
      siteAccountManager,
      siteAccountManagerEmail,
      siteCelebrationsEnabled,
      allowSessionTimeoutExtend,
      enableEmployeeLogReport,
      disableDirectAccessAuth,
      ssoProvider,
    };
  };

  if (!currentSite) {
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

  // Show warning if client is missing but allow configuration
  const showClientWarning = !currentClient;

  return (
    <div className="space-y-6">
      {/* Client Missing Warning */}
      {showClientWarning && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong className="block mb-1">Client Information Missing</strong>
            <p className="text-sm">
              This site doesn't have a client assigned. Some features may not work correctly. 
              Please update the site's clientId in the database or contact your administrator.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Site Context Header - Sticky */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-0 z-40 shadow-md backdrop-blur-sm bg-white/95">
        <div className="flex items-center justify-between">
          {/* Site Info with Switcher */}
          <div className="flex items-center gap-4">
            {/* Site Logo/Icon */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ backgroundColor: currentSite?.branding?.primaryColor || '#D91C81' }}
            >
              {currentClient?.name?.substring(0, 2).toUpperCase()}
            </div>
            
            {/* Site Details */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <Link to="/admin/sites" className="hover:text-[#D91C81] transition-colors">
                  {currentClient?.name}
                </Link>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {currentSite.domain || 'No domain'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{currentSite.name}</h1>
                
                {/* View Live Site - Moved here next to site name */}
                {currentSite.status === 'active' && currentSite.slug && (
                  <a
                    href={getPublicSiteUrlBySlug(currentSite.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">View Live</span>
                  </a>
                )}
                
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
            
            {/* Live/Draft Mode Toggle - Always editable, auto-switches to draft */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeToggle('live')}
                disabled={currentSite.status === 'draft'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  configMode === 'live'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title={currentSite.status === 'draft' ? 'Publish site first to view live mode' : 'View live configuration'}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Live</span>
              </button>
              <button
                onClick={() => handleModeToggle('draft')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  configMode === 'draft'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Edit configuration (auto-switches when you make changes)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
            
            {/* Info message when in live mode - only show if no draft exists */}
            {configMode === 'live' && currentSite.status === 'active' && !currentSite._hasUnpublishedChanges && !(currentSite as any).draftSettings && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Start editing to create a draft</span>
                <span className="sm:hidden">Edit to create draft</span>
              </div>
            )}
            
            {/* Unpublished Changes Indicator - Show in live mode when draft changes exist */}
            {configMode === 'live' && (currentSite._hasUnpublishedChanges || (currentSite as any).draftSettings) && (
              <UnpublishedChangesIndicator 
                onNavigateToDraft={() => handleModeToggle('draft')}
              />
            )}

            {/* Publish Button - Show in draft mode when there are unpublished changes (saved or unsaved) */}
            {configMode === 'draft' && (currentSite.status === 'draft' || hasChanges || currentSite._hasUnpublishedChanges || (currentSite as any).draftSettings) && (
              <Button
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isPublishing || hasChanges}
                size="default"
                title={hasChanges ? 'Save changes before publishing' : 'Publish site to make it live'}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Publish Site</span>
                    <span className="sm:hidden">Publish</span>
                  </>
                )}
              </Button>
            )}
            
            {/* Discard Draft Button - Only show in draft mode if there are saved draft changes */}
            {configMode === 'draft' && !hasChanges && (currentSite._hasUnpublishedChanges || (currentSite as any).draftSettings) && (
              <Button
                onClick={handleDiscardDraft}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                size="default"
                title="Discard all draft changes and revert to live version"
              >
                <History className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Discard Draft</span>
                <span className="sm:hidden">Discard</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {configMode === 'draft' && currentSite.status === 'draft' && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>✏️ Draft Mode:</strong> This site is not published yet. Configure your settings below, then click "Publish Site" in the header when ready.
          </AlertDescription>
        </Alert>
      )}
      
      {configMode === 'draft' && currentSite.status === 'active' && hasChanges && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>✏️ Editing Draft:</strong> You have unsaved changes. Remember to save before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      {/* Site Type Selector - Determines configuration template */}
      <Card className="border-2 border-[#D91C81]/20 bg-gradient-to-br from-pink-50 to-white mb-8">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-[#D91C81]" />
            <h3 className="text-lg font-semibold">Site Type</h3>
            <span className="text-sm text-gray-600 ml-2">— Select the type of site to show relevant configuration options</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column - Site Type Selector */}
            <div className="w-full">
              <CustomSelect
                value={siteType}
                onChange={(value) => {
                  setSiteType(value as any);
                  setHasChanges(true);
                }}
                disabled={configMode === 'live'}
                options={[
                  { value: 'event-gifting', label: '🎉 Event Gifting' },
                  { value: 'onboarding-kit', label: '👋 Employee Onboarding Kit' },
                  { value: 'service-awards', label: '🏆 Service Awards' },
                  { value: 'incentives', label: '💎 Incentives & Rewards' },
                  { value: 'custom', label: '⚙️ Custom Configuration' }
                ]}
              />
            </div>

            {/* Right Column - Info Box */}
            <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-1.5 text-sm">
                {siteType === 'event-gifting' && '🎉 Event Gifting'}
                {siteType === 'onboarding-kit' && '👋 Employee Onboarding Kit'}
                {siteType === 'service-awards' && '🏆 Service Awards'}
                {siteType === 'incentives' && '💎 Incentives & Rewards'}
                {siteType === 'custom' && '⚙️ Custom Configuration'}
              </h4>
              <ul className="text-xs text-blue-900 space-y-1">
                {siteType === 'event-gifting' && (
                  <>
                    <li>• Perfect for corporate events and conferences</li>
                    <li>• Time-limited gift selection windows</li>
                    <li>• Bulk gift distribution for attendees</li>
                    <li>• Event-specific branding and messaging</li>
                  </>
                )}
                {siteType === 'onboarding-kit' && (
                  <>
                    <li>• Streamline new hire onboarding process</li>
                    <li>• Customizable welcome kits and swag</li>
                    <li>• Automated delivery to new employees</li>
                    <li>• First-day experience enhancement</li>
                  </>
                )}
                {siteType === 'service-awards' && (
                  <>
                    <li>• Recognize employee milestones</li>
                    <li>• Years of service celebrations</li>
                    <li>• Tiered reward options by tenure</li>
                    <li>• Automated anniversary notifications</li>
                  </>
                )}
                {siteType === 'incentives' && (
                  <>
                    <li>• Drive performance with rewards</li>
                    <li>• Points-based incentive programs</li>
                    <li>• Goal achievement recognition</li>
                    <li>• Flexible redemption options</li>
                  </>
                )}
                {siteType === 'custom' && (
                  <>
                    <li>• Fully customizable configuration</li>
                    <li>• Flexible settings for any use case</li>
                    <li>• No predefined templates or restrictions</li>
                    <li>• Complete control over all options</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
              value="branding" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Palette className="w-4 h-4 flex-shrink-0" />
              <span>Branding</span>
            </TabsTrigger>
            <TabsTrigger 
              value="header-footer" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Layout className="w-4 h-4 flex-shrink-0" />
              <span>Header/Footer</span>
            </TabsTrigger>
            <TabsTrigger 
              value="landing" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Rocket className="w-4 h-4 flex-shrink-0" />
              <span>Landing</span>
            </TabsTrigger>
            <TabsTrigger 
              value="access" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>Access</span>
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
              value="review" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Eye className="w-4 h-4 flex-shrink-0" />
              <span>Review Order</span>
            </TabsTrigger>
            <TabsTrigger 
              value="confirmation" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Order Confirmation</span>
            </TabsTrigger>
            <TabsTrigger 
              value="page-content" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap data-[state=active]:bg-[#D91C81] data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span>Page Content</span>
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
              {siteUrl && (
                <div className="flex items-center gap-2 text-sm p-3 bg-green-50 rounded-lg border border-green-200">
                  <Globe className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">
                    Your site will be accessible at:{' '}
                    <a 
                      href={getPublicSiteUrlBySlug(siteUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {getPublicSiteUrlBySlug(siteUrl)}
                    </a>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
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
                    disabled={false}
                    placeholder="Enter site name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Site URL Slug
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {getEnvironmentBaseUrl()}/site/
                      </span>
                      <Input
                        type="text"
                        value={siteUrl}
                        onChange={(e) => {
                          // Only allow lowercase letters, numbers, and hyphens
                          const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          setSiteUrl(slug);
                          setHasChanges(true);
                        }}
                        disabled={false}
                        placeholder="techcorpus"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Lowercase letters, numbers, and hyphens only
                    </p>
                  </div>
                </div>
              </div>

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
                  <p className="text-xs text-gray-500 mt-1">Display name for multi-site dropdown (max 100 chars)</p>
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
                  <p className="text-xs text-gray-500 mt-1">Custom domain for this site</p>
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
                  <p className="text-xs text-gray-500 mt-1">Primary contact for this site</p>
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
                  <p className="text-xs text-gray-500 mt-1">Contact email for account manager</p>
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
                    disabled={false}
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
                    disabled={false}
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
                  disabled={false}
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
                    disabled={false}
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
                    disabled={false}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Select ERP System</option>
                    <option value="NXJ">NXJ</option>
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
                    placeholder="e.g., NXJ, Fourgen"
                    disabled={false}
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
                    disabled={false}
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
                    disabled={false}
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
                Configure feature toggles and site behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      disabled={false}
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
                      disabled={false}
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
                      disabled={false}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ========== INTERNATIONALIZATION & REGIONAL SETTINGS ========== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00B4CC]" />
                Internationalization & Regional Settings
              </CardTitle>
              <CardDescription>
                Language, currency, regional settings, and allowed countries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language, Currency, Country */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Default Settings</h3>
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
                      disabled={false}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="en">English</option>
                      <option value="en-GB">English (British)</option>
                      <option value="es">Spanish</option>
                      <option value="es-MX">Spanish (Mexican)</option>
                      <option value="fr">French</option>
                      <option value="fr-CA">French (Canadian)</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt-BR">Portuguese (Brazilian)</option>
                      <option value="pt-PT">Portuguese (Portugal)</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese (Simplified)</option>
                      <option value="zh-TW">Chinese (Traditional)</option>
                      <option value="hi">Hindi</option>
                      <option value="ko">Korean</option>
                      <option value="pl">Polish</option>
                      <option value="ru">Russian</option>
                      <option value="ar">Arabic</option>
                      <option value="he">Hebrew</option>
                      <option value="ta">Tamil</option>
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
                      disabled={false}
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
                      disabled={false}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="IT">Italy</option>
                      <option value="ES">Spain</option>
                      <option value="NL">Netherlands</option>
                      <option value="BE">Belgium</option>
                      <option value="CH">Switzerland</option>
                      <option value="AT">Austria</option>
                      <option value="SE">Sweden</option>
                      <option value="NO">Norway</option>
                      <option value="DK">Denmark</option>
                      <option value="FI">Finland</option>
                      <option value="IE">Ireland</option>
                      <option value="PL">Poland</option>
                      <option value="PT">Portugal</option>
                      <option value="GR">Greece</option>
                      <option value="CZ">Czech Republic</option>
                      <option value="HU">Hungary</option>
                      <option value="RO">Romania</option>
                      <option value="BG">Bulgaria</option>
                      <option value="HR">Croatia</option>
                      <option value="SK">Slovakia</option>
                      <option value="SI">Slovenia</option>
                      <option value="LT">Lithuania</option>
                      <option value="LV">Latvia</option>
                      <option value="EE">Estonia</option>
                      <option value="LU">Luxembourg</option>
                      <option value="MT">Malta</option>
                      <option value="CY">Cyprus</option>
                      <option value="IS">Iceland</option>
                      <option value="NZ">New Zealand</option>
                      <option value="SG">Singapore</option>
                      <option value="HK">Hong Kong</option>
                      <option value="JP">Japan</option>
                      <option value="KR">South Korea</option>
                      <option value="CN">China</option>
                      <option value="IN">India</option>
                      <option value="MY">Malaysia</option>
                      <option value="TH">Thailand</option>
                      <option value="ID">Indonesia</option>
                      <option value="PH">Philippines</option>
                      <option value="VN">Vietnam</option>
                      <option value="AE">United Arab Emirates</option>
                      <option value="SA">Saudi Arabia</option>
                      <option value="IL">Israel</option>
                      <option value="TR">Turkey</option>
                      <option value="ZA">South Africa</option>
                      <option value="EG">Egypt</option>
                      <option value="NG">Nigeria</option>
                      <option value="KE">Kenya</option>
                      <option value="MX">Mexico</option>
                      <option value="BR">Brazil</option>
                      <option value="AR">Argentina</option>
                      <option value="CL">Chile</option>
                      <option value="CO">Colombia</option>
                      <option value="PE">Peru</option>
                      <option value="VE">Venezuela</option>
                      <option value="UY">Uruguay</option>
                      <option value="PY">Paraguay</option>
                      <option value="BO">Bolivia</option>
                      <option value="EC">Ecuador</option>
                      <option value="CR">Costa Rica</option>
                      <option value="PA">Panama</option>
                      <option value="GT">Guatemala</option>
                      <option value="DO">Dominican Republic</option>
                      <option value="PR">Puerto Rico</option>
                      <option value="RU">Russia</option>
                      <option value="UA">Ukraine</option>
                      <option value="BY">Belarus</option>
                      <option value="KZ">Kazakhstan</option>
                      <option value="RS">Serbia</option>
                      <option value="BA">Bosnia and Herzegovina</option>
                      <option value="MK">North Macedonia</option>
                      <option value="AL">Albania</option>
                      <option value="ME">Montenegro</option>
                      <option value="XK">Kosovo</option>
                      <option value="MD">Moldova</option>
                      <option value="GE">Georgia</option>
                      <option value="AM">Armenia</option>
                      <option value="AZ">Azerbaijan</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Language Configuration */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Language Configuration</h3>
                <MultiLanguageSelector
                  selectedLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                  onChange={(languages) => {
                    if (configMode === 'draft') {
                      setDraftAvailableLanguages(languages);
                    } else {
                      setAvailableLanguages(languages);
                    }
                    setHasChanges(true);
                  }}
                  defaultLanguage={defaultLanguage}
                  onDefaultChange={(language) => {
                    setDefaultLanguage(language);
                    setHasChanges(true);
                  }}
                />
              </div>

              {/* Translation Progress */}
              <div className="border-t border-gray-200 pt-6">
                <TranslationProgress
                  translations={currentSite?.translations || {}}
                  availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                  requiredFields={[
                    'header.logoAlt',
                    'header.homeLink',
                    'welcomePage.title',
                    'welcomePage.message',
                    'landingPage.heroTitle',
                    'catalogPage.title',
                    'footer.text'
                  ]}
                />
              </div>

              {/* Allowed Countries */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Regional Restrictions</h3>
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
                    disabled={false}
                    placeholder="US, CA, GB, DE (leave empty for all countries)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated ISO country codes. Leave empty to allow all countries.
                  </p>
                </div>
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
                    disabled={false}
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
                    disabled={false}
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
                    disabled={false}
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
                    disabled={false}
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
                      disabled={false}
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
                      disabled={false}
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
                      disabled={false}
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
                        disabled={false}
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
                        disabled={false}
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
                      disabled={false}
                      placeholder="GB123456789"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tax identification number for this region</p>
                  </div>
                </div>
              </div>
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
                    disabled={false}
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
                  disabled={false}
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
                    disabled={false}
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
                  disabled={false}
                  placeholder="Enter company name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Displayed next to the logo in the header
                </p>
              </div>

              {/* Header Translatable Content */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Header Content (Multi-Language)</h3>
                
                <div className="space-y-4">
                  <TranslatableInput
                    label="Logo Alt Text"
                    value={translations?.header?.logoAlt || {}}
                    onChange={(language, value) => updateTranslation('header.logoAlt', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    required={true}
                    placeholder="Company Logo"
                  />

                  <TranslatableInput
                    label="Home Link Text"
                    value={translations?.header?.homeLink || {}}
                    onChange={(language, value) => updateTranslation('header.homeLink', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    required={true}
                    placeholder="Home"
                  />

                  <TranslatableInput
                    label="Products Link Text"
                    value={translations?.header?.productsLink || {}}
                    onChange={(language, value) => updateTranslation('header.productsLink', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    placeholder="Products"
                  />

                  <TranslatableInput
                    label="About Link Text"
                    value={translations?.header?.aboutLink || {}}
                    onChange={(language, value) => updateTranslation('header.aboutLink', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    placeholder="About"
                  />

                  <TranslatableInput
                    label="Contact Link Text"
                    value={translations?.header?.contactLink || {}}
                    onChange={(language, value) => updateTranslation('header.contactLink', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    placeholder="Contact"
                  />

                  <TranslatableInput
                    label="CTA Button Text"
                    value={translations?.header?.ctaButton || {}}
                    onChange={(language, value) => updateTranslation('header.ctaButton', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    placeholder="Get Started"
                  />
                </div>
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
                    disabled={false}
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
                  disabled={false}
                  placeholder="© 2026 All rights reserved."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Copyright or legal text displayed in footer
                </p>
              </div>

              {/* Footer Translatable Content */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Footer Content (Multi-Language)</h3>
                
                <div className="space-y-4">
                  <TranslatableTextarea
                    label="Footer Text"
                    value={translations?.footer?.text || {}}
                    onChange={(language, value) => updateTranslation('footer.text', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    rows={2}
                    placeholder="© 2026 All rights reserved."
                  />

                  <TranslatableInput
                    label="Privacy Link Text"
                    value={translations?.footer?.privacyLink || {}}
                    onChange={(language, value) => updateTranslation('footer.privacyLink', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    placeholder="Privacy Policy"
                  />

                  <TranslatableInput
                    label="Terms Link Text"
                    value={translations?.footer?.termsLink || {}}
                    onChange={(language, value) => updateTranslation('footer.termsLink', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    placeholder="Terms of Service"
                  />

                  <TranslatableInput
                    label="Contact Link Text"
                    value={translations?.footer?.contactLink || {}}
                    onChange={(language, value) => updateTranslation('footer.contactLink', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    placeholder="Contact Us"
                  />
                </div>
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
                      disabled={false}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={false}
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
                      disabled={false}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => {
                        setSecondaryColor(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={false}
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
                      disabled={false}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Input
                      type="text"
                      value={tertiaryColor}
                      onChange={(e) => {
                        setTertiaryColor(e.target.value);
                        setHasChanges(true);
                      }}
                      disabled={false}
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
                  disabled={false}
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
                  disabled={false}
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
                    disabled={false}
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
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gifts Per User
                </label>
                <div className="flex items-center gap-3">
                  {/* Minus Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (giftsPerUser > 1) {
                        setGiftsPerUser(giftsPerUser - 1);
                        setHasChanges(true);
                      }
                    }}
                    disabled={configMode === 'live' || giftsPerUser <= 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-[#D91C81] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-colors"
                    aria-label="Decrease gifts per user"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  {/* Editable Input */}
                  <div className="relative flex-1 max-w-[120px]">
                    <Input
                      type="number"
                      value={giftsPerUser}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        // Ensure value is at least 1 (database constraint)
                        if (!isNaN(value) && value >= 1) {
                          setGiftsPerUser(value);
                          setHasChanges(true);
                        } else if (e.target.value === '') {
                          // Allow empty input temporarily, will default to 1 on save
                          setGiftsPerUser(1);
                          setHasChanges(true);
                        }
                      }}
                      disabled={false}
                      min="1"
                      className="text-center text-lg font-semibold"
                      placeholder="1"
                    />
                  </div>
                  
                  {/* Plus Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setGiftsPerUser(giftsPerUser + 1);
                      setHasChanges(true);
                    }}
                    disabled={false}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-[#D91C81] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-colors"
                    aria-label="Increase gifts per user"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of gifts each user can select (minimum 1)
                </p>
              </div>
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
                  value={defaultGiftId || ''}
                  onChange={(e) => {
                    setDefaultGiftId(e.target.value || null);
                    setHasChanges(true);
                  }}
                  disabled={false}
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
                    disabled={false}
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
                    disabled={false}
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
                    disabled={false}
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
                  disabled={false}
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
                    disabled={false}
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
                        disabled={false}
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

          {/* Landing Page Enable/Disable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-600" />
                Landing Page Configuration
              </CardTitle>
              <CardDescription>
                Configure landing page visibility (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Enable Landing Page</p>
                  <p className="text-sm text-gray-600">Show landing page before authentication</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={enableLandingPage}
                    onChange={(e) => {
                      setEnableLandingPage(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {enableLandingPage && (
            <>
              {/* Landing Page Translatable Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#D91C81]" />
                    Landing Page Content (Multi-Language)
                  </CardTitle>
                  <CardDescription>
                    Configure hero section text in multiple languages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TranslatableInput
                    label="Hero Title"
                    value={translations?.landingPage?.heroTitle || {}}
                    onChange={(language, value) => updateTranslation('landingPage.heroTitle', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    required={true}
                    placeholder="Welcome to Our Gift Program"
                  />

                  <TranslatableInput
                    label="Hero Subtitle"
                    value={translations?.landingPage?.heroSubtitle || {}}
                    onChange={(language, value) => updateTranslation('landingPage.heroSubtitle', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    placeholder="Select your perfect gift"
                  />

                  <TranslatableInput
                    label="Hero CTA Button"
                    value={translations?.landingPage?.heroCTA || {}}
                    onChange={(language, value) => updateTranslation('landingPage.heroCTA', language, value)}
                    availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                    defaultLanguage={defaultLanguage}
                    required={true}
                    placeholder="Get Started"
                  />
                </CardContent>
              </Card>

              <Suspense fallback={<LoadingSpinner />}>
                <LandingPageEditor />
              </Suspense>
            </>
          )}
        </TabsContent>

        {/* Welcome Page Tab */}
        <TabsContent value="welcome" className="space-y-6">
          {/* Welcome Page Configuration */}
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
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              {enableWelcomePage && (
                <>
                  {/* Welcome Page Translatable Content */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Welcome Page Content (Multi-Language)</h3>
                    
                    <div className="space-y-4">
                      <TranslatableInput
                        label="Page Title"
                        value={translations?.welcomePage?.title || {}}
                        onChange={(language, value) => updateTranslation('welcomePage.title', language, value)}
                        availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                        defaultLanguage={defaultLanguage}
                        required={true}
                        placeholder="Welcome!"
                      />

                      <TranslatableTextarea
                        label="Welcome Message"
                        value={translations?.welcomePage?.message || {}}
                        onChange={(language, value) => updateTranslation('welcomePage.message', language, value)}
                        availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                        defaultLanguage={defaultLanguage}
                        rows={4}
                        placeholder="Thank you for your dedication and hard work..."
                      />

                      <TranslatableInput
                        label="Button Text"
                        value={translations?.welcomePage?.buttonText || {}}
                        onChange={(language, value) => updateTranslation('welcomePage.buttonText', language, value)}
                        availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                        defaultLanguage={defaultLanguage}
                        required={true}
                        placeholder="Continue"
                      />
                    </div>
                  </div>

                  {/* Non-translatable fields */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Additional Settings</h3>
                    
                    <div className="space-y-4">
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
                          disabled={false}
                          placeholder="https://..."
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
                            disabled={false}
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
                            disabled={false}
                            placeholder="Chief Executive Officer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Visual Editor */}
          <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-start gap-3">
              <Layout className="w-5 h-5 text-[#D91C81] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Visual Editor</h3>
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
                <h3 className="font-semibold text-gray-900 mb-1">Access & Authentication</h3>
                <p className="text-sm text-gray-700">
                  Configure how users access your site - from simple validation to enterprise SSO
                </p>
              </div>
            </div>
          </div>

          {/* Authentication Type Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D91C81]" />
                Authentication Method
              </CardTitle>
              <CardDescription>Choose between simple validation or advanced authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    // Set to simple auth method if currently SSO
                    if (validationMethod === 'sso') {
                      setIsUserInitiatedChange(true);
                      setValidationMethod('email');
                      setHasChanges(true);
                    }
                  }}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    validationMethod !== 'sso'
                      ? 'border-[#D91C81] bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Mail className="w-6 h-6 text-[#D91C81] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Simple Auth</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        For sites without full employee data. Quick validation methods.
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Email validation</li>
                        <li>• Serial card numbers</li>
                        <li>• Magic links</li>
                      </ul>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsUserInitiatedChange(true);
                    setValidationMethod('sso');
                    setHasChanges(true);
                  }}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    validationMethod === 'sso'
                      ? 'border-[#D91C81] bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Lock className="w-6 h-6 text-[#1B2A5E] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Advanced Auth</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        For sites with employee data. Enterprise-grade security.
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Single Sign-On (SSO)</li>
                        <li>• User/Password authentication</li>
                        <li>• Roles & access groups</li>
                      </ul>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Access Validation Page Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#D91C81]" />
                Access Validation Page Content (Multi-Language)
              </CardTitle>
              <CardDescription>
                Configure the text displayed on the access validation page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.accessPage?.title || {}}
                onChange={(language, value) => updateTranslation('accessPage.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required={true}
                placeholder="Verify Your Access"
              />

              <TranslatableTextarea
                label="Description"
                value={translations?.accessPage?.description || {}}
                onChange={(language, value) => updateTranslation('accessPage.description', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                rows={3}
                placeholder="Please enter your information to access the gift selection portal."
              />

              <TranslatableInput
                label="Button Text"
                value={translations?.accessPage?.buttonText || {}}
                onChange={(language, value) => updateTranslation('accessPage.buttonText', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required={true}
                placeholder="Continue"
              />

              <TranslatableInput
                label="Error Message"
                value={translations?.accessPage?.errorMessage || {}}
                onChange={(language, value) => updateTranslation('accessPage.errorMessage', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required={true}
                placeholder="Invalid credentials. Please try again."
              />

              <TranslatableInput
                label="Success Message"
                value={translations?.accessPage?.successMessage || {}}
                onChange={(language, value) => updateTranslation('accessPage.successMessage', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required={true}
                placeholder="Access granted! Redirecting..."
              />
            </CardContent>
          </Card>

          {/* Simple Auth Configuration */}
          {validationMethod !== 'sso' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#D91C81]" />
                    Simple Authentication Settings
                  </CardTitle>
                  <CardDescription>Choose a validation method for user access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Validation Method
                    </label>
                    <select
                      value={validationMethod}
                      onChange={(e) => {
                        setValidationMethod(e.target.value as any);
                        setHasChanges(true);
                      }}
                      disabled={false}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="email">Email Address Validation</option>
                      <option value="serialCard">Serial Card Number</option>
                      <option value="magic_link">Magic Link (Email)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {validationMethod === 'email' && 'Users verify their email address to access the portal'}
                      {validationMethod === 'serialCard' && 'Users enter a unique serial card number'}
                      {validationMethod === 'magic_link' && 'Users request a magic link sent to their email'}
                    </p>
                  </div>

                  {/* Serial Card settings */}
                  {validationMethod === 'serialCard' && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Serial Card Configuration</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Users will need to enter a unique serial card number to access the site.
                      </p>
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 text-sm">
                          <strong>Note:</strong> Serial card numbers must be uploaded via the employee management section below.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Employee Management for Simple Auth */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Employee Management
                  </CardTitle>
                  <CardDescription>
                    Manage employee access and validation credentials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AccessManagement 
                      mode="simple"
                      validationMethod={validationMethod}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            </>
          )}

          {/* Advanced Auth Configuration (SSO) */}
          {validationMethod === 'sso' && (
            <>
              <SSOConfigCard
                ssoProvider={ssoProvider}
                ssoConfigured={ssoConfigured}
                ssoEditMode={ssoEditMode}
                ssoClientId={ssoClientId}
                ssoClientSecret={ssoClientSecret}
                ssoAuthUrl={ssoAuthUrl}
                ssoTokenUrl={ssoTokenUrl}
                ssoUserInfoUrl={ssoUserInfoUrl}
                ssoScope={ssoScope}
                ssoIdpEntryPoint={ssoIdpEntryPoint}
                ssoEntityId={ssoEntityId}
                ssoCertificate={ssoCertificate}
                ssoAutoProvision={ssoAutoProvision}
                allowAdminBypass={allowAdminBypass}
                bypassRequires2FA={bypassRequires2FA}
                bypassAllowedIPs={bypassAllowedIPs}
                validationErrors={validationErrors}
                configMode={configMode}
                currentSiteDomain={currentSite.domain}
                siteUrl={siteUrl}
                setSsoProvider={setSsoProvider}
                setSsoClientId={setSsoClientId}
                setSsoClientSecret={setSsoClientSecret}
                setSsoAuthUrl={setSsoAuthUrl}
                setSsoTokenUrl={setSsoTokenUrl}
                setSsoUserInfoUrl={setSsoUserInfoUrl}
                setSsoScope={setSsoScope}
                setSsoIdpEntryPoint={setSsoIdpEntryPoint}
                setSsoEntityId={setSsoEntityId}
                setSsoCertificate={setSsoCertificate}
                setSsoAutoProvision={setSsoAutoProvision}
                setAllowAdminBypass={setAllowAdminBypass}
                setBypassRequires2FA={setBypassRequires2FA}
                setBypassAllowedIPs={setBypassAllowedIPs}
                setHasChanges={setHasChanges}
                handleProviderChange={handleProviderChange}
                handleSaveConfiguration={handleSaveConfiguration}
                handleEditConfiguration={handleEditConfiguration}
                handleCancelEdit={handleCancelEdit}
                handleDisableSSO={handleDisableSSO}
                getUIState={getUIState}
                getProviderCategory={getProviderCategory}
                getProviderDisplayName={getProviderDisplayName}
                getPublicSiteUrlBySlug={getPublicSiteUrlBySlug}
              />


              {/* Employee Management for Advanced Auth */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Employee Management & Access Groups
                  </CardTitle>
                  <CardDescription>
                    Manage employees, roles, and access permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AccessManagement 
                      mode="advanced"
                      validationMethod="sso"
                    />
                  </Suspense>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Review Order Tab */}
        <TabsContent value="review" className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Review Order Page Configuration</h3>
                <p className="text-sm text-gray-700">
                  Customize the order review page where users confirm their selections
                </p>
              </div>
            </div>
          </div>

          {/* Skip Review Page Toggle */}
          <Card className="border-2 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Quick Checkout
              </CardTitle>
              <CardDescription>Skip the review page for faster checkout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                <div>
                  <p className="font-semibold text-gray-900">Skip Review Page</p>
                  <p className="text-sm text-gray-600">
                    Users go directly to confirmation after entering shipping details
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={skipReviewPage}
                    onChange={(e) => {
                      setSkipReviewPage(e.target.checked);
                      setHasChanges(true);
                    }}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>
              {skipReviewPage && (
                <Alert className="mt-4 border-amber-200 bg-amber-50">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-sm">
                    <strong>Note:</strong> When enabled, users will skip the review page and go directly to the order confirmation after completing shipping information. Make sure your shipping form collects all necessary information.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#D91C81]" />
                Review Page Settings
              </CardTitle>
              <CardDescription>Configure what users see when reviewing their order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Gift Images</p>
                  <p className="text-sm text-gray-600">Display product images in the review summary</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    defaultChecked
                    onChange={() => setHasChanges(true)}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Gift Prices</p>
                  <p className="text-sm text-gray-600">Display pricing information in the review</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    defaultChecked
                    onChange={() => setHasChanges(true)}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Allow Editing</p>
                  <p className="text-sm text-gray-600">Let users edit their selections from the review page</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    defaultChecked
                    onChange={() => setHasChanges(true)}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Review Page Title
                </label>
                <Input
                  type="text"
                  defaultValue="Review Your Order"
                  placeholder="Review Your Order"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Heading displayed at the top of the review page
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Review Page Description
                </label>
                <textarea
                  rows={3}
                  defaultValue="Please review your selections before submitting your order."
                  placeholder="Please review your selections before submitting your order."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Instructions or description shown to users
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Submit Button Text
                </label>
                <Input
                  type="text"
                  defaultValue="Submit Order"
                  placeholder="Submit Order"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Text displayed on the submit button
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Review Order Page Content (Multi-Language) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#D91C81]" />
                Review Order Page Content (Multi-Language)
              </CardTitle>
              <CardDescription>
                Configure the text displayed on the review order page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.reviewOrder?.title || {}}
                onChange={(language, value) => updateTranslation('reviewOrder.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required={true}
                placeholder="Review Your Order"
              />

              <TranslatableTextarea
                label="Instructions"
                value={translations?.reviewOrder?.instructions || {}}
                onChange={(language, value) => updateTranslation('reviewOrder.instructions', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                rows={3}
                placeholder="Please review your selections before submitting your order."
              />

              <TranslatableInput
                label="Confirm Button Text"
                value={translations?.reviewOrder?.confirmButton || {}}
                onChange={(language, value) => updateTranslation('reviewOrder.confirmButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required={true}
                placeholder="Submit Order"
              />

              <TranslatableInput
                label="Edit Button Text"
                value={translations?.reviewOrder?.editButton || {}}
                onChange={(language, value) => updateTranslation('reviewOrder.editButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Edit"
              />

              <TranslatableInput
                label="Shipping Label"
                value={translations?.reviewOrder?.shippingLabel || {}}
                onChange={(language, value) => updateTranslation('reviewOrder.shippingLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Shipping Address"
              />

              <TranslatableInput
                label="Items Label"
                value={translations?.reviewOrder?.itemsLabel || {}}
                onChange={(language, value) => updateTranslation('reviewOrder.itemsLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Order Items"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Terms & Conditions
              </CardTitle>
              <CardDescription>Legal agreements and disclaimers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Require Terms Acceptance</p>
                  <p className="text-sm text-gray-600">Users must agree to terms before submitting</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    defaultChecked
                    onChange={() => setHasChanges(true)}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Terms & Conditions Text
                </label>
                <textarea
                  rows={6}
                  defaultValue="By submitting this order, you agree to our terms and conditions."
                  placeholder="Enter your terms and conditions..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 font-mono text-sm"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Legal text that users must agree to
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Terms & Conditions URL (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/terms"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link to full terms and conditions document
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order Confirmation Tab */}
        <TabsContent value="confirmation" className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Order Confirmation Page Configuration</h3>
                <p className="text-sm text-gray-700">
                  Customize the confirmation page users see after submitting their order
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#D91C81]" />
                Confirmation Page Settings
              </CardTitle>
              <CardDescription>Configure the success message and next steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmation Title
                </label>
                <Input
                  type="text"
                  defaultValue="Order Confirmed!"
                  placeholder="Order Confirmed!"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Main heading on the confirmation page
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmation Message
                </label>
                <textarea
                  rows={4}
                  defaultValue="Thank you for your order! We've received your selection and will process it shortly. You'll receive a confirmation email with tracking information once your order ships."
                  placeholder="Enter confirmation message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Message displayed to users after successful order submission
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Order Number</p>
                  <p className="text-sm text-gray-600">Display the order confirmation number</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    defaultChecked
                    onChange={() => setHasChanges(true)}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Order Summary</p>
                  <p className="text-sm text-gray-600">Display a summary of selected items</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    defaultChecked
                    onChange={() => setHasChanges(true)}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Estimated Delivery</p>
                  <p className="text-sm text-gray-600">Display estimated delivery timeframe</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    defaultChecked
                    onChange={() => setHasChanges(true)}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Delivery Text
                </label>
                <Input
                  type="text"
                  defaultValue="Your order will arrive within 5-7 business days"
                  placeholder="Your order will arrive within 5-7 business days"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Delivery timeframe message
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Email Notifications
              </CardTitle>
              <CardDescription>Configure confirmation email settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Send Confirmation Email</p>
                  <p className="text-sm text-gray-600">Automatically email order confirmation to users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    defaultChecked
                    onChange={() => setHasChanges(true)}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Subject Line
                </label>
                <Input
                  type="text"
                  defaultValue="Your Order Confirmation"
                  placeholder="Your Order Confirmation"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Subject line for confirmation emails
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reply-To Email Address
                </label>
                <Input
                  type="email"
                  placeholder="support@example.com"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email address for customer replies
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Page Content (Multi-Language) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#D91C81]" />
                Confirmation Page Content (Multi-Language)
              </CardTitle>
              <CardDescription>
                Configure the text displayed on the order confirmation page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.confirmation?.title || {}}
                onChange={(language, value) => updateTranslation('confirmation.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required={true}
                placeholder="Order Confirmed!"
              />

              <TranslatableTextarea
                label="Confirmation Message"
                value={translations?.confirmation?.message || {}}
                onChange={(language, value) => updateTranslation('confirmation.message', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                rows={4}
                placeholder="Thank you for your order! We've received your selection..."
              />

              <TranslatableInput
                label="Order Number Label"
                value={translations?.confirmation?.orderNumberLabel || {}}
                onChange={(language, value) => updateTranslation('confirmation.orderNumberLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Order Number"
              />

              <TranslatableInput
                label="Tracking Label"
                value={translations?.confirmation?.trackingLabel || {}}
                onChange={(language, value) => updateTranslation('confirmation.trackingLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Tracking Number"
              />

              <TranslatableTextarea
                label="Next Steps"
                value={translations?.confirmation?.nextSteps || {}}
                onChange={(language, value) => updateTranslation('confirmation.nextSteps', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                rows={3}
                placeholder="What happens next..."
              />

              <TranslatableInput
                label="Continue Button Text"
                value={translations?.confirmation?.continueButton || {}}
                onChange={(language, value) => updateTranslation('confirmation.continueButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Return to Home"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Next Steps & Actions
              </CardTitle>
              <CardDescription>Configure what users can do after confirmation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Track Order Button</p>
                  <p className="text-sm text-gray-600">Allow users to track their order status</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    defaultChecked
                    onChange={() => setHasChanges(true)}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Show Print Receipt Button</p>
                  <p className="text-sm text-gray-600">Let users print their order confirmation</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    defaultChecked
                    onChange={() => setHasChanges(true)}
                    disabled={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Action Button Text (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Return to Dashboard"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add a custom button with your own text
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Action Button URL (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/dashboard"
                  onChange={() => setHasChanges(true)}
                  disabled={false}
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL for the custom action button
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Content Tab */}
        <TabsContent value="page-content" className="space-y-6">
          {/* Catalog/Products Page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D91C81]" />
                Catalog/Products Page
              </CardTitle>
              <CardDescription>Configure translatable content for the products catalog page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.catalogPage?.title || {}}
                onChange={(language, value) => updateTranslation('catalogPage.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required
                placeholder="Our Products"
              />

              <TranslatableTextarea
                label="Page Description"
                value={translations?.catalogPage?.description || {}}
                onChange={(language, value) => updateTranslation('catalogPage.description', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Browse our selection of products"
                rows={3}
              />

              <TranslatableInput
                label="Empty Catalog Message"
                value={translations?.catalogPage?.emptyMessage || {}}
                onChange={(language, value) => updateTranslation('catalogPage.emptyMessage', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="No products available"
              />

              <TranslatableInput
                label="Filter All Text"
                value={translations?.catalogPage?.filterAllText || {}}
                onChange={(language, value) => updateTranslation('catalogPage.filterAllText', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="All"
              />

              <TranslatableInput
                label="Search Placeholder"
                value={translations?.catalogPage?.searchPlaceholder || {}}
                onChange={(language, value) => updateTranslation('catalogPage.searchPlaceholder', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Search products..."
              />
            </CardContent>
          </Card>

          {/* Product Detail Page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D91C81]" />
                Product Detail Page
              </CardTitle>
              <CardDescription>Configure translatable content for individual product pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Back Button Text"
                value={translations?.productDetail?.backButton || {}}
                onChange={(language, value) => updateTranslation('productDetail.backButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Back to Products"
              />

              <TranslatableInput
                label="Add to Cart Button"
                value={translations?.productDetail?.addToCart || {}}
                onChange={(language, value) => updateTranslation('productDetail.addToCart', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Add to Cart"
              />

              <TranslatableInput
                label="Buy Now Button"
                value={translations?.productDetail?.buyNow || {}}
                onChange={(language, value) => updateTranslation('productDetail.buyNow', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Buy Now"
              />

              <TranslatableInput
                label="Out of Stock Message"
                value={translations?.productDetail?.outOfStock || {}}
                onChange={(language, value) => updateTranslation('productDetail.outOfStock', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Out of Stock"
              />

              <TranslatableInput
                label="Specifications Label"
                value={translations?.productDetail?.specifications || {}}
                onChange={(language, value) => updateTranslation('productDetail.specifications', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Specifications"
              />

              <TranslatableInput
                label="Description Label"
                value={translations?.productDetail?.description || {}}
                onChange={(language, value) => updateTranslation('productDetail.description', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Description"
              />
            </CardContent>
          </Card>

          {/* Checkout Page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D91C81]" />
                Checkout Page
              </CardTitle>
              <CardDescription>Configure translatable content for the checkout process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.checkoutPage?.title || {}}
                onChange={(language, value) => updateTranslation('checkoutPage.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required
                placeholder="Checkout"
              />

              <TranslatableInput
                label="Shipping Section Title"
                value={translations?.checkoutPage?.shippingTitle || {}}
                onChange={(language, value) => updateTranslation('checkoutPage.shippingTitle', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Shipping Information"
              />

              <TranslatableInput
                label="Payment Section Title"
                value={translations?.checkoutPage?.paymentTitle || {}}
                onChange={(language, value) => updateTranslation('checkoutPage.paymentTitle', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Payment Information"
              />

              <TranslatableInput
                label="Order Summary Title"
                value={translations?.checkoutPage?.orderSummary || {}}
                onChange={(language, value) => updateTranslation('checkoutPage.orderSummary', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Order Summary"
              />

              <TranslatableInput
                label="Place Order Button"
                value={translations?.checkoutPage?.placeOrderButton || {}}
                onChange={(language, value) => updateTranslation('checkoutPage.placeOrderButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Place Order"
              />

              <TranslatableInput
                label="Free Shipping Message"
                value={translations?.checkoutPage?.freeShippingMessage || {}}
                onChange={(language, value) => updateTranslation('checkoutPage.freeShippingMessage', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Free shipping on orders over $50"
              />
            </CardContent>
          </Card>

          {/* Cart Page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#D91C81]" />
                Cart Page
              </CardTitle>
              <CardDescription>Configure translatable content for the shopping cart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.cartPage?.title || {}}
                onChange={(language, value) => updateTranslation('cartPage.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required
                placeholder="Shopping Cart"
              />

              <TranslatableInput
                label="Empty Cart Message"
                value={translations?.cartPage?.emptyMessage || {}}
                onChange={(language, value) => updateTranslation('cartPage.emptyMessage', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Your cart is empty"
              />

              <TranslatableTextarea
                label="Empty Cart Description"
                value={translations?.cartPage?.emptyDescription || {}}
                onChange={(language, value) => updateTranslation('cartPage.emptyDescription', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Start shopping to add items to your cart"
                rows={2}
              />

              <TranslatableInput
                label="Browse Button"
                value={translations?.cartPage?.browseButton || {}}
                onChange={(language, value) => updateTranslation('cartPage.browseButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Browse Products"
              />

              <TranslatableInput
                label="Remove Button"
                value={translations?.cartPage?.removeButton || {}}
                onChange={(language, value) => updateTranslation('cartPage.removeButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Remove"
              />

              <TranslatableInput
                label="Clear Cart Button"
                value={translations?.cartPage?.clearCartButton || {}}
                onChange={(language, value) => updateTranslation('cartPage.clearCartButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Clear Cart"
              />

              <TranslatableInput
                label="Clear Cart Confirmation"
                value={translations?.cartPage?.clearCartConfirm || {}}
                onChange={(language, value) => updateTranslation('cartPage.clearCartConfirm', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Are you sure you want to clear your cart?"
              />

              <TranslatableInput
                label="Subtotal Label"
                value={translations?.cartPage?.subtotalLabel || {}}
                onChange={(language, value) => updateTranslation('cartPage.subtotalLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Subtotal"
              />

              <TranslatableInput
                label="Shipping Label"
                value={translations?.cartPage?.shippingLabel || {}}
                onChange={(language, value) => updateTranslation('cartPage.shippingLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Shipping"
              />

              <TranslatableInput
                label="Tax Label"
                value={translations?.cartPage?.taxLabel || {}}
                onChange={(language, value) => updateTranslation('cartPage.taxLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Tax"
              />

              <TranslatableInput
                label="Total Label"
                value={translations?.cartPage?.totalLabel || {}}
                onChange={(language, value) => updateTranslation('cartPage.totalLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Total"
              />

              <TranslatableInput
                label="Checkout Button"
                value={translations?.cartPage?.checkoutButton || {}}
                onChange={(language, value) => updateTranslation('cartPage.checkoutButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Proceed to Checkout"
              />

              <TranslatableInput
                label="Continue Shopping Button"
                value={translations?.cartPage?.continueShoppingButton || {}}
                onChange={(language, value) => updateTranslation('cartPage.continueShoppingButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Continue Shopping"
              />

              <TranslatableInput
                label="Security Notice"
                value={translations?.cartPage?.securityNotice || {}}
                onChange={(language, value) => updateTranslation('cartPage.securityNotice', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Secure checkout"
              />
            </CardContent>
          </Card>

          {/* Order History Page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D91C81]" />
                Order History Page
              </CardTitle>
              <CardDescription>Configure translatable content for the order history page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.orderHistory?.title || {}}
                onChange={(language, value) => updateTranslation('orderHistory.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required
                placeholder="Order History"
              />

              <TranslatableTextarea
                label="Page Description"
                value={translations?.orderHistory?.description || {}}
                onChange={(language, value) => updateTranslation('orderHistory.description', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="View your past orders"
                rows={2}
              />

              <TranslatableInput
                label="Empty State Title"
                value={translations?.orderHistory?.emptyTitle || {}}
                onChange={(language, value) => updateTranslation('orderHistory.emptyTitle', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="No Orders Yet"
              />

              <TranslatableTextarea
                label="Empty State Message"
                value={translations?.orderHistory?.emptyMessage || {}}
                onChange={(language, value) => updateTranslation('orderHistory.emptyMessage', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="You haven't placed any orders yet"
                rows={2}
              />

              <TranslatableInput
                label="Browse Button"
                value={translations?.orderHistory?.browseButton || {}}
                onChange={(language, value) => updateTranslation('orderHistory.browseButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Browse Products"
              />

              <TranslatableInput
                label="View Details Button"
                value={translations?.orderHistory?.viewDetailsButton || {}}
                onChange={(language, value) => updateTranslation('orderHistory.viewDetailsButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="View Details"
              />

              <TranslatableInput
                label="Status: Pending"
                value={translations?.orderHistory?.statusPending || {}}
                onChange={(language, value) => updateTranslation('orderHistory.statusPending', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Pending"
              />

              <TranslatableInput
                label="Status: Confirmed"
                value={translations?.orderHistory?.statusConfirmed || {}}
                onChange={(language, value) => updateTranslation('orderHistory.statusConfirmed', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Confirmed"
              />

              <TranslatableInput
                label="Status: Shipped"
                value={translations?.orderHistory?.statusShipped || {}}
                onChange={(language, value) => updateTranslation('orderHistory.statusShipped', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Shipped"
              />

              <TranslatableInput
                label="Status: Delivered"
                value={translations?.orderHistory?.statusDelivered || {}}
                onChange={(language, value) => updateTranslation('orderHistory.statusDelivered', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Delivered"
              />

              <TranslatableInput
                label="Status: Cancelled"
                value={translations?.orderHistory?.statusCancelled || {}}
                onChange={(language, value) => updateTranslation('orderHistory.statusCancelled', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Cancelled"
              />
            </CardContent>
          </Card>

          {/* Order Tracking Page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#D91C81]" />
                Order Tracking Page
              </CardTitle>
              <CardDescription>Configure translatable content for order tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.orderTracking?.title || {}}
                onChange={(language, value) => updateTranslation('orderTracking.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required
                placeholder="Track Your Order"
              />

              <TranslatableInput
                label="Order Number Label"
                value={translations?.orderTracking?.orderNumberLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.orderNumberLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Order Number"
              />

              <TranslatableInput
                label="Placed On Label"
                value={translations?.orderTracking?.placedOnLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.placedOnLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Placed On"
              />

              <TranslatableInput
                label="Status Label"
                value={translations?.orderTracking?.statusLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.statusLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Status"
              />

              <TranslatableInput
                label="Order Placed Label"
                value={translations?.orderTracking?.orderPlacedLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.orderPlacedLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Order Placed"
              />

              <TranslatableTextarea
                label="Order Placed Description"
                value={translations?.orderTracking?.orderPlacedDesc || {}}
                onChange={(language, value) => updateTranslation('orderTracking.orderPlacedDesc', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Your order has been received"
                rows={2}
              />

              <TranslatableInput
                label="Order Confirmed Label"
                value={translations?.orderTracking?.orderConfirmedLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.orderConfirmedLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Order Confirmed"
              />

              <TranslatableTextarea
                label="Order Confirmed Description"
                value={translations?.orderTracking?.orderConfirmedDesc || {}}
                onChange={(language, value) => updateTranslation('orderTracking.orderConfirmedDesc', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Your order has been confirmed"
                rows={2}
              />

              <TranslatableInput
                label="Shipped Label"
                value={translations?.orderTracking?.shippedLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.shippedLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Shipped"
              />

              <TranslatableTextarea
                label="Shipped Description"
                value={translations?.orderTracking?.shippedDesc || {}}
                onChange={(language, value) => updateTranslation('orderTracking.shippedDesc', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Your order is on its way"
                rows={2}
              />

              <TranslatableInput
                label="Delivered Label"
                value={translations?.orderTracking?.deliveredLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.deliveredLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Delivered"
              />

              <TranslatableTextarea
                label="Delivered Description"
                value={translations?.orderTracking?.deliveredDesc || {}}
                onChange={(language, value) => updateTranslation('orderTracking.deliveredDesc', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Your order has been delivered"
                rows={2}
              />

              <TranslatableInput
                label="Tracking Number Label"
                value={translations?.orderTracking?.trackingNumberLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.trackingNumberLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Tracking Number"
              />

              <TranslatableInput
                label="Estimated Delivery Label"
                value={translations?.orderTracking?.estimatedDeliveryLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.estimatedDeliveryLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Estimated Delivery"
              />

              <TranslatableInput
                label="Gift Details Label"
                value={translations?.orderTracking?.giftDetailsLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.giftDetailsLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Gift Details"
              />

              <TranslatableInput
                label="Shipping Address Label"
                value={translations?.orderTracking?.shippingAddressLabel || {}}
                onChange={(language, value) => updateTranslation('orderTracking.shippingAddressLabel', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Shipping Address"
              />

              <TranslatableInput
                label="Return Home Button"
                value={translations?.orderTracking?.returnHomeButton || {}}
                onChange={(language, value) => updateTranslation('orderTracking.returnHomeButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Return to Home"
              />

              <TranslatableInput
                label="Print Button"
                value={translations?.orderTracking?.printButton || {}}
                onChange={(language, value) => updateTranslation('orderTracking.printButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Print"
              />

              <TranslatableInput
                label="Support Message"
                value={translations?.orderTracking?.supportMessage || {}}
                onChange={(language, value) => updateTranslation('orderTracking.supportMessage', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Need help? Contact support"
              />
            </CardContent>
          </Card>

          {/* Not Found Page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#D91C81]" />
                404 Not Found Page
              </CardTitle>
              <CardDescription>Configure translatable content for the 404 error page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.notFoundPage?.title || {}}
                onChange={(language, value) => updateTranslation('notFoundPage.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required
                placeholder="Page Not Found"
              />

              <TranslatableTextarea
                label="Error Message"
                value={translations?.notFoundPage?.message || {}}
                onChange={(language, value) => updateTranslation('notFoundPage.message', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="The page you're looking for doesn't exist"
                rows={2}
              />

              <TranslatableInput
                label="Home Button"
                value={translations?.notFoundPage?.homeButton || {}}
                onChange={(language, value) => updateTranslation('notFoundPage.homeButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Go Home"
              />

              <TranslatableInput
                label="Admin Login Button"
                value={translations?.notFoundPage?.adminLoginButton || {}}
                onChange={(language, value) => updateTranslation('notFoundPage.adminLoginButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Admin Login"
              />

              <TranslatableInput
                label="Client Portal Button"
                value={translations?.notFoundPage?.clientPortalButton || {}}
                onChange={(language, value) => updateTranslation('notFoundPage.clientPortalButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Client Portal"
              />
            </CardContent>
          </Card>

          {/* Privacy Policy Page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D91C81]" />
                Privacy Policy Page
              </CardTitle>
              <CardDescription>Configure translatable content for the privacy policy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.privacyPolicy?.title || {}}
                onChange={(language, value) => updateTranslation('privacyPolicy.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required
                placeholder="Privacy Policy"
              />

              <TranslatableInput
                label="Last Updated Label"
                value={translations?.privacyPolicy?.lastUpdated || {}}
                onChange={(language, value) => updateTranslation('privacyPolicy.lastUpdated', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Last Updated"
              />

              <TranslatableInput
                label="Introduction Section Title"
                value={translations?.privacyPolicy?.introductionTitle || {}}
                onChange={(language, value) => updateTranslation('privacyPolicy.introductionTitle', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Introduction"
              />

              <TranslatableTextarea
                label="Introduction Text"
                value={translations?.privacyPolicy?.introductionText || {}}
                onChange={(language, value) => updateTranslation('privacyPolicy.introductionText', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="We value your privacy..."
                rows={4}
              />

              <TranslatableInput
                label="Information Collected Section Title"
                value={translations?.privacyPolicy?.informationCollectedTitle || {}}
                onChange={(language, value) => updateTranslation('privacyPolicy.informationCollectedTitle', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Information We Collect"
              />

              <TranslatableInput
                label="How We Use Section Title"
                value={translations?.privacyPolicy?.howWeUseTitle || {}}
                onChange={(language, value) => updateTranslation('privacyPolicy.howWeUseTitle', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="How We Use Your Information"
              />

              <TranslatableInput
                label="Your Rights Section Title"
                value={translations?.privacyPolicy?.yourRightsTitle || {}}
                onChange={(language, value) => updateTranslation('privacyPolicy.yourRightsTitle', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Your Rights"
              />

              <TranslatableInput
                label="Data Security Section Title"
                value={translations?.privacyPolicy?.dataSecurityTitle || {}}
                onChange={(language, value) => updateTranslation('privacyPolicy.dataSecurityTitle', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Data Security"
              />

              <TranslatableInput
                label="Contact Section Title"
                value={translations?.privacyPolicy?.contactTitle || {}}
                onChange={(language, value) => updateTranslation('privacyPolicy.contactTitle', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Contact Us"
              />

              <TranslatableInput
                label="Privacy Settings Button"
                value={translations?.privacyPolicy?.privacySettingsButton || {}}
                onChange={(language, value) => updateTranslation('privacyPolicy.privacySettingsButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Privacy Settings"
              />
            </CardContent>
          </Card>

          {/* Selection Period Expired Page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D91C81]" />
                Selection Period Expired Page
              </CardTitle>
              <CardDescription>Configure translatable content for expired selection periods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TranslatableInput
                label="Page Title"
                value={translations?.expiredPage?.title || {}}
                onChange={(language, value) => updateTranslation('expiredPage.title', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                required
                placeholder="Selection Period Expired"
              />

              <TranslatableTextarea
                label="Expiration Message"
                value={translations?.expiredPage?.message || {}}
                onChange={(language, value) => updateTranslation('expiredPage.message', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="The selection period for this site has ended"
                rows={2}
              />

              <TranslatableTextarea
                label="Contact Message"
                value={translations?.expiredPage?.contactMessage || {}}
                onChange={(language, value) => updateTranslation('expiredPage.contactMessage', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Please contact the administrator for assistance"
                rows={2}
              />

              <TranslatableInput
                label="Return Home Button"
                value={translations?.expiredPage?.returnHomeButton || {}}
                onChange={(language, value) => updateTranslation('expiredPage.returnHomeButton', language, value)}
                availableLanguages={configMode === 'draft' ? draftAvailableLanguages : availableLanguages}
                defaultLanguage={defaultLanguage}
                placeholder="Return to Home"
              />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Publish Confirmation Modal */}
      <PublishConfirmationModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handleConfirmPublish}
        changes={originalSiteData ? detectSiteChanges(originalSiteData, buildCurrentStateForComparison()) : []}
        isPublishing={isPublishing}
        siteName={siteName}
      />

      {/* Discard Confirmation Modal */}
      <DiscardConfirmationModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={handleConfirmDiscard}
        isDiscarding={isDiscarding}
        siteName={siteName}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedChangesModal}
        onClose={() => {
          setShowUnsavedChangesModal(false);
          setPendingModeSwitch(null);
        }}
        onSave={handleSaveUnsavedChanges}
        onDiscard={handleDiscardUnsavedChanges}
        isSaving={isAutoSaving}
      />
    </div>
  );
}