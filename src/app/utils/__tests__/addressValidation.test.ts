/**
 * Unit Tests for Address Validation
 * Requirements: 10.1-10.14
 */

import { describe, it, expect } from 'vitest';
import {
  validatePostalCode,
  validateAddressLine,
  postalCodePatterns,
} from '../addressValidation';

describe('validatePostalCode', () => {
  describe('US postal codes', () => {
    it('should accept valid 5-digit ZIP codes', () => {
      expect(validatePostalCode('12345', 'US')).toBe(true);
      expect(validatePostalCode('90210', 'US')).toBe(true);
    });

    it('should accept valid ZIP+4 codes', () => {
      expect(validatePostalCode('12345-6789', 'US')).toBe(true);
      expect(validatePostalCode('90210-1234', 'US')).toBe(true);
    });

    it('should reject invalid US postal codes', () => {
      expect(validatePostalCode('1234', 'US')).toBe(false);
      expect(validatePostalCode('123456', 'US')).toBe(false);
      expect(validatePostalCode('ABCDE', 'US')).toBe(false);
    });
  });

  describe('Canadian postal codes', () => {
    it('should accept valid Canadian postal codes', () => {
      expect(validatePostalCode('K1A 0B1', 'CA')).toBe(true);
      expect(validatePostalCode('M5W 1E6', 'CA')).toBe(true);
      expect(validatePostalCode('K1A0B1', 'CA')).toBe(true); // Without space
    });

    it('should reject invalid Canadian postal codes', () => {
      expect(validatePostalCode('12345', 'CA')).toBe(false);
      expect(validatePostalCode('ABCDEF', 'CA')).toBe(false);
    });
  });

  describe('UK postal codes', () => {
    it('should accept valid UK postcodes', () => {
      expect(validatePostalCode('SW1A 1AA', 'GB')).toBe(true);
      expect(validatePostalCode('EC1A 1BB', 'GB')).toBe(true);
      expect(validatePostalCode('W1A 0AX', 'GB')).toBe(true);
      expect(validatePostalCode('M1 1AE', 'GB')).toBe(true);
    });

    it('should reject invalid UK postcodes', () => {
      expect(validatePostalCode('12345', 'GB')).toBe(false);
      expect(validatePostalCode('ABCDEFGH', 'GB')).toBe(false);
    });
  });

  describe('German postal codes', () => {
    it('should accept valid German postal codes', () => {
      expect(validatePostalCode('10115', 'DE')).toBe(true);
      expect(validatePostalCode('80331', 'DE')).toBe(true);
    });

    it('should reject invalid German postal codes', () => {
      expect(validatePostalCode('1234', 'DE')).toBe(false);
      expect(validatePostalCode('123456', 'DE')).toBe(false);
    });
  });

  describe('French postal codes', () => {
    it('should accept valid French postal codes', () => {
      expect(validatePostalCode('75001', 'FR')).toBe(true);
      expect(validatePostalCode('69002', 'FR')).toBe(true);
    });

    it('should reject invalid French postal codes', () => {
      expect(validatePostalCode('1234', 'FR')).toBe(false);
      expect(validatePostalCode('123456', 'FR')).toBe(false);
    });
  });

  describe('Japanese postal codes', () => {
    it('should accept valid Japanese postal codes', () => {
      expect(validatePostalCode('100-0001', 'JP')).toBe(true);
      expect(validatePostalCode('1000001', 'JP')).toBe(true); // Without hyphen
    });

    it('should reject invalid Japanese postal codes', () => {
      expect(validatePostalCode('12345', 'JP')).toBe(false);
      expect(validatePostalCode('12-3456', 'JP')).toBe(false);
    });
  });

  describe('Chinese postal codes', () => {
    it('should accept valid Chinese postal codes', () => {
      expect(validatePostalCode('100000', 'CN')).toBe(true);
      expect(validatePostalCode('200000', 'CN')).toBe(true);
    });

    it('should reject invalid Chinese postal codes', () => {
      expect(validatePostalCode('12345', 'CN')).toBe(false);
      expect(validatePostalCode('1234567', 'CN')).toBe(false);
    });
  });

  describe('Indian postal codes', () => {
    it('should accept valid Indian PIN codes', () => {
      expect(validatePostalCode('110001', 'IN')).toBe(true);
      expect(validatePostalCode('400001', 'IN')).toBe(true);
    });

    it('should reject invalid Indian PIN codes', () => {
      expect(validatePostalCode('12345', 'IN')).toBe(false);
      expect(validatePostalCode('1234567', 'IN')).toBe(false);
    });
  });

  describe('Australian postal codes', () => {
    it('should accept valid Australian postcodes', () => {
      expect(validatePostalCode('2000', 'AU')).toBe(true);
      expect(validatePostalCode('3000', 'AU')).toBe(true);
    });

    it('should reject invalid Australian postcodes', () => {
      expect(validatePostalCode('123', 'AU')).toBe(false);
      expect(validatePostalCode('12345', 'AU')).toBe(false);
    });
  });

  describe('Brazilian postal codes', () => {
    it('should accept valid Brazilian CEP codes', () => {
      expect(validatePostalCode('01310-100', 'BR')).toBe(true);
      expect(validatePostalCode('01310100', 'BR')).toBe(true); // Without hyphen
    });

    it('should reject invalid Brazilian CEP codes', () => {
      expect(validatePostalCode('12345', 'BR')).toBe(false);
      expect(validatePostalCode('123456789', 'BR')).toBe(false);
    });
  });

  describe('Mexican postal codes', () => {
    it('should accept valid Mexican postal codes', () => {
      expect(validatePostalCode('01000', 'MX')).toBe(true);
      expect(validatePostalCode('06600', 'MX')).toBe(true);
    });

    it('should reject invalid Mexican postal codes', () => {
      expect(validatePostalCode('1234', 'MX')).toBe(false);
      expect(validatePostalCode('123456', 'MX')).toBe(false);
    });
  });

  describe('Swedish postal codes', () => {
    it('should accept valid Swedish postal codes', () => {
      expect(validatePostalCode('123 45', 'SE')).toBe(true);
      expect(validatePostalCode('12345', 'SE')).toBe(true); // Without space
    });

    it('should reject invalid Swedish postal codes', () => {
      expect(validatePostalCode('1234', 'SE')).toBe(false);
      expect(validatePostalCode('123456', 'SE')).toBe(false);
    });
  });

  describe('Norwegian postal codes', () => {
    it('should accept valid Norwegian postal codes', () => {
      expect(validatePostalCode('0001', 'NO')).toBe(true);
      expect(validatePostalCode('9999', 'NO')).toBe(true);
    });

    it('should reject invalid Norwegian postal codes', () => {
      expect(validatePostalCode('123', 'NO')).toBe(false);
      expect(validatePostalCode('12345', 'NO')).toBe(false);
    });
  });

  describe('Unknown countries', () => {
    it('should accept any postal code for unknown countries', () => {
      expect(validatePostalCode('12345', 'XX')).toBe(true);
      expect(validatePostalCode('ABCDE', 'YY')).toBe(true);
      expect(validatePostalCode('anything', 'ZZ')).toBe(true);
    });
  });
});

