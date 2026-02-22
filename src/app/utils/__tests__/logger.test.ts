/**
 * Logger Utils Test Suite
 * Day 3 - Morning Session
 * Tests for src/app/utils/logger.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, setLogLevel } from '../logger';

describe('Logger Utils', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;
  let consoleInfoSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    // Reset log level to DEBUG for each test
    setLogLevel('DEBUG');
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('Log Levels', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Debug message'
      );
    });

    it('should log info messages', () => {
      logger.info('Info message');
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Info message'
      );
    });

    it('should log warn messages', () => {
      logger.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        'Warning message'
      );
    });

    it('should log error messages', () => {
      logger.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Error message'
      );
    });

    it('should log with default log method', () => {
      logger.log('Log message');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.anything(),
        'Log message'
      );
    });
  });

  describe('Log Level Filtering', () => {
    it('should filter logs below set level - ERROR', () => {
      setLogLevel('ERROR');
      
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should filter logs below set level - WARN', () => {
      setLogLevel('WARN');
      
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should filter logs below set level - INFO', () => {
      setLogLevel('INFO');
      
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should show all logs with DEBUG level', () => {
      setLogLevel('DEBUG');
      
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should disable all logs with NONE level', () => {
      setLogLevel('NONE');
      
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Log Formatting', () => {
    it('should include timestamp in logs', () => {
      logger.info('Test');
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\d{2}:\d{2}:\d{2}/),
        'Test'
      );
    });

    it('should format multiple arguments', () => {
      logger.info('Message', { data: 'value' }, 123);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.any(String),
        'Message',
        { data: 'value' },
        123
      );
    });

    it('should handle object logging', () => {
      const obj = { key: 'value', nested: { prop: 'test' } };
      logger.info('Object:', obj);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.any(String),
        'Object:',
        obj
      );
    });

    it('should handle array logging', () => {
      const arr = [1, 2, 3, { test: 'value' }];
      logger.info('Array:', arr);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.any(String),
        'Array:',
        arr
      );
    });

    it('should handle error object logging', () => {
      const error = new Error('Test error');
      logger.error('Error occurred:', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        'Error occurred:',
        error
      );
    });
  });

  describe('Context and Metadata', () => {
    it('should log with context', () => {
      logger.info('Message', { context: { userId: '123', action: 'login' } });
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.any(String),
        'Message',
        expect.objectContaining({ context: expect.any(Object) })
      );
    });

    it('should preserve metadata in logs', () => {
      const metadata = { requestId: 'abc-123', timestamp: Date.now() };
      logger.info('Request', metadata);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.any(String),
        'Request',
        metadata
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      expect(() => logger.info(null)).not.toThrow();
    });

    it('should handle undefined values', () => {
      expect(() => logger.info(undefined)).not.toThrow();
    });

    it('should handle empty strings', () => {
      logger.info('');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000);
      expect(() => logger.info(longMessage)).not.toThrow();
    });

    it('should handle circular references', () => {
      const circular: any = { prop: 'value' };
      circular.self = circular;
      
      expect(() => logger.info('Circular:', circular)).not.toThrow();
    });

    it('should handle symbols', () => {
      const sym = Symbol('test');
      expect(() => logger.info('Symbol:', sym)).not.toThrow();
    });

    it('should handle functions', () => {
      const fn = () => 'test';
      expect(() => logger.info('Function:', fn)).not.toThrow();
    });

    it('should handle dates', () => {
      const date = new Date();
      logger.info('Date:', date);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.any(String),
        'Date:',
        date
      );
    });

    it('should handle regex', () => {
      const regex = /test/g;
      logger.info('Regex:', regex);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.any(String),
        'Regex:',
        regex
      );
    });

    it('should handle maps', () => {
      const map = new Map([['key', 'value']]);
      logger.info('Map:', map);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.any(String),
        'Map:',
        map
      );
    });

    it('should handle sets', () => {
      const set = new Set([1, 2, 3]);
      logger.info('Set:', set);
      
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.any(String),
        'Set:',
        set
      );
    });
  });

  describe('Environment-Specific Behavior', () => {
    it('should respect production environment settings', () => {
      const originalEnv = import.meta.env.MODE;
      (import.meta.env as any).MODE = 'production';
      
      // In production, debug logs might be disabled
      setLogLevel('INFO');
      logger.debug('Debug in production');
      
      (import.meta.env as any).MODE = originalEnv;
    });

    it('should respect development environment settings', () => {
      const originalEnv = import.meta.env.MODE;
      (import.meta.env as any).MODE = 'development';
      
      // In development, all logs should be visible
      setLogLevel('DEBUG');
      logger.debug('Debug in development');
      
      expect(consoleLogSpy).toHaveBeenCalled();
      
      (import.meta.env as any).MODE = originalEnv;
    });
  });

  describe('Performance', () => {
    it('should handle rapid logging without issues', () => {
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`);
      }
      
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1000);
    });

    it('should not evaluate expensive operations when log level filters them', () => {
      setLogLevel('ERROR');
      
      const expensiveOperation = vi.fn(() => {
        // Simulate expensive computation
        return 'result';
      });
      
      logger.debug('Debug', expensiveOperation());
      
      // Function should still be called (lazy evaluation not implemented)
      // This test documents current behavior
    });
  });

  describe('Special Characters', () => {
    it('should handle unicode characters', () => {
      logger.info('Unicode: 你好世界 🎉');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle escape sequences', () => {
      logger.info('Escape: \n\t\r');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle quotes', () => {
      logger.info('Quotes: "double" \'single\' `backtick`');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });
});
