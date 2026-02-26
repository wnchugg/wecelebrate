/**
 * Secure Form Component
 * Form with built-in CSRF protection and rate limiting
 * Phase 2.4: Security Hardening
 */

import React, { FormEvent, useState } from 'react';
import { useCsrfToken } from '../hooks/useCsrfToken';
import { useFormRateLimit } from '../hooks/useRateLimit';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface SecureFormProps {
  formName: string;
  onSubmit: (e: FormEvent<HTMLFormElement>, csrfToken: string) => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  showRateLimitWarning?: boolean;
}

export function SecureForm({
  formName,
  onSubmit,
  children,
  className = '',
  showRateLimitWarning = true
}: SecureFormProps) {
  const { token: csrfToken } = useCsrfToken();
  const { isAllowed, remainingAttempts, checkLimit } = useFormRateLimit(formName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check rate limit
    if (!checkLimit()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(e, csrfToken);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className={className}>
      {/* Hidden CSRF Token Field */}
      <input type="hidden" name="_csrf" value={csrfToken} />

      {/* Rate Limit Warning */}
      {showRateLimitWarning && remainingAttempts <= 3 && remainingAttempts > 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <strong>Warning:</strong> You have {remainingAttempts} submission{remainingAttempts !== 1 ? 's' : ''} remaining before being temporarily blocked.
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className={isSubmitting ? 'opacity-60 pointer-events-none' : ''}>
        {children}
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#D91C81]" />
            <span className="font-medium text-gray-700">Submitting...</span>
          </div>
        </div>
      )}
    </form>
  );
}

/**
 * Secure Input Field with validation feedback
 */
interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function SecureInput({
  label,
  error,
  helperText,
  required,
  className = '',
  ...props
}: SecureInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        {...props}
        required={required}
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91C81] transition-all ${
          error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 focus:border-[#D91C81]'
        } ${className}`}
      />
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Secure Textarea Field
 */
interface SecureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function SecureTextarea({
  label,
  error,
  helperText,
  required,
  className = '',
  ...props
}: SecureTextareaProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        {...props}
        required={required}
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91C81] transition-all resize-none ${
          error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 focus:border-[#D91C81]'
        } ${className}`}
      />
      
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Secure Submit Button
 */
interface SecureSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function SecureSubmitButton({
  loading,
  children,
  className = '',
  disabled,
  ...props
}: SecureSubmitButtonProps) {
  return (
    <button
      {...props}
      type="submit"
      disabled={disabled || loading}
      className={`w-full px-6 py-3 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}