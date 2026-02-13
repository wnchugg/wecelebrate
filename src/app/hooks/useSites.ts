/**
 * Site Management Hooks
 * Phase 4: Frontend Refactoring
 */

import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from './useApi';
import { apiClient } from '../lib/apiClient';
import type {
  Site,
  CreateSiteRequest,
  UpdateSiteRequest,
  PaginationParams,
  PaginatedResponse,
} from '../types/api.types';

// ===== useSites Hook =====

export function useSites(
  params?: PaginationParams,
  options?: UseQueryOptions<PaginatedResponse<Site>>
) {
  return useQuery(
    ['sites', params],
    () => apiClient.sites.list(params),
    options
  );
}

// ===== usePublicSites Hook =====

export function usePublicSites(
  options?: UseQueryOptions<Site[]>
) {
  return useQuery(
    ['public-sites'],
    () => apiClient.sites.listPublic(),
    options
  );
}

// ===== useSite Hook =====

export function useSite(
  id: string,
  options?: UseQueryOptions<Site>
) {
  return useQuery(
    ['site', id],
    () => apiClient.sites.get(id),
    options
  );
}

// ===== useSitesByClient Hook =====

export function useSitesByClient(
  clientId: string,
  options?: UseQueryOptions<Site[]>
) {
  return useQuery(
    ['sites-by-client', clientId],
    () => apiClient.sites.getByClient(clientId),
    options
  );
}

// ===== useCreateSite Hook =====

export function useCreateSite(
  options?: UseMutationOptions<Site, CreateSiteRequest>
) {
  return useMutation(
    (request: CreateSiteRequest) => apiClient.sites.create(request),
    options
  );
}

// ===== useUpdateSite Hook =====

export function useUpdateSite(
  options?: UseMutationOptions<Site, { id: string; data: UpdateSiteRequest }>
) {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateSiteRequest }) =>
      apiClient.sites.update(id, data),
    options
  );
}

// ===== useDeleteSite Hook =====

export function useDeleteSite(
  options?: UseMutationOptions<void, string>
) {
  return useMutation(
    (id: string) => apiClient.sites.delete(id),
    options
  );
}