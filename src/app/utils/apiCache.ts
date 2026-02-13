/**
 * API Response Cache Utility
 * Implements intelligent caching with TTL and invalidation strategies
 * Phase 2.3: Performance Optimization
 */

import { logger } from './logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheConfig {
  defaultTTL: number; // milliseconds
  maxSize: number; // maximum number of entries
  enableLogging: boolean;
}

class APICache {
  private cache: Map<string, CacheEntry<any>>;
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new Map();
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      enableLogging: import.meta.env.DEV,
      ...config
    };
  }

  /**
   * Generate cache key from URL and params
   */
  private generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest() {
    if (this.cache.size < this.config.maxSize) return;

    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      if (this.config.enableLogging) {
        logger.log(`[Cache] Evicted oldest entry: ${oldestKey}`);
      }
    }
  }

  /**
   * Set cache entry
   */
  set<T>(
    url: string, 
    data: T, 
    params?: Record<string, any>, 
    ttl?: number
  ): void {
    const key = this.generateKey(url, params);
    
    // Evict if necessary
    this.evictOldest();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key
    };

    this.cache.set(key, entry);

    if (this.config.enableLogging) {
      logger.log(`[Cache] Set: ${key} (TTL: ${entry.ttl}ms)`);
    }
  }

  /**
   * Get cache entry
   */
  get<T>(url: string, params?: Record<string, any>): T | undefined {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);

    if (!entry) {
      if (this.config.enableLogging) {
        logger.log(`[Cache] Miss: ${key}`);
      }
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      if (this.config.enableLogging) {
        logger.log(`[Cache] Expired: ${key}`);
      }
      return undefined;
    }

    if (this.config.enableLogging) {
      logger.log(`[Cache] Hit: ${key}`);
    }

    return entry.data as T;
  }

  /**
   * Check if cache has valid entry
   */
  has(url: string, params?: Record<string, any>): boolean {
    const data = this.get(url, params);
    return data !== undefined;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(url: string, params?: Record<string, any>): void {
    const key = this.generateKey(url, params);
    const deleted = this.cache.delete(key);

    if (deleted && this.config.enableLogging) {
      logger.log(`[Cache] Invalidated: ${key}`);
    }
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    let count = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      const matches = typeof pattern === 'string' 
        ? key.includes(pattern)
        : pattern.test(key);

      if (matches) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      count++;
    });

    if (count > 0 && this.config.enableLogging) {
      logger.log(`[Cache] Invalidated ${count} entries matching pattern: ${pattern}`);
    }

    return count;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();

    if (this.config.enableLogging) {
      logger.log(`[Cache] Cleared ${size} entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      usage: (this.cache.size / this.config.maxSize) * 100,
      entries: entries.map(entry => ({
        key: entry.key,
        age: now - entry.timestamp,
        ttl: entry.ttl,
        timeRemaining: Math.max(0, entry.ttl - (now - entry.timestamp))
      }))
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let count = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      count++;
    });

    if (count > 0 && this.config.enableLogging) {
      logger.log(`[Cache] Cleaned up ${count} expired entries`);
    }

    return count;
  }

  /**
   * Wrap an async function with caching
   */
  async cached<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    this.set(key, result, undefined, ttl);
    return result;
  }
}

// Singleton instances for different cache types
export const apiCache = new APICache({
  defaultTTL: 5 * 60 * 1000, // 5 minutes for API responses
  maxSize: 100
});

export const staticDataCache = new APICache({
  defaultTTL: 30 * 60 * 1000, // 30 minutes for static data (clients, sites, products)
  maxSize: 50
});

export const userDataCache = new APICache({
  defaultTTL: 2 * 60 * 1000, // 2 minutes for user data (more volatile)
  maxSize: 50
});

// Start cleanup interval (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
    staticDataCache.cleanup();
    userDataCache.cleanup();
  }, 5 * 60 * 1000);
}

// Export utility functions
export const clearAllCaches = () => {
  apiCache.clear();
  staticDataCache.clear();
  userDataCache.clear();
  logger.log('[Cache] All caches cleared');
};

export const getCacheStats = () => ({
  api: apiCache.getStats(),
  staticData: staticDataCache.getStats(),
  userData: userDataCache.getStats()
});

// Additional standalone functions for testing
export const deleteEntry = (url: string, params?: Record<string, any>) => {
  apiCache.invalidate(url, params);
};

export const size = () => {
  return apiCache.getStats().size;
};

export const invalidateByPrefix = (prefix: string) => {
  return apiCache.invalidatePattern(prefix);
};

export const invalidateByPattern = (pattern: string | RegExp) => {
  return apiCache.invalidatePattern(pattern);
};

// Export the class for advanced usage
export { APICache };