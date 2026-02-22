/**
 * Address Validation Utilities
 * 
 * Helper functions for validating international addresses
 */

import { AddressData, ADDRESS_FORMATS } from '../components/ui/address-input';

/**
 * Validates an address line
 * Requirements: 10.12, 10.13, 10.14
 * 
 * @param line - The address line to validate
 * @param country - The country code
 * @returns Error message if invalid, null if valid
 */
export function validateAddressLine(line: string, country: string): string | null {
  // Trim the line first to handle whitespace-only strings
  const trimmedLine = line.trim();
  
  // Check minimum length (Requirement 10.13)
  if (trimmedLine.length < 3) {
    return 'Address too short';
  }
  
  // Check for PO Box restrictions for US addresses (Requirement 10.12)
  // Match various PO Box formats: PO Box, P.O. Box, P O Box, POBox, etc.
  if (country === 'US' && /P\.?\s*O\.?\s*Box/i.test(trimmedLine)) {
    return 'PO Boxes not allowed for this country';
  }
  
  return null; // Valid
}

/**
 * Validates if an address is complete based on country requirements
 */
export function isValidAddress(address: AddressData): boolean {
  if (!address.line1 || !address.city || !address.postalCode || !address.country) {
    return false;
  }

  const format = ADDRESS_FORMATS.find(f => f.country === address.country);
  if (!format) {
    return false;
  }

  // Check if state is required and provided
  if (format.requiresState && !address.state) {
    return false;
  }

  return true;
}

/**
 * Validates address and returns error messages
 */
export function validateAddress(address: AddressData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!address.line1 || address.line1.trim() === '') {
    errors.line1 = 'Street address is required';
  }

  if (!address.city || address.city.trim() === '') {
    errors.city = 'City is required';
  }

  if (!address.postalCode || address.postalCode.trim() === '') {
    errors.postalCode = 'Postal code is required';
  }

  if (!address.country || address.country.trim() === '') {
    errors.country = 'Country is required';
  }

  const format = ADDRESS_FORMATS.find(f => f.country === address.country);
  if (format && format.requiresState) {
    if (!address.state || address.state.trim() === '') {
      errors.state = `${format.stateLabel || 'State'} is required`;
    }
  }

  return errors;
}

/**
 * Postal code validation patterns for supported countries
 * Requirements: 10.1-10.11
 */
export const postalCodePatterns: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
  GB: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
  AU: /^\d{4}$/,
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  JP: /^\d{3}-?\d{4}$/,
  CN: /^\d{6}$/,
  IN: /^\d{6}$/,
  BR: /^\d{5}-?\d{3}$/,
  MX: /^\d{5}$/,
  ES: /^\d{5}$/,
  IT: /^\d{5}$/,
  NL: /^\d{4}\s?[A-Z]{2}$/i,
  SE: /^\d{3}\s?\d{2}$/,
  NO: /^\d{4}$/,
  SG: /^\d{6}$/,
  KR: /^\d{5}$/,
};

/**
 * Validates postal code format for specific countries
 * Returns true if valid, false otherwise
 * Requirements: 10.1-10.11
 */
export function validatePostalCode(postalCode: string, country: string): boolean {
  const pattern = postalCodePatterns[country];
  if (!pattern) return true; // No pattern defined, accept any
  return pattern.test(postalCode);
}

/**
 * Validates postal code and returns error message if invalid
 * Returns null if valid
 */
