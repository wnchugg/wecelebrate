// Currency utilities for formatting prices based on site settings

export interface CurrencyConfig {
  code: string; // ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
  symbol: string;
  name: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimalPlaces: 2,
    symbolPosition: 'after',
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimalPlaces: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: "'",
    decimalSeparator: '.',
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    decimalPlaces: 2,
    symbolPosition: 'after',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    decimalPlaces: 2,
    symbolPosition: 'after',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    decimalPlaces: 2,
    symbolPosition: 'after',
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    decimalPlaces: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  PLN: {
    code: 'PLN',
    symbol: 'zł',
    name: 'Polish Złoty',
    decimalPlaces: 2,
    symbolPosition: 'after',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    decimalPlaces: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
};

/**
 * Get currency configuration by code
 */
export function getCurrency(code: string): CurrencyConfig {
  if (!code) return CURRENCIES.USD;
  return CURRENCIES[code.toUpperCase()] || CURRENCIES.USD;
}

/**
 * Format a price according to currency rules
 */
export function formatPrice(
  amount: number,
  currencyCode: string,
  options?: {
    showCode?: boolean; // Show currency code after symbol (e.g., "$100 USD")
    compact?: boolean; // Use compact notation for large numbers
  }
): string {
  const currency = getCurrency(currencyCode);
  const { symbol, decimalPlaces, symbolPosition, thousandsSeparator, decimalSeparator } = currency;
  
  // Handle compact notation for large numbers
  if (options?.compact && Math.abs(amount) >= 1000000) {
    const millions = amount / 1000000;
    const roundedMillions = Math.round(millions * 10) / 10;
    const formattedPrice = symbolPosition === 'before'
      ? `${symbol}${roundedMillions}M`
      : `${roundedMillions}M ${symbol}`;
    return options.showCode ? `${formattedPrice} ${currency.code}` : formattedPrice;
  }
  
  // Handle negative amounts
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  // Round to appropriate decimal places
  const roundedAmount = Math.round(absoluteAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = roundedAmount.toFixed(decimalPlaces).split('.');
  
  // Add thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  // Construct the final number
  let formattedNumber = formattedInteger;
  if (decimalPlaces > 0) {
    formattedNumber += decimalSeparator + decimalPart;
  }
  
  // Add currency symbol
  let formattedPrice = symbolPosition === 'before' 
    ? `${symbol}${formattedNumber}`
    : `${formattedNumber} ${symbol}`;
  
  // Add negative sign before everything
  if (isNegative) {
    formattedPrice = `-${formattedPrice}`;
  }
  
  // Optionally add currency code
  if (options?.showCode) {
    return `${formattedPrice} ${currency.code}`;
  }
  
  return formattedPrice;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  return getCurrency(currencyCode).symbol;
}

/**
 * Parse a formatted price string back to a number
 * Note: This is a basic implementation and may need enhancement for complex formats
 */
export function parsePrice(formattedPrice: string, currencyCode: string): number {
  const currency = getCurrency(currencyCode);
  
  // Remove currency symbol and code
  let cleanedPrice = formattedPrice
    .replace(currency.symbol, '')
    .replace(currency.code, '')
    .trim();
  
  // Replace thousands separator with nothing (escape special regex characters)
  const escapedSeparator = currency.thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  cleanedPrice = cleanedPrice.replace(new RegExp(escapedSeparator, 'g'), '');
  
  // Replace decimal separator with standard period
  cleanedPrice = cleanedPrice.replace(currency.decimalSeparator, '.');
  
  const parsed = parseFloat(cleanedPrice);
  return isNaN(parsed) ? NaN : parsed;
}

// Alias for backward compatibility
export const parseCurrencyAmount = parsePrice;

/**
 * Convert currency using provided exchange rate
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @param exchangeRate - Optional exchange rate (if not provided, returns amount unchanged)
 */
export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string,
  exchangeRate?: number
): number {
  // If same currency, return as-is
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return amount;
  }
  
  // If no exchange rate provided, return amount unchanged
  if (exchangeRate === undefined) {
    return amount;
  }
  
  // Convert using the provided exchange rate
  const result = amount * exchangeRate;
  
  // Round to 2 decimal places for most currencies
  // (In a real app, you'd use the target currency's decimalPlaces)
  return Math.round(result * 100) / 100;
}