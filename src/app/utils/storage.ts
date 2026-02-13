/**
 * Storage Utilities
 * Provides localStorage wrapper functions and Supabase Storage integration
 */

import { supabase } from '../lib/supabase';

// ========================================
// Type Definitions
// ========================================

export type StorageBucket = 'logos' | 'gifts' | 'brands';

export interface UploadOptions {
  file: File;
  bucket: StorageBucket;
  path: string;
  upsert?: boolean;
}

export interface UploadResult {
  url: string;
  path: string;
  publicUrl: string;
}

// ========================================
// Supabase Storage Functions
// ========================================

/**
 * Upload a file to Supabase Storage
 */
export async function uploadImage(options: UploadOptions): Promise<UploadResult> {
  const { file, bucket, path, upsert = true } = options;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Upload a logo to Supabase Storage
 */
export async function uploadLogo(
  file: File,
  entityId: string
): Promise<{
  url: string;
  path: string;
  publicUrl: string;
}> {
  const timestamp = Date.now();
  const fileName = `${entityId}-${timestamp}.${file.name.split('.').pop()}`;
  const path = `logos/${fileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
}

/**
 * Upload a gift image to Supabase Storage
 */
export async function uploadGiftImage(
  file: File,
  giftId: string
): Promise<UploadResult> {
  const timestamp = Date.now();
  const fileName = `${giftId}-${timestamp}.${file.name.split('.').pop()}`;
  return uploadImage({
    file,
    bucket: 'gifts',
    path: `gifts/${fileName}`,
  });
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Get the public URL for a stored file
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Check if a URL is a base64 data URL
 */
export function isBase64DataUrl(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Check if a URL is a Supabase Storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage/');
}

// ========================================
// LocalStorage Wrapper Utilities
// ========================================

/**
 * Sets an item in localStorage with JSON serialization
 */
export function setItem(key: string, value: any): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error('Error setting item in localStorage:', error);
    // Don't re-throw - just log the error
  }
}

/**
 * Gets an item from localStorage with JSON deserialization
 */
export function getItem<T = any>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error('Error getting item from localStorage:', error);
    return null;
  }
}

/**
 * Removes an item from localStorage
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item from localStorage:', error);
  }
}

/**
 * Clears all items from localStorage
 */
export function clearAll(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Gets all keys from localStorage
 */
export function getAllKeys(): string[] {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error('Error getting localStorage keys:', error);
    return [];
  }
}

// ========================================
// Encrypted Storage (Session Storage)
// ========================================

/**
 * Store encrypted data in sessionStorage
 * Uses a simple encoding for now - can be enhanced with actual encryption
 */
export function setEncrypted(key: string, value: any): void {
  try {
    const serialized = JSON.stringify(value);
    const encoded = btoa(serialized); // Base64 encoding as simple obfuscation
    sessionStorage.setItem(key, encoded);
  } catch (error) {
    console.error('Error setting encrypted item:', error);
  }
}

/**
 * Retrieve encrypted data from sessionStorage
 */
export function getEncrypted<T = any>(key: string): T | null {
  try {
    const encoded = sessionStorage.getItem(key);
    if (!encoded) return null;
    const decoded = atob(encoded);
    return JSON.parse(decoded) as T;
  } catch (error) {
    console.error('Error getting encrypted item:', error);
    return null;
  }
}

/**
 * Remove encrypted item from sessionStorage
 */
export function removeEncrypted(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing encrypted item:', error);
  }
}

/**
 * Clear all encrypted data from sessionStorage
 */
export function clearEncrypted(): void {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing encrypted storage:', error);
  }
}

// ========================================
// Storage Utilities
// ========================================

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage size in bytes (approximate)
 */
export function getStorageSize(): number {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * Get storage size in human-readable format
 */
export function getStorageSizeFormatted(): string {
  const bytes = getStorageSize();
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ========================================
// Aliases for backward compatibility
// ========================================

export const clear = clearAll;
export const hasItem = (key: string): boolean => getItem(key) !== null;
export const getKeys = getAllKeys;