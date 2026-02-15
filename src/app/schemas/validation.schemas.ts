/**
 * Zod Validation Schemas for Runtime Validation
 * Phase 4: Frontend Refactoring
 *
 * Note: @ts-nocheck required due to zod 3.25.x incompatibility with moduleResolution: "bundler"
 */

import { z } from 'zod';

// Re-export commonly used Zod utility types
export type ZodError<T = any> = z.ZodError<T>;
export type ZodSchema<T = any> = z.ZodType<T>;

// ===== Common Schemas =====

export const emailSchema = z
  .string()
  .email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must not exceed 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores');

export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

export const currencySchema = z
  .string()
  .min(3, 'Currency must be at least 3 characters')
  .max(3, 'Currency must be exactly 3 characters')
  .regex(/^[A-Z]{3}$/, 'Currency must be uppercase (e.g., USD, EUR)');

export const urlSchema = z.string().url('Invalid URL format');

// Use ISO 8601 date string validation
export const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)$/,
  'Invalid ISO 8601 datetime format'
);

// ===== Authentication Schemas =====

export const signupRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
  fullName: z.string().min(1, 'Full name is required'),
});

export type SignupRequest = z.infer<typeof signupRequestSchema>;

export const loginRequestSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const sessionResponseSchema = z.object({
  authenticated: z.boolean(),
  userId: z.string().uuid().optional(),
  email: emailSchema.optional(),
  username: z.string().optional(),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;

// ===== Client Schemas =====

export const createClientRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  contactEmail: emailSchema,
  status: z.enum(['active', 'inactive']).default('active' as const),
});

export type CreateClientRequest = z.infer<typeof createClientRequestSchema>;

export const updateClientRequestSchema = createClientRequestSchema.partial();

export type UpdateClientRequest = z.infer<typeof updateClientRequestSchema>;

export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  contactEmail: z.string().email(),
  status: z.enum(['active', 'inactive']),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema,
});

export type Client = z.infer<typeof clientSchema>;

// ===== Site Schemas =====

export const validationMethodSchema = z.object({
  type: z.enum(['email', 'employeeId', 'serialCard', 'magicLink']),
  enabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
});

export type ValidationMethod = z.infer<typeof validationMethodSchema>;

export const siteBrandingSchema = z.object({
  logo: urlSchema.optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  tertiaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  customCss: z.string().optional(),
});

export type SiteBranding = z.infer<typeof siteBrandingSchema>;

const createSiteBaseSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  name: z.string().min(1, 'Name is required'),
  slug: slugSchema,
  status: z.enum(['active', 'inactive']).default('active' as const),
  validationMethods: z
    .array(validationMethodSchema)
    .min(1, 'At least one validation method is required'),
  branding: siteBrandingSchema.optional(),
  selectionStartDate: dateStringSchema.optional(),
  selectionEndDate: dateStringSchema.optional(),
});

type CreateSiteBase = z.infer<typeof createSiteBaseSchema>;

export const createSiteRequestSchema: ZodSchema<CreateSiteBase> = createSiteBaseSchema.refine(
  (data: CreateSiteBase) => {
    if (data.selectionStartDate && data.selectionEndDate) {
      return new Date(data.selectionStartDate) < new Date(data.selectionEndDate);
    }
    return true;
  },
  {
    message: 'Selection end date must be after start date',
    path: ['selectionEndDate'],
  }
) as ZodSchema<CreateSiteBase>;

export type CreateSiteRequest = z.infer<typeof createSiteBaseSchema>;

export const updateSiteRequestSchema: ZodSchema<Partial<CreateSiteBase>> = createSiteBaseSchema.partial().refine(
  (data: Partial<CreateSiteBase>) => {
    if (data.selectionStartDate && data.selectionEndDate) {
      return new Date(data.selectionStartDate) < new Date(data.selectionEndDate);
    }
    return true;
  },
  {
    message: 'Selection end date must be after start date',
    path: ['selectionEndDate'],
  }
) as ZodSchema<Partial<CreateSiteBase>>;

export type UpdateSiteRequest = Partial<CreateSiteRequest>;

