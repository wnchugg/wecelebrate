// Centralized logging utility for the wecelebrate platform

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  userId?: string;
  action?: string;
  resource?: string;
  service?: string;
  url?: string;
  siteId?: string;
  stats?: any;
  count?: number;
  config?: any;
  metadata?: Record<string, any>;
  [key: string]: any; // Allow any additional properties
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // In development, log everything
    if (this.isDevelopment) {
      return true;
    }

    // In production, only log warnings and errors
    if (this.isProduction) {
      return level === LogLevel.WARN || level === LogLevel.ERROR;
    }

    return true;
  }

  private sendToServer(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.isProduction) return;

    // Send logs to server in production
    const logData = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Use navigator.sendBeacon for fire-and-forget logging
    const blob = new Blob([JSON.stringify(logData)], { type: 'application/json' });
    navigator.sendBeacon('/api/logs', blob);
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    console.warn(this.formatMessage(LogLevel.DEBUG, message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    console.warn(this.formatMessage(LogLevel.INFO, message, context));
    this.sendToServer(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    console.warn(this.formatMessage(LogLevel.WARN, message, context));
    this.sendToServer(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const errorContext = {
      ...context,
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
    };

    console.error(this.formatMessage(LogLevel.ERROR, message, errorContext), error);
    this.sendToServer(LogLevel.ERROR, message, errorContext);
  }

  // Specialized logging methods

  apiRequest(method: string, url: string, context?: LogContext): void {
    this.debug(`API Request: ${method} ${url}`, {
      ...context,
      action: 'api_request',
      resource: url,
    });
  }

  apiResponse(method: string, url: string, status: number, duration: number, context?: LogContext): void {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.DEBUG;
    const message = `API Response: ${method} ${url} - ${status} (${duration}ms)`;
    
    if (level === LogLevel.WARN) {
      this.warn(message, {
        ...context,
        action: 'api_response',
        resource: url,
        metadata: { status, duration },
      });
    } else {
      this.debug(message, {
        ...context,
        action: 'api_response',
        resource: url,
        metadata: { status, duration },
      });
    }
  }

  apiError(method: string, url: string, error: Error, context?: LogContext): void {
    this.error(`API Error: ${method} ${url}`, error, {
      ...context,
      action: 'api_error',
      resource: url,
    });
  }

  userAction(action: string, resource?: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      ...context,
      action,
      resource,
    });
  }

  authEvent(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth Event: ${event}`, {
      ...context,
      userId,
      action: 'auth',
      resource: event,
    });
  }

  performanceMetric(metric: string, value: number, context?: LogContext): void {
    this.debug(`Performance: ${metric} = ${value}ms`, {
      ...context,
      action: 'performance',
      metadata: { metric, value },
    });
  }

  // Measure and log execution time
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      
      this.performanceMetric(name, duration, context);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.error(`${name} failed after ${duration}ms`, error as Error, context);
      throw error;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const {
  debug,
  info,
  warn,
  error,
  apiRequest,
  apiResponse,
  apiError,
  userAction,
  authEvent,
  performanceMetric,
  measure,
} = logger;
