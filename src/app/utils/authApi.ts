import { apiRequest } from './api';

/**
 * Authenticated API helper with convenience methods.
 * Wraps apiRequest with HTTP method shortcuts.
 */
export const authApi = {
  async get<T = unknown>(url: string): Promise<T> {
    return apiRequest<T>(url);
  },

  async post<T = unknown>(url: string, body?: unknown): Promise<T> {
    return apiRequest<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async put<T = unknown>(url: string, body?: unknown): Promise<T> {
    return apiRequest<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async del<T = unknown>(url: string): Promise<T> {
    return apiRequest<T>(url, {
      method: 'DELETE',
    });
  },
};
