export interface Country {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  postalCodeLabel: string;
  stateLabel: string;
  hasStates: boolean;
}

export const countries: Country[] = [
  // North America
  { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', phonePrefix: '+1', postalCodeLabel: 'ZIP Code', stateLabel: 'State', hasStates: true },
  { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'C$', phonePrefix: '+1', postalCodeLabel: 'Postal Code', stateLabel: 'Province', hasStates: true },
  { code: 'MX', name: 'Mexico', currency: 'MXN', currencySymbol: 'MX$', phonePrefix: '+52', postalCodeLabel: 'Postal Code', stateLabel: 'State', hasStates: true },
  
  // Europe
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', phonePrefix: '+44', postalCodeLabel: 'Postcode', stateLabel: 'County', hasStates: false },
  { code: 'IE', name: 'Ireland', currency: 'EUR', currencySymbol: '€', phonePrefix: '+353', postalCodeLabel: 'Eircode', stateLabel: 'County', hasStates: false },
  { code: 'DE', name: 'Germany', currency: 'EUR', currencySymbol: '€', phonePrefix: '+49', postalCodeLabel: 'Postleitzahl', stateLabel: 'State', hasStates: false },
  { code: 'FR', name: 'France', currency: 'EUR', currencySymbol: '€', phonePrefix: '+33', postalCodeLabel: 'Code Postal', stateLabel: 'Region', hasStates: false },
  { code: 'ES', name: 'Spain', currency: 'EUR', currencySymbol: '€', phonePrefix: '+34', postalCodeLabel: 'Código Postal', stateLabel: 'Province', hasStates: false },
  { code: 'IT', name: 'Italy', currency: 'EUR', currencySymbol: '€', phonePrefix: '+39', postalCodeLabel: 'CAP', stateLabel: 'Province', hasStates: false },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', currencySymbol: '€', phonePrefix: '+31', postalCodeLabel: 'Postcode', stateLabel: 'Province', hasStates: false },
  { code: 'BE', name: 'Belgium', currency: 'EUR', currencySymbol: '€', phonePrefix: '+32', postalCodeLabel: 'Postcode', stateLabel: 'Province', hasStates: false },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', currencySymbol: 'CHF', phonePrefix: '+41', postalCodeLabel: 'Postleitzahl', stateLabel: 'Canton', hasStates: false },
  { code: 'AT', name: 'Austria', currency: 'EUR', currencySymbol: '€', phonePrefix: '+43', postalCodeLabel: 'Postleitzahl', stateLabel: 'State', hasStates: false },
  { code: 'SE', name: 'Sweden', currency: 'SEK', currencySymbol: 'kr', phonePrefix: '+46', postalCodeLabel: 'Postnummer', stateLabel: 'County', hasStates: false },
  { code: 'NO', name: 'Norway', currency: 'NOK', currencySymbol: 'kr', phonePrefix: '+47', postalCodeLabel: 'Postnummer', stateLabel: 'County', hasStates: false },
  { code: 'DK', name: 'Denmark', currency: 'DKK', currencySymbol: 'kr', phonePrefix: '+45', postalCodeLabel: 'Postnummer', stateLabel: 'Region', hasStates: false },
  { code: 'FI', name: 'Finland', currency: 'EUR', currencySymbol: '€', phonePrefix: '+358', postalCodeLabel: 'Postinumero', stateLabel: 'Region', hasStates: false },
  { code: 'PL', name: 'Poland', currency: 'PLN', currencySymbol: 'zł', phonePrefix: '+48', postalCodeLabel: 'Kod Pocztowy', stateLabel: 'Voivodeship', hasStates: false },
  { code: 'CZ', name: 'Czech Republic', currency: 'CZK', currencySymbol: 'Kč', phonePrefix: '+420', postalCodeLabel: 'PSČ', stateLabel: 'Region', hasStates: false },
  { code: 'PT', name: 'Portugal', currency: 'EUR', currencySymbol: '€', phonePrefix: '+351', postalCodeLabel: 'Código Postal', stateLabel: 'District', hasStates: false },
  
  // Asia Pacific
  { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$', phonePrefix: '+61', postalCodeLabel: 'Postcode', stateLabel: 'State', hasStates: true },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', currencySymbol: 'NZ$', phonePrefix: '+64', postalCodeLabel: 'Postcode', stateLabel: 'Region', hasStates: false },
  { code: 'JP', name: 'Japan', currency: 'JPY', currencySymbol: '¥', phonePrefix: '+81', postalCodeLabel: 'Postal Code', stateLabel: 'Prefecture', hasStates: true },
  { code: 'KR', name: 'South Korea', currency: 'KRW', currencySymbol: '₩', phonePrefix: '+82', postalCodeLabel: 'Postal Code', stateLabel: 'Province', hasStates: false },
  { code: 'CN', name: 'China', currency: 'CNY', currencySymbol: '¥', phonePrefix: '+86', postalCodeLabel: 'Postal Code', stateLabel: 'Province', hasStates: true },
  { code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: 'S$', phonePrefix: '+65', postalCodeLabel: 'Postal Code', stateLabel: 'District', hasStates: false },
  { code: 'HK', name: 'Hong Kong', currency: 'HKD', currencySymbol: 'HK$', phonePrefix: '+852', postalCodeLabel: 'Postal Code', stateLabel: 'District', hasStates: false },
  { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹', phonePrefix: '+91', postalCodeLabel: 'PIN Code', stateLabel: 'State', hasStates: true },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', currencySymbol: 'RM', phonePrefix: '+60', postalCodeLabel: 'Postcode', stateLabel: 'State', hasStates: true },
  { code: 'TH', name: 'Thailand', currency: 'THB', currencySymbol: '฿', phonePrefix: '+66', postalCodeLabel: 'Postal Code', stateLabel: 'Province', hasStates: false },
  { code: 'PH', name: 'Philippines', currency: 'PHP', currencySymbol: '₱', phonePrefix: '+63', postalCodeLabel: 'Postal Code', stateLabel: 'Province', hasStates: false },
  { code: 'ID', name: 'Indonesia', currency: 'IDR', currencySymbol: 'Rp', phonePrefix: '+62', postalCodeLabel: 'Postal Code', stateLabel: 'Province', hasStates: false },
  { code: 'VN', name: 'Vietnam', currency: 'VND', currencySymbol: '₫', phonePrefix: '+84', postalCodeLabel: 'Postal Code', stateLabel: 'Province', hasStates: false },
  
  // Middle East & Africa
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', currencySymbol: 'د.إ', phonePrefix: '+971', postalCodeLabel: 'Postal Code', stateLabel: 'Emirate', hasStates: false },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', currencySymbol: 'SR', phonePrefix: '+966', postalCodeLabel: 'Postal Code', stateLabel: 'Province', hasStates: false },
  { code: 'IL', name: 'Israel', currency: 'ILS', currencySymbol: '₪', phonePrefix: '+972', postalCodeLabel: 'Postal Code', stateLabel: 'District', hasStates: false },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', currencySymbol: 'R', phonePrefix: '+27', postalCodeLabel: 'Postal Code', stateLabel: 'Province', hasStates: true },
  
  // South America
  { code: 'BR', name: 'Brazil', currency: 'BRL', currencySymbol: 'R$', phonePrefix: '+55', postalCodeLabel: 'CEP', stateLabel: 'State', hasStates: true },
  { code: 'AR', name: 'Argentina', currency: 'ARS', currencySymbol: 'AR$', phonePrefix: '+54', postalCodeLabel: 'Código Postal', stateLabel: 'Province', hasStates: false },
  { code: 'CL', name: 'Chile', currency: 'CLP', currencySymbol: 'CL$', phonePrefix: '+56', postalCodeLabel: 'Código Postal', stateLabel: 'Region', hasStates: false },
  { code: 'CO', name: 'Colombia', currency: 'COP', currencySymbol: 'CO$', phonePrefix: '+57', postalCodeLabel: 'Código Postal', stateLabel: 'Department', hasStates: false },
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find(c => c.code === code);
}

