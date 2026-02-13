/**
 * Gift Management Hooks
 * Phase 4: Frontend Refactoring
 */

import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from './useApi';
import { apiClient } from '../lib/apiClient';
import type {
  Gift,
  CreateGiftRequest,
  UpdateGiftRequest,
  PaginationParams,
  PaginatedResponse,
} from '../types/api.types';

// ===== useGifts Hook =====

export function useGifts(
  params?: PaginationParams,
  options?: UseQueryOptions<PaginatedResponse<Gift>>
) {
  return useQuery(
    ['gifts', params],
    () => apiClient.gifts.list(params),
    options
  );
}

// ===== useGiftsBySite Hook =====

export function useGiftsBySite(
  siteId: string,
  options?: UseQueryOptions<Gift[]>
) {
  return useQuery(
    ['gifts-by-site', siteId],
    () => apiClient.gifts.listBySite(siteId),
    options
  );
}

// ===== useGift Hook =====

export function useGift(
  id: string,
  options?: UseQueryOptions<Gift>
) {
  return useQuery(
    ['gift', id],
    () => apiClient.gifts.get(id),
    options
  );
}

// ===== useCreateGift Hook =====

export function useCreateGift(
  options?: UseMutationOptions<Gift, CreateGiftRequest>
) {
  return useMutation(
    (request: CreateGiftRequest) => apiClient.gifts.create(request),
    options
  );
}

// ===== useUpdateGift Hook =====

export function useUpdateGift(
  options?: UseMutationOptions<Gift, { id: string; data: UpdateGiftRequest }>
) {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateGiftRequest }) =>
      apiClient.gifts.update(id, data),
    options
  );
}

// ===== useDeleteGift Hook =====

export function useDeleteGift(
  options?: UseMutationOptions<void, string>
) {
  return useMutation(
    (id: string) => apiClient.gifts.delete(id),
    options
  );
}

// ===== useBulkDeleteGifts Hook =====

export function useBulkDeleteGifts(
  options?: UseMutationOptions<void, string[]>
) {
  return useMutation(
    (giftIds: string[]) => apiClient.gifts.bulkDelete(giftIds),
    options
  );
}