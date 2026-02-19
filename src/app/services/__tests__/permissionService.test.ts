/**
 * Permission Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  hasPermission, 
  userHasPermission,
  grantPermission,
  revokePermission,
  getAllPermissions,
  getUserPermissions,
  hasAnyPermission,
  hasAllPermissions
} from '../permissionService';
import { supabase } from '../../lib/supabase';

// Mock supabase
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));

// Mock audit log service
vi.mock('../auditLogService', () => ({
  logPermissionGrant: vi.fn(),
  logPermissionRevoke: vi.fn(),
}));

describe('permissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('should return true when user has the permission', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      } as any);

      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      } as any);

      const result = await hasPermission('proxy_login');

      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('user_has_permission', {
        p_user_id: 'user-1',
        p_permission: 'proxy_login',
      });
    });

    it('should return false when user does not have the permission', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: false,
        error: null,
      } as any);

      const result = await hasPermission('proxy_login');

      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await hasPermission('proxy_login');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      } as any);

      const result = await hasPermission('proxy_login');

      expect(result).toBe(false);
    });
  });

  describe('userHasPermission', () => {
    it('should check permission for a specific user', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: true,
        error: null,
      } as any);

      const result = await userHasPermission('user-2', 'user_management');

      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('user_has_permission', {
        p_user_id: 'user-2',
        p_permission: 'user_management',
      });
    });
  });

  describe('grantPermission', () => {
    it('should grant permission to a user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'admin@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: 'permission-id',
        error: null,
      } as any);

      const result = await grantPermission('user-1', 'proxy_login');

      expect(result.success).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('grant_permission', {
        p_user_id: 'user-1',
        p_permission: 'proxy_login',
        p_granted_by: 'admin-1',
        p_expires_at: null,
      });
    });

    it('should grant permission with expiration', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'admin@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: 'permission-id',
        error: null,
      } as any);

      const expiresAt = '2024-12-31T23:59:59Z';
      const result = await grantPermission('user-1', 'proxy_login', expiresAt);

      expect(result.success).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('grant_permission', {
        p_user_id: 'user-1',
        p_permission: 'proxy_login',
        p_granted_by: 'admin-1',
        p_expires_at: expiresAt,
      });
    });

    it('should return error when not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await grantPermission('user-1', 'proxy_login');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });
  });

  describe('revokePermission', () => {
    it('should revoke permission from a user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'admin@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: true,
        error: null,
      } as any);

      const result = await revokePermission('user-1', 'proxy_login');

      expect(result.success).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('revoke_permission', {
        p_user_id: 'user-1',
        p_permission: 'proxy_login',
      });
    });

    it('should return error when not authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      const result = await revokePermission('user-1', 'proxy_login');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not authenticated');
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the permissions', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({ data: false, error: null } as any)
        .mockResolvedValueOnce({ data: true, error: null } as any);

      const result = await hasAnyPermission(['user_management', 'proxy_login']);

      expect(result).toBe(true);
    });

    it('should return false if user has none of the permissions', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({ data: false, error: null } as any)
        .mockResolvedValueOnce({ data: false, error: null } as any);

      const result = await hasAnyPermission(['user_management', 'proxy_login']);

      expect(result).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({ data: true, error: null } as any)
        .mockResolvedValueOnce({ data: true, error: null } as any);

      const result = await hasAllPermissions(['user_management', 'proxy_login']);

      expect(result).toBe(true);
    });

    it('should return false if user is missing any permission', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      } as any);

      vi.mocked(supabase.rpc)
        .mockResolvedValueOnce({ data: true, error: null } as any)
        .mockResolvedValueOnce({ data: false, error: null } as any);

      const result = await hasAllPermissions(['user_management', 'proxy_login']);

      expect(result).toBe(false);
    });
  });
});
