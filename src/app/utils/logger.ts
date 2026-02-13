/**
 * Production-Safe Logger Utility
 * 
 * Wraps console methods to prevent logging in production builds.
 * console.error is always enabled for critical error reporting.
 * 
 * Usage:
 *   import { logger } from './logger'; // or '../utils/logger' depending on your location
 *   
 *   logger.log('Debug info');       // Only in development
 *   logger.warn('Warning');         // Only in development
 *   logger.info('Information');     // Only in development
 *   logger.debug('Debug details');  // Only in development
 *   logger.error('Critical error'); // Always logged (development + production)
 * 
 * @module logger
 */

// Safely check if we're in development mode
let isDevelopment = true; // Default to development mode
try {
  isDevelopment = import.meta.env.DEV !== false;
} catch (e) {
  // import.meta.env not available, default to development
  isDevelopment = true;
}

/**
 * Log levels for filtering
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE';

let currentLogLevel: LogLevel = 'DEBUG';

/**
 * Set the current log level
 */
export function setLogLevel(level: LogLevel) {
  currentLogLevel = level;
}

/**
 * Get current timestamp string with log level
 */
function getTimestamp(level?: string): string {
  const now = new Date();
  const time = now.toTimeString().split(' ')[0]; // Returns HH:MM:SS
  return level ? `${time} [${level}]` : time;
}

/**
 * Check if a log level should be displayed
 */
function shouldLog(level: LogLevel): boolean {
  const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'];
  const currentIndex = levels.indexOf(currentLogLevel);
  const levelIndex = levels.indexOf(level);
  return levelIndex >= currentIndex && currentLogLevel !== 'NONE';
}

/**
 * Logger object with gated console methods
 */
export const logger = {
  /**
   * Log general information (development only)
   */
  log: (...args: any[]) => {
    if (isDevelopment && shouldLog('DEBUG')) {
      console.log(getTimestamp(), ...args);
    }
  },

  /**
   * Log warnings (development only)
   */
  warn: (...args: any[]) => {
    if (isDevelopment && shouldLog('WARN')) {
      console.warn(getTimestamp('WARN'), ...args);
    }
  },

  /**
   * Log informational messages (development only)
   */
  info: (...args: any[]) => {
    if (isDevelopment && shouldLog('INFO')) {
      console.info(getTimestamp('INFO'), ...args);
    }
  },

  /**
   * Log debug information (development only)
   */
  debug: (...args: any[]) => {
    if (isDevelopment && shouldLog('DEBUG')) {
      console.debug(getTimestamp('DEBUG'), ...args);
    }
  },

  /**
   * Log errors (ALWAYS logged - development + production)
   * Errors should always be visible for debugging production issues
   */
  error: (...args: any[]) => {
    if (shouldLog('ERROR')) {
      console.error(getTimestamp('ERROR'), ...args);
    }
  },

  /**
   * Create a namespaced logger for specific modules
   * 
   * @param namespace - Module or component name
   * @returns Logger with prefixed namespace
   * 
   * @example
   * const log = logger.namespace('AdminContext');
   * log.info('User logged in'); // [AdminContext] User logged in
   */
  namespace: (namespace: string) => ({
    log: (...args: any[]) => logger.log(`[${namespace}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[${namespace}]`, ...args),
    info: (...args: any[]) => logger.info(`[${namespace}]`, ...args),
    debug: (...args: any[]) => logger.debug(`[${namespace}]`, ...args),
    error: (...args: any[]) => logger.error(`[${namespace}]`, ...args),
  }),

  /**
   * Log a table (development only)
   * Useful for displaying structured data
   */
  table: (data: any) => {
    if (isDevelopment && console.table) {
      console.table(data);
    }
  },

  /**
   * Log with timing information (development only)
   * Useful for performance debugging
   */
  time: (label: string) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  /**
   * End timing (development only)
   */
  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },

  /**
   * Create a performance mark (development only)
   */
  mark: (label: string) => {
    if (isDevelopment && performance?.mark) {
      performance.mark(label);
    }
  },

  /**
   * Start a console group (development only)
   */
  group: (label: string) => {
    if (isDevelopment && console.group) {
      console.group(label);
    }
  },

  /**
   * Start a collapsed console group (development only)
   */
  groupCollapsed: (label: string) => {
    if (isDevelopment && console.groupCollapsed) {
      console.groupCollapsed(label);
    }
  },

  /**
   * End a console group (development only)
   */
  groupEnd: () => {
    if (isDevelopment && console.groupEnd) {
      console.groupEnd();
    }
  },

  /**
   * Measure performance between marks (development only)
   */
  measure: (name: string, startMark: string, endMark: string) => {
    if (isDevelopment && performance?.measure) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      logger.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
    }
  },
};

/**
 * Environment information logger
 * Logs current environment details (development only)
 */
export function logEnvironmentInfo() {
  if (!isDevelopment) return;

  logger.log('🌍 Environment Information:');
  try {
    logger.log('  Mode:', import.meta.env.MODE);
    logger.log('  Dev:', import.meta.env.DEV);
    logger.log('  Prod:', import.meta.env.PROD);
    logger.log('  Base URL:', import.meta.env.BASE_URL);
  } catch (e) {
    logger.log('  Environment variables not available');
  }
}

/**
 * Assert condition and log error if false (always enabled)
 * Similar to console.assert but uses our logger
 */
export function assert(condition: boolean, message: string) {
  if (!condition) {
    logger.error('❌ Assertion failed:', message);
  }
}

/**
 * Export default for convenience
 */
export default logger;

// Make logger globally available as a fallback for edge cases
// This prevents "logger is not defined" errors during module loading
if (typeof window !== 'undefined') {
  (window as any).__logger = logger;
}