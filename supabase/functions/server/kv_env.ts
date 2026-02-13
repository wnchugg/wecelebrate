/**
 * Environment-Aware KV Store Wrapper
 * This wrapper adds environment awareness to the KV store operations
 * allowing data isolation between development and production environments.
 */
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Production Supabase configuration
const PRODUCTION_SUPABASE_URL = 'https://lmffeqwhrnbsbhdztwyv.supabase.co';
const PRODUCTION_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY_PROD');

// Timeout and retry configuration
const DB_TIMEOUT_MS = 30000; // 30 second timeout (increased from 15s for better reliability)
const MAX_RETRIES = 3; // 3 retries = 4 total attempts (increased from 2)
const RETRY_DELAY_MS = 1000; // 1000ms initial delay between retries (increased from 500ms)

// In-memory cache to reduce database load
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 30000; // 30 second cache TTL

// Helper to get from cache
function getCached(cacheKey: string): any | null {
  const cached = queryCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    console.log(`[KV Cache] Hit for ${cacheKey}`);
    return cached.data;
  }
  return null;
}

// Helper to set in cache
function setCache(cacheKey: string, data: any): void {
  queryCache.set(cacheKey, { data, timestamp: Date.now() });
  
  // Limit cache size to 1000 entries
  if (queryCache.size > 1000) {
    const oldestKey = queryCache.keys().next().value;
    queryCache.delete(oldestKey);
  }
}

// Helper to invalidate cache by prefix
function invalidateCacheByPrefix(prefix: string): void {
  for (const key of queryCache.keys()) {
    if (key.startsWith(prefix)) {
      queryCache.delete(key);
    }
  }
}

// Helper function to get the appropriate Supabase client based on environment
function getSupabaseClient(environmentId?: string) {
  // If production environment is requested and we have the production key
  if (environmentId === 'production' && PRODUCTION_SERVICE_ROLE_KEY) {
    return createClient(
      PRODUCTION_SUPABASE_URL,
      PRODUCTION_SERVICE_ROLE_KEY
    );
  }
  
  // Default to development
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? '',
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '',
  );
}

// Helper function to detect if error is a connection/timeout issue
function isConnectionError(error: any): boolean {
  const errorStr = String(error?.message || error || '').toLowerCase();
  return errorStr.includes('522') || 
         errorStr.includes('timeout') || 
         errorStr.includes('connection') ||
         errorStr.includes('<!doctype html>') ||
         errorStr.includes('cloudflare');
}

// Retry wrapper with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      // Add timeout to the operation
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), DB_TIMEOUT_MS)
      );
      
      const result = await Promise.race([operation(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error;
      
      if (isConnectionError(error)) {
        console.error(`[KV Store] Connection error on ${operationName} (attempt ${i + 1}/${retries + 1}):`, 
          error instanceof Error ? error.message.substring(0, 200) : 'Unknown error');
        
        // Don't retry if we've exhausted retries
        if (i < retries) {
          const delay = RETRY_DELAY_MS * Math.pow(2, i);
          console.log(`[KV Store] Retrying ${operationName} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      } else {
        // Non-connection errors don't get retried
        throw error;
      }
    }
  }
  
  // If we get here, all retries failed
  console.error(`[KV Store] All retries exhausted for ${operationName}`);
  throw new Error(`Database connection failed after ${retries + 1} attempts. Please try again later.`);
}

// Set stores a key-value pair in the database.
export const set = async (key: string, value: any, environmentId?: string): Promise<void> => {
  await withRetry(async () => {
    const supabase = getSupabaseClient(environmentId);
    const { error } = await supabase.from("kv_store_6fcaeea3").upsert({
      key,
      value
    });
    if (error) {
      throw new Error(error.message);
    }
    invalidateCacheByPrefix(key);
  }, `set(${key})`);
};

// Get retrieves a key-value pair from the database.
export const get = async (key: string, environmentId?: string): Promise<any> => {
  const cached = getCached(key);
  if (cached !== null) {
    return cached;
  }
  
  return await withRetry(async () => {
    const supabase = getSupabaseClient(environmentId);
    const { data, error } = await supabase.from("kv_store_6fcaeea3").select("value").eq("key", key).maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    setCache(key, data?.value);
    return data?.value;
  }, `get(${key})`);
};

// Delete deletes a key-value pair from the database.
export const del = async (key: string, environmentId?: string): Promise<void> => {
  await withRetry(async () => {
    const supabase = getSupabaseClient(environmentId);
    const { error } = await supabase.from("kv_store_6fcaeea3").delete().eq("key", key);
    if (error) {
      throw new Error(error.message);
    }
    invalidateCacheByPrefix(key);
  }, `del(${key})`);
};

// Sets multiple key-value pairs in the database.
export const mset = async (keys: string[], values: any[], environmentId?: string): Promise<void> => {
  await withRetry(async () => {
    const supabase = getSupabaseClient(environmentId);
    const { error } = await supabase.from("kv_store_6fcaeea3").upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
    if (error) {
      throw new Error(error.message);
    }
    keys.forEach(key => invalidateCacheByPrefix(key));
  }, `mset(${keys.length} keys)`);
};

// Gets multiple key-value pairs from the database.
export const mget = async (keys: string[], environmentId?: string): Promise<any[]> => {
  const cachedKeys = keys.filter(key => getCached(key) !== null);
  const uncachedKeys = keys.filter(key => getCached(key) === null);
  
  if (cachedKeys.length === keys.length) {
    return keys.map(key => getCached(key));
  }
  
  return await withRetry(async () => {
    const supabase = getSupabaseClient(environmentId);
    const { data, error } = await supabase.from("kv_store_6fcaeea3").select("value").in("key", uncachedKeys);
    if (error) {
      throw new Error(error.message);
    }
    const uncachedValues = data?.map((d) => d.value) ?? [];
    uncachedKeys.forEach((key, index) => setCache(key, uncachedValues[index]));
    return keys.map(key => getCached(key));
  }, `mget(${keys.length} keys)`);
};

// Deletes multiple key-value pairs from the database.
export const mdel = async (keys: string[], environmentId?: string): Promise<void> => {
  await withRetry(async () => {
    const supabase = getSupabaseClient(environmentId);
    const { error } = await supabase.from("kv_store_6fcaeea3").delete().in("key", keys);
    if (error) {
      throw new Error(error.message);
    }
    keys.forEach(key => invalidateCacheByPrefix(key));
  }, `mdel(${keys.length} keys)`);
};

// Search for key-value pairs by prefix.
export const getByPrefix = async (prefix: string, environmentId?: string): Promise<any[]> => {
  const cacheKey = `prefix:${prefix}:${environmentId || 'default'}`;
  const cached = getCached(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  return await withRetry(async () => {
    const supabase = getSupabaseClient(environmentId);
    const { data, error } = await supabase
      .from("kv_store_6fcaeea3")
      .select("key, value")
      .like("key", prefix + "%")
      .limit(1000); // Add limit to prevent large result sets
    if (error) {
      throw new Error(error.message);
    }
    const results = data?.map((d) => d.value) ?? [];
    setCache(cacheKey, results);
    return results;
  }, `getByPrefix(${prefix})`);
};