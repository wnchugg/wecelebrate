/**
 * Storage Utils Test Suite
 * Day 2 - Afternoon Session
 * Tests for src/app/utils/storage.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

global.localStorage = localStorageMock as Storage;

// Import after mocking
import {
  setItem,
  getItem,
  removeItem,
  clear,
  hasItem,
  getKeys,
  setEncrypted,
  getEncrypted
} from '../storage';

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve string value', () => {
      setItem('test-key', 'test-value');
      expect(getItem('test-key')).toBe('test-value');
    });

    it('should store and retrieve number value', () => {
      setItem('number', 42);
      expect(getItem('number')).toBe(42);
    });

    it('should store and retrieve boolean value', () => {
      setItem('boolean', true);
      expect(getItem('boolean')).toBe(true);
    });

    it('should store and retrieve object', () => {
      const obj = { name: 'Test', value: 123 };
      setItem('object', obj);
      expect(getItem('object')).toEqual(obj);
    });

    it('should store and retrieve array', () => {
      const arr = [1, 2, 3, 'test'];
      setItem('array', arr);
      expect(getItem('array')).toEqual(arr);
    });

    it('should return null for non-existent key', () => {
      expect(getItem('nonexistent')).toBeNull();
    });

    it('should remove item', () => {
      setItem('test', 'value');
      removeItem('test');
      expect(getItem('test')).toBeNull();
    });

    it('should clear all items', () => {
      setItem('test1', 'value1');
      setItem('test2', 'value2');
      clear();
      expect(getItem('test1')).toBeNull();
      expect(getItem('test2')).toBeNull();
    });
  });

  describe('Key Management', () => {
    it('should check if item exists', () => {
      setItem('test', 'value');
      expect(hasItem('test')).toBe(true);
      expect(hasItem('nonexistent')).toBe(false);
    });

    it('should get all keys', () => {
      setItem('key1', 'value1');
      setItem('key2', 'value2');
      setItem('key3', 'value3');
      
      const keys = getKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
      expect(keys.length).toBe(3);
    });

    it('should get keys by prefix', () => {
      setItem('user:1', 'data1');
      setItem('user:2', 'data2');
      setItem('product:1', 'data3');
      
      const userKeys = getKeys();
      const filteredKeys = userKeys.filter(key => key.startsWith('user:'));
      expect(filteredKeys).toContain('user:1');
      expect(filteredKeys).toContain('user:2');
      expect(filteredKeys).not.toContain('product:1');
    });

    it('should return empty array when no keys match prefix', () => {
      setItem('test', 'value');
      const keys = getKeys();
      const filteredKeys = keys.filter(key => key.startsWith('nonexistent:'));
      expect(filteredKeys).toEqual([]);
    });
  });

  describe('Data Types and Serialization', () => {
    it('should handle null values', () => {
      setItem('null-test', null);
      expect(getItem('null-test')).toBeNull();
    });

    it('should handle undefined values', () => {
      setItem('undefined-test', undefined);
      const result = getItem('undefined-test');
      expect(result === undefined || result === null).toBe(true);
    });

    it('should handle nested objects', () => {
      const nested = {
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      };
      setItem('nested', nested);
      expect(getItem('nested')).toEqual(nested);
    });

    it('should handle arrays of objects', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      setItem('array-objects', data);
      expect(getItem('array-objects')).toEqual(data);
    });

    it('should handle special characters in values', () => {
      const special = 'Test with "quotes" and \'apostrophes\' and \\backslashes\\';
      setItem('special', special);
      expect(getItem('special')).toBe(special);
    });

    it('should handle Date objects', () => {
      const date = new Date('2026-02-11');
      setItem('date', date);
      const retrieved = getItem('date');
      // Dates are serialized to ISO strings
      expect(retrieved).toBe(date.toISOString());
    });
  });

  describe('Encrypted Storage', () => {
    it('should store and retrieve encrypted data', () => {
      const sensitive = { password: 'secret123', apiKey: 'key-abc' };
      setEncrypted('credentials', sensitive);
      
      const retrieved = getEncrypted('credentials');
      expect(retrieved).toEqual(sensitive);
    });

    it('should not store encrypted data in plain text', () => {
      const sensitive = { password: 'secret123' };
      setEncrypted('credentials', sensitive);
      
      const raw = localStorage.getItem('credentials');
      expect(raw).not.toContain('secret123');
    });

    it('should return null for non-existent encrypted key', () => {
      expect(getEncrypted('nonexistent')).toBeNull();
    });

    it('should handle encrypted arrays', () => {
      const tokens = ['token1', 'token2', 'token3'];
      setEncrypted('tokens', tokens);
      expect(getEncrypted('tokens')).toEqual(tokens);
    });

    it('should handle encrypted primitive values', () => {
      setEncrypted('secret-number', 12345);
      expect(getEncrypted('secret-number')).toBe(12345);
    });

    it('should overwrite existing encrypted data', () => {
      setEncrypted('credentials', { password: 'old' });
      setEncrypted('credentials', { password: 'new' });
      expect(getEncrypted('credentials')).toEqual({ password: 'new' });
    });
  });

  describe('Error Handling', () => {
    it('should handle storage quota exceeded', () => {
      // Mock quota exceeded error
      const originalSetItem = localStorage.setItem;
      
      try {
        localStorage.setItem = vi.fn(() => {
          throw new DOMException('QuotaExceededError');
        });

        expect(() => setItem('test', 'value')).not.toThrow();
      } finally {
        localStorage.setItem = originalSetItem;
      }
    });

    it('should handle corrupted encrypted data', () => {
      const originalSetItem = localStorage.setItem;
      
      try {
        // Manually insert corrupted encrypted data
        localStorage.setItem('corrupted', 'not-valid-encrypted-data');
        
        // Should return null or handle gracefully
        const result = getEncrypted('corrupted');
        expect(result).toBeNull();
      } finally {
        localStorage.setItem = originalSetItem;
      }
    });
  });

  describe('Storage Limits', () => {
    it('should handle large strings', () => {
      const large = 'x'.repeat(10000);
      setItem('large', large);
      expect(getItem('large')).toBe(large);
    });

    it('should handle many items', () => {
      for (let i = 0; i < 100; i++) {
        setItem(`item-${i}`, `value-${i}`);
      }
      
      expect(getKeys().length).toBe(100);
      expect(getItem('item-50')).toBe('value-50');
    });
  });

  describe('Namespace Support', () => {
    it('should support namespaced keys', () => {
      setItem('app:user:name', 'John');
      setItem('app:user:email', 'john@example.com');
      setItem('app:settings:theme', 'dark');
      
      const allKeys = getKeys();
      const userKeys = allKeys.filter(key => key.startsWith('app:user:'));
      expect(userKeys.length).toBe(2);
    });

    it('should clear namespace', () => {
      setItem('app:data:1', 'value1');
      setItem('app:data:2', 'value2');
      setItem('other:data', 'value3');
      
      // Remove all app:data: items
      const allKeys = getKeys();
      allKeys.filter(key => key.startsWith('app:data:')).forEach(key => removeItem(key));
      
      expect(hasItem('app:data:1')).toBe(false);
      expect(hasItem('app:data:2')).toBe(false);
      expect(hasItem('other:data')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string key', () => {
      setItem('', 'value');
      expect(getItem('')).toBe('value');
    });

    it('should handle whitespace-only values', () => {
      setItem('whitespace', '   ');
      expect(getItem('whitespace')).toBe('   ');
    });

    it('should handle unicode characters', () => {
      const unicode = '你好世界 🎉 مرحبا';
      setItem('unicode', unicode);
      expect(getItem('unicode')).toBe(unicode);
    });

    it('should handle very long keys', () => {
      const longKey = 'x'.repeat(1000);
      setItem(longKey, 'value');
      expect(getItem(longKey)).toBe('value');
    });

    it('should handle circular references gracefully', () => {
      const circular: any = { prop: 'value' };
      circular.self = circular;
      
      // Should not throw error
      expect(() => setItem('circular', circular)).not.toThrow();
    });
  });
});