/**
 * Environment Variable Utilities
 * 
 * Helper functions for safely accessing environment variables
 * with type safety, validation, and fallbacks.
 */

// Safe helper to access import.meta.env
function safeGetEnv(key?: keyof ImportMetaEnv): any {
  try {
    if (key) {
      return import.meta.env[key];
    }
    return import.meta.env;
  } catch (e) {
    return undefined;
  }
}

/**
 * Safely get a string environment variable with optional fallback
 */
export function getEnvString(key: keyof ImportMetaEnv, fallback: string = ''): string {
  const value = safeGetEnv(key);
  return typeof value === 'string' ? value : fallback;
}

/**
 * Get a required string environment variable (throws if missing)
 */
export function getRequiredEnvString(key: keyof ImportMetaEnv): string {
  const value = safeGetEnv(key);
  if (typeof value !== 'string' || value === '') {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get a boolean environment variable
 */
export function getEnvBoolean(key: keyof ImportMetaEnv, fallback: boolean = false): boolean {
  const value = safeGetEnv(key);
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return fallback;
}

/**
 * Get a number environment variable
 */
export function getEnvNumber(key: keyof ImportMetaEnv, fallback: number = 0): number {
  const value = safeGetEnv(key);
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * Check if an environment variable is defined and non-empty
 */
export function hasEnvVar(key: keyof ImportMetaEnv): boolean {
  const value = safeGetEnv(key);
  return typeof value === 'string' && value !== '';
}

/**
 * Get all environment variables (for debugging - use carefully!)
 */
export function getAllEnvVars(): Partial<ImportMetaEnv> {
  const env = safeGetEnv();
  return env ? { ...env } : {};
}

/**
 * Log all environment variables (development only)
 */
export function logEnvVars(): void {
  try {
    if (safeGetEnv('DEV' as keyof ImportMetaEnv)) {
      console.group('🔧 Environment Variables');
      console.log('Mode:', safeGetEnv('MODE' as keyof ImportMetaEnv));
      console.log('Base URL:', safeGetEnv('BASE_URL' as keyof ImportMetaEnv));
      console.log('Production:', safeGetEnv('PROD' as keyof ImportMetaEnv));
      console.log('Development:', safeGetEnv('DEV' as keyof ImportMetaEnv));
      
      // Log custom VITE_ variables (filter out built-ins)
      const env = safeGetEnv();
      if (env) {
        const customVars = Object.entries(env)
          .filter(([key]) => key.startsWith('VITE_'))
          .reduce((acc, [key, value]) => {
            // Mask sensitive values
            if (key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN')) {
              acc[key] = value ? '***' + String(value).slice(-4) : '(not set)';
            } else {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, unknown>);
        
        console.table(customVars);
      }
      console.groupEnd();
    }
  } catch (e) {
    // Silently fail if import.meta.env is not available
  }
}

/**
 * Type-safe environment variable access with validation
 */
export const env = {
  // Built-in Vite variables
  get mode() {
    return safeGetEnv('MODE' as keyof ImportMetaEnv) || 'development';
  },
  get baseUrl() {
    return safeGetEnv('BASE_URL' as keyof ImportMetaEnv) || '/';
  },
  get isProd() {
    return safeGetEnv('PROD' as keyof ImportMetaEnv) === true;
  },
  get isDev() {
    return safeGetEnv('DEV' as keyof ImportMetaEnv) !== false;
  },
  get isSsr() {
    return safeGetEnv('SSR' as keyof ImportMetaEnv) === true;
  },

  // Custom variables with type safety
  get appEnv() {
    return getEnvString('VITE_APP_ENV', 'development');
  },

  get apiUrl() {
    return getEnvString('VITE_API_URL', 'http://localhost:3001');
  },

  get supabase() {
    return {
      url: getEnvString('VITE_SUPABASE_URL'),
      anonKey: getEnvString('VITE_SUPABASE_ANON_KEY'),
      isConfigured: hasEnvVar('VITE_SUPABASE_URL') && hasEnvVar('VITE_SUPABASE_ANON_KEY'),
    };
  },

  get analytics() {
    return {
      googleAnalyticsId: getEnvString('VITE_GA_ID'),
      segmentKey: getEnvString('VITE_SEGMENT_KEY'),
      isConfigured: hasEnvVar('VITE_GA_ID') || hasEnvVar('VITE_SEGMENT_KEY'),
    };
  },

  get monitoring() {
    return {
      sentryDsn: getEnvString('VITE_SENTRY_DSN'),
      isConfigured: hasEnvVar('VITE_SENTRY_DSN'),
    };
  },

  get features() {
    return {
      enableAnalytics: getEnvBoolean('VITE_ENABLE_ANALYTICS'),
      enableErrorReporting: getEnvBoolean('VITE_ENABLE_ERROR_REPORTING'),
      enableDebugLogging: getEnvBoolean('VITE_ENABLE_DEBUG_LOGGING'),
    };
  },
} as const;

export default env;