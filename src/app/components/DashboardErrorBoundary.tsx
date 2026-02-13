/**
 * Dashboard Error Boundary
 * 
 * Catches and handles errors in the Dashboard component tree
 * Provides graceful error recovery and reporting
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error Boundary for Dashboard Component
 * 
 * Features:
 * - Catches JavaScript errors in child components
 * - Logs error details to console
 * - Provides user-friendly error UI
 * - Allows error recovery with reset
 * - Tracks error count to prevent infinite loops
 * 
 * Usage:
 * ```tsx
 * <DashboardErrorBoundary>
 *   <Dashboard />
 * </DashboardErrorBoundary>
 * ```
 */
export class DashboardErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('[DashboardErrorBoundary] Caught error:', error);
    console.error('[DashboardErrorBoundary] Error info:', errorInfo);
    console.error('[DashboardErrorBoundary] Component stack:', errorInfo.componentStack);

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to analytics/monitoring service (if available)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Send error to monitoring service (Sentry, LogRocket, etc.)
    // For now, just log to console with structured format
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorCount: this.state.errorCount + 1,
    };

    console.error('[DashboardErrorBoundary] Error Report:', JSON.stringify(errorReport, null, 2));

    // TODO: Send to actual monitoring service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetError = () => {
    console.log('[DashboardErrorBoundary] Resetting error state');
    
    // Check if we've hit too many errors (prevent infinite loop)
    if (this.state.errorCount >= 5) {
      console.error('[DashboardErrorBoundary] Too many errors, not resetting');
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.resetError);
      }

      // Too many errors - show critical error state
      if (errorCount >= 5) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
              <div className="bg-white rounded-lg border-2 border-red-500 p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Critical Error
                </h1>
                <p className="text-gray-600 mb-6">
                  Multiple errors detected. Please refresh the page or contact support.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Reload Page
                  </button>
                  <Link
                    to="/admin"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Home className="w-5 h-5" />
                    Go to Admin Home
                  </Link>
                </div>
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    Technical Details
                  </summary>
                  <div className="mt-3 p-3 bg-gray-50 rounded text-xs font-mono text-gray-600 max-h-48 overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Error Count:</strong> {errorCount}
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap">{error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>
          </div>
        );
      }

      // Default error UI with recovery option
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-8">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Something Went Wrong
                </h1>
                <p className="text-gray-600 mb-6">
                  The dashboard encountered an unexpected error. You can try refreshing or go back to the admin home.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <button
                    onClick={this.resetError}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B71569] transition-colors font-medium"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </button>
                  <Link
                    to="/admin"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <Home className="w-5 h-5" />
                    Admin Home
                  </Link>
                </div>

                <details className="text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 mb-2">
                    View Error Details
                  </summary>
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-3">
                      <strong className="text-sm text-gray-700">Error Message:</strong>
                      <p className="text-sm text-red-600 mt-1">{error.message}</p>
                    </div>
                    {error.stack && (
                      <div className="mb-3">
                        <strong className="text-sm text-gray-700">Stack Trace:</strong>
                        <pre className="text-xs text-gray-600 mt-1 p-2 bg-white rounded border border-gray-200 overflow-auto max-h-40">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo && (
                      <div>
                        <strong className="text-sm text-gray-700">Component Stack:</strong>
                        <pre className="text-xs text-gray-600 mt-1 p-2 bg-white rounded border border-gray-200 overflow-auto max-h-40">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>

                <p className="text-xs text-gray-500 mt-4">
                  Error #{errorCount} • {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook-based helper for error boundary
 * Allows functional components to trigger error boundary
 */
export const useDashboardErrorHandler = () => {
  const throwError = (error: Error) => {
    throw error;
  };

  return { throwError };
};
