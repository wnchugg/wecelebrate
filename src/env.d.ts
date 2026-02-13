/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 * All environment variables must be prefixed with VITE_
 */
interface ImportMetaEnv {
  // Environment
  readonly VITE_APP_ENV?: 'development' | 'staging' | 'production';

  // API Configuration
  readonly VITE_API_URL?: string;

  // Supabase Integration (Optional)
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;

  // Analytics Integration (Optional)
  readonly VITE_GA_ID?: string;
  readonly VITE_SEGMENT_KEY?: string;

  // Error Monitoring (Optional)
  readonly VITE_SENTRY_DSN?: string;

  // Feature Flags (Optional)
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_ERROR_REPORTING?: string;
  readonly VITE_ENABLE_DEBUG_LOGGING?: string;

  // Vite Built-in Variables
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
