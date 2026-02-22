/**
 * Site Settings Storage Adapter
 * Stores page configurations in site settings
 * Requirements: 12.6, 13.6
 */

import { StorageAdapter, PageConfiguration } from '../../core/types';

/**
 * Storage adapter for site settings (Landing/Welcome pages)
 */
export class SiteSettingsAdapter implements StorageAdapter {
  constructor(
    private siteId: string,
    private updateSite: (id: string, updates: any) => Promise<void>,
    private getCurrentSite: () => any | null
  ) {}

  /**
   * Load configuration from site settings
   */
  async load(key: string): Promise<PageConfiguration | null> {
    try {
      const site = this.getCurrentSite();
      
      if (!site) {
        throw new Error('No current site available');
      }

      // Configuration is stored in site.settings[key]
      const config = site.settings?.[key];
      
      if (!config) {
        return null;
      }

      // If it's a string, parse it as JSON
      if (typeof config === 'string') {
        return JSON.parse(config) as PageConfiguration;
      }

      // Otherwise return as-is (already an object)
      return config as PageConfiguration;
    } catch (error) {
      console.error(`Failed to load configuration from site settings (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * Save configuration to site settings
   */
  async save(key: string, config: PageConfiguration): Promise<void> {
    try {
      // Update the site settings with the new configuration
      await this.updateSite(this.siteId, {
        settings: {
          [key]: config,
        },
      });
    } catch (error) {
      console.error(`Failed to save configuration to site settings (key: ${key}):`, error);
      throw new Error('Failed to save page configuration');
    }
  }

  /**
   * Delete configuration from site settings
   */
  async delete(key: string): Promise<void> {
    try {
      await this.updateSite(this.siteId, {
        settings: {
          [key]: null,
        },
      });
    } catch (error) {
      console.error(`Failed to delete configuration from site settings (key: ${key}):`, error);
      throw new Error('Failed to delete page configuration');
    }
  }

  /**
   * Check if configuration exists in site settings
   */
  async exists(key: string): Promise<boolean> {
    try {
      const site = this.getCurrentSite();
      
      if (!site) {
        return false;
      }

      return site.settings?.[key] !== undefined && site.settings?.[key] !== null;
    } catch (error) {
      console.error(`Failed to check configuration existence (key: ${key}):`, error);
      return false;
    }
  }
}
