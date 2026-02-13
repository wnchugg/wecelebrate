/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_ANON_KEY_PROD?: string;
  readonly VITE_SUPABASE_PROJECT_ID?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_GA_ID?: string;
  readonly VITE_SEGMENT_KEY?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_MAINTENANCE_MODE?: string;
  readonly VITE_ENVIRONMENT?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
