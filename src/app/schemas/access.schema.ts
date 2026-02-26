import { z } from 'zod';

/**
 * Email Access Validation Schema
 * Validates email format for email-based access
 */
export const emailAccessSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
});

/**
 * Employee ID Access Validation Schema
 * Validates employee ID format
 */
export const employeeIdAccessSchema = z.object({
  employeeId: z
    .string()
    .min(1, 'Employee ID is required')
    .max(50, 'Employee ID must be less than 50 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Employee ID can only contain letters, numbers, hyphens, and underscores'),
});

/**
 * Serial Card Access Validation Schema
 * Validates serial card code format
 */
export const serialCardAccessSchema = z.object({
  serialCard: z
    .string()
    .min(1, 'Serial card code is required')
    .min(8, 'Serial card code must be at least 8 characters')
    .max(50, 'Serial card code must be less than 50 characters')
    .regex(/^[A-Z0-9-]+$/, 'Serial card code can only contain uppercase letters, numbers, and hyphens'),
});

// Export types
export type EmailAccessFormValues = z.infer<typeof emailAccessSchema>;
export type EmployeeIdAccessFormValues = z.infer<typeof employeeIdAccessSchema>;
export type SerialCardAccessFormValues = z.infer<typeof serialCardAccessSchema>;

// Union type for all access validation forms
export type AccessFormValues = EmailAccessFormValues | EmployeeIdAccessFormValues | SerialCardAccessFormValues;
