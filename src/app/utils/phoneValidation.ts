/**
 * Phone Number Validation Utilities
 * 
 * Helper functions for validating international phone numbers
 */

import { COUNTRIES } from '../components/ui/phone-input';

/**
 * Validates if a phone number is in the correct format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return false;
  }

  // Check if it starts with a valid country code
  const country = COUNTRIES.find(c => phoneNumber.startsWith(c.dial));
  if (!country) {
    return false;
  }

  // Extract the number part (without country code)
  const numberPart = phoneNumber.substring(country.dial.length).trim();
  
  // Remove all non-digit characters
  const digits = numberPart.replace(/\D/g, '');
  
  // Most phone numbers are between 7-15 digits (excluding country code)
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Extracts just the digits from a phone number
 */
export function getPhoneDigits(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}

/**
 * Parses a phone number into country code and number parts
 */
export function parsePhoneNumber(phoneNumber: string): {
  countryCode: string;
  countryName: string;
  number: string;
  fullNumber: string;
} | null {
  if (!phoneNumber) {
    return null;
  }

  const country = COUNTRIES.find(c => phoneNumber.startsWith(c.dial));
  if (!country) {
    return null;
  }

  const numberPart = phoneNumber.substring(country.dial.length).trim();

  return {
    countryCode: country.dial,
    countryName: country.name,
    number: numberPart,
    fullNumber: phoneNumber,
  };
}

/**
 * Formats a phone number for display
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
  if (!phoneNumber) {
    return '';
  }

  const parsed = parsePhoneNumber(phoneNumber);
  if (!parsed) {
    return phoneNumber;
  }

  return `${parsed.countryCode} ${parsed.number}`;
}

/**
 * Formats a phone number for storage (E.164 format)
 */
export function formatPhoneForStorage(phoneNumber: string): string {
  if (!phoneNumber) {
    return '';
  }

  // Remove all non-digit characters except the leading +
  return phoneNumber.replace(/[^\d+]/g, '');
}

/**
 * Validates phone number and returns error message if invalid
 */
export function validatePhoneNumber(phoneNumber: string): string | null {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return 'Phone number is required';
  }

  if (!phoneNumber.startsWith('+')) {
    return 'Phone number must include country code (e.g., +1)';
  }

  const country = COUNTRIES.find(c => phoneNumber.startsWith(c.dial));
  if (!country) {
    return 'Invalid country code';
  }

  const numberPart = phoneNumber.substring(country.dial.length).trim();
  const digits = numberPart.replace(/\D/g, '');

  if (digits.length < 7) {
    return 'Phone number is too short';
  }

  if (digits.length > 15) {
    return 'Phone number is too long';
  }

  return null;
}

/**
 * Gets country information from a phone number
 */
export function getCountryFromPhone(phoneNumber: string) {
  if (!phoneNumber) {
    return null;
  }

  return COUNTRIES.find(c => phoneNumber.startsWith(c.dial)) || null;
}
