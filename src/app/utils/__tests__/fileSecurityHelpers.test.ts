import { describe, it, expect } from 'vitest';
import {
  validateFileSize,
  validateFileType,
  sanitizeObjectKeys,
  sanitizeImportedData,
  validateStringForReDoS,
  performSecurityChecks,
} from '../fileSecurityHelpers';

describe('fileSecurityHelpers', () => {
  describe('validateFileSize', () => {
    it('should accept files under the size limit', () => {
      const file = new File(['a'.repeat(1024 * 1024)], 'test.csv', { type: 'text/csv' });
      expect(validateFileSize(file, 10)).toBe(true);
    });

    it('should reject files over the size limit', () => {
      const file = new File(['a'.repeat(11 * 1024 * 1024)], 'test.csv', { type: 'text/csv' });
      expect(validateFileSize(file, 10)).toBe(false);
    });

    it('should use default 10MB limit', () => {
      const file = new File(['a'.repeat(9 * 1024 * 1024)], 'test.csv', { type: 'text/csv' });
      expect(validateFileSize(file)).toBe(true);
    });
  });

  describe('validateFileType', () => {
    it('should accept valid file extensions', () => {
      const file = new File(['data'], 'test.csv', { type: 'text/csv' });
      expect(validateFileType(file, ['.csv', '.xlsx'])).toBe(true);
    });

    it('should reject invalid file extensions', () => {
      const file = new File(['data'], 'test.exe', { type: 'application/x-executable' });
      expect(validateFileType(file, ['.csv', '.xlsx'])).toBe(false);
    });

    it('should be case-insensitive for extensions', () => {
      const file = new File(['data'], 'test.CSV', { type: 'text/csv' });
      expect(validateFileType(file, ['.csv'])).toBe(true);
    });

    it('should validate MIME types when provided', () => {
      const file = new File(['data'], 'test.csv', { type: 'text/csv' });
      expect(validateFileType(file, ['.csv'], ['text/csv'])).toBe(true);
    });

    it('should reject wrong MIME types', () => {
      const file = new File(['data'], 'test.csv', { type: 'application/octet-stream' });
      expect(validateFileType(file, ['.csv'], ['text/csv'])).toBe(false);
    });
  });

  describe('sanitizeObjectKeys', () => {
    it('should remove __proto__ keys', () => {
      const obj = { name: 'John', __proto__: { admin: true } };
      const sanitized = sanitizeObjectKeys(obj);
      expect(sanitized).toEqual({ name: 'John' });
      expect('__proto__' in sanitized).toBe(false);
    });

    it('should remove constructor keys', () => {
      const obj = { name: 'John', constructor: 'malicious' };
      const sanitized = sanitizeObjectKeys(obj);
      expect(sanitized).toEqual({ name: 'John' });
    });

    it('should remove prototype keys', () => {
      const obj = { name: 'John', prototype: 'malicious' };
      const sanitized = sanitizeObjectKeys(obj);
      expect(sanitized).toEqual({ name: 'John' });
    });

    it('should preserve safe keys', () => {
      const obj = { name: 'John', email: 'john@example.com', age: 30 };
      const sanitized = sanitizeObjectKeys(obj);
      expect(sanitized).toEqual(obj);
    });

    it('should handle empty objects', () => {
      const obj = {};
      const sanitized = sanitizeObjectKeys(obj);
      expect(sanitized).toEqual({});
    });
  });

  describe('sanitizeImportedData', () => {
    it('should sanitize all objects in array', () => {
      const data: any[] = [
        { name: 'John', __proto__: { admin: true }, constructor: undefined as any },
        { name: 'Jane', constructor: 'malicious' as any, __proto__: undefined },
      ];
      const sanitized = sanitizeImportedData(data);
      expect(sanitized).toEqual([
        { name: 'John' },
        { name: 'Jane' },
      ]);
    });

    it('should handle empty arrays', () => {
      expect(sanitizeImportedData([])).toEqual([]);
    });
  });

  describe('validateStringForReDoS', () => {
    it('should accept normal strings', () => {
      expect(validateStringForReDoS('Hello World')).toBe(true);
      expect(validateStringForReDoS('John Doe, 123 Main St')).toBe(true);
    });

    it('should reject excessively long strings', () => {
      const longString = 'a'.repeat(20000);
      expect(validateStringForReDoS(longString)).toBe(false);
    });

    it('should accept long strings under custom limit', () => {
      // Use a varied string that doesn't trigger repetition checks
      const longString = 'abcdefghij'.repeat(1500); // 15000 chars, no excessive repetition
      expect(validateStringForReDoS(longString, 20000)).toBe(true);
    });

    it('should reject strings with excessive character repetition', () => {
      const repetitiveString = 'a'.repeat(150);
      expect(validateStringForReDoS(repetitiveString)).toBe(false);
    });

    it('should reject strings with excessive word repetition', () => {
      const repetitiveString = 'word '.repeat(150);
      expect(validateStringForReDoS(repetitiveString)).toBe(false);
    });

    it('should accept reasonable repetition', () => {
      const string = 'Hello! '.repeat(10);
      expect(validateStringForReDoS(string)).toBe(true);
    });
  });

  describe('performSecurityChecks', () => {
    it('should pass valid file and data', () => {
      const file = new File(['data'], 'test.csv', { type: 'text/csv' });
      const data = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' },
      ];
      
      const result = performSecurityChecks(file, data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for oversized files', () => {
      const file = new File(['a'.repeat(15 * 1024 * 1024)], 'test.csv', { type: 'text/csv' });
      const data = [{ name: 'John' }];
      
      const result = performSecurityChecks(file, data, { maxSizeMB: 10 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size exceeds 10MB limit');
    });

    it('should fail for invalid file types', () => {
      const file = new File(['data'], 'test.exe', { type: 'application/x-executable' });
      const data = [{ name: 'John' }];
      
      const result = performSecurityChecks(file, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('File type not allowed'))).toBe(true);
    });

    it('should fail for too many rows', () => {
      const file = new File(['data'], 'test.csv', { type: 'text/csv' });
      const data = Array.from({ length: 15000 }, (_, i) => ({ id: i }));
      
      const result = performSecurityChecks(file, data, { maxRows: 10000 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Too many rows'))).toBe(true);
    });

    it('should fail for empty data', () => {
      const file = new File(['data'], 'test.csv', { type: 'text/csv' });
      const data: any[] = [];
      
      const result = performSecurityChecks(file, data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File contains no data');
    });

    it('should warn for long cell content', () => {
      const file = new File(['data'], 'test.csv', { type: 'text/csv' });
      const data = [{ name: 'a'.repeat(6000) }];
      
      const result = performSecurityChecks(file, data, { maxCellLength: 5000 });
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('exceed'))).toBe(true);
    });

    it('should fail for suspicious ReDoS patterns', () => {
      const file = new File(['data'], 'test.csv', { type: 'text/csv' });
      const data = [{ name: 'a'.repeat(150) }];
      
      const result = performSecurityChecks(file, data);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Suspicious content detected'))).toBe(true);
    });

    it('should use custom options', () => {
      const file = new File(['data'], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      
      const result = performSecurityChecks(file, data, {
        maxSizeMB: 20,
        allowedExtensions: ['.xlsx', '.xls'],
        maxRows: 200,
        maxCellLength: 1000,
      });
      
      expect(result.isValid).toBe(true);
    });
  });
});
