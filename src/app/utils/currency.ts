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
  
  // Round to appropriate decimal places
  const roundedAmount = Math.round(amount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  
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
  const formattedPrice = symbolPosition === 'before' 
    ? `${symbol}${formattedNumber}`
    : `${formattedNumber} ${symbol}`;
  
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
  
  // Replace thousands separator with nothing
  cleanedPrice = cleanedPrice.replace(new RegExp(`\\\\${currency.thousandsSeparator}`, 'g'), '');
  
  // Replace decimal separator with standard period
  cleanedPrice = cleanedPrice.replace(currency.decimalSeparator, '.');
  
  return parseFloat(cleanedPrice) || 0;
}

// Alias for backward compatibility
export const parseCurrencyAmount = parsePrice;

/**
 * Convert currency using exchange rates from countries.ts
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // Import exchange rates from countries.ts
  const { convertCurrency: convertFromCountries } = require('./countries');
  return convertFromCountries(amount, fromCurrency, toCurrency);
}