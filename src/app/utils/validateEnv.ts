/**
 * Environment Variable Validation Script
 * 
 * Run this to validate your environment configuration.
 * Usage: Include in your app initialization or run separately.
 */

import { validateBuildEnvironment, detectBuildEnvironment } from '../config/buildConfig';
import { logEnvVars } from './env';

// Safe helper to access import.meta.env
function safeGetEnv(key?: string): string | ImportMetaEnv | undefined {
  try {
    if (key) {
      return (import.meta.env as any)[key];
    }
    return import.meta.env;
  } catch (e) {
    return undefined;
  }
}

interface ValidationResult {
  environment: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: {
    hasSupabase: boolean;
    hasAnalytics: boolean;
    hasMonitoring: boolean;
  };
}

/**
 * Comprehensive environment validation
 */
export function validateEnvironmentConfiguration(): ValidationResult {
  const environment = detectBuildEnvironment();
  const { isValid, errors } = validateBuildEnvironment();
  const warnings: string[] = [];

  // Check optional but recommended variables
  if (!safeGetEnv('VITE_SUPABASE_URL') && environment !== 'development') {
    warnings.push('VITE_SUPABASE_URL is not set - backend features will be limited');
  }

  if (safeGetEnv('VITE_ENABLE_ANALYTICS') === 'true' && !safeGetEnv('VITE_GA_ID')) {
    warnings.push('Analytics is enabled but VITE_GA_ID is not set');
  }

  if (safeGetEnv('VITE_ENABLE_ERROR_REPORTING') === 'true' && !safeGetEnv('VITE_SENTRY_DSN')) {
    warnings.push('Error reporting is enabled but VITE_SENTRY_DSN is not set');
  }

  // Check for common misconfigurations
  if (safeGetEnv('VITE_API_URL')?.includes('localhost') && environment === 'production') {
    warnings.push('Production environment is using localhost API URL');
  }

  return {
    environment,
    isValid,
    errors,
    warnings,
    info: {
      hasSupabase: Boolean(safeGetEnv('VITE_SUPABASE_URL') && safeGetEnv('VITE_SUPABASE_ANON_KEY')),
      hasAnalytics: Boolean(safeGetEnv('VITE_GA_ID') || safeGetEnv('VITE_SEGMENT_KEY')),
      hasMonitoring: Boolean(safeGetEnv('VITE_SENTRY_DSN')),
    },
  };
}

/**
 * Print validation report to console
 */
export function printValidationReport(): void {
  console.warn('🔍 Environment Configuration Report');
  
  const result = validateEnvironmentConfiguration();
  
  // Environment info
  console.warn('\n📍 Environment:', result.environment.toUpperCase());
  console.warn('Mode:', safeGetEnv('MODE'));
  console.warn('Production build:', safeGetEnv('PROD'));
  console.warn('Development mode:', safeGetEnv('DEV'));
  
  // Status
  if (result.isValid) {
    console.warn('\n✅ Configuration is valid');
  } else {
    console.error('\n❌ Configuration has errors:');
    result.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  // Warnings
  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  // Integration status
  console.warn('\n🔌 Integrations:');
  console.warn('  Supabase:', result.info.hasSupabase ? '✅ Configured' : '❌ Not configured');
  console.warn('  Analytics:', result.info.hasAnalytics ? '✅ Configured' : '❌ Not configured');
  console.warn('  Monitoring:', result.info.hasMonitoring ? '✅ Configured' : '❌ Not configured');
  
  // API Configuration
  console.warn('\n🌐 API Configuration:');
  console.warn('  Base URL:', safeGetEnv('VITE_API_URL') || '(using default)');
  
  // Help text
  if (!result.isValid || result.warnings.length > 0) {
    console.warn('\n📚 For help:');
    console.warn('  - See ENVIRONMENT_VARIABLES.md for complete documentation');
    console.warn('  - See ENVIRONMENT_QUICK_REFERENCE.md for quick reference');
    console.warn('  - Check .env.example for available variables');
  }
  
  // End of report
}

/**
 * Validate and throw if critical errors exist
 */
export function validateOrThrow(): void {
  const result = validateEnvironmentConfiguration();
  
  if (!result.isValid && result.environment !== 'development') {
    throw new Error(
      `Environment validation failed:\n${result.errors.join('\n')}\n\n` +
      'See ENVIRONMENT_VARIABLES.md for setup instructions.'
    );
  }
}

/**
 * Run validation in development mode
 */
export function runDevelopmentValidation(): void {
  if (safeGetEnv('DEV')) {
    printValidationReport();
    logEnvVars();
  }
}

// Auto-run in development if imported
try {
  if (safeGetEnv('DEV') && typeof sessionStorage !== 'undefined') {
    // Only log once on initial load
    const hasValidated = sessionStorage.getItem('env_validated');
    if (!hasValidated) {
      printValidationReport();
      sessionStorage.setItem('env_validated', 'true');
    }
  }
} catch (e) {
  // Silently fail if not in browser environment
}

export default {
  validate: validateEnvironmentConfiguration,
  printReport: printValidationReport,
  validateOrThrow,
  runDevelopmentValidation,
};