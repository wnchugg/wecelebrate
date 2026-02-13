/**
 * Request Validation Utilities
 * Phase 3: Backend Refactoring
 */

import type { Context } from 'npm:hono@4.0.2';
import type {
  SignupRequest,
  LoginRequest,
  CreateClientRequest,
  CreateSiteRequest,
  CreateGiftRequest,
  CreateEmployeeRequest,
  CreateOrderRequest,
  ValidateAccessRequest,
} from './types.ts';

// ===== Validation Helpers =====

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidSlug(slug: string): boolean {
  // Lowercase letters, numbers, hyphens only
  return /^[a-z0-9-]+$/.test(slug);
}

export function isValidCurrency(currency: string): boolean {
  // ISO 4217 currency codes (3 uppercase letters)
  return /^[A-Z]{3}$/.test(currency);
}

// ===== Validation Error Response =====

export function validationError(c: Context, field: string, message: string) {
  return c.json({
    error: 'Validation Error',
    field,
    message,
  }, 400);
}

// ===== Request Validators =====

export function validateSignupRequest(
  data: any
): { valid: boolean; error?: string; field?: string } {
  if (!data.email || typeof data.email !== 'string') {
    return { valid: false, error: 'Email is required', field: 'email' };
  }

  if (!isValidEmail(data.email)) {
    return { valid: false, error: 'Invalid email format', field: 'email' };
  }

  if (!data.password || typeof data.password !== 'string') {
    return { valid: false, error: 'Password is required', field: 'password' };
  }

  if (!isValidPassword(data.password)) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      field: 'password',
    };
  }

  if (!data.username || typeof data.username !== 'string') {
    return { valid: false, error: 'Username is required', field: 'username' };
  }

  if (data.username.length < 3 || data.username.length > 30) {
    return {
      valid: false,
      error: 'Username must be 3-30 characters',
      field: 'username',
    };
  }

  if (!data.fullName || typeof data.fullName !== 'string') {
    return { valid: false, error: 'Full name is required', field: 'fullName' };
  }

  return { valid: true };
}

export function validateLoginRequest(
  data: any
): { valid: boolean; error?: string; field?: string } {
  if (!data.emailOrUsername || typeof data.emailOrUsername !== 'string') {
    return {
      valid: false,
      error: 'Email or username is required',
      field: 'emailOrUsername',
    };
  }

  if (!data.password || typeof data.password !== 'string') {
    return { valid: false, error: 'Password is required', field: 'password' };
  }

  return { valid: true };
}

export function validateCreateClientRequest(
  data: any
): { valid: boolean; error?: string; field?: string } {
  if (!data.name || typeof data.name !== 'string') {
    return { valid: false, error: 'Name is required', field: 'name' };
  }

  if (data.name.length < 2 || data.name.length > 100) {
    return { valid: false, error: 'Name must be 2-100 characters', field: 'name' };
  }

  if (!data.contactEmail || typeof data.contactEmail !== 'string') {
    return {
      valid: false,
      error: 'Contact email is required',
      field: 'contactEmail',
    };
  }

  if (!isValidEmail(data.contactEmail)) {
    return {
      valid: false,
      error: 'Invalid contact email format',
      field: 'contactEmail',
    };
  }

  if (data.status && !['active', 'inactive'].includes(data.status)) {
    return {
      valid: false,
      error: 'Status must be active or inactive',
      field: 'status',
    };
  }

  return { valid: true };
}

export function validateCreateSiteRequest(
  data: any
): { valid: boolean; error?: string; field?: string } {
  if (!data.clientId || typeof data.clientId !== 'string') {
    return { valid: false, error: 'Client ID is required', field: 'clientId' };
  }

  if (!data.name || typeof data.name !== 'string') {
    return { valid: false, error: 'Name is required', field: 'name' };
  }

  if (!data.slug || typeof data.slug !== 'string') {
    return { valid: false, error: 'Slug is required', field: 'slug' };
  }

  if (!isValidSlug(data.slug)) {
    return {
      valid: false,
      error: 'Slug must contain only lowercase letters, numbers, and hyphens',
      field: 'slug',
    };
  }

  if (!data.validationMethods || !Array.isArray(data.validationMethods)) {
    return {
      valid: false,
      error: 'Validation methods must be an array',
      field: 'validationMethods',
    };
  }

  if (data.validationMethods.length === 0) {
    return {
      valid: false,
      error: 'At least one validation method is required',
      field: 'validationMethods',
    };
  }

  // Validate each validation method
  const validTypes = ['email', 'employeeId', 'serialCard', 'magicLink'];
  for (const method of data.validationMethods) {
    if (!method.type || !validTypes.includes(method.type)) {
      return {
        valid: false,
        error: `Invalid validation method type: ${method.type}`,
        field: 'validationMethods',
      };
    }
    if (typeof method.enabled !== 'boolean') {
      return {
        valid: false,
        error: 'Validation method enabled must be boolean',
        field: 'validationMethods',
      };
    }
  }

  return { valid: true };
}

export function validateCreateGiftRequest(
  data: any
): { valid: boolean; error?: string; field?: string } {
  if (!data.name || typeof data.name !== 'string') {
    return { valid: false, error: 'Name is required', field: 'name' };
  }

  if (!data.description || typeof data.description !== 'string') {
    return { valid: false, error: 'Description is required', field: 'description' };
  }

  if (!data.sku || typeof data.sku !== 'string') {
    return { valid: false, error: 'SKU is required', field: 'sku' };
  }

  if (typeof data.price !== 'number' || data.price < 0) {
    return {
      valid: false,
      error: 'Price must be a positive number',
      field: 'price',
    };
  }

  if (data.currency && !isValidCurrency(data.currency)) {
    return {
      valid: false,
      error: 'Currency must be a valid ISO 4217 code (e.g., USD, EUR)',
      field: 'currency',
    };
  }

  if (data.imageUrl && !isValidUrl(data.imageUrl)) {
    return {
      valid: false,
      error: 'Image URL must be a valid URL',
      field: 'imageUrl',
    };
  }

  if (
    data.availableQuantity !== undefined &&
    (typeof data.availableQuantity !== 'number' || data.availableQuantity < 0)
  ) {
    return {
      valid: false,
      error: 'Available quantity must be a non-negative number',
      field: 'availableQuantity',
    };
  }

  return { valid: true };
}

export function validateCreateEmployeeRequest(
  data: any
): { valid: boolean; error?: string; field?: string } {
  if (!data.siteId || typeof data.siteId !== 'string') {
    return { valid: false, error: 'Site ID is required', field: 'siteId' };
  }

  if (!data.employeeId || typeof data.employeeId !== 'string') {
    return { valid: false, error: 'Employee ID is required', field: 'employeeId' };
  }

  if (data.email && !isValidEmail(data.email)) {
    return { valid: false, error: 'Invalid email format', field: 'email' };
  }

  return { valid: true };
}

export function validateCreateOrderRequest(
  data: any
): { valid: boolean; error?: string; field?: string } {
  if (!data.siteId || typeof data.siteId !== 'string') {
    return { valid: false, error: 'Site ID is required', field: 'siteId' };
  }

  if (!data.giftId || typeof data.giftId !== 'string') {
    return { valid: false, error: 'Gift ID is required', field: 'giftId' };
  }

  if (!data.shippingAddress || typeof data.shippingAddress !== 'object') {
    return {
      valid: false,
      error: 'Shipping address is required',
      field: 'shippingAddress',
    };
  }

  const addr = data.shippingAddress;
  const requiredFields = ['street', 'city', 'state', 'postalCode', 'country'];
  for (const field of requiredFields) {
    if (!addr[field] || typeof addr[field] !== 'string') {
      return {
        valid: false,
        error: `Shipping address ${field} is required`,
        field: `shippingAddress.${field}`,
      };
    }
  }

  return { valid: true };
}

export function validateAccessRequest(
  data: any
): { valid: boolean; error?: string; field?: string } {
  if (!data.siteId || typeof data.siteId !== 'string') {
    return { valid: false, error: 'Site ID is required', field: 'siteId' };
  }

  const validMethods = ['email', 'employeeId', 'serialCard', 'magicLink'];
  if (!data.method || !validMethods.includes(data.method)) {
    return {
      valid: false,
      error: 'Invalid validation method',
      field: 'method',
    };
  }

  if (!data.value || typeof data.value !== 'string') {
    return { valid: false, error: 'Validation value is required', field: 'value' };
  }

  // Method-specific validation
  if (data.method === 'email' && !isValidEmail(data.value)) {
    return { valid: false, error: 'Invalid email format', field: 'value' };
  }

  return { valid: true };
}
