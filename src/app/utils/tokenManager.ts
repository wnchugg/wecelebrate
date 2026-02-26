/**
 * Secure Token Manager
 * Handles JWT tokens with automatic refresh and secure storage
 * Phase 2.4: Security Hardening
 */

import { logger } from './logger';
import { rotateCSRFToken } from './csrfProtection';
import * as storage from './storage';

interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  userId?: string;
}

class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly EXPIRES_AT_KEY = 'token_expires_at';
  private readonly USER_ID_KEY = 'user_id';
  private refreshTimer: NodeJS.Timeout | null = null;
  private refreshCallback: (() => Promise<void>) | null = null;

  /**
   * Store tokens securely
   */
  setTokens(data: TokenData): void {
    try {
      // Store in localStorage (consider httpOnly cookies in production)
      storage.setEncrypted(this.ACCESS_TOKEN_KEY, data.accessToken);
      
      if (data.refreshToken) {
        storage.setEncrypted(this.REFRESH_TOKEN_KEY, data.refreshToken);
      }
      
      localStorage.setItem(this.EXPIRES_AT_KEY, data.expiresAt.toString());
      
      if (data.userId) {
        localStorage.setItem(this.USER_ID_KEY, data.userId);
      }

      // Rotate CSRF token on new login
      rotateCSRFToken();

      // Schedule automatic refresh
      this.scheduleTokenRefresh(data.expiresAt);

      logger.log('[TokenManager] Tokens stored successfully');
    } catch (e) {
      logger.error('[TokenManager] Failed to store tokens:', e);
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    try {
      return storage.getEncrypted(this.ACCESS_TOKEN_KEY);
    } catch (e) {
      logger.error('[TokenManager] Failed to get access token:', e);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    try {
      return storage.getEncrypted(this.REFRESH_TOKEN_KEY);
    } catch (e) {
      logger.error('[TokenManager] Failed to get refresh token:', e);
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  getExpiresAt(): number | null {
    try {
      const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
      return expiresAt ? parseInt(expiresAt, 10) : null;
    } catch (e) {
      logger.error('[TokenManager] Failed to get expiration time:', e);
      return null;
    }
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    try {
      return localStorage.getItem(this.USER_ID_KEY);
    } catch (e) {
      logger.error('[TokenManager] Failed to get user ID:', e);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return true;

    const now = Date.now();
    return now >= expiresAt;
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return true;

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return now >= (expiresAt - fiveMinutes);
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    try {
      storage.removeItem(this.ACCESS_TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.EXPIRES_AT_KEY);
      localStorage.removeItem(this.USER_ID_KEY);

      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      logger.log('[TokenManager] Tokens cleared');
    } catch (e) {
      logger.error('[TokenManager] Failed to clear tokens:', e);
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(expiresAt: number): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    
    // Refresh 5 minutes before expiry
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000);

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        void this.performTokenRefresh().catch((error) => {
          logger.error('[TokenManager] Scheduled token refresh failed:', error);
        });
      }, refreshTime);

      logger.log(`[TokenManager] Token refresh scheduled in ${Math.round(refreshTime / 1000)}s`);
    }
  }

  /**
   * Perform token refresh
   */
  private async performTokenRefresh(): Promise<void> {
    logger.log('[TokenManager] Attempting token refresh...');

    if (this.refreshCallback) {
      try {
        await this.refreshCallback();
        logger.log('[TokenManager] Token refresh successful');
      } catch (e) {
        logger.error('[TokenManager] Token refresh failed:', e);
        // Clear tokens on refresh failure
        this.clearTokens();
      }
    } else {
      logger.warn('[TokenManager] No refresh callback registered');
    }
  }

  /**
   * Register callback for token refresh
   */
  onTokenRefresh(callback: () => Promise<void>): void {
    this.refreshCallback = callback;
    logger.log('[TokenManager] Refresh callback registered');
  }

  /**
   * Get token with automatic refresh
   */
  async getValidToken(): Promise<string | null> {
    const token = this.getAccessToken();

    if (!token) {
      logger.warn('[TokenManager] No token found');
      return null;
    }

    // If token is expiring soon, try to refresh
    if (this.isTokenExpiringSoon()) {
      logger.log('[TokenManager] Token expiring soon, refreshing...');
      await this.performTokenRefresh();
      return this.getAccessToken();
    }

    return token;
  }

  /**
   * Parse JWT token (without verification - for display only)
   */
  parseToken(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as Record<string, unknown>;
    } catch (e) {
      logger.error('[TokenManager] Failed to parse token:', e);
      return null;
    }
  }

  /**
   * Get token expiration from JWT
   */
  getTokenExpiration(token: string): number | null {
    const parsed = this.parseToken(token);
    return parsed?.exp && typeof parsed.exp === 'number' ? parsed.exp * 1000 : null;
  }

  /**
   * Validate token structure (basic check)
   */
  isValidTokenStructure(token: string): boolean {
    if (!token) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    try {
      // Try to decode the payload
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      JSON.parse(payload);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Initialize token manager
   */
  initialize(): void {
    // Check if we have stored tokens
    const expiresAt = this.getExpiresAt();
    
    if (expiresAt) {
      // Schedule refresh if token exists
      this.scheduleTokenRefresh(expiresAt);
      logger.log('[TokenManager] Initialized with existing token');
    } else {
      logger.log('[TokenManager] Initialized without token');
    }
  }

  /**
   * Destroy token manager
   */
  destroy(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.refreshCallback = null;
    logger.log('[TokenManager] Destroyed');
  }
}

// Singleton instance
export const tokenManager = new TokenManager();

// Export convenience functions
export const setTokens = (data: TokenData) => tokenManager.setTokens(data);
export const getAccessToken = () => tokenManager.getAccessToken();
export const getRefreshToken = () => tokenManager.getRefreshToken();
export const clearTokens = () => tokenManager.clearTokens();
export const getValidToken = () => tokenManager.getValidToken();
export const onTokenRefresh = (callback: () => Promise<void>) => tokenManager.onTokenRefresh(callback);
export const initializeTokenManager = () => tokenManager.initialize();

// Additional standalone functions for testing
export const setAccessToken = (token: string) => {
  storage.setEncrypted('access_token', token);
};

export const clearAccessToken = () => {
  storage.removeItem('access_token');
};

export const setRefreshToken = (token: string) => {
  storage.setEncrypted('refresh_token', token);
};

export const clearRefreshToken = () => {
  storage.removeItem('refresh_token');
};

export const parseJWT = (token: string): { header: Record<string, unknown>; payload: Record<string, unknown>; signature: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
    const signature = parts[2];

    return { header, payload, signature };
  } catch {
    return null;
  }
};

export const isValidJWT = (token: string | null | undefined): boolean => {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    // Try to decode header and payload
    const headerStr = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
    const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    
    // Verify they're valid JSON
    JSON.parse(headerStr);
    JSON.parse(payloadStr);
    
    return true;
  } catch {
    return false;
  }
};

export const getTokenExpiry = (token: string): number | null => {
  const parsed = parseJWT(token);
  if (!parsed || !parsed.payload || !parsed.payload.exp || typeof parsed.payload.exp !== 'number') {
    return null;
  }
  return parsed.payload.exp * 1000; // Convert seconds to milliseconds
};

/**
 * Check if a specific token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  
  // First check if it's a valid JWT
  if (!isValidJWT(token)) return true;
  
  const expiry = getTokenExpiry(token);
  if (!expiry) return false; // No expiry means token doesn't expire
  
  return Date.now() >= expiry;
};