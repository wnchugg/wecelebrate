import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

export interface ErrorBoundaryProps {
  children?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Class-based error boundary that doesn't rely on router context
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportIssue = () => {
    const { error, errorInfo } = this.state;
    const errorMessage = error?.message || 'Unknown error';
    const errorDetails = errorInfo?.componentStack || error?.stack || '';
    
    const subject = encodeURIComponent(`Error Report: ${errorMessage.substring(0, 50)}`);
    const body = encodeURIComponent(`
Error Message: ${errorMessage}

Details:
${errorDetails}

Browser: ${navigator.userAgent}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `);
    window.open(`mailto:support@wecelebrate.com?subject=${subject}&body=${body}`, '_blank');
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const error = this.state.error;
    const errorMessage = error?.message || 'An unexpected error occurred';
    const errorDetails = this.state.errorInfo?.componentStack || error?.stack || '';
    
    // Check if it's a dynamic import error
    const isModuleError = errorMessage.includes('Failed to fetch dynamically imported module');
    let modulePath = '';
    
    if (isModuleError) {
      const match = errorMessage.match(/https?:\/\/[^\s]+/);
      if (match) {
        modulePath = match[0];
        // Extract just the file name
        const pathMatch = modulePath.match(/\/([^/]+\.tsx)/);
        if (pathMatch) {
          modulePath = pathMatch[1];
        }
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Error Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
                  <p className="text-red-50 text-sm mt-1">
                    {isModuleError 
                      ? "We're having trouble loading this page" 
                      : "The application encountered an unexpected error"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* User-Friendly Message */}
              {isModuleError ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <Bug className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Module Loading Error</h3>
                      <p className="text-sm text-blue-800 mb-3">
                        The page you're trying to access couldn't be loaded. This usually happens when:
                      </p>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside ml-2">
                        <li>The application was recently updated</li>
                        <li>Your browser cache is outdated</li>
                        <li>There's a temporary network issue</li>
                      </ul>
                      {modulePath && (
                        <p className="text-xs text-blue-700 mt-3 font-mono bg-white border border-blue-200 rounded px-3 py-2">
                          Failed to load: {modulePath}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-2">Error Details</h3>
                      <p className="text-sm text-amber-800 break-words">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm">Try these solutions:</h3>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <Button
                    onClick={this.handleReload}
                    className="bg-[#D91C81] hover:bg-[#B01669] text-white w-full flex items-center justify-center gap-2 h-12"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Reload Page
                  </Button>

                  <Button
                    onClick={this.handleGoBack}
                    variant="outline"
                    className="border-2 border-gray-300 hover:bg-gray-50 w-full flex items-center justify-center gap-2 h-12"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Go Back
                  </Button>

                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="border-2 border-gray-300 hover:bg-gray-50 w-full flex items-center justify-center gap-2 h-12"
                  >
                    <Home className="w-5 h-5" />
                    Go to Home
                  </Button>

                  <Button
                    onClick={this.handleReportIssue}
                    variant="outline"
                    className="border-2 border-gray-300 hover:bg-gray-50 w-full flex items-center justify-center gap-2 h-12"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Report Issue
                  </Button>
                </div>
              </div>

              {/* Additional Tips */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Still having issues?</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-[#D91C81] font-bold">1.</span>
                    <p>Try clearing your browser cache and refreshing the page</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#D91C81] font-bold">2.</span>
                    <p>Make sure you're using the latest version of your browser</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#D91C81] font-bold">3.</span>
                    <p>If the problem persists, contact support with the error details below</p>
                  </div>
                </div>
              </div>

              {/* Technical Details (Collapsible) */}
              {errorDetails && (
                <details className="bg-gray-900 text-gray-100 rounded-xl overflow-hidden">
                  <summary className="cursor-pointer p-4 hover:bg-gray-800 transition-colors font-mono text-sm font-semibold">
                    🔧 Technical Details (for developers)
                  </summary>
                  <div className="p-4 border-t border-gray-700">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap break-words max-h-64">
                      {errorDetails}
                    </pre>
                  </div>
                </details>
              )}

              {/* Admin Tools Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <a
                  href="/admin/developer-tools"
                  className="text-sm text-[#D91C81] hover:text-[#B01669] font-medium inline-flex items-center gap-2"
                >
                  <Bug className="w-4 h-4" />
                  Developer Tools & Diagnostics
                </a>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-gray-600">
              wecelebrate Platform • Corporate Gifting & Recognition
            </p>
            <p className="text-xs text-gray-500">
              Error ID: {Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;