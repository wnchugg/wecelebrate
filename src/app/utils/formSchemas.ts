/**
 * Form Validation Schemas
 * Centralized validation schemas for forms across the application
 */

import type { ValidationSchema } from '../hooks/useFormUtils';

/**
 * Email validation
 */
export const emailValidation = (value: string): string | null => {
  if (!value) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Password validation
 */
export const passwordValidation = (value: string): string | null => {
  if (!value) return 'Password is required';
  
  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/[0-9]/.test(value)) {
    return 'Password must contain at least one number';
  }
  
  return null;
};

/**
 * Required field validation
 */
export const requiredValidation = (fieldName: string = 'This field') => {
  return (value: unknown): string | null => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return `${fieldName} is required`;
    }
    
    return null;
  };
};

/**
 * Min length validation
 */
export const minLengthValidation = (min: number, fieldName: string = 'This field') => {
  return (value: string): string | null => {
    if (!value) return null; // Skip if empty (use required validation separately)
    
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    
    return null;
  };
};

/**
 * Max length validation
 */
export const maxLengthValidation = (max: number, fieldName: string = 'This field') => {
  return (value: string): string | null => {
    if (!value) return null;
    
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters`;
    }
    
    return null;
  };
};

/**
 * Number range validation
 */
export const rangeValidation = (min: number, max: number, fieldName: string = 'Value') => {
  return (value: number): string | null => {
    if (value === null || value === undefined) return null;
    
    if (value < min || value > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    
    return null;
  };
};

/**
 * URL validation
 */
export const urlValidation = (value: string): string | null => {
  if (!value) return null;
  
  try {
    new URL(value);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

/**
 * Phone number validation (US format)
 */
export const phoneValidation = (value: string): string | null => {
  if (!value) return null;
  
  const phoneRegex = /^[\d\s\-()]+$/;
  if (!phoneRegex.test(value)) {
    return 'Please enter a valid phone number';
  }
  
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 10) {
    return 'Phone number must be 10 digits';
  }
  
  return null;
};

/**
 * Zip code validation (US format)
 */
export const zipCodeValidation = (value: string): string | null => {
  if (!value) return null;
  
  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!zipRegex.test(value)) {
    return 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
  }
  
  return null;
};

/**
 * Date validation
 */
export const dateValidation = (value: string): string | null => {
  if (!value) return null;
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return 'Please enter a valid date';
  }
  
  return null;
};

/**
 * Future date validation
 */
export const futureDateValidation = (value: string): string | null => {
  if (!value) return null;
  
  const dateError = dateValidation(value);
  if (dateError) return dateError;
  
  const date = new Date(value);
  const now = new Date();
  
  if (date <= now) {
    return 'Date must be in the future';
  }
  
  return null;
};

/**
 * Past date validation
 */
export const pastDateValidation = (value: string): string | null => {
  if (!value) return null;
  
  const dateError = dateValidation(value);
  if (dateError) return dateError;
  
  const date = new Date(value);
  const now = new Date();
  
  if (date >= now) {
    return 'Date must be in the past';
  }
  
  return null;
};

/**
 * Match validation (e.g., password confirmation)
 */
export const matchValidation = <T>(matchValue: T, fieldName: string = 'Fields') => {
  return (value: T): string | null => {
    if (value !== matchValue) {
      return `${fieldName} do not match`;
    }
    
    return null;
  };
};

/**
 * Login form validation schema
 */
export const loginFormSchema: ValidationSchema<{
  email: string;
  password: string;
}> = {
  email: emailValidation,
  password: requiredValidation('Password'),
};

/**
 * Signup form validation schema
 */
export const signupFormSchema: ValidationSchema<{
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}> = {
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: (value: string, formData?: { password?: string }) => {
    const passwordError = requiredValidation('Confirm password')(value);
    if (passwordError) return passwordError;
    
    return matchValidation(formData?.password, 'Passwords')(value);
  },
  firstName: requiredValidation('First name'),
  lastName: requiredValidation('Last name'),
};

/**
 * Client form validation schema
 */
export const clientFormSchema: ValidationSchema<{
  name: string;
  contactEmail: string;
  status: string;
}> = {
  name: (value: string) => {
    const required = requiredValidation('Client name')(value);
    if (required) return required;
    
    return minLengthValidation(2, 'Client name')(value);
  },
  contactEmail: emailValidation,
  status: requiredValidation('Status'),
};

/**
 * Site form validation schema
 */
export const siteFormSchema: ValidationSchema<{
  name: string;
  clientId: string;
  domain: string;
  'settings.validationMethod': string;
  'settings.giftsPerUser': number;
}> = {
  name: (value: string) => {
    const required = requiredValidation('Site name')(value);
    if (required) return required;
    
    return minLengthValidation(2, 'Site name')(value);
  },
  clientId: requiredValidation('Client'),
  domain: urlValidation,
  'settings.validationMethod': requiredValidation('Validation method'),
  'settings.giftsPerUser': (value: number) => {
    return rangeValidation(1, 100, 'Gifts per user')(value);
  },
};

/**
 * Gift form validation schema
 */
export const giftFormSchema: ValidationSchema<{
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}> = {
  name: (value: string) => {
    const required = requiredValidation('Gift name')(value);
    if (required) return required;
    
    return minLengthValidation(2, 'Gift name')(value);
  },
  description: maxLengthValidation(500, 'Description'),
  price: (value: number) => {
    const required = requiredValidation('Price')(value);
    if (required) return required;
    
    return rangeValidation(0.01, 10000, 'Price')(value);
  },
  category: requiredValidation('Category'),
  imageUrl: urlValidation,
};

/**
 * Employee form validation schema
 */
export const employeeFormSchema: ValidationSchema<{
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}> = {
  employeeId: requiredValidation('Employee ID'),
  firstName: requiredValidation('First name'),
  lastName: requiredValidation('Last name'),
  email: emailValidation,
  department: requiredValidation('Department'),
};

/**
 * Shipping address validation schema
 */
export const shippingAddressSchema: ValidationSchema<{
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}> = {
  street: requiredValidation('Street address'),
  city: requiredValidation('City'),
  state: requiredValidation('State'),
  zipCode: (value: string) => {
    const required = requiredValidation('Zip code')(value);
    if (required) return required;
    
    return zipCodeValidation(value);
  },
  country: requiredValidation('Country'),
};

/**
 * Order form validation schema
 */
export const orderFormSchema: ValidationSchema<{
  userId: string;
  siteId: string;
  items: unknown[];
  'shippingAddress.street': string;
  'shippingAddress.city': string;
  'shippingAddress.state': string;
  'shippingAddress.zipCode': string;
  'shippingAddress.country': string;
}> = {
  userId: requiredValidation('User'),
  siteId: requiredValidation('Site'),
  items: (value: unknown[]) => {
    if (!value || value.length === 0) {
      return 'At least one item is required';
    }
    return null;
  },
  'shippingAddress.street': requiredValidation('Street address'),
  'shippingAddress.city': requiredValidation('City'),
  'shippingAddress.state': requiredValidation('State'),
  'shippingAddress.zipCode': zipCodeValidation,
  'shippingAddress.country': requiredValidation('Country'),
};

/**
 * Contact form validation schema
 */
export const contactFormSchema: ValidationSchema<{
  name: string;
  email: string;
  subject: string;
  message: string;
}> = {
  name: requiredValidation('Name'),
  email: emailValidation,
  subject: requiredValidation('Subject'),
  message: (value: string) => {
    const required = requiredValidation('Message')(value);
    if (required) return required;
    
    return minLengthValidation(10, 'Message')(value);
  },
};

/**
 * Profile form validation schema
 */
export const profileFormSchema: ValidationSchema<{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
}> = {
  firstName: requiredValidation('First name'),
  lastName: requiredValidation('Last name'),
  email: emailValidation,
  phone: phoneValidation,
  bio: maxLengthValidation(500, 'Bio'),
};

/**
 * Password change validation schema
 */
export const passwordChangeSchema: ValidationSchema<{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}> = {
  currentPassword: requiredValidation('Current password'),
  newPassword: passwordValidation,
  confirmPassword: (value: string, formData?: { newPassword?: string }) => {
    const required = requiredValidation('Confirm password')(value);
    if (required) return required;
    
    return matchValidation(formData?.newPassword, 'Passwords')(value);
  },
};

/**
 * Search form validation schema
 */
export const searchFormSchema: ValidationSchema<{
  query: string;
}> = {
  query: (value: string) => {
    const required = requiredValidation('Search query')(value);
    if (required) return required;
    
    return minLengthValidation(2, 'Search query')(value);
  },
};

/**
 * Filter form validation schema
 */
export const filterFormSchema: ValidationSchema<{
  minPrice: number;
  maxPrice: number;
}> = {
  minPrice: (value: number, formData?: { maxPrice?: number }) => {
    if (value && formData?.maxPrice && value > formData.maxPrice) {
      return 'Min price must be less than max price';
    }
    return null;
  },
  maxPrice: (value: number, formData?: { minPrice?: number }) => {
    if (value && formData?.minPrice && value < formData.minPrice) {
      return 'Max price must be greater than min price';
    }
    return null;
  },
};

/**
 * Date range validation schema
 */
export const dateRangeSchema: ValidationSchema<{
  startDate: string;
  endDate: string;
}> = {
  startDate: (value: string, formData?: { endDate?: string }) => {
    const dateError = dateValidation(value);
    if (dateError) return dateError;
    
    if (formData?.endDate) {
      const start = new Date(value);
      const end = new Date(formData.endDate);
      
      if (start > end) {
        return 'Start date must be before end date';
      }
    }
    
    return null;
  },
  endDate: (value: string, formData?: { startDate?: string }) => {
    const dateError = dateValidation(value);
    if (dateError) return dateError;
    
    if (formData?.startDate) {
      const start = new Date(formData.startDate);
      const end = new Date(value);
      
      if (end < start) {
        return 'End date must be after start date';
      }
    }
    
    return null;
  },
};

/**
 * Compose multiple validators
 */
export function composeValidators<T>(
  ...validators: Array<(value: T) => string | null>
): (value: T) => string | null {
  return (value: T) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}

/**
 * Create conditional validator
 */
export function conditionalValidator<T, TFormData = Record<string, unknown>>(
  condition: (formData: TFormData) => boolean,
  validator: (value: T) => string | null
): (value: T, formData?: TFormData) => string | null {
  return (value: T, formData?: TFormData) => {
    if (formData && condition(formData)) {
      return validator(value);
    }
    return null;
  };
}

/**
 * Create async validator (for API checks)
 */
export function createAsyncValidator<T>(
  validatorFn: (value: T) => Promise<string | null>
): (value: T) => Promise<string | null> {
  return async (value: T) => {
    try {
      return await validatorFn(value);
    } catch (error) {
      return error instanceof Error ? error.message : 'Validation failed';
    }
  };
}