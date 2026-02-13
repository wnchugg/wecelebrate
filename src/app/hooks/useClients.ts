/**
 * Client Management Hooks
 * Phase 4: Frontend Refactoring
 */

import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from './useApi';
import { apiClient } from '../lib/apiClient';
import type {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  PaginationParams,
  PaginatedResponse,
} from '../types/api.types';

// ===== useClients Hook =====

export function useClients(
  params?: PaginationParams,
  options?: UseQueryOptions<PaginatedResponse<Client>>
) {
  return useQuery(
    ['clients', params],
    () => apiClient.clients.list(params),
    options
  );
}

// ===== useClient Hook =====

export function useClient(
  id: string,
  options?: UseQueryOptions<Client>
) {
  return useQuery(
    ['client', id],
    () => apiClient.clients.get(id),
    options
  );
}

// ===== useCreateClient Hook =====

export function useCreateClient(
  options?: UseMutationOptions<Client, CreateClientRequest>
) {
  return useMutation(
    (request: CreateClientRequest) => apiClient.clients.create(request),
    options
  );
}

// ===== useUpdateClient Hook =====

export function useUpdateClient(
  options?: UseMutationOptions<Client, { id: string; data: UpdateClientRequest }>
) {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateClientRequest }) =>
      apiClient.clients.update(id, data),
    options
  );
}

// ===== useDeleteClient Hook =====

export function useDeleteClient(
  options?: UseMutationOptions<void, string>
) {
  return useMutation(
    (id: string) => apiClient.clients.delete(id),
    options
  );
}