describe('validateAddressLine', () => {
  describe('Minimum length validation', () => {
    it('should reject addresses shorter than 3 characters', () => {
      expect(validateAddressLine('', 'US')).toBe('Address too short');
      expect(validateAddressLine('a', 'US')).toBe('Address too short');
      expect(validateAddressLine('ab', 'US')).toBe('Address too short');
      expect(validateAddressLine('  ', 'US')).toBe('Address too short'); // Only spaces
    });

    it('should accept addresses with 3 or more characters', () => {
      expect(validateAddressLine('abc', 'US')).toBeNull();
      expect(validateAddressLine('123 Main St', 'US')).toBeNull();
      expect(validateAddressLine('A very long address line', 'US')).toBeNull();
    });
  });

  describe('PO Box detection for US', () => {
    it('should reject PO Box addresses in US', () => {
      expect(validateAddressLine('PO Box 123', 'US')).toBe('PO Boxes not allowed for this country');
      expect(validateAddressLine('P.O. Box 456', 'US')).toBe('PO Boxes not allowed for this country');
      expect(validateAddressLine('P.O.Box 789', 'US')).toBe('PO Boxes not allowed for this country');
      expect(validateAddressLine('po box 111', 'US')).toBe('PO Boxes not allowed for this country');
      expect(validateAddressLine('P O Box 222', 'US')).toBe('PO Boxes not allowed for this country');
      expect(validateAddressLine('POBox 333', 'US')).toBe('PO Boxes not allowed for this country');
    });

    it('should accept regular street addresses in US', () => {
      expect(validateAddressLine('123 Main Street', 'US')).toBeNull();
      expect(validateAddressLine('456 Oak Avenue', 'US')).toBeNull();
      expect(validateAddressLine('789 Elm Boulevard', 'US')).toBeNull();
    });

    it('should not reject addresses that contain "box" but are not PO Boxes', () => {
      expect(validateAddressLine('123 Boxwood Lane', 'US')).toBeNull();
      expect(validateAddressLine('456 Box Elder Drive', 'US')).toBeNull();
    });
  });

  describe('PO Box acceptance for non-US countries', () => {
    it('should accept PO Box addresses in Canada', () => {
      expect(validateAddressLine('PO Box 123', 'CA')).toBeNull();
      expect(validateAddressLine('P.O. Box 456', 'CA')).toBeNull();
    });

    it('should accept PO Box addresses in UK', () => {
      expect(validateAddressLine('PO Box 789', 'GB')).toBeNull();
      expect(validateAddressLine('P.O. Box 111', 'GB')).toBeNull();
    });

    it('should accept PO Box addresses in other countries', () => {
      expect(validateAddressLine('PO Box 222', 'DE')).toBeNull();
      expect(validateAddressLine('PO Box 333', 'FR')).toBeNull();
      expect(validateAddressLine('PO Box 444', 'JP')).toBeNull();
      expect(validateAddressLine('PO Box 555', 'AU')).toBeNull();
    });
  });
});

describe('postalCodePatterns', () => {
  it('should export postal code patterns for all required countries', () => {
    // Requirements 10.1-10.11 specify patterns for these countries
    expect(postalCodePatterns.US).toBeDefined();
    expect(postalCodePatterns.CA).toBeDefined();
    expect(postalCodePatterns.GB).toBeDefined();
    expect(postalCodePatterns.DE).toBeDefined();
    expect(postalCodePatterns.FR).toBeDefined();
    expect(postalCodePatterns.JP).toBeDefined();
    expect(postalCodePatterns.CN).toBeDefined();
    expect(postalCodePatterns.IN).toBeDefined();
    expect(postalCodePatterns.AU).toBeDefined();
    expect(postalCodePatterns.BR).toBeDefined();
    expect(postalCodePatterns.MX).toBeDefined();
  });

  it('should have RegExp patterns', () => {
    expect(postalCodePatterns.US).toBeInstanceOf(RegExp);
    expect(postalCodePatterns.CA).toBeInstanceOf(RegExp);
    expect(postalCodePatterns.GB).toBeInstanceOf(RegExp);
  });
});
