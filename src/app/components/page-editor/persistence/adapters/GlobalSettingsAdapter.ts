/**
 * Global Settings Storage Adapter
 * Stores page configurations in global settings API
 * Requirements: 20.6, 20.7
 */

import { StorageAdapter, PageConfiguration } from '../../core/types';

/**
 * Storage adapter for global settings (Home page)
 */
export class GlobalSettingsAdapter implements StorageAdapter {
  constructor(
    private endpoint: string,
    private authToken: string
  ) {}

  /**
   * Load configuration from global settings API
   */
  async load(key: string): Promise<PageConfiguration | null> {
    try {
      const response = await fetch(`${this.endpoint}/${key}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Configuration doesn't exist yet
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // The API returns { config: PageConfiguration }
      if (data.config) {
        return data.config as PageConfiguration;
      }

      return null;
    } catch (error) {
      console.error(`Failed to load configuration from global settings (key: ${key}):`, error);
      
      // Return null for network errors to allow fallback to default config
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return null;
      }
      
      throw error;
    }
  }

  /**
   * Save configuration to global settings API
   */
  async save(key: string, config: PageConfiguration): Promise<void> {
    try {
      const response = await fetch(`${this.endpoint}/${key}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error(`Failed to save configuration to global settings (key: ${key}):`, error);
      throw new Error('Failed to save page configuration');
    }
  }

  /**
   * Delete configuration from global settings API
   */
  async delete(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.endpoint}/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to delete configuration from global settings (key: ${key}):`, error);
      throw new Error('Failed to delete page configuration');
    }
  }

  /**
   * Check if configuration exists in global settings API
   */
  async exists(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/${key}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to check configuration existence (key: ${key}):`, error);
      return false;
    }
  }
}
