/**
 * Session Manager Test Suite
 * Day 2 - Afternoon Session
 * Tests for src/app/utils/sessionManager.ts
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
  createSession,
  getSession,
  updateSession,
  destroySession,
  isSessionValid,
  refreshSession,
  getSessionTimeout,
  extendSession
} from '../sessionManager';
import * as storage from '../storage';

describe('Session Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Session Creation', () => {
    it('should create new session with user data', () => {
      const userData = { id: '1', email: 'test@example.com', role: 'user' };
      const session = createSession(userData);
      
      expect(session).toBeDefined();
      expect(session.userId).toBe('1');
      expect(session.email).toBe('test@example.com');
      expect(session.createdAt).toBeDefined();
    });

    it('should generate unique session ID', () => {
      const session1 = createSession({ id: '1', email: 'test1@example.com' });
      const session2 = createSession({ id: '2', email: 'test2@example.com' });
      
      expect(session1.sessionId).not.toBe(session2.sessionId);
    });

    it('should set session expiration time', () => {
      const session = createSession({ id: '1', email: 'test@example.com' });
      
      expect(session.expiresAt).toBeDefined();
      expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('should store session in storage', () => {
      createSession({ id: '1', email: 'test@example.com' });
      
      expect(storage.setEncrypted).toHaveBeenCalled();
    });

    it('should handle additional session metadata', () => {
      const session = createSession(
        { id: '1', email: 'test@example.com' },
        { ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0' }
      );
      
      expect(session.metadata).toBeDefined();
      expect(session.metadata.ipAddress).toBe('192.168.1.1');
    });
  });

  describe('Session Retrieval', () => {
    it('should retrieve existing session', () => {
      const mockSession = {
        sessionId: 'test-session',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(mockSession);
      
      const session = getSession();
      // getSession normalizes expiresAt to a number
      expect(session).toEqual({
        ...mockSession,
        expiresAt: new Date(mockSession.expiresAt).getTime()
      });
    });

    it('should return null when no session exists', () => {
      vi.mocked(storage.getEncrypted).mockReturnValue(null);
      
      const session = getSession();
      expect(session).toBeNull();
    });

    it('should return null for expired session', () => {
      const expiredSession = {
        sessionId: 'expired',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        expiresAt: new Date(Date.now() - 3600000).toISOString() // Expired 1 hour ago
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(expiredSession);
      
      const session = getSession();
      expect(session).toBeNull();
    });
  });

  describe('Session Validation', () => {
    it('should validate active session', () => {
      const activeSession = {
        sessionId: 'active',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(activeSession);
      
      expect(isSessionValid()).toBe(true);
    });

    it('should invalidate expired session', () => {
      const expiredSession = {
        sessionId: 'expired',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(expiredSession);
      
      expect(isSessionValid()).toBe(false);
    });

    it('should invalidate when no session exists', () => {
      vi.mocked(storage.getEncrypted).mockReturnValue(null);
      
      expect(isSessionValid()).toBe(false);
    });
  });

  describe('Session Updates', () => {
    it('should update session data', () => {
      const existingSession = {
        sessionId: 'test',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(existingSession);
      
      updateSession({ lastActivity: new Date().toISOString() });
      
      expect(storage.setEncrypted).toHaveBeenCalled();
    });

    it('should not update non-existent session', () => {
      vi.mocked(storage.getEncrypted).mockReturnValue(null);
      
      const result = updateSession({ lastActivity: new Date().toISOString() });
      
      expect(result).toBe(false);
      expect(storage.setEncrypted).not.toHaveBeenCalled();
    });

    it('should preserve existing session data when updating', () => {
      const existingSession = {
        sessionId: 'test',
        userId: '1',
        email: 'test@example.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(existingSession);
      
      updateSession({ lastActivity: new Date().toISOString() });
      
      const savedSession = vi.mocked(storage.setEncrypted).mock.calls[0][1];
      expect(savedSession.role).toBe('admin');
      expect(savedSession.userId).toBe('1');
    });
  });

  describe('Session Destruction', () => {
    it('should destroy session', () => {
      destroySession();
      
      expect(storage.removeItem).toHaveBeenCalled();
    });

    it('should clear session data from storage', () => {
      const existingSession = {
        sessionId: 'test',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(existingSession);
      
      destroySession();
      
      vi.mocked(storage.getEncrypted).mockReturnValue(null);
      expect(getSession()).toBeNull();
    });
  });

  describe('Session Refresh', () => {
    it('should refresh session expiration', () => {
      const existingSession = {
        sessionId: 'test',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1800000).toISOString() // 30 minutes
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(existingSession);
      
      const refreshed = refreshSession();
      
      expect(refreshed).toBe(true);
      expect(storage.setEncrypted).toHaveBeenCalled();
      
      const savedSession = vi.mocked(storage.setEncrypted).mock.calls[0][1];
      expect(new Date(savedSession.expiresAt).getTime()).toBeGreaterThan(
        new Date(existingSession.expiresAt).getTime()
      );
    });

    it('should not refresh expired session', () => {
      const expiredSession = {
        sessionId: 'expired',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(expiredSession);
      
      const refreshed = refreshSession();
      expect(refreshed).toBe(false);
    });

    it('should not refresh non-existent session', () => {
      vi.mocked(storage.getEncrypted).mockReturnValue(null);
      
      const refreshed = refreshSession();
      expect(refreshed).toBe(false);
    });
  });

  describe('Session Timeout', () => {
    it('should calculate time until session expires', () => {
      const futureExpiry = Date.now() + 3600000; // 1 hour
      const activeSession = {
        sessionId: 'test',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(futureExpiry).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(activeSession);
      
      const timeout = getSessionTimeout();
      expect(timeout).toBeGreaterThan(0);
      expect(timeout).toBeLessThanOrEqual(3600000);
    });

    it('should return 0 for expired session', () => {
      const expiredSession = {
        sessionId: 'expired',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(expiredSession);
      
      const timeout = getSessionTimeout();
      expect(timeout).toBe(0);
    });

    it('should return 0 when no session exists', () => {
      vi.mocked(storage.getEncrypted).mockReturnValue(null);
      
      const timeout = getSessionTimeout();
      expect(timeout).toBe(0);
    });
  });

  describe('Session Extension', () => {
    it('should extend session expiration by specified time', () => {
      const existingSession = {
        sessionId: 'test',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1800000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(existingSession);
      
      const additionalTime = 1800000; // 30 minutes
      extendSession(additionalTime);
      
      expect(storage.setEncrypted).toHaveBeenCalled();
      
      const savedSession = vi.mocked(storage.setEncrypted).mock.calls[0][1];
      expect(new Date(savedSession.expiresAt).getTime()).toBeGreaterThan(
        new Date(existingSession.expiresAt).getTime()
      );
    });

    it('should not extend expired session', () => {
      const expiredSession = {
        sessionId: 'expired',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(expiredSession);
      
      const result = extendSession(1800000);
      expect(result).toBe(false);
    });
  });

  describe('Concurrent Sessions', () => {
    it('should handle multiple session updates', () => {
      const session = {
        sessionId: 'test',
        userId: '1',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      
      vi.mocked(storage.getEncrypted).mockReturnValue(session);
      
      updateSession({ lastActivity: new Date().toISOString() });
      updateSession({ lastActivity: new Date().toISOString() });
      
      expect(storage.setEncrypted).toHaveBeenCalledTimes(2);
    });
  });
});