import { useState, useCallback } from 'react';

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Custom hook for form validation
 * @param rules - Array of validation rules
 * @returns Validation function and result
 */
export function useFormValidation<T = any>(
  rules: ValidationRule<T>[]
): [(value: T) => ValidationResult, ValidationResult | null] {
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validate = useCallback(
    (value: T): ValidationResult => {
      const errors: string[] = [];

      for (const rule of rules) {
        if (!rule.validate(value)) {
          errors.push(rule.message);
        }
      }

      const validationResult: ValidationResult = {
        isValid: errors.length === 0,
        errors,
      };

      setResult(validationResult);
      return validationResult;
    },
    [rules]
  );

  return [validate, result];
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule<string> => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),

  email: (message = 'Invalid email address'): ValidationRule<string> => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length <= max,
    message: message || `Must be at most ${max} characters`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message,
  }),

  numeric: (message = 'Must be a number'): ValidationRule<string> => ({
    validate: (value) => !isNaN(Number(value)),
    message,
  }),

  url: (message = 'Invalid URL'): ValidationRule<string> => ({
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),
};
