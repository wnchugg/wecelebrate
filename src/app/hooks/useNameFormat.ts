import { useLanguage } from '../context/LanguageContext';

interface NameFormatResult {
  formatFullName: (firstName: string, lastName: string, middleName?: string) => string;
  formatFormalName: (firstName: string, lastName: string, title?: string) => string;
}

/**
 * Hook for locale-aware name formatting
 * 
 * Provides name formatting functions that respect cultural conventions for name order.
 * Asian languages (ja, zh, ko) use family-first order, while Western languages use given-first order.
 * Automatically uses the current language from LanguageContext.
 * 
 * @returns Name formatting utilities
 * 
 * @example
 * const { formatFullName, formatFormalName } = useNameFormat();
 * 
 * // For English (en): "John Smith"
 * // For Japanese (ja): "Smith John"
 * const name = formatFullName('John', 'Smith');
 * 
 * // For English (en): "Mr. John Smith"
 * // For Japanese (ja): "Mr. Smith John"
 * const formalName = formatFormalName('John', 'Smith', 'Mr.');
 */
export function useNameFormat(): NameFormatResult {
  const { currentLanguage } = useLanguage();
  
  const locale = currentLanguage.code;
  
  /**
   * Format a full name with locale-aware name order
   * 
   * Asian languages (ja, zh, ko) use family-first order: "Family Middle Given"
   * Western languages use given-first order: "Given Middle Family"
   * 
   * @param firstName - Given name
   * @param lastName - Family name
   * @param middleName - Optional middle name
   * @returns Formatted full name
   */
  const formatFullName = (
    firstName: string,
    lastName: string,
    middleName?: string
  ): string => {
    // Asian languages: Family name first
    if (['ja', 'zh', 'zh-TW', 'ko'].includes(locale)) {
      return middleName 
        ? `${lastName} ${middleName} ${firstName}`
        : `${lastName} ${firstName}`;
    }
    
    // Western languages: Given name first
    return middleName
      ? `${firstName} ${middleName} ${lastName}`
      : `${firstName} ${lastName}`;
  };
  
  /**
   * Format a formal name with title
   * 
   * Prepends the title to the formatted full name according to locale conventions.
   * 
   * @param firstName - Given name
   * @param lastName - Family name
   * @param title - Optional title (e.g., "Mr.", "Dr.", "Ms.")
   * @returns Formatted formal name with title
   */
  const formatFormalName = (
    firstName: string,
    lastName: string,
    title?: string
  ): string => {
    const fullName = formatFullName(firstName, lastName);
    return title ? `${title} ${fullName}` : fullName;
  };
  
  return {
    formatFullName,
    formatFormalName,
  };
}
