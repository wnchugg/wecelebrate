/**
 * Build Configuration
 * 
 * Manages build-time environment-specific settings and configuration.
 * Supports: development, staging, production
 * 
 * Environment Variables:
 * All variables must be prefixed with VITE_ to be exposed to the client.
 * See /ENVIRONMENT_VARIABLES.md for complete documentation.
 * 
 * NOTE: This file handles build-time environment configuration.
 * For runtime deployment environment switching (dev/test/uat/prod Supabase projects),
 * see deploymentEnvironments.ts
 */

export type BuildEnvironment = 'development' | 'staging' | 'production';

export interface BuildConfig {
  environment: BuildEnvironment;
  apiBaseUrl: string;
  apiTimeout: number;
  enableDebugLogging: boolean;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  maxUploadSize: number; // in MB
  sessionTimeout: number; // in minutes
  features: {
    enableImportExport: boolean;
    enableAdvancedAdmin: boolean;
    enableBetaFeatures: boolean;
    enableAuditLogs: boolean;
    enableSSOConfig: boolean;
  };
  integrations: {
    supabase?: {
      url: string;
      anonKey: string;
    };
    analytics?: {
      googleAnalyticsId?: string;
      segmentKey?: string;
    };
    monitoring?: {
      sentryDsn?: string;
    };
  };
}

/**
 * Detect current build environment
 * Priority: VITE_APP_ENV > NODE_ENV > hostname
 */
export function detectBuildEnvironment(): BuildEnvironment {
  // Check Vite environment variable
  const viteEnv = import.meta.env.VITE_APP_ENV as BuildEnvironment | undefined;
  if (viteEnv && ['development', 'staging', 'production'].includes(viteEnv)) {
    return viteEnv;
  }

  // Check Node environment (fallback)
  const nodeEnv = import.meta.env.MODE;
  if (nodeEnv === 'production') {
    return 'production';
  }

  // Check hostname patterns
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('staging') || hostname.includes('stg')) {
      return 'staging';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    // Production domains
    if (hostname.includes('.jala.com') || hostname.includes('jala.app')) {
      return 'production';
    }
  }

  // Default to development
  return 'development';
}

/**
 * Get build environment-specific configuration
 */
export function getBuildConfig(): BuildConfig {
  const environment = detectBuildEnvironment();

  // Base configuration for all environments
  const baseConfig = {
    environment,
    apiTimeout: 30000,
    maxUploadSize: 10,
  };

  // Environment-specific configurations
  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        apiBaseUrl: import.meta.env.VITE_API_URL || 'https://api.jala.com',
        enableDebugLogging: false,
        enableAnalytics: true,
        enableErrorReporting: true,
        sessionTimeout: 60,
        features: {
          enableImportExport: true,
          enableAdvancedAdmin: true,
          enableBetaFeatures: false,
          enableAuditLogs: true,
          enableSSOConfig: true,
        },
        integrations: {
          supabase: {
            url: import.meta.env.VITE_SUPABASE_URL || '',
            anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          },
          analytics: {
            googleAnalyticsId: import.meta.env.VITE_GA_ID,
            segmentKey: import.meta.env.VITE_SEGMENT_KEY,
          },
          monitoring: {
            sentryDsn: import.meta.env.VITE_SENTRY_DSN,
          },
        },
      };

    case 'staging':
      return {
        ...baseConfig,
        apiBaseUrl: import.meta.env.VITE_API_URL || 'https://staging-api.jala.com',
        enableDebugLogging: true,
        enableAnalytics: true,
        enableErrorReporting: true,
        sessionTimeout: 120,
        features: {
          enableImportExport: true,
          enableAdvancedAdmin: true,
          enableBetaFeatures: true,
          enableAuditLogs: true,
          enableSSOConfig: true,
        },
        integrations: {
          supabase: {
            url: import.meta.env.VITE_SUPABASE_URL || '',
            anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          },
          analytics: {
            googleAnalyticsId: import.meta.env.VITE_GA_ID,
          },
          monitoring: {
            sentryDsn: import.meta.env.VITE_SENTRY_DSN,
          },
        },
      };

    case 'development':
    default:
      return {
        ...baseConfig,
        apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
        enableDebugLogging: true,
        enableAnalytics: false,
        enableErrorReporting: false,
        sessionTimeout: 480, // 8 hours for dev
        features: {
          enableImportExport: true,
          enableAdvancedAdmin: true,
          enableBetaFeatures: true,
          enableAuditLogs: true,
          enableSSOConfig: true,
        },
        integrations: {
          supabase: {
            url: import.meta.env.VITE_SUPABASE_URL || '',
            anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          },
        },
      };
  }
}

/**
 * Build environment utilities
 */
export const buildEnv = {
  get current() {
    return detectBuildEnvironment();
  },
  
  get config() {
    return getBuildConfig();
  },

  get isDevelopment() {
    return detectBuildEnvironment() === 'development';
  },

  get isStaging() {
    return detectBuildEnvironment() === 'staging';
  },

  get isProduction() {
    return detectBuildEnvironment() === 'production';
  },

  /**
   * Check if a feature is enabled in current environment
   */
  hasFeature(feature: keyof BuildConfig['features']): boolean {
    return getBuildConfig().features[feature];
  },

  /**
   * Get API URL with path
   */
  getApiUrl(path: string = ''): string {
    const baseUrl = getBuildConfig().apiBaseUrl;
    return path ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : baseUrl;
  },

  /**
   * Log debug message (only in dev/staging)
   */
  debug(...args: unknown[]): void {
    if (getBuildConfig().enableDebugLogging) {
      console.warn('[DEBUG]', ...args);
    }
  },

  /**
   * Log warning message
   */
  warn(...args: unknown[]): void {
    console.warn('[WARN]', ...args);
  },

  /**
   * Log error message
   */
  error(...args: unknown[]): void {
    console.error('[ERROR]', ...args);
    
    // Send to error reporting service if enabled
    if (getBuildConfig().enableErrorReporting) {
      // TODO: Integrate with Sentry or other error reporting service
    }
  },
};

/**
 * Validate build environment variables
 */
export function validateBuildEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = getBuildConfig();

  // Check required environment variables based on environment
  if (config.environment === 'production' || config.environment === 'staging') {
    if (!config.integrations.supabase?.url) {
      errors.push('VITE_SUPABASE_URL is required in production/staging');
    }
    if (!config.integrations.supabase?.anonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required in production/staging');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Export singleton instance
export default buildEnv;