export const siteSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: z.enum(['active', 'inactive']),
  validationMethods: z.array(validationMethodSchema),
  branding: siteBrandingSchema.optional(),
  selectionStartDate: dateStringSchema.optional(),
  selectionEndDate: dateStringSchema.optional(),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema,
});

export type Site = z.infer<typeof siteSchema>;

// ===== Gift Schemas =====

export const createGiftRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: currencySchema.default('USD' as const),
  imageUrl: urlSchema.optional(),
  category: z.string().optional(),
  availableQuantity: z.number().int().min(0, 'Quantity must be non-negative').optional(),
  status: z.enum(['active', 'inactive']).default('active' as const),
});

export type CreateGiftRequest = z.infer<typeof createGiftRequestSchema>;

export const updateGiftRequestSchema = createGiftRequestSchema.partial();

export type UpdateGiftRequest = z.infer<typeof updateGiftRequestSchema>;

export const giftSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  sku: z.string(),
  price: z.number(),
  currency: z.string(),
  imageUrl: z.string().url().optional(),
  category: z.string().optional(),
  availableQuantity: z.number().optional(),
  status: z.enum(['active', 'inactive']),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema,
});

export type Gift = z.infer<typeof giftSchema>;

// ===== Employee Schemas =====

export const createEmployeeRequestSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: emailSchema.optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  serialCardNumber: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active' as const),
});

export type CreateEmployeeRequest = z.infer<typeof createEmployeeRequestSchema>;

export const updateEmployeeRequestSchema = createEmployeeRequestSchema.omit({ siteId: true }).partial();

export type UpdateEmployeeRequest = z.infer<typeof updateEmployeeRequestSchema>;

export const employeeSchema = z.object({
  id: z.string().uuid(),
  siteId: z.string().uuid(),
  employeeId: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  serialCardNumber: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema,
});

export type Employee = z.infer<typeof employeeSchema>;

export const bulkImportEmployeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: emailSchema.optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  serialCardNumber: z.string().optional(),
});

export type BulkImportEmployee = z.infer<typeof bulkImportEmployeeSchema>;

export const bulkImportRequestSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  employees: z.array(bulkImportEmployeeSchema).min(1, 'At least one employee is required'),
  overwriteExisting: z.boolean().default(false),
});

export type BulkImportRequest = z.infer<typeof bulkImportRequestSchema>;

// ===== Order Schemas =====

export const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

export const createOrderRequestSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  employeeId: z.string().uuid('Invalid employee ID').optional(),
  giftId: z.string().uuid('Invalid gift ID'),
  shippingAddress: shippingAddressSchema,
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const updateOrderRequestSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  trackingNumber: z.string().optional(),
});

export type UpdateOrderRequest = z.infer<typeof updateOrderRequestSchema>;

export const orderSchema = z.object({
  id: z.string().uuid(),
  siteId: z.string().uuid(),
  employeeId: z.string().uuid().optional(),
  giftId: z.string().uuid(),
  shippingAddress: shippingAddressSchema,
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().optional(),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema,
});

export type Order = z.infer<typeof orderSchema>;

// ===== Access Validation Schemas =====

export const validateAccessRequestSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  method: z.enum(['email', 'employeeId', 'serialCard', 'magicLink']),
  value: z.string().min(1, 'Validation value is required'),
});

export type ValidateAccessRequest = z.infer<typeof validateAccessRequestSchema>;

export const magicLinkRequestSchema = z.object({
  siteId: z.string().uuid('Invalid site ID'),
  email: emailSchema,
});

export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>;

// ===== Pagination Schema =====

export const paginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

// ===== Helper Functions =====

/**
 * Safely parse data with a Zod schema
 */
export function safeParse<T>(schema: ZodSchema<T>, data: unknown) {
  return schema.safeParse(data);
}

/**
 * Validate data with a Zod schema and throw on error
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Get validation errors in a user-friendly format
 */
export function getValidationErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }
  
  return errors;
}

/**
 * Get first validation error message
 */
export function getFirstError(error: ZodError): string {
  return error.issues[0]?.message ?? 'Validation error';
}