// RTL (Right-to-Left) language support utilities

export const RTL_LANGUAGES = ['ar', 'he'];

/**
 * Determines if a language uses right-to-left text direction
 * @param language - Language code (e.g., 'ar', 'he', 'en')
 * @returns true if the language is RTL, false otherwise
 */
export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language);
}

/**
 * Gets the text direction for a given language
 * @param language - Language code (e.g., 'ar', 'he', 'en')
 * @returns 'rtl' for right-to-left languages, 'ltr' for left-to-right languages
 */
export function getTextDirection(language: string): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}
