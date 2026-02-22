/**
 * Password Strength Indicator Component
 * Shows visual feedback for password strength
 */

import { useEffect, useState } from 'react';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthBgColor } from '../../utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showErrors?: boolean;
}

export function PasswordStrengthIndicator({ password, showErrors = true }: PasswordStrengthIndicatorProps) {
  const [validation, setValidation] = useState(validatePassword(''));

  useEffect(() => {
    if (password) {
      setValidation(validatePassword(password));
    } else {
      setValidation(validatePassword(''));
    }
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Password Strength:</span>
          <span className={`font-semibold ${getPasswordStrengthColor(validation.strength)}`}>
            {validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBgColor(validation.strength)}`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
      </div>

      {/* Error messages */}
      {showErrors && validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-start gap-1">
              <span className="text-red-500 mt-0.5">•</span>
              <span>{error}</span>
            </p>
          ))}
        </div>
      )}

      {/* Success message */}
      {validation.valid && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Password meets all requirements
        </p>
      )}
    </div>
  );
}
