import { AlertCircle, AlertTriangle, Info, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  dismissible?: boolean;
  className?: string;
}

const variantStyles = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-700',
    button: 'bg-red-600 hover:bg-red-700 text-white',
    Icon: XCircle,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: 'text-amber-600',
    title: 'text-amber-900',
    message: 'text-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    Icon: AlertTriangle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    Icon: Info,
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-900',
    icon: 'text-green-600',
    title: 'text-green-900',
    message: 'text-green-700',
    button: 'bg-green-600 hover:bg-green-700 text-white',
    Icon: CheckCircle,
  },
};

/**
 * Inline Alert Component
 * Displays errors, warnings, info, and success messages inline
 */
export function Alert({
  variant = 'error',
  title,
  message,
  action,
  onClose,
  dismissible = true,
  className = '',
}: AlertProps) {
  const styles = variantStyles[variant];
  const Icon = styles.Icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`border rounded-xl p-4 ${styles.container} ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <Icon className={`w-5 h-5 ${styles.icon}`} aria-hidden="true" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`text-sm font-semibold mb-1 ${styles.title}`}>
                {title}
              </h3>
            )}
            <p className={`text-sm ${styles.message}`}>{message}</p>

            {/* Action Button */}
            {action && (
              <button
                onClick={action.onClick}
                className={`mt-3 inline-flex items-center gap-2 px-4 py-2 ${styles.button} rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent`}
              >
                {action.label}
              </button>
            )}
          </div>

          {/* Close Button */}
          {dismissible && onClose && (
            <button
              onClick={onClose}
              className={`flex-shrink-0 ${styles.icon} hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 rounded`}
              aria-label="Dismiss"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Form Field Error Component
 * Displays validation errors for individual form fields
 */
export interface FieldErrorProps {
  error?: string;
  touched?: boolean;
  className?: string;
}

export function FieldError({ error, touched, className = '' }: FieldErrorProps) {
  if (!error || !touched) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 mt-1.5 ${className}`}
      role="alert"
    >
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
      <p className="text-sm text-red-600">{error}</p>
    </motion.div>
  );
}

/**
 * Loading Error Component
 * Shows error state for failed data loading with retry option
 */
export interface LoadingErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function LoadingError({
  title = 'Failed to Load Data',
  message = 'Something went wrong while loading this content. Please try again.',
  onRetry,
  className = '',
}: LoadingErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-[#D91C81] text-white rounded-xl hover:bg-[#B71569] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}

/**
 * Empty State Error Component
 * Shows when no data is available (not technically an error, but useful)
 */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
      {icon ? (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Info className="w-8 h-8 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-gray-600 text-center max-w-md mb-6">{message}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-[#D91C81] text-white rounded-xl hover:bg-[#B71569] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Network Error Component
 * Specialized component for network/connection errors
 */
export interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className = '' }: NetworkErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-10 h-10 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connection Problem
      </h3>
      <p className="text-sm text-gray-600 text-center max-w-md mb-6">
        We're having trouble connecting to our servers. Please check your
        internet connection and try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-[#D91C81] text-white rounded-xl hover:bg-[#B71569] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:ring-offset-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
