/**
 * Global Configuration
 * 
 * Application-wide settings that apply across all clients and sites.
 */

export interface GlobalConfig {
  version: string;
  applicationName: string;
  supportEmail: string;
  supportPhone?: string;
  
  // Brand Assets
  branding: {
    defaultPrimaryColor: string;
    defaultSecondaryColor: string;
    defaultTertiaryColor: string;
    logoUrl?: string;
    faviconUrl?: string;
  };

  // Default Settings
  defaults: {
    language: string;
    currency: string;
    country: string;
    timezone: string;
  };

  // Security Settings
  security: {
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecialChars: boolean;
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    requireMFA: boolean;
    allowedFileTypes: string[];
    maxFileSize: number; // MB
  };

  // Email Settings
  email: {
    fromName: string;
    fromEmail: string;
    replyToEmail: string;
    footerText?: string;
    enableEmailNotifications: boolean;
  };

  // Feature Flags
  features: {
    enableMultiLanguage: boolean;
    enableMultiCurrency: boolean;
    enableGiftWrap: boolean;
    enableGiftMessage: boolean;
    enableStorePickup: boolean;
    enableExpressShipping: boolean;
    enableInternationalShipping: boolean;
    enableProductReviews: boolean;
    enableWishlist: boolean;
    enableGiftRegistry: boolean;
  };

  // Compliance
  compliance: {
    enableGDPR: boolean;
    enableCCPA: boolean;
    enableCookieConsent: boolean;
    dataRetentionDays: number;
    requirePrivacyPolicyAcceptance: boolean;
    requireTermsAcceptance: boolean;
  };

  // Integrations
  integrations: {
    enableShippingProviders: boolean;
    enablePaymentGateways: boolean;
    enableAnalytics: boolean;
    enableCRM: boolean;
    enableInventoryManagement: boolean;
  };

  // Operational Settings
  operational: {
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    allowNewClientRegistration: boolean;
    allowNewSiteCreation: boolean;
    maxClientsPerAccount: number;
    maxSitesPerClient: number;
    defaultOrderProcessingDays: number;
  };

  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    updatedBy?: string;
  };
}

/**
 * Default global configuration
 */
export const defaultGlobalConfig: GlobalConfig = {
  version: '2.0.0',
  applicationName: 'JALA 2',
  supportEmail: 'support@jala.com',
  supportPhone: '1-800-JALA-GIFT',

  branding: {
    defaultPrimaryColor: '#D91C81',
    defaultSecondaryColor: '#1B2A5E',
    defaultTertiaryColor: '#00B4CC',
  },

  defaults: {
    language: 'en',
    currency: 'USD',
    country: 'US',
    timezone: 'America/New_York',
  },

  security: {
    passwordMinLength: 12,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    requireMFA: false,
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.xlsx', '.csv'],
    maxFileSize: 10,
  },

  email: {
    fromName: 'JALA Gifting Platform',
    fromEmail: 'noreply@jala.com',
    replyToEmail: 'support@jala.com',
    footerText: '© 2026 JALA. All rights reserved.',
    enableEmailNotifications: true,
  },

  features: {
    enableMultiLanguage: true,
    enableMultiCurrency: true,
    enableGiftWrap: true,
    enableGiftMessage: true,
    enableStorePickup: true,
    enableExpressShipping: true,
    enableInternationalShipping: true,
    enableProductReviews: false,
    enableWishlist: false,
    enableGiftRegistry: false,
  },

  compliance: {
    enableGDPR: true,
    enableCCPA: true,
    enableCookieConsent: true,
    dataRetentionDays: 2555, // ~7 years
    requirePrivacyPolicyAcceptance: true,
    requireTermsAcceptance: true,
  },

  integrations: {
    enableShippingProviders: true,
    enablePaymentGateways: true,
    enableAnalytics: true,
    enableCRM: false,
    enableInventoryManagement: false,
  },

  operational: {
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back soon.',
    allowNewClientRegistration: true,
    allowNewSiteCreation: true,
    maxClientsPerAccount: 100,
    maxSitesPerClient: 50,
    defaultOrderProcessingDays: 3,
  },

  metadata: {
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
};

/**
 * Global configuration state management
 */
class GlobalConfigManager {
  private config: GlobalConfig;
  private storageKey = 'jala_global_config';

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from storage or use default
   */
  private loadConfig(): GlobalConfig {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.error('Error loading global config:', error);
    }
    return { ...defaultGlobalConfig };
  }

  /**
   * Merge stored config with defaults (handles version updates)
   */
  private mergeWithDefaults(stored: Partial<GlobalConfig>): GlobalConfig {
    return {
      ...defaultGlobalConfig,
      ...stored,
      branding: { ...defaultGlobalConfig.branding, ...stored.branding },
      defaults: { ...defaultGlobalConfig.defaults, ...stored.defaults },
      security: { ...defaultGlobalConfig.security, ...stored.security },
      email: { ...defaultGlobalConfig.email, ...stored.email },
      features: { ...defaultGlobalConfig.features, ...stored.features },
      compliance: { ...defaultGlobalConfig.compliance, ...stored.compliance },
      integrations: { ...defaultGlobalConfig.integrations, ...stored.integrations },
      operational: { ...defaultGlobalConfig.operational, ...stored.operational },
      metadata: { ...defaultGlobalConfig.metadata, ...stored.metadata },
    };
  }

  /**
   * Save configuration to storage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving global config:', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): GlobalConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<GlobalConfig>): GlobalConfig {
    this.config = {
      ...this.config,
      ...updates,
      metadata: {
        ...this.config.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
    this.saveConfig();
    return this.getConfig();
  }

  /**
   * Reset to default configuration
   */
  resetConfig(): GlobalConfig {
    this.config = { ...defaultGlobalConfig };
    this.saveConfig();
    return this.getConfig();
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(json: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(json);
      
      // Validate required fields
      if (!parsed.version || !parsed.applicationName) {
        return {
          success: false,
          error: 'Invalid configuration: missing required fields',
        };
      }

      this.config = this.mergeWithDefaults(parsed);
      this.saveConfig();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid JSON format',
      };
    }
  }
}

// Export singleton instance
export const globalConfigManager = new GlobalConfigManager();

// Export convenience functions
export function getGlobalConfig(): GlobalConfig {
  return globalConfigManager.getConfig();
}

export function updateGlobalConfig(updates: Partial<GlobalConfig>): GlobalConfig {
  return globalConfigManager.updateConfig(updates);
}

export function resetGlobalConfig(): GlobalConfig {
  return globalConfigManager.resetConfig();
}

export function exportGlobalConfig(): string {
  return globalConfigManager.exportConfig();
}

export function importGlobalConfig(json: string): { success: boolean; error?: string } {
  return globalConfigManager.importConfig(json);
}
