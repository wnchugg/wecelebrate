import { useLanguage } from '../context/LanguageContext';

interface NumberFormatResult {
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatInteger: (value: number) => string;
  formatDecimal: (value: number, decimals?: number) => string;
  formatPercent: (value: number) => string;
  formatCompact: (value: number) => string;
}

/**
 * Hook for number formatting utilities
 * 
 * Provides locale-aware number formatting functions using Intl.NumberFormat.
 * Automatically uses the current language from LanguageContext.
 * 
 * @returns Number formatting utilities
 * 
 * @example
 * const { formatNumber, formatInteger, formatDecimal, formatPercent, formatCompact } = useNumberFormat();
 * console.log(formatNumber(1234.56)); // "1,234.56" (en-US) or "1 234,56" (fr-FR)
 * console.log(formatInteger(1234.56)); // "1,235" (rounded, no decimals)
 * console.log(formatDecimal(1234.5, 3)); // "1,234.500" (exactly 3 decimals)
 * console.log(formatPercent(45.5)); // "45.5%" (45.5 becomes 45.5%)
 * console.log(formatCompact(1234567)); // "1.2M" (en-US) or "1,2 M" (fr-FR)
 */
export function useNumberFormat(): NumberFormatResult {
  const { currentLanguage } = useLanguage();
  const locale = currentLanguage.code;
  
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(locale, options).format(value);
    } catch (error) {
      console.warn(`Error formatting number: ${error}`);
      return String(value);
    }
  };
  
  const formatInteger = (value: number): string => {
    try {
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }).format(value);
    } catch (error) {
      console.warn(`Error formatting integer: ${error}`);
      return String(Math.round(value));
    }
  };
  
  const formatDecimal = (value: number, decimals: number = 2): string => {
    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    } catch (error) {
      console.warn(`Error formatting decimal: ${error}`);
      return value.toFixed(decimals);
    }
  };
  
  const formatPercent = (value: number): string => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(value / 100);
    } catch (error) {
      console.warn(`Error formatting percent: ${error}`);
      return `${value}%`;
    }
  };
  
  const formatCompact = (value: number): string => {
    try {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value);
    } catch (error) {
      console.warn(`Error formatting compact number: ${error}`);
      return String(value);
    }
  };
  
  return {
    formatNumber,
    formatInteger,
    formatDecimal,
    formatPercent,
    formatCompact,
  };
}