export function validatePostalCodeWithMessage(postalCode: string, countryCode: string): string | null {
  if (!postalCode || postalCode.trim() === '') {
    return 'Postal code is required';
  }

  const patterns: Record<string, { regex: RegExp; message: string }> = {
    US: {
      regex: /^\d{5}(-\d{4})?$/,
      message: 'ZIP code must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789)',
    },
    CA: {
      regex: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
      message: 'Postal code must be in format A1A 1A1',
    },
    GB: {
      regex: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
      message: 'Postcode must be in valid UK format (e.g., SW1A 1AA)',
    },
    AU: {
      regex: /^\d{4}$/,
      message: 'Postcode must be 4 digits',
    },
    DE: {
      regex: /^\d{5}$/,
      message: 'Postleitzahl must be 5 digits',
    },
    FR: {
      regex: /^\d{5}$/,
      message: 'Code postal must be 5 digits',
    },
    JP: {
      regex: /^\d{3}-?\d{4}$/,
      message: 'Postal code must be 7 digits (e.g., 123-4567)',
    },
    CN: {
      regex: /^\d{6}$/,
      message: 'Postal code must be 6 digits',
    },
    IN: {
      regex: /^\d{6}$/,
      message: 'PIN code must be 6 digits',
    },
    BR: {
      regex: /^\d{5}-?\d{3}$/,
      message: 'CEP must be 8 digits (e.g., 12345-678)',
    },
    MX: {
      regex: /^\d{5}$/,
      message: 'Código postal must be 5 digits',
    },
    ES: {
      regex: /^\d{5}$/,
      message: 'Código postal must be 5 digits',
    },
    IT: {
      regex: /^\d{5}$/,
      message: 'CAP must be 5 digits',
    },
    NL: {
      regex: /^\d{4}\s?[A-Z]{2}$/i,
      message: 'Postcode must be in format 1234 AB',
    },
    SE: {
      regex: /^\d{3}\s?\d{2}$/,
      message: 'Postnummer must be 5 digits (e.g., 123 45)',
    },
    NO: {
      regex: /^\d{4}$/,
      message: 'Postnummer must be 4 digits',
    },
    SG: {
      regex: /^\d{6}$/,
      message: 'Postal code must be 6 digits',
    },
    KR: {
      regex: /^\d{5}$/,
      message: 'Postal code must be 5 digits',
    },
  };

  const pattern = patterns[countryCode];
  if (pattern && !pattern.regex.test(postalCode)) {
    return pattern.message;
  }

  return null;
}

/**
 * Formats an address for display
 */
export function formatAddressForDisplay(address: AddressData): string {
  const parts: string[] = [];

  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);
  if (address.line3) parts.push(address.line3);

  const format = ADDRESS_FORMATS.find(f => f.country === address.country);
  
  if (format?.countryCode === 'US' || format?.countryCode === 'CA') {
    // US/Canada format: City, State ZIP
    const cityStateZip = [
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean).join(', ');
    if (cityStateZip) parts.push(cityStateZip);
  } else if (format?.countryCode === 'GB') {
    // UK format: City, Postcode
    if (address.city) parts.push(address.city);
    if (address.postalCode) parts.push(address.postalCode);
  } else if (format?.countryCode === 'JP' || format?.countryCode === 'CN' || format?.countryCode === 'KR') {
    // Asian format: Postal code first, then state, city
    const location = [
      address.postalCode,
      address.state,
      address.city,
    ].filter(Boolean).join(' ');
    if (location) parts.push(location);
  } else {
    // Default format: Postal code City, State
    const cityInfo = [address.postalCode, address.city, address.state]
      .filter(Boolean)
      .join(' ');
    if (cityInfo) parts.push(cityInfo);
  }

  if (address.country) parts.push(address.country);

  return parts.join('\n');
}

/**
 * Formats an address for single-line display
 */
export function formatAddressOneLine(address: AddressData): string {
  return formatAddressForDisplay(address).replace(/\n/g, ', ');
}

/**
 * Checks if address is in a specific country
 */
export function isCountry(address: AddressData, countryCode: string): boolean {
  const format = ADDRESS_FORMATS.find(f => f.country === address.country);
  return format?.countryCode === countryCode;
}

/**
 * Gets country format information
 */
export function getCountryFormat(countryCode: string) {
  return ADDRESS_FORMATS.find(f => f.countryCode === countryCode);
}

/**
 * Normalizes postal code format
 */
export function normalizePostalCode(postalCode: string, countryCode: string): string {
  // Remove extra spaces
  let normalized = postalCode.trim().toUpperCase();

  // Country-specific normalization
  switch (countryCode) {
    case 'CA':
      // Add space in Canadian postal codes if missing
      if (normalized.length === 6 && !normalized.includes(' ')) {
        normalized = `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
      }
      break;
    case 'GB':
      // Ensure space in UK postcodes
      if (!normalized.includes(' ') && normalized.length > 3) {
        normalized = `${normalized.slice(0, -3)} ${normalized.slice(-3)}`;
      }
      break;
    case 'NL':
      // Add space in Dutch postcodes if missing
      if (normalized.length === 6 && !normalized.includes(' ')) {
        normalized = `${normalized.slice(0, 4)} ${normalized.slice(4)}`;
      }
      break;
  }

  return normalized;
}
