import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { t, TranslationKey } from '../i18n/translations';
import { getTextDirection } from '../utils/rtl';

export type Language = {
  code: string;
  name: string;
  flag: string;
  rtl?: boolean; // Right-to-left language support
};

export const languages: Language[] = [
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'fr-CA', name: 'Français (Canada)', flag: '🇨🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'he', name: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'zh', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'zh-TW', name: '中文 (繁體)', flag: '🇹🇼' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (languageOrCode: Language | string) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('preferred-language');
    if (saved) {
      const found = languages.find(lang => lang.code === saved);
      if (found) {
        return found;
      } else {
        // Language previously saved is no longer available, clean up and use default
        console.warn(`Previously saved language '${saved}' is no longer supported. Resetting to English.`);
        localStorage.removeItem('preferred-language');
      }
    }
    return languages[0]; // Default to English
  });

  const setLanguage = (languageOrCode: Language | string) => {
    const newLanguage = typeof languageOrCode === 'string'
      ? languages.find(lang => lang.code === languageOrCode) || languages[0]
      : languageOrCode;
    setCurrentLanguage(newLanguage);
  };

  // Apply RTL direction to document
  useEffect(() => {
    const direction = getTextDirection(currentLanguage.code);
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage.code;
    localStorage.setItem('preferred-language', currentLanguage.code);
  }, [currentLanguage]);

  const translate = (key: TranslationKey): string => {
    return t(key, currentLanguage.code);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}