import { useState, useCallback, ChangeEvent } from 'react';

export interface FormFieldState {
  value: string;
  error?: string;
  touched: boolean;
}

export interface UseFormFieldReturn {
  value: string;
  error?: string;
  touched: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
  setValue: (value: string) => void;
  setError: (error: string) => void;
  reset: () => void;
}

/**
 * Custom hook for managing individual form fields
 * @param initialValue - Initial field value
 * @param validate - Optional validation function
 * @returns Field state and handlers
 */
export function useFormField(
  initialValue: string = '',
  validate?: (value: string) => string | undefined
): UseFormFieldReturn {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
      
      // Clear error when user starts typing
      if (error) {
        setError(undefined);
      }
    },
    [error]
  );

  const onBlur = useCallback(() => {
    setTouched(true);
    
    // Validate on blur if validation function provided
    if (validate) {
      const validationError = validate(value);
      setError(validationError);
    }
  }, [value, validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(undefined);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    onChange,
    onBlur,
    setValue,
    setError,
    reset,
  };
}
