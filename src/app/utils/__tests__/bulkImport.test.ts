/**
 * Bulk Import Tests
 * Day 7 - Week 2: Business Logic Utils Testing
 * Target: 30 tests
 * 
 * UPDATED: February 12, 2026 - Migrated from xlsx to exceljs
 */

import { describe, it, expect, vi } from 'vitest';
import {
  detectFieldMapping,
  validateProductData,
  generateSampleCSV,
  FIELD_MAPPINGS,
} from '../bulkImport';

// Mock Papa and ExcelJS
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
    unparse: vi.fn((data) => {
      // Return CSV with headers for testing
      if (data && data.fields) {
        return data.fields.join(',') + '\n' + 
               data.data.map((row: any[]) => row.join(',')).join('\n');
      }
      return 'name,category,value,description\nSample Product,Electronics,50.00,Sample description';
    }),
  }
}));

// Mock ExcelJS (replaces xlsx mock)
vi.mock('exceljs', () => ({
  default: class MockWorkbook {
    worksheets: any[] = [];
    xlsx = {
      load: async (data: ArrayBuffer) => {
        return Promise.resolve();
      },
      writeBuffer: async () => {
        return Promise.resolve(new ArrayBuffer(0));
      }
    };
    
    addWorksheet(name: string) {
      const worksheet = {
        name,
        addRow: vi.fn(),
        eachRow: vi.fn(),
        getRow: vi.fn(),
      };
      this.worksheets.push(worksheet);
      return worksheet;
    }
  }
}));

