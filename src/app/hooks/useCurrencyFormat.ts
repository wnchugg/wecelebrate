import { useCurrency } from '../components/CurrencyDisplay';

interface CurrencyFormatResult {
  currency: string;
  formatPrice: (amount: number) => string;
  formatRange: (min: number, max: number) => string;
  symbol: string;
}

/**
 * Hook for currency formatting utilities
 * 
 * Wraps the existing CurrencyDisplay logic to provide currency formatting functions.
 * Returns formatPrice, formatRange, currency code, and currency symbol.
 * 
 * @param siteId - Optional site ID to override site detection
 * @returns Currency formatting utilities
 * 
 * @example
 * const { formatPrice, formatRange, currency, symbol } = useCurrencyFormat();
 * console.log(formatPrice(100)); // "$100.00"
 * console.log(formatRange(50, 100)); // "$50.00 - $100.00"
 * console.log(currency); // "USD"
 * console.log(symbol); // "$"
 */
export function useCurrencyFormat(siteId?: string): CurrencyFormatResult {
  const { currency, format, convert } = useCurrency(siteId);
  
  return {
    currency,
    formatPrice: (amount: number) => format(amount),
    formatRange: (min: number, max: number) => `${format(min)} - ${format(max)}`,
    symbol: getCurrencySymbol(currency),
  };
}

/**
 * Get the currency symbol for a given currency code
 * 
 * @param currency - Currency code (e.g., 'USD', 'EUR', 'GBP')
 * @returns Currency symbol (e.g., '$', '€', '£')
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    CAD: 'CA$',
    AUD: 'A$',
    MXN: 'MX$',
    BRL: 'R$',
  };
  return symbols[currency] || currency;
}
