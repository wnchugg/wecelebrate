/**
 * Authentication Hooks
 * Phase 4: Frontend Refactoring
 */

import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from './useApi';
import { apiClient } from '../lib/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  SessionResponse,
} from '../types/api.types';

// ===== useSession Hook =====

export function useSession(
  options?: UseQueryOptions<SessionResponse>
) {
  return useQuery(
    ['session'],
    () => apiClient.auth.getSession(),
    {
      refetchOnMount: true,
      ...options,
    }
  );
}

// ===== useLogin Hook =====

export function useLogin(
  options?: UseMutationOptions<LoginResponse, LoginRequest>
) {
  return useMutation(
    (request: LoginRequest) => apiClient.auth.login(request),
    options
  );
}

// ===== useSignup Hook =====

export function useSignup(
  options?: UseMutationOptions<SignupResponse, SignupRequest>
) {
  return useMutation(
    (request: SignupRequest) => apiClient.auth.signup(request),
    options
  );
}

// ===== useBootstrapAdmin Hook =====

export function useBootstrapAdmin(
  options?: UseMutationOptions<SignupResponse, SignupRequest>
) {
  return useMutation(
    (request: SignupRequest) => apiClient.auth.bootstrapAdmin(request),
    options
  );
}

// ===== useLogout Hook =====

export function useLogout(
  options?: UseMutationOptions<void, void>
) {
  return useMutation(
    () => apiClient.auth.logout(),
    options
  );
}