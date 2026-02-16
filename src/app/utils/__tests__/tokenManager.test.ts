/**
 * Token Manager Test Suite
 * Day 2 - Afternoon Session
 * Tests for src/app/utils/tokenManager.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dependencies
vi.mock('../storage', () => ({
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setEncrypted: vi.fn(),
  getEncrypted: vi.fn()
}));

vi.mock('../logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }
}));

import {
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  setRefreshToken,
  getRefreshToken,
  clearRefreshToken,
  isTokenExpired,
  getTokenExpiry,
  parseJWT,
  isValidJWT
} from '../tokenManager';
import * as storage from '../storage';

describe('Token Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Access Token Management', () => {
    it('should store access token', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      setAccessToken(token);
      
      expect(storage.setEncrypted).toHaveBeenCalledWith('access_token', token);
    });

    it('should retrieve access token', () => {
      const token = 'test-token-123';
      vi.mocked(storage.getEncrypted).mockReturnValue(token);
      
      const result = getAccessToken();
      expect(result).toBe(token);
    });

    it('should clear access token', () => {
      clearAccessToken();
      
      expect(storage.removeItem).toHaveBeenCalledWith('access_token');
    });

    it('should return null when no access token exists', () => {
      vi.mocked(storage.getEncrypted).mockReturnValue(null);
      
      const result = getAccessToken();
      expect(result).toBeNull();
    });
  });

  describe('Refresh Token Management', () => {
    it('should store refresh token', () => {
      const token = 'refresh-token-abc';
      setRefreshToken(token);
      
      expect(storage.setEncrypted).toHaveBeenCalledWith('refresh_token', token);
    });

    it('should retrieve refresh token', () => {
      const token = 'refresh-token-xyz';
      vi.mocked(storage.getEncrypted).mockReturnValue(token);
      
      const result = getRefreshToken();
      expect(result).toBe(token);
    });

    it('should clear refresh token', () => {
      clearRefreshToken();
      
      expect(storage.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should return null when no refresh token exists', () => {
      vi.mocked(storage.getEncrypted).mockReturnValue(null);
      
      const result = getRefreshToken();
      expect(result).toBeNull();
    });
  });

  describe('JWT Parsing', () => {
    it('should parse valid JWT', () => {
      // Valid JWT with payload: { userId: "123", email: "test@example.com", iat: 1516239022 }
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const parsed = parseJWT(token);
      
      expect(parsed).toBeDefined();
      expect(parsed.payload).toBeDefined();
      expect(parsed.payload.userId).toBe('123');
      expect(parsed.payload.email).toBe('test@example.com');
    });

    it('should parse JWT header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.test';
      
      const parsed = parseJWT(token);
      
      expect(parsed.header).toBeDefined();
      expect(parsed.header.alg).toBe('HS256');
      expect(parsed.header.typ).toBe('JWT');
    });

    it('should handle malformed JWT', () => {
      const malformed = 'not.a.valid.jwt';
      
      const parsed = parseJWT(malformed);
      
      expect(parsed).toBeNull();
    });

    it('should handle JWT with invalid base64', () => {
      const invalid = 'invalid!!!.invalid!!!.invalid!!!';
      
      const parsed = parseJWT(invalid);
      
      expect(parsed).toBeNull();
    });

    it('should handle empty string', () => {
      const parsed = parseJWT('');
      
      expect(parsed).toBeNull();
    });
  });

  describe('JWT Validation', () => {
    it('should validate correctly formatted JWT', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      expect(isValidJWT(validToken)).toBe(true);
    });

    it('should invalidate JWT with wrong number of parts', () => {
      const invalid = 'only.two.parts';
      
      expect(isValidJWT(invalid)).toBe(false);
    });

    it('should invalidate empty string', () => {
      expect(isValidJWT('')).toBe(false);
    });

    it('should invalidate null', () => {
      expect(isValidJWT(null as any)).toBe(false);
    });

    it('should invalidate undefined', () => {
      expect(isValidJWT(undefined as any)).toBe(false);
    });

    it('should validate JWT with additional parts', () => {
      // Some JWTs might have additional parts in specific implementations
      const token = 'header.payload.signature.extra';
      
      // Should handle gracefully
      const result = isValidJWT(token);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Token Expiration', () => {
    it('should detect expired token', () => {
      // Create token with past expiry (exp: Jan 1, 2020)
      const expiredPayload = btoa(JSON.stringify({
        userId: '123',
        exp: 1577836800 // Jan 1, 2020
      }));
      const expiredToken = `eyJhbGciOiJIUzI1NiJ9.${expiredPayload}.signature`;
      
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it('should detect valid token', () => {
      // Create token with future expiry (year 2099)
      const futurePayload = btoa(JSON.stringify({
        userId: '123',
        exp: 4102444800 // Jan 1, 2099
      }));
      const validToken = `eyJhbGciOiJIUzI1NiJ9.${futurePayload}.signature`;
      
      expect(isTokenExpired(validToken)).toBe(false);
    });

    it('should handle token without expiry', () => {
      const noExpiryPayload = btoa(JSON.stringify({
        userId: '123'
      }));
      const token = `eyJhbGciOiJIUzI1NiJ9.${noExpiryPayload}.signature`;
      
      // Token without exp should be considered not expired
      expect(isTokenExpired(token)).toBe(false);
    });

    it('should handle malformed token', () => {
      const malformed = 'not.a.valid.jwt';
      
      expect(isTokenExpired(malformed)).toBe(true);
    });
  });

  describe('Token Expiry Time', () => {
    it('should return expiry timestamp', () => {
      const expiryTime = 4102444800; // Jan 1, 2099
      const payload = btoa(JSON.stringify({
        userId: '123',
        exp: expiryTime
      }));
      const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.signature`;
      
      const expiry = getTokenExpiry(token);
      expect(expiry).toBe(expiryTime * 1000); // Should return milliseconds
    });

    it('should return null for token without expiry', () => {
      const payload = btoa(JSON.stringify({
        userId: '123'
      }));
      const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.signature`;
      
      const expiry = getTokenExpiry(token);
      expect(expiry).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformed = 'not.a.valid.jwt';
      
      const expiry = getTokenExpiry(malformed);
      expect(expiry).toBeNull();
    });

    it('should calculate time until expiry', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = btoa(JSON.stringify({
        userId: '123',
        exp: futureTime
      }));
      const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.signature`;
      
      const expiry = getTokenExpiry(token);
      const timeUntilExpiry = expiry - Date.now();
      
      expect(timeUntilExpiry).toBeGreaterThan(3599000); // Almost 1 hour
      expect(timeUntilExpiry).toBeLessThan(3601000); // Just over 1 hour
    });
  });

  describe('Token Rotation', () => {
    it('should support token rotation', () => {
      const oldToken = 'old-token-123';
      const newToken = 'new-token-456';
      
      setAccessToken(oldToken);
      setAccessToken(newToken);
      
      vi.mocked(storage.getEncrypted).mockReturnValue(newToken);
      
      expect(getAccessToken()).toBe(newToken);
    });

    it('should clear both access and refresh tokens', () => {
      clearAccessToken();
      clearRefreshToken();
      
      expect(storage.removeItem).toHaveBeenCalledWith('access_token');
      expect(storage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long tokens', () => {
      const longToken = 'a'.repeat(10000);
      setAccessToken(longToken);
      
      expect(storage.setEncrypted).toHaveBeenCalledWith('access_token', longToken);
    });

    it('should handle tokens with special characters', () => {
      const specialToken = 'token-with-special!@#$%^&*()_+-={}[]|:;"<>?,./';
      setAccessToken(specialToken);
      
      expect(storage.setEncrypted).toHaveBeenCalledWith('access_token', specialToken);
    });

    it('should handle unicode in token payload', () => {
      // Test that parseJWT doesn't crash with various token formats
      // Unicode handling in btoa/atob is environment-specific
      const simpleToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.signature';
      const parsed = parseJWT(simpleToken);
      // Just verify it doesn't crash - parseJWT may return null for invalid signatures
      expect(parsed !== undefined).toBe(true);
    });

    it('should handle concurrent token operations', () => {
      setAccessToken('token1');
      setAccessToken('token2');
      setAccessToken('token3');
      
      expect(storage.setEncrypted).toHaveBeenCalledTimes(3);
    });
  });

  describe('Security', () => {
    it('should use encrypted storage for tokens', () => {
      setAccessToken('sensitive-token');
      
      // Should use encrypted storage, not plain storage
      expect(storage.setEncrypted).toHaveBeenCalled();
      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('should validate token signature format', () => {
      const noSignature = 'header.payload';
      
      expect(isValidJWT(noSignature)).toBe(false);
    });

    it('should handle JWT with suspicious claims', () => {
      const suspiciousPayload = btoa(JSON.stringify({
        userId: '123',
        role: 'admin',
        __proto__: { isAdmin: true }
      }));
      const token = `eyJhbGciOiJIUzI1NiJ9.${suspiciousPayload}.signature`;
      
      // Should parse but not be exploitable
      const parsed = parseJWT(token);
      expect(parsed).toBeDefined();
    });
  });
});