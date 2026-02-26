import { z } from 'zod';

/**
 * Shipping Information Form Schema
 * Validates all shipping address fields with appropriate error messages
 */
export const shippingSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(
      /^[\d\s()+-]+$/,
      'Phone number can only contain digits, spaces, parentheses, plus, and hyphen'
    ),
  
  street: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must be less than 200 characters'),
  
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),
  
  state: z
    .string()
    .min(2, 'State/Province must be at least 2 characters')
    .max(100, 'State/Province must be less than 100 characters'),
  
  zipCode: z
    .string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code must be less than 20 characters'),
  
  country: z
    .string()
    .min(2, 'Country code must be exactly 2 characters')
    .max(2, 'Country code must be exactly 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters'),
});

/**
 * Company Shipping Schema (when shipping to company address)
 * Only requires name and phone since address is pre-filled
 */
export const companyShippingSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(
      /^[\d\s()+-]+$/,
      'Phone number can only contain digits, spaces, parentheses, plus, and hyphen'
    ),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;
export type CompanyShippingFormValues = z.infer<typeof companyShippingSchema>;
