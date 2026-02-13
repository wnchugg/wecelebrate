import { apiRequest } from './api';

/**
 * Simple KV store abstraction for client-side key-value operations.
 * Wraps API requests to a backend KV endpoint.
 */
export const kv = {
  async set(key: string, value: unknown): Promise<void> {
    await apiRequest('/kv', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
  },

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const result = await apiRequest<{ value: T }>(`/kv/${encodeURIComponent(key)}`);
      return result.value ?? null;
    } catch {
      return null;
    }
  },

  async del(key: string): Promise<void> {
    await apiRequest(`/kv/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  },
};