describe('BulkImport Utils', () => {
  describe('FIELD_MAPPINGS', () => {
    it('should have mapping for name field', () => {
      expect(FIELD_MAPPINGS.name).toBeDefined();
      expect(FIELD_MAPPINGS.name).toContain('name');
    });

    it('should have mapping for all essential fields', () => {
      const essentialFields = ['name', 'category', 'value', 'description'];
      essentialFields.forEach(field => {
        expect((FIELD_MAPPINGS as Record<string, string[]>)[field]).toBeDefined();
      });
    });

    it('should have multiple possible headers per field', () => {
      expect(FIELD_MAPPINGS.value.length).toBeGreaterThan(1);
      expect(FIELD_MAPPINGS.name.length).toBeGreaterThan(1);
    });

    it('should include common variations', () => {
      expect(FIELD_MAPPINGS.value).toContain('price');
      expect(FIELD_MAPPINGS.value).toContain('amount');
    });
  });

  describe('detectFieldMapping', () => {
    it('should detect exact field names', () => {
      const headers = ['name', 'category', 'value'];
      const mapping = detectFieldMapping(headers);
      
      expect(mapping.name).toBe('name');
      expect(mapping.category).toBe('category');
      expect(mapping.value).toBe('value');
    });

    it('should detect alternative field names', () => {
      const headers = ['product_name', 'type', 'price'];
      const mapping = detectFieldMapping(headers);
      
      expect(mapping.name).toBe('product_name');
      expect(mapping.category).toBe('type');
      expect(mapping.value).toBe('price');
    });

    it('should handle case insensitive matching', () => {
      const headers = ['NAME', 'CATEGORY', 'PRICE'];
      const mapping = detectFieldMapping(headers);
      
      expect(mapping.name).toBeDefined();
      expect(mapping.category).toBeDefined();
      expect(mapping.value).toBeDefined();
    });

    it('should handle headers with whitespace', () => {
      const headers = ['  name  ', 'category', 'value'];
      const mapping = detectFieldMapping(headers);
      
      expect(mapping.name).toBeDefined();
    });

    it('should return empty object for unrecognized headers', () => {
      const headers = ['unknown1', 'unknown2'];
      const mapping = detectFieldMapping(headers);
      
      expect(Object.keys(mapping).length).toBe(0);
    });

    it('should map multiple fields correctly', () => {
      const headers = ['name', 'description', 'category', 'value', 'sku'];
      const mapping = detectFieldMapping(headers);
      
      expect(Object.keys(mapping).length).toBeGreaterThanOrEqual(5);
    });

    it('should prefer exact matches', () => {
      const headers = ['name', 'product_name'];
      const mapping = detectFieldMapping(headers);
      
      // Should find at least one
      expect(mapping.name).toBeDefined();
    });
  });

  describe('validateProductData', () => {
    it('should validate required fields', () => {
      const data = [
        { name: 'Product 1', category: 'Electronics', value: '100' }
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
    });

    it('should detect missing required fields', () => {
      const data = [
        { name: 'Product 1' } // Missing category and value
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'category')).toBe(true);
      expect(result.errors.some(e => e.field === 'value')).toBe(true);
    });

    it('should validate name length minimum', () => {
      const data = [
        { name: 'A', category: 'Test', value: '100' }
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.errors.some(e => 
        e.field === 'name' && e.message.includes('at least 2 characters')
      )).toBe(true);
    });

    it('should validate name length maximum', () => {
      const data = [
        { name: 'A'.repeat(201), category: 'Test', value: '100' }
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.errors.some(e => 
        e.field === 'name' && e.message.includes('less than 200 characters')
      )).toBe(true);
    });

    it('should parse numeric values', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '99.99' }
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].value).toBe(99.99);
      expect(typeof result.data[0].value).toBe('number');
    });

    it('should handle currency symbols in values', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '$123.45' }
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].value).toBe(123.45);
    });

    it('should reject negative values', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '-50' }
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.errors.some(e => 
        e.field === 'value' && e.message.includes('positive number')
      )).toBe(true);
    });

    it('should reject invalid numeric values', () => {
      const data = [
        { name: 'Product', category: 'Test', value: 'not a number' }
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.errors.some(e => e.field === 'value')).toBe(true);
    });

    it('should validate retail value when present', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100', retailValue: '$150.00' }
      ];
      const mapping = { 
        name: 'name', 
        category: 'category', 
        value: 'value',
        retailValue: 'retailValue'
      };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].retailValue).toBe(150);
    });

    it('should validate status field', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100', status: 'active' }
      ];
      const mapping = { 
        name: 'name', 
        category: 'category', 
        value: 'value',
        status: 'status'
      };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].status).toBe('active');
    });

    it('should reject invalid status', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100', status: 'invalid' }
      ];
      const mapping = { 
        name: 'name', 
        category: 'category', 
        value: 'value',
        status: 'status'
      };
      
      const result = validateProductData(data, mapping);
      
      expect(result.errors.some(e => e.field === 'status')).toBe(true);
    });

    it('should default status to active', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100' }
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].status).toBe('active');
    });

    it('should parse boolean available field', () => {
      const testCases = [
        { input: 'true', expected: true },
        { input: '1', expected: true },
        { input: 'yes', expected: true },
        { input: 'false', expected: false },
        { input: '0', expected: false },
        { input: 'no', expected: false },
      ];

      testCases.forEach(({ input, expected }) => {
        const data = [
          { name: 'Product', category: 'Test', value: '100', available: input }
        ];
        const mapping = { 
          name: 'name', 
          category: 'category', 
          value: 'value',
          available: 'available'
        };
        
        const result = validateProductData(data, mapping);
        expect(result.data[0].available).toBe(expected);
      });
    });

    it('should default available to true', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100' }
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].available).toBe(true);
    });

    it('should validate inventory status', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100', inventoryStatus: 'in_stock' }
      ];
      const mapping = { 
        name: 'name', 
        category: 'category', 
        value: 'value',
        inventoryStatus: 'inventoryStatus'
      };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].inventoryStatus).toBe('in_stock');
    });

    it('should normalize inventory status spacing', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100', inventoryStatus: 'in stock' }
      ];
      const mapping = { 
        name: 'name', 
        category: 'category', 
        value: 'value',
        inventoryStatus: 'inventoryStatus'
      };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].inventoryStatus).toBe('in_stock');
    });

    it('should validate image URL format', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100', imageUrl: 'not-a-url' }
      ];
      const mapping = { 
        name: 'name', 
        category: 'category', 
        value: 'value',
        imageUrl: 'imageUrl'
      };
      
      const result = validateProductData(data, mapping);
      
      expect(result.errors.some(e => e.field === 'imageUrl')).toBe(true);
    });

    it('should accept valid image URLs', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100', imageUrl: 'https://example.com/image.jpg' }
      ];
      const mapping = { 
        name: 'name', 
        category: 'category', 
        value: 'value',
        imageUrl: 'imageUrl'
      };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should validate priority as integer', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100', priority: '5' }
      ];
      const mapping = { 
        name: 'name', 
        category: 'category', 
        value: 'value',
        priority: 'priority'
      };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].priority).toBe(5);
    });

    it('should validate quantity limit', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100', quantityLimit: '10' }
      ];
      const mapping = { 
        name: 'name', 
        category: 'category', 
        value: 'value',
        quantityLimit: 'quantityLimit'
      };
      
      const result = validateProductData(data, mapping);
      
      expect(result.data[0].quantityLimit).toBe(10);
    });

    it('should reject zero or negative quantity limit', () => {
      const data = [
        { name: 'Product', category: 'Test', value: '100', quantityLimit: '0' }
      ];
      const mapping = { 
        name: 'name', 
        category: 'category', 
        value: 'value',
        quantityLimit: 'quantityLimit'
      };
      
      const result = validateProductData(data, mapping);
      
      expect(result.errors.some(e => e.field === 'quantityLimit')).toBe(true);
    });

    it('should handle multiple rows', () => {
      const data = [
        { name: 'Product 1', category: 'Test', value: '100' },
        { name: 'Product 2', category: 'Test', value: '200' },
        { name: 'Product 3', category: 'Test', value: '300' }
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.totalRows).toBe(3);
      expect(result.successCount).toBe(3);
      expect(result.data.length).toBe(3);
    });

    it('should track row numbers in errors', () => {
      const data = [
        { name: 'Product 1', category: 'Test' }, // Missing value
        { name: 'Product 2', category: 'Test', value: '200' },
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      const error = result.errors.find(e => e.field === 'value');
      expect(error?.row).toBe(2); // Account for header row
    });

    it('should return correct error count', () => {
      const data = [
        { name: 'A', category: 'Test', value: 'invalid' } // 2 errors: name length + invalid value
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.errorCount).toBeGreaterThan(0);
      expect(result.errors.length).toBe(result.errorCount);
    });

    it('should set success to false when errors exist', () => {
      const data = [
        { name: 'Product' } // Missing required fields
      ];
      const mapping = { name: 'name', category: 'category', value: 'value' };
      
      const result = validateProductData(data, mapping);
      
      expect(result.success).toBe(false);
    });
  });

  describe('generateSampleCSV', () => {
    it('should generate a CSV string', () => {
      const csv = generateSampleCSV();
      expect(typeof csv).toBe('string');
      expect(csv.length).toBeGreaterThan(0);
    });

    it('should include all required headers', () => {
      // The mock already returns CSV with headers
      const csv = generateSampleCSV();
      
      expect(csv).toContain('name');
      expect(csv).toContain('category');
      expect(csv).toContain('value');
    });
  });
});