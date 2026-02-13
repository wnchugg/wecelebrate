import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Privacy Context for GDPR and CCPA Compliance
 * Manages user consent, privacy preferences, and data handling
 */

export interface PrivacyConsent {
  necessary: boolean; // Always true, cannot be disabled
  functional: boolean; // Language preference, session
  analytics: boolean; // Usage analytics
  marketing: boolean; // Marketing cookies
}

export interface PrivacyPreferences {
  consentGiven: boolean;
  consentTimestamp?: string;
  consents: PrivacyConsent;
  doNotSell: boolean; // CCPA requirement
  dataProcessingAgreed: boolean;
  lastUpdated?: string;
}

export interface PrivacyContextType {
  preferences: PrivacyPreferences;
  privacySettings: PrivacyPreferences; // Alias for backward compatibility
  setPrivacySettings: (prefs: PrivacyPreferences) => void; // Alias for backward compatibility
  showConsentBanner: boolean;
  updateConsent: (consents: Partial<PrivacyConsent>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  updateDoNotSell: (doNotSell: boolean) => void;
  hasConsent: (type: keyof PrivacyConsent) => boolean;
  grantConsent: (type: keyof PrivacyConsent) => void;
  revokeConsent: (type: keyof PrivacyConsent) => void;
  dismissBanner: () => void;
  exportUserData: () => Promise<string>;
  deleteUserData: () => Promise<void>;
  withdrawConsent: () => void;
  setDoNotSell: (doNotSell: boolean) => void;
}

const defaultPreferences: PrivacyPreferences = {
  consentGiven: false,
  consents: {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  },
  doNotSell: false,
  dataProcessingAgreed: false,
};

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PrivacyPreferences>(() => {
    const stored = localStorage.getItem('privacy_preferences');
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  const [showConsentBanner, setShowConsentBanner] = useState(() => {
    return !preferences.consentGiven;
  });

  useEffect(() => {
    localStorage.setItem('privacy_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updateConsent = (consents: Partial<PrivacyConsent>) => {
    setPreferences(prev => ({
      ...prev,
      consents: { ...prev.consents, ...consents },
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const acceptAll = () => {
    setPreferences({
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      consents: {
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true,
      },
      doNotSell: false,
      dataProcessingAgreed: true,
      lastUpdated: new Date().toISOString(),
    });
    setShowConsentBanner(false);
  };

  const rejectAll = () => {
    setPreferences({
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      consents: {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
      },
      doNotSell: true,
      dataProcessingAgreed: false,
      lastUpdated: new Date().toISOString(),
    });
    setShowConsentBanner(false);
  };

  const updateDoNotSell = (doNotSell: boolean) => {
    setPreferences(prev => ({
      ...prev,
      doNotSell,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const hasConsent = (type: keyof PrivacyConsent): boolean => {
    return preferences.consents[type];
  };

  const grantConsent = (type: keyof PrivacyConsent) => {
    setPreferences(prev => ({
      ...prev,
      consents: { ...prev.consents, [type]: true },
      consentGiven: true,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const revokeConsent = (type: keyof PrivacyConsent) => {
    if (type === 'necessary') {
      console.warn('Cannot revoke necessary consent');
      return;
    }
    setPreferences(prev => ({
      ...prev,
      consents: { ...prev.consents, [type]: false },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const dismissBanner = () => {
    setShowConsentBanner(false);
  };

  const setPrivacySettings = (prefs: PrivacyPreferences) => {
    setPreferences(prefs);
  };

  const exportUserData = async (): Promise<string> => {
    return JSON.stringify(preferences, null, 2);
  };

  const deleteUserData = async (): Promise<void> => {
    localStorage.removeItem('privacy_preferences');
    setPreferences(defaultPreferences);
  };

  const withdrawConsent = () => {
    rejectAll();
  };

  const setDoNotSell = (doNotSell: boolean) => {
    updateDoNotSell(doNotSell);
  };

  const value: PrivacyContextType = {
    preferences,
    privacySettings: preferences,
    setPrivacySettings,
    showConsentBanner,
    updateConsent,
    acceptAll,
    rejectAll,
    updateDoNotSell,
    hasConsent,
    grantConsent,
    revokeConsent,
    dismissBanner,
    exportUserData,
    deleteUserData,
    withdrawConsent,
    setDoNotSell,
  };

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy(): PrivacyContextType {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}