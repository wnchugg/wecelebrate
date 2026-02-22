/**
 * Proxy Login API Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProxySession, endProxySession, getCurrentProxySession } from '../proxyLoginApi';
import { supabase } from '../../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../auditLogService', () => ({
  logProxyLoginStart: vi.fn(),
  logProxyLoginEnd: vi.fn(),
}));

describe('proxyLoginApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProxySession', () => {
    it('should create a proxy session successfully', async () => {
      const mockSession = {
        id: 'session-123',
        admin_id: 'admin-456',
        employee_id: 'emp-789',
        site_id: 'site-abc',
        token: 'token-xyz',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        is_active: true,
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockSession,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await createProxySession({
        adminId: 'admin-456',
        employeeId: 'emp-789',
        siteId: 'site-abc',
        durationMinutes: 30,
      });

      expect(result.id).toBe('session-123');
      expect(result.adminId).toBe('admin-456');
      expect(result.employeeId).toBe('emp-789');
      expect(result.token).toBe('token-xyz');
    });

    it('should throw error if session creation fails', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      await expect(
        createProxySession({
          adminId: 'admin-456',
          employeeId: 'emp-789',
          siteId: 'site-abc',
        })
      ).rejects.toThrow('Failed to create proxy session');
    });
  });

  describe('endProxySession', () => {
    it('should end a proxy session successfully', async () => {
      const mockSession = {
        admin_id: 'admin-456',
        employee_id: 'emp-789',
        site_id: 'site-abc',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      };

      const mockFrom = vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockSession,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        });

      (supabase.from as any) = mockFrom;

      await expect(endProxySession('session-123')).resolves.not.toThrow();
    });
  });

  describe('getCurrentProxySession', () => {
    it('should return null if no token in localStorage', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const result = await getCurrentProxySession();

      expect(result).toBeNull();
    });

    it('should return session if valid token exists', async () => {
      const mockSession = {
        id: 'session-123',
        admin_id: 'admin-456',
        employee_id: 'emp-789',
        site_id: 'site-abc',
        token: 'token-xyz',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        is_active: true,
      };

      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('token-xyz');

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gt: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockSession,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      (supabase.from as any) = mockFrom;

      const result = await getCurrentProxySession();

      expect(result).not.toBeNull();
      expect(result?.id).toBe('session-123');
    });
  });
});
