import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { 
  createRoutesFromChildren, 
  matchRoutes, 
  useLocation, 
  useNavigationType 
} from 'react-router';

// Initialize Sentry
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  // Note: BrowserTracing and Replay integrations may need to be imported from separate packages
  // in newer versions of @sentry/react. For now, initialize with basic config.
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_ENVIRONMENT || 'production',
    
    // Performance Monitoring - Using integrations available in current @sentry/react version
    integrations: [
      // BrowserTracing and Replay need to be imported separately in v8+
      // Install @sentry/browser and import from there if needed
      // new Sentry.BrowserTracing({...}),
      // new Sentry.Replay({...}),
    ],
    
    // Performance traces sample rate
    tracesSampleRate: 0.1,
    
    // Session Replay sample rate
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'development',
    
    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Random plugins/extensions
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      // Other
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
    
    // Filter out unwanted breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Don't log console messages
      if (breadcrumb.category === 'console') {
        return null;
      }
      return breadcrumb;
    },
    
    // Add custom context
    beforeSend(event, hint) {
      // Add user context if available
      const userContext = localStorage.getItem('user');
      if (userContext) {
        try {
          const user = JSON.parse(userContext);
          event.user = {
            id: user.id,
            email: user.email,
          };
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      return event;
    },
  });
}

export { Sentry };

// Error boundary for top-level errors
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Custom error logging
export function logError(error: Error, context?: Record<string, any>) {
  if (import.meta.env.DEV) {
    console.error('Error:', error, context);
  } else {
    Sentry.captureException(error, {
      contexts: { custom: context },
    });
  }
}

// Custom performance tracking
export function trackPerformance(name: string, duration: number) {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: name,
      level: 'info',
      data: { duration },
    });
  }
}

// User tracking
export function identifyUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

// Clear user on logout
export function clearUser() {
  Sentry.setUser(null);
}

// Custom context
export function setContext(key: string, value: any) {
  Sentry.setContext(key, value);
}

// Add breadcrumb
export function addBreadcrumb(message: string, category?: string, data?: any) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    data,
    level: 'info',
  });
}

// Capture message
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}