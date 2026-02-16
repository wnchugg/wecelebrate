/**
 * useSites Hook Test Suite
 * Day 5 - Afternoon Session
 * Tests for src/app/hooks/useSites.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useSites,
  usePublicSites,
  useSite,
  useSitesByClient,
  useCreateSite,
  useUpdateSite,
  useDeleteSite
} from '../useSites';
import type { Site, CreateSiteRequest, UpdateSiteRequest } from '../../types/api.types';
import { useQuery, useMutation } from '../useApi';

// Mock useApi hooks
vi.mock('../useApi', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn()
}));

// Mock apiClient
vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    sites: {
      list: vi.fn(),
      listPublic: vi.fn(),
      get: vi.fn(),
      getByClient: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

describe('useSites Hooks', () => {
  const mockSite: Site = {
    id: 'site-123',
    name: 'Test Site',
    slug: 'test-site',
    clientId: 'client-456',
    status: 'active' as const,
    isActive: true,
    validationMethods: [
      {
        type: 'email' as const,
        enabled: true,
      }
    ],
    settings: {
      validationMethod: 'email' as const,
      allowMultipleSelections: true,
      requireShipping: true,
      supportEmail: 'support@test.com',
      languages: ['en'],
      defaultLanguage: 'en',
      enableLanguageSelector: true,
      allowQuantitySelection: true,
      showPricing: true,
      giftsPerUser: 3,
      shippingMode: 'employee' as const,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Sites List Loading', () => {
    it('should initialize with default state', () => {
      // useQuery is mocked
      
      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSites());

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should fetch sites list', () => {
      // useQuery is mocked
      const mockData = {
        data: [mockSite],
        total: 1,
        page: 1,
        limit: 10
      };

      vi.mocked(useQuery).mockReturnValue({
        data: mockData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSites());

      expect(result.current.data).toEqual(mockData);
    });

    it('should set loading state during fetch', () => {
      // useQuery is mocked

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSites());

      expect(result.current.isLoading).toBe(true);
    });

    it('should handle fetch errors', () => {
      // useQuery is mocked
      const mockError = { message: 'Failed to fetch sites', statusCode: 500, name: 'ApiError' };

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: mockError,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSites());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it('should support pagination parameters', () => {
      // useQuery is mocked
      const mockData = {
        data: [mockSite],
        total: 100,
        page: 2,
        limit: 25
      };

      vi.mocked(useQuery).mockReturnValue({
        data: mockData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => 
        useSites({ page: 2, limit: 25 })
      );

      expect(useQuery).toHaveBeenCalledWith(
        ['sites', { page: 2, limit: 25 }],
        expect.any(Function),
        undefined
      );
    });

    it('should fetch public sites', () => {
      // useQuery is mocked
      const mockPublicSites = [mockSite];

      vi.mocked(useQuery).mockReturnValue({
        data: mockPublicSites,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => usePublicSites());

      expect(result.current.data).toEqual(mockPublicSites);
    });
  });

  describe('Site Filtering', () => {
    it('should fetch single site by ID', () => {
      // useQuery is mocked

      vi.mocked(useQuery).mockReturnValue({
        data: mockSite,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSite('site-123'));

      expect(result.current.data).toEqual(mockSite);
      expect(useQuery).toHaveBeenCalledWith(
        ['site', 'site-123'],
        expect.any(Function),
        undefined
      );
    });

    it('should fetch sites by client ID', () => {
      // useQuery is mocked
      const mockClientSites = [mockSite];

      vi.mocked(useQuery).mockReturnValue({
        data: mockClientSites,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSitesByClient('client-456'));

      expect(result.current.data).toEqual(mockClientSites);
      expect(useQuery).toHaveBeenCalledWith(
        ['sites-by-client', 'client-456'],
        expect.any(Function),
        undefined
      );
    });

    it('should handle empty client sites list', () => {
      // useQuery is mocked

      vi.mocked(useQuery).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSitesByClient('client-with-no-sites'));

      expect(result.current.data).toEqual([]);
    });

    it('should handle site not found', () => {
      // useQuery is mocked
      const mockError = { message: 'Site not found', statusCode: 404, name: 'ApiError' };

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: mockError,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSite('nonexistent-site'));

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it('should support refetch for filtered results', () => {
      // useQuery is mocked
      const mockRefetch = vi.fn();

      vi.mocked(useQuery).mockReturnValue({
        data: [mockSite],
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch
      });

      const { result } = renderHook(() => useSitesByClient('client-456'));

      act(() => {
        result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle multiple sites for same client', () => {
      // useQuery is mocked
      const multipleSites = [
        mockSite,
        { ...mockSite, id: 'site-124', name: 'Test Site 2' },
        { ...mockSite, id: 'site-125', name: 'Test Site 3' }
      ];

      vi.mocked(useQuery).mockReturnValue({
        data: multipleSites,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSitesByClient('client-456'));

      expect(result.current.data).toHaveLength(3);
    });
  });

  describe('Site CRUD Operations', () => {
    it('should create new site', async () => {
      // useMutation is mocked
      const mockMutate = vi.fn();
      const newSiteData: CreateSiteRequest = {
        name: 'New Site',
        clientId: 'client-456',
        slug: 'new-site',
        validationMethods: mockSite.validationMethods,
        settings: mockSite.settings
      };

      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useCreateSite());

      act(() => {
        result.current.mutate(newSiteData);
      });

      expect(mockMutate).toHaveBeenCalledWith(newSiteData);
    });

    it('should update existing site', async () => {
      // useMutation is mocked
      const mockMutate = vi.fn();
      const updateData: UpdateSiteRequest = {
        name: 'Updated Site Name'
      };

      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useUpdateSite());

      act(() => {
        result.current.mutate({ id: 'site-123', data: updateData });
      });

      expect(mockMutate).toHaveBeenCalledWith({ id: 'site-123', data: updateData });
    });

    it('should delete site', async () => {
      // useMutation is mocked
      const mockMutate = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useDeleteSite());

      act(() => {
        result.current.mutate('site-123');
      });

      expect(mockMutate).toHaveBeenCalledWith('site-123');
    });

    it('should handle create site validation errors', () => {
      // useMutation is mocked
      const mockError = { message: 'Validation failed', statusCode: 400, name: 'ApiError' };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: true,
        error: mockError,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useCreateSite());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it('should return created site data', () => {
      // useMutation is mocked
      const createdSite = { ...mockSite, id: 'new-site-456' };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: createdSite,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useCreateSite());

      expect(result.current.data).toEqual(createdSite);
    });

    it('should set loading state during site creation', () => {
      // useMutation is mocked

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: true,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useCreateSite());

      expect(result.current.isLoading).toBe(true);
    });

    it('should handle update conflicts', () => {
      // useMutation is mocked
      const mockError = { message: 'Conflict', statusCode: 409, name: 'ApiError' };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: true,
        error: mockError,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useUpdateSite());

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.statusCode).toBe(409);
    });

    it('should handle delete authorization errors', () => {
      // useMutation is mocked
      const mockError = { message: 'Unauthorized', statusCode: 403, name: 'ApiError' };

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: true,
        error: mockError,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useDeleteSite());

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.statusCode).toBe(403);
    });

    it('should call onSuccess callback after creation', () => {
      // useMutation is mocked
      const onSuccess = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      renderHook(() => useCreateSite({ onSuccess }));

      expect(useMutation).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ onSuccess })
      );
    });

    it('should call onError callback on create failure', () => {
      // useMutation is mocked
      const onError = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      renderHook(() => useCreateSite({ onError }));

      expect(useMutation).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ onError })
      );
    });
  });

  describe('Query Options', () => {
    it('should support custom query options for sites list', () => {
      // useQuery is mocked
      const onSuccess = vi.fn();
      const onError = vi.fn();

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      renderHook(() => useSites(undefined, { onSuccess, onError }));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        expect.objectContaining({ onSuccess, onError })
      );
    });

    it('should support enabled option', () => {
      // useQuery is mocked

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      renderHook(() => useSite('site-123', { enabled: false }));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        expect.objectContaining({ enabled: false })
      );
    });

    it('should support refetchOnMount option', () => {
      // useQuery is mocked

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      renderHook(() => usePublicSites({ refetchOnMount: true }));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Function),
        expect.objectContaining({ refetchOnMount: true })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sites list', () => {
      // useQuery is mocked
      const emptyData = {
        data: [] as Site[],
        total: 0,
        page: 1,
        limit: 10
      };

      vi.mocked(useQuery).mockReturnValue({
        data: emptyData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSites());

      expect(result.current.data?.data).toHaveLength(0);
    });

    it('should handle concurrent site operations', async () => {
      // useMutation is mocked
      const mockMutate = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn().mockResolvedValue(mockSite),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: vi.fn()
      });

      const { result } = renderHook(() => useCreateSite());

      act(() => {
        result.current.mutate({ name: 'Site 1', clientId: 'client-1', slug: 'site-1', validationMethods: mockSite.validationMethods, settings: mockSite.settings });
        result.current.mutate({ name: 'Site 2', clientId: 'client-1', slug: 'site-2', validationMethods: mockSite.validationMethods, settings: mockSite.settings });
      });

      expect(mockMutate).toHaveBeenCalledTimes(2);
    });

    it('should reset mutation state', () => {
      // useMutation is mocked
      const mockReset = vi.fn();

      vi.mocked(useMutation).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
        isError: false,
        error: null,
        data: null,
        reset: mockReset
      });

      const { result } = renderHook(() => useCreateSite());

      act(() => {
        result.current.reset();
      });

      expect(mockReset).toHaveBeenCalled();
    });

    it('should handle network timeout', () => {
      // useQuery is mocked
      const mockError = { message: 'Request timeout', statusCode: 408, name: 'ApiError' };

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: mockError,
        refetch: vi.fn()
      });

      const { result } = renderHook(() => useSites());

      expect(result.current.error?.statusCode).toBe(408);
    });

    it('should handle malformed pagination params', () => {
      // useQuery is mocked

      vi.mocked(useQuery).mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn()
      });

      renderHook(() => useSites({ page: -1, limit: 0 }));

      expect(useQuery).toHaveBeenCalled();
    });
  });
});