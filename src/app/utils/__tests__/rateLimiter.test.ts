/**
 * Rate Limiter Tests
 * Day 6 - Week 2: Performance & Optimization Testing
 * Target: 35 tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  rateLimiter,
  RATE_LIMITS,
  createRateLimitKey,
  checkRateLimit,
  getRemainingAttempts,
  resetRateLimit,
} from '../rateLimiter';

// Mock logger
vi.mock('../logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }
}));

describe('RateLimiter', () => {
  beforeEach(() => {
    rateLimiter.clearAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    rateLimiter.clearAll();
    vi.useRealTimers();
  });

  describe('checkLimit', () => {
    it('should allow first attempt', () => {
      const config = { maxAttempts: 5, windowMs: 60000 };
      const result = rateLimiter.checkLimit('test-action', config);
      
      expect(result).toBe(true);
    });

    it('should track attempts within window', () => {
      const config = { maxAttempts: 3, windowMs: 60000 };
      
      expect(rateLimiter.checkLimit('test', config)).toBe(true); // 1
      expect(rateLimiter.checkLimit('test', config)).toBe(true); // 2
      expect(rateLimiter.checkLimit('test', config)).toBe(true); // 3
      expect(rateLimiter.checkLimit('test', config)).toBe(false); // 4 - exceeded
    });

    it('should block after exceeding max attempts', () => {
      const config = { maxAttempts: 2, windowMs: 60000 };
      
      rateLimiter.checkLimit('blocked-test', config);
      rateLimiter.checkLimit('blocked-test', config);
      const result = rateLimiter.checkLimit('blocked-test', config);
      
      expect(result).toBe(false);
    });

    it('should reset after window expires', () => {
      const config = { maxAttempts: 2, windowMs: 60000 };
      
      rateLimiter.checkLimit('window-test', config);
      rateLimiter.checkLimit('window-test', config);
      
      // Advance past window
      vi.advanceTimersByTime(60001);
      
      const result = rateLimiter.checkLimit('window-test', config);
      expect(result).toBe(true);
    });

    it('should use custom block duration', () => {
      const config = { 
        maxAttempts: 1, 
        windowMs: 1000, 
        blockDurationMs: 5000 
      };
      
      rateLimiter.checkLimit('custom-block', config);
      rateLimiter.checkLimit('custom-block', config); // Block
      
      // Advance less than block duration
      vi.advanceTimersByTime(4000);
      expect(rateLimiter.checkLimit('custom-block', config)).toBe(false);
      
      // Advance past block duration
      vi.advanceTimersByTime(1001);
      expect(rateLimiter.checkLimit('custom-block', config)).toBe(true);
    });

    it('should use default block duration if not specified', () => {
      const config = { maxAttempts: 1, windowMs: 1000 };
      
      rateLimiter.checkLimit('default-block', config);
      rateLimiter.checkLimit('default-block', config); // Block
      
      expect(rateLimiter.isBlocked('default-block')).toBe(true);
    });

    it('should handle different keys independently', () => {
      const config = { maxAttempts: 1, windowMs: 60000 };
      
      rateLimiter.checkLimit('key1', config);
      rateLimiter.checkLimit('key1', config); // Block key1
      
      // key2 should still work
      expect(rateLimiter.checkLimit('key2', config)).toBe(true);
    });

    it('should track attempts accurately', () => {
      const config = { maxAttempts: 5, windowMs: 60000 };
      const key = 'count-test';
      
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.checkLimit(key, config)).toBe(true);
      }
      
      expect(rateLimiter.checkLimit(key, config)).toBe(false);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return max attempts initially', () => {
      const config = { maxAttempts: 5, windowMs: 60000 };
      const remaining = rateLimiter.getRemainingAttempts('new-key', config);
      
      expect(remaining).toBe(5);
    });

    it('should decrease after each attempt', () => {
      const config = { maxAttempts: 5, windowMs: 60000 };
      const key = 'decrease-test';
      
      rateLimiter.checkLimit(key, config);
      expect(rateLimiter.getRemainingAttempts(key, config)).toBe(4);
      
      rateLimiter.checkLimit(key, config);
      expect(rateLimiter.getRemainingAttempts(key, config)).toBe(3);
    });

    it('should return 0 when blocked', () => {
      const config = { maxAttempts: 1, windowMs: 60000 };
      const key = 'zero-test';
      
      rateLimiter.checkLimit(key, config);
      rateLimiter.checkLimit(key, config); // Block
      
      expect(rateLimiter.getRemainingAttempts(key, config)).toBe(0);
    });

    it('should reset after window expires', () => {
      const config = { maxAttempts: 3, windowMs: 1000 };
      const key = 'reset-test';
      
      rateLimiter.checkLimit(key, config);
      
      vi.advanceTimersByTime(1001);
      
      expect(rateLimiter.getRemainingAttempts(key, config)).toBe(3);
    });

    it('should never return negative values', () => {
      const config = { maxAttempts: 1, windowMs: 60000 };
      const key = 'negative-test';
      
      rateLimiter.checkLimit(key, config);
      rateLimiter.checkLimit(key, config);
      rateLimiter.checkLimit(key, config);
      
      expect(rateLimiter.getRemainingAttempts(key, config)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getTimeUntilUnblocked', () => {
    it('should return 0 if not blocked', () => {
      const time = rateLimiter.getTimeUntilUnblocked('not-blocked');
      expect(time).toBe(0);
    });

    it('should return remaining block time', () => {
      const config = { 
        maxAttempts: 1, 
        windowMs: 1000, 
        blockDurationMs: 5000 
      };
      
      rateLimiter.checkLimit('blocked', config);
      rateLimiter.checkLimit('blocked', config); // Block
      
      const remaining = rateLimiter.getTimeUntilUnblocked('blocked');
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(5000);
    });

    it('should decrease over time', () => {
      const config = { 
        maxAttempts: 1, 
        windowMs: 1000, 
        blockDurationMs: 5000 
      };
      
      rateLimiter.checkLimit('time-test', config);
      rateLimiter.checkLimit('time-test', config); // Block
      
      const time1 = rateLimiter.getTimeUntilUnblocked('time-test');
      
      vi.advanceTimersByTime(1000);
      
      const time2 = rateLimiter.getTimeUntilUnblocked('time-test');
      
      expect(time2).toBeLessThan(time1);
    });

    it('should return 0 after block expires', () => {
      const config = { 
        maxAttempts: 1, 
        windowMs: 1000, 
        blockDurationMs: 2000 
      };
      
      rateLimiter.checkLimit('expire-test', config);
      rateLimiter.checkLimit('expire-test', config);
      
      vi.advanceTimersByTime(2001);
      
      expect(rateLimiter.getTimeUntilUnblocked('expire-test')).toBe(0);
    });
  });

  describe('isBlocked', () => {
    it('should return false if not blocked', () => {
      expect(rateLimiter.isBlocked('never-blocked')).toBe(false);
    });

    it('should return true when blocked', () => {
      const config = { maxAttempts: 1, windowMs: 60000 };
      
      rateLimiter.checkLimit('check-blocked', config);
      rateLimiter.checkLimit('check-blocked', config); // Block
      
      expect(rateLimiter.isBlocked('check-blocked')).toBe(true);
    });

    it('should return false after block expires', () => {
      const config = { 
        maxAttempts: 1, 
        windowMs: 1000, 
        blockDurationMs: 2000 
      };
      
      rateLimiter.checkLimit('temp-block', config);
      rateLimiter.checkLimit('temp-block', config); // Block
      
      vi.advanceTimersByTime(2001);
      
      expect(rateLimiter.isBlocked('temp-block')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset rate limit for key', () => {
      const config = { maxAttempts: 1, windowMs: 60000 };
      
      rateLimiter.checkLimit('reset-me', config);
      rateLimiter.checkLimit('reset-me', config); // Block
      
      rateLimiter.reset('reset-me');
      
      expect(rateLimiter.checkLimit('reset-me', config)).toBe(true);
    });

    it('should not affect other keys', () => {
      const config = { maxAttempts: 1, windowMs: 60000 };
      
      rateLimiter.checkLimit('key1', config);
      rateLimiter.checkLimit('key2', config);
      
      rateLimiter.reset('key1');
      
      expect(rateLimiter.getRemainingAttempts('key1', config)).toBe(1);
      expect(rateLimiter.getRemainingAttempts('key2', config)).toBe(0);
    });
  });

  describe('clearAll', () => {
    it('should clear all rate limits', () => {
      const config = { maxAttempts: 1, windowMs: 60000 };
      
      rateLimiter.checkLimit('key1', config);
      rateLimiter.checkLimit('key2', config);
      rateLimiter.checkLimit('key3', config);
      
      rateLimiter.clearAll();
      
      expect(rateLimiter.getRemainingAttempts('key1', config)).toBe(1);
      expect(rateLimiter.getRemainingAttempts('key2', config)).toBe(1);
      expect(rateLimiter.getRemainingAttempts('key3', config)).toBe(1);
    });
  });

  describe('Predefined Rate Limits', () => {
    it('should have LOGIN rate limit', () => {
      expect(RATE_LIMITS.LOGIN).toBeDefined();
      expect(RATE_LIMITS.LOGIN.maxAttempts).toBe(5);
    });

    it('should have PASSWORD_RESET rate limit', () => {
      expect(RATE_LIMITS.PASSWORD_RESET).toBeDefined();
      expect(RATE_LIMITS.PASSWORD_RESET.maxAttempts).toBe(3);
    });

    it('should have API_GENERAL rate limit', () => {
      expect(RATE_LIMITS.API_GENERAL).toBeDefined();
      expect(RATE_LIMITS.API_GENERAL.maxAttempts).toBe(100);
    });

    it('should have FORM_SUBMISSION rate limit', () => {
      expect(RATE_LIMITS.FORM_SUBMISSION).toBeDefined();
      expect(RATE_LIMITS.FORM_SUBMISSION.maxAttempts).toBe(10);
    });

    it('should have all expected rate limits', () => {
      const expectedLimits = [
        'LOGIN',
        'PASSWORD_RESET',
        'SIGNUP',
        'API_GENERAL',
        'API_WRITE',
        'API_HEAVY',
        'FORM_SUBMISSION',
        'SEARCH',
        'EXPORT',
        'UPLOAD'
      ];
      
      expectedLimits.forEach(limit => {
        expect(RATE_LIMITS[limit as keyof typeof RATE_LIMITS]).toBeDefined();
      });
    });
  });

  describe('Helper Functions', () => {
    it('should create rate limit key without identifier', () => {
      const key = createRateLimitKey('login');
      expect(key).toBe('ratelimit:login');
    });

    it('should create rate limit key with identifier', () => {
      const key = createRateLimitKey('login', 'user@example.com');
      expect(key).toBe('ratelimit:login:user@example.com');
    });

    it('should check rate limit using helper', () => {
      const result = checkRateLimit('test-action');
      expect(typeof result).toBe('boolean');
    });

    it('should get remaining attempts using helper', () => {
      const remaining = getRemainingAttempts('test-action');
      expect(typeof remaining).toBe('number');
    });

    it('should reset rate limit using helper', () => {
      checkRateLimit('reset-action', 'user1');
      resetRateLimit('reset-action', 'user1');
      
      const remaining = getRemainingAttempts('reset-action', 'user1');
      expect(remaining).toBeGreaterThan(0);
    });

    it('should use custom config in checkRateLimit', () => {
      const customConfig = { maxAttempts: 2, windowMs: 1000 };
      
      expect(checkRateLimit('custom', undefined, customConfig)).toBe(true);
      expect(checkRateLimit('custom', undefined, customConfig)).toBe(true);
      expect(checkRateLimit('custom', undefined, customConfig)).toBe(false);
    });
  });
});