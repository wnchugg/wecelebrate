/**
 * Form Hook Utilities
 * Provides custom hooks for form handling and validation
 */

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

/**
 * Field error type
 */
export type FieldError = string | null;

/**
 * Form errors type
 */
export type FormErrors<T> = {
  [K in keyof T]?: FieldError;
};

/**
 * Form touched fields type
 */
export type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

/**
 * Validation function type
 */
export type ValidationFunction<T> = (value: T) => FieldError;

/**
 * Form validation schema
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationFunction<T[K]>;
};

/**
 * Use form with validation
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: ValidationSchema<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateField = useCallback(
    (name: keyof T, value: any): FieldError => {
      const validator = validationSchema?.[name];
      return validator ? validator(value) : null;
    },
    [validationSchema]
  );
  
  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true;
    
    const newErrors: FormErrors<T> = {};
    let isValid = true;
    
    for (const key in validationSchema) {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  }, [validationSchema, validateField, values]);
  
  const handleChange = useCallback(
    (name: keyof T) => (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const value = event.target.value;
      
      setValues(prev => ({ ...prev, [name]: value }));
      
      // Validate field on change if it's been touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );
  
  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setTouched(prev => ({ ...prev, [name]: true }));
      
      const error = validateField(name, values[name]);
      setErrors(prev => ({ ...prev, [name]: error }));
    },
    [validateField, values]
  );
  
  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [name]: value }));
      
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );
  
  const setFieldError = useCallback(
    (name: keyof T, error: FieldError) => {
      setErrors(prev => ({ ...prev, [name]: error }));
    },
    []
  );
  
  const setFieldTouched = useCallback(
    (name: keyof T, isTouched: boolean = true) => {
      setTouched(prev => ({ ...prev, [name]: isTouched }));
    },
    []
  );
  
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => {
      return async (event: FormEvent) => {
        event.preventDefault();
        
        setIsSubmitting(true);
        
        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as FormTouched<T>
        );
        setTouched(allTouched);
        
        // Validate form
        const isValid = validateForm();
        
        if (isValid) {
          try {
            await onSubmit(values);
          } finally {
            setIsSubmitting(false);
          }
        } else {
          setIsSubmitting(false);
        }
      };
    },
    [values, validateForm]
  );
  
  const getFieldProps = useCallback(
    (name: keyof T) => ({
      name: String(name),
      value: values[name] || '',
      onChange: handleChange(name),
      onBlur: handleBlur(name),
    }),
    [values, handleChange, handleBlur]
  );
  
  const getFieldMeta = useCallback(
    (name: keyof T) => ({
      error: errors[name],
      touched: touched[name],
      invalid: Boolean(errors[name] && touched[name]),
    }),
    [errors, touched]
  );
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues,
    setErrors,
    resetForm,
    validateForm,
    getFieldProps,
    getFieldMeta,
  };
}

/**
 * Common validation rules
 */
export const validators = {
  required: (message: string = 'This field is required'): ValidationFunction<any> => {
    return (value: any) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return message;
      }
      return null;
    };
  },
  
  email: (message: string = 'Invalid email address'): ValidationFunction<string> => {
    return (value: string) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : message;
    };
  },
  
  minLength: (
    length: number,
    message?: string
  ): ValidationFunction<string> => {
    return (value: string) => {
      if (!value) return null;
      return value.length >= length
        ? null
        : message || `Must be at least ${length} characters`;
    };
  },
  
  maxLength: (
    length: number,
    message?: string
  ): ValidationFunction<string> => {
    return (value: string) => {
      if (!value) return null;
      return value.length <= length
        ? null
        : message || `Must be at most ${length} characters`;
    };
  },
  
  min: (
    min: number,
    message?: string
  ): ValidationFunction<number> => {
    return (value: number) => {
      if (value === null || value === undefined) return null;
      return value >= min
        ? null
        : message || `Must be at least ${min}`;
    };
  },
  
  max: (
    max: number,
    message?: string
  ): ValidationFunction<number> => {
    return (value: number) => {
      if (value === null || value === undefined) return null;
      return value <= max
        ? null
        : message || `Must be at most ${max}`;
    };
  },
  
  pattern: (
    pattern: RegExp,
    message: string = 'Invalid format'
  ): ValidationFunction<string> => {
    return (value: string) => {
      if (!value) return null;
      return pattern.test(value) ? null : message;
    };
  },
  
  url: (message: string = 'Invalid URL'): ValidationFunction<string> => {
    return (value: string) => {
      if (!value) return null;
      try {
        new URL(value);
        return null;
      } catch {
        return message;
      }
    };
  },
  
  phone: (message: string = 'Invalid phone number'): ValidationFunction<string> => {
    return (value: string) => {
      if (!value) return null;
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      return phoneRegex.test(value.replace(/\s/g, '')) ? null : message;
    };
  },
  
  numeric: (message: string = 'Must be a number'): ValidationFunction<string> => {
    return (value: string) => {
      if (!value) return null;
      return /^\d+$/.test(value) ? null : message;
    };
  },
  
  alphanumeric: (message: string = 'Must be alphanumeric'): ValidationFunction<string> => {
    return (value: string) => {
      if (!value) return null;
      return /^[a-zA-Z0-9]+$/.test(value) ? null : message;
    };
  },
  
  match: (
    fieldName: string,
    message?: string
  ): ValidationFunction<string> => {
    return (value: string, allValues?: any) => {
      if (!value) return null;
      const otherValue = allValues?.[fieldName];
      return value === otherValue
        ? null
        : message || `Must match ${fieldName}`;
    };
  },
  
  custom: <T>(
    validatorFn: (value: T) => boolean,
    message: string
  ): ValidationFunction<T> => {
    return (value: T) => {
      if (value === null || value === undefined) return null;
      return validatorFn(value) ? null : message;
    };
  },
};

/**
 * Compose multiple validators
 */
export function composeValidators<T>(
  ...validators: Array<ValidationFunction<T>>
): ValidationFunction<T> {
  return (value: T) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}

/**
 * Use field array (for dynamic form fields)
 */
export function useFieldArray<T>(initialValues: T[] = []) {
  const [fields, setFields] = useState<T[]>(initialValues);
  
  const append = useCallback((value: T) => {
    setFields(prev => [...prev, value]);
  }, []);
  
  const prepend = useCallback((value: T) => {
    setFields(prev => [value, ...prev]);
  }, []);
  
  const insert = useCallback((index: number, value: T) => {
    setFields(prev => [
      ...prev.slice(0, index),
      value,
      ...prev.slice(index),
    ]);
  }, []);
  
  const remove = useCallback((index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const update = useCallback((index: number, value: T) => {
    setFields(prev => prev.map((item, i) => (i === index ? value : item)));
  }, []);
  
  const move = useCallback((from: number, to: number) => {
    setFields(prev => {
      const result = [...prev];
      const [removed] = result.splice(from, 1);
      result.splice(to, 0, removed);
      return result;
    });
  }, []);
  
  const swap = useCallback((indexA: number, indexB: number) => {
    setFields(prev => {
      const result = [...prev];
      [result[indexA], result[indexB]] = [result[indexB], result[indexA]];
      return result;
    });
  }, []);
  
  const clear = useCallback(() => {
    setFields([]);
  }, []);
  
  return {
    fields,
    append,
    prepend,
    insert,
    remove,
    update,
    move,
    swap,
    clear,
    setFields,
  };
}
