import { useSite } from '../context/SiteContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * Hook for retrieving translated content from site configuration
 * 
 * Implements a fallback chain for missing translations:
 * 1. Current language
 * 2. Default language
 * 3. English ('en')
 * 4. First available translation
 * 5. Provided fallback string
 * 
 * @example
 * const { getTranslatedContent } = useSiteContent();
 * const title = getTranslatedContent('welcomePage.title', 'Welcome');
 */
export function useSiteContent() {
  const { currentSite } = useSite();
  const { currentLanguage } = useLanguage();

  /**
   * Retrieves translated content for a given field path
   * 
   * @param path - Dot-notation path to the field (e.g., 'welcomePage.title')
   * @param fallback - Fallback string to return if no translation is found
   * @returns The translated content or fallback string
   */
  const getTranslatedContent = (path: string, fallback: string = ''): string => {
    try {
      // Validate inputs
      if (!path || typeof path !== 'string') {
        console.warn('[useSiteContent] Invalid path provided:', path);
        return fallback;
      }

      if (!currentSite) {
        console.warn('[useSiteContent] No current site available');
        return fallback;
      }

      // Get translations object from site
      const translations = currentSite.translations;
      
      if (!translations || typeof translations !== 'object') {
        console.warn('[useSiteContent] No translations available for site');
        return fallback;
      }

      // Navigate to the field using the path
      const pathParts = path.split('.');
      let current: unknown = translations;

      for (const part of pathParts) {
        if (!current || typeof current !== 'object') {
          console.warn(`[useSiteContent] Invalid path structure at "${part}" in path "${path}"`);
          return fallback;
        }
        current = (current as Record<string, unknown>)[part];
      }

      // Check if we reached a translations object (should have language keys)
      if (!current || typeof current !== 'object') {
        console.warn(`[useSiteContent] No translations object found at path "${path}"`);
        return fallback;
      }

      // Get the current language code
      const currentLang = currentLanguage.code;
      
      // Get default language from site settings
      const defaultLang = currentSite.settings?.defaultLanguage || 'en';

      // Implement fallback chain
      // 1. Try current language
      if ((current as Record<string, unknown>)[currentLang] && typeof (current as Record<string, unknown>)[currentLang] === 'string' && ((current as Record<string, unknown>)[currentLang] as string).trim()) {
        return (current as Record<string, unknown>)[currentLang] as string;
      }

      // 2. Try default language
      if (currentLang !== defaultLang && (current as Record<string, unknown>)[defaultLang] && typeof (current as Record<string, unknown>)[defaultLang] === 'string' && ((current as Record<string, unknown>)[defaultLang] as string).trim()) {
        console.warn(`[useSiteContent] Translation not found for "${path}" in language "${currentLang}", using default language "${defaultLang}"`);
        return (current as Record<string, unknown>)[defaultLang] as string;
      }

      // 3. Try English
      if (defaultLang !== 'en' && (current as Record<string, unknown>)['en'] && typeof (current as Record<string, unknown>)['en'] === 'string' && ((current as Record<string, unknown>)['en'] as string).trim()) {
        console.warn(`[useSiteContent] Translation not found for "${path}" in languages "${currentLang}" or "${defaultLang}", using English`);
        return (current as Record<string, unknown>)['en'] as string;
      }

      // 4. Try first available translation
      const availableKeys = Object.keys(current as Record<string, unknown>);
      for (const key of availableKeys) {
        if (typeof (current as Record<string, unknown>)[key] === 'string' && ((current as Record<string, unknown>)[key] as string).trim()) {
          console.warn(`[useSiteContent] Translation not found for "${path}" in preferred languages, using first available: "${key}"`);
          return (current as Record<string, unknown>)[key] as string;
        }
      }

      // 5. Return fallback
      console.warn(`[useSiteContent] No translations found for "${path}", using fallback`);
      return fallback;

    } catch (error) {
      console.error(`[useSiteContent] Error retrieving translation for path "${path}":`, error);
      return fallback;
    }
  };

  return { getTranslatedContent };
}
