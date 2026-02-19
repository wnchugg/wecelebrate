/**
 * User API Permission Enforcement Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUser, setUserPassword, createUser, deleteUser } from '../userApi';
import * as permissionService from '../permissionService';
import { supabase } from '../../lib/supabase';

// Mock dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('../permissionService');
vi.mock('../auditLogService', () => ({
  logUserEdit: vi.fn(),
  logUserPasswordSet: vi.fn(),
  logUserCreation: vi.fn(),
  logUserDeletion: vi.fn(),
}));

describe('userApi - Permission Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateUser', () => {
    it('should allow update when user has user_edit permission', async () => {
      vi.mocked(permissionService.hasPermission)
        .mockResolvedValueOnce(true)  // user_edit
        .mockResolvedValueOnce(false); // user_management

      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      } as any);

      await updateUser({
        userId: 'user-1',
        siteId: 'site-1',
        firstName: 'John',
      });

      expect(mockFrom.update).toHaveBeenCalled();
    });

    it('should allow update when user has user_management permission', async () => {
      vi.mocked(permissionService.hasPermission)
        .mockResolvedValueOnce(false) // user_edit
        .mockResolvedValueOnce(true);  // user_management

      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      } as any);

      await updateUser({
        userId: 'user-1',
        siteId: 'site-1',
        firstName: 'John',
      });

      expect(mockFrom.update).toHaveBeenCalled();
    });

    it('should throw error when user lacks permissions', async () => {
      vi.mocked(permissionService.hasPermission)
        .mockResolvedValueOnce(false) // user_edit
        .mockResolvedValueOnce(false); // user_management

      await expect(
        updateUser({
          userId: 'user-1',
          siteId: 'site-1',
          firstName: 'John',
        })
      ).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('setUserPassword', () => {
    it('should allow password set when user has user_password_set permission', async () => {
      vi.mocked(permissionService.hasPermission)
        .mockResolvedValueOnce(true)  // user_password_set
        .mockResolvedValueOnce(false); // user_management

      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      } as any);

      await setUserPassword({
        userId: 'user-1',
        siteId: 'site-1',
        temporaryPassword: 'temp123',
        forcePasswordReset: true,
      });

      expect(mockFrom.update).toHaveBeenCalled();
    });

    it('should throw error when user lacks permissions', async () => {
      vi.mocked(permissionService.hasPermission)
        .mockResolvedValueOnce(false) // user_password_set
        .mockResolvedValueOnce(false); // user_management

      await expect(
        setUserPassword({
          userId: 'user-1',
          siteId: 'site-1',
          temporaryPassword: 'temp123',
          forcePasswordReset: true,
        })
      ).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('createUser', () => {
    it('should allow user creation when user has user_management permission', async () => {
      vi.mocked(permissionService.hasPermission).mockResolvedValue(true);

      const mockFrom = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'user-1',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'employee',
            status: 'active',
            force_password_reset: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      } as any);

      const result = await createUser('site-1', {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'employee',
        status: 'active',
      });

      expect(result.id).toBe('user-1');
      expect(mockFrom.insert).toHaveBeenCalled();
    });

    it('should throw error when user lacks user_management permission', async () => {
      vi.mocked(permissionService.hasPermission).mockResolvedValue(false);

      await expect(
        createUser('site-1', {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'employee',
          status: 'active',
        })
      ).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('deleteUser', () => {
    it('should allow user deletion when user has user_delete permission', async () => {
      vi.mocked(permissionService.hasPermission)
        .mockResolvedValueOnce(true)  // user_delete
        .mockResolvedValueOnce(false); // user_management

      const mockFrom = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { site_id: 'site-1' },
          error: null,
        }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockFrom as any);
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'admin-1' } },
        error: null,
      } as any);

      await deleteUser('user-1');

      expect(mockFrom.update).toHaveBeenCalled();
    });

    it('should throw error when user lacks permissions', async () => {
      vi.mocked(permissionService.hasPermission)
        .mockResolvedValueOnce(false) // user_delete
        .mockResolvedValueOnce(false); // user_management

      await expect(deleteUser('user-1')).rejects.toThrow('Insufficient permissions');
    });
  });
});
