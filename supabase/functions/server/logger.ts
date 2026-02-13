/**
 * Backend Logger Utility
 * Provides consistent logging with environment-based gating
 * Phase 2.4: Security Hardening
 * 
 * Matches frontend logger API for consistency
 */

/**
 * Check if logging is enabled
 * Uses CONSOLE_ENABLED environment variable
 * Production default: false (silent)
 * Development: set to 'true' for verbose logging
 */
function isLoggingEnabled(): boolean {
  // Check CONSOLE_ENABLED environment variable
  const consoleEnabled = Deno.env.get('CONSOLE_ENABLED');
  
  // Also check DENO_ENV for backwards compatibility
  const denoEnv = Deno.env.get('DENO_ENV');
  
  // Enable logging if:
  // 1. CONSOLE_ENABLED is explicitly 'true', OR
  // 2. DENO_ENV is not 'production'
  return consoleEnabled === 'true' || denoEnv !== 'production';
}

/**
 * Logger object with gated console methods
 * Provides same API as native console but respects environment settings
 */
export const logger = {
  /**
   * Log informational messages
   */
  log: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.log(...args);
    }
  },

  /**
   * Log informational messages (alias for log)
   */
  info: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.info(...args);
    }
  },

  /**
   * Log warning messages
   */
  warn: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.warn(...args);
    }
  },

  /**
   * Log error messages
   * Always logs in production for critical errors
   */
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },

  /**
   * Log debug messages
   * Only in development
   */
  debug: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.debug(...args);
    }
  },

  /**
   * Start a console group
   */
  group: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.group(...args);
    }
  },

  /**
   * Start a collapsed console group
   */
  groupCollapsed: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.groupCollapsed(...args);
    }
  },

  /**
   * End a console group
   */
  groupEnd: () => {
    if (isLoggingEnabled()) {
      console.groupEnd();
    }
  },

  /**
   * Log a table
   */
  table: (data: any) => {
    if (isLoggingEnabled()) {
      console.table(data);
    }
  },

  /**
   * Start a timer
   */
  time: (label: string) => {
    if (isLoggingEnabled()) {
      console.time(label);
    }
  },

  /**
   * End a timer
   */
  timeEnd: (label: string) => {
    if (isLoggingEnabled()) {
      console.timeEnd(label);
    }
  },

  /**
   * Log a timer without ending it
   */
  timeLog: (label: string, ...args: any[]) => {
    if (isLoggingEnabled()) {
      console.timeLog(label, ...args);
    }
  },

  /**
   * Clear the console
   */
  clear: () => {
    if (isLoggingEnabled()) {
      console.clear();
    }
  },

  /**
   * Log a stack trace
   */
  trace: (...args: any[]) => {
    if (isLoggingEnabled()) {
      console.trace(...args);
    }
  },

  /**
   * Assert a condition
   */
  assert: (condition: boolean, ...args: any[]) => {
    if (isLoggingEnabled()) {
      console.assert(condition, ...args);
    }
  },

  /**
   * Count occurrences
   */
  count: (label?: string) => {
    if (isLoggingEnabled()) {
      console.count(label);
    }
  },

  /**
   * Reset count
   */
  countReset: (label?: string) => {
    if (isLoggingEnabled()) {
      console.countReset(label);
    }
  }
};

/**
 * Export individual methods for named imports
 */
export const log = logger.log;
export const info = logger.info;
export const warn = logger.warn;
export const error = logger.error;
export const debug = logger.debug;

/**
 * Export as default for convenience
 */
export default logger;