export function getCountryByName(name: string): Country | undefined {
  return countries.find(c => c.name === name);
}

// Alias for backward compatibility
export const COUNTRIES = countries;
export const getAllCountries = () => countries;

export function getCountriesByRegion(region: string): Country[] {
  const regionMap: Record<string, string[]> = {
    'North America': ['US', 'CA', 'MX'],
    'Europe': ['GB', 'IE', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'PT'],
    'Asia Pacific': ['AU', 'NZ', 'JP', 'KR', 'CN', 'SG', 'HK', 'IN', 'MY', 'TH', 'PH', 'ID', 'VN'],
    'Middle East & Africa': ['AE', 'SA', 'IL', 'ZA'],
    'South America': ['BR', 'AR', 'CL', 'CO']
  };
  
  const codes = regionMap[region] || [];
  return countries.filter(c => codes.includes(c.code));
}

export function getCountryNames(): string[] {
  return countries.map(c => c.name);
}

export function getCountryCodes(): string[] {
  return countries.map(c => c.code);
}

export function isValidCountryCode(code: string): boolean {
  return countries.some(c => c.code === code);
}

export function formatCountryName(code: string): string {
  const country = getCountryByCode(code);
  return country ? country.name : code;
}

export function getCountryFlag(code: string): string {
  // Convert country code to flag emoji
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const country = countries.find(c => c.currency === currencyCode);
  
  if (!country) {
    return `${amount.toFixed(2)}`;
  }
  
  // Format based on currency
  switch (currencyCode) {
    case 'JPY':
    case 'KRW':
    case 'VND':
      // No decimal places for these currencies
      return `${country.currencySymbol}${Math.round(amount).toLocaleString()}`;
    default:
      return `${country.currencySymbol}${amount.toFixed(2)}`;
  }
}

export function formatPhoneNumber(phone: string, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  if (!country) return phone;
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Basic formatting - can be enhanced per country
  if (countryCode === 'US' || countryCode === 'CA') {
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
  }
  
  return phone;
}

// Exchange rates (in production, these would come from an API)
export const exchangeRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.08,
  BRL: 4.97,
  CHF: 0.88,
  SEK: 10.34,
  NOK: 10.68,
  DKK: 6.87,
  NZD: 1.63,
  SGD: 1.34,
  HKD: 7.83,
  KRW: 1308.45,
  ZAR: 18.62,
  AED: 3.67,
  SAR: 3.75,
  THB: 35.42,
  MYR: 4.48,
  IDR: 15678.00,
  PHP: 55.87,
  VND: 24350.00,
  ILS: 3.64,
  PLN: 3.98,
  CZK: 22.47,
  ARS: 850.00,
  CLP: 945.00,
  COP: 3925.00,
};

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}