/**
 * Zod Schema Validation Tests
 * Phase 4: Frontend Refactoring
 */

import { describe, it, expect } from 'vitest';
import {
  signupRequestSchema,
  loginRequestSchema,
  createClientRequestSchema,
  createSiteRequestSchema,
  createGiftRequestSchema,
  createEmployeeRequestSchema,
  shippingAddressSchema,
  emailSchema,
  passwordSchema,
  usernameSchema,
  slugSchema,
  currencySchema,
  urlSchema,
  safeParse,
} from '../app/schemas/validation.schemas';

describe('Common Schemas', () => {
  describe('emailSchema', () => {
    it('validates correct email addresses', () => {
      expect(safeParse(emailSchema, 'user@example.com').success).toBe(true);
      expect(safeParse(emailSchema, 'test+tag@domain.co.uk').success).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(safeParse(emailSchema, 'notanemail').success).toBe(false);
      expect(safeParse(emailSchema, '@example.com').success).toBe(false);
      expect(safeParse(emailSchema, '').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('validates strong passwords', () => {
      expect(safeParse(passwordSchema, 'Password123').success).toBe(true);
      expect(safeParse(passwordSchema, 'SecureP@ss99').success).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(safeParse(passwordSchema, 'short1A').success).toBe(false); // Too short
      expect(safeParse(passwordSchema, 'nouppercase1').success).toBe(false);
      expect(safeParse(passwordSchema, 'NOLOWERCASE1').success).toBe(false);
      expect(safeParse(passwordSchema, 'NoNumbers').success).toBe(false);
    });
  });

  describe('usernameSchema', () => {
    it('validates correct usernames', () => {
      expect(safeParse(usernameSchema, 'john_doe').success).toBe(true);
      expect(safeParse(usernameSchema, 'user-123').success).toBe(true);
      expect(safeParse(usernameSchema, 'Test_User').success).toBe(true);
    });

    it('rejects invalid usernames', () => {
      expect(safeParse(usernameSchema, 'ab').success).toBe(false); // Too short
      expect(safeParse(usernameSchema, 'a'.repeat(31)).success).toBe(false); // Too long
      expect(safeParse(usernameSchema, 'user@name').success).toBe(false); // Invalid chars
    });
  });

  describe('slugSchema', () => {
    it('validates correct slugs', () => {
      expect(safeParse(slugSchema, 'my-site').success).toBe(true);
      expect(safeParse(slugSchema, 'company-2024').success).toBe(true);
    });

    it('rejects invalid slugs', () => {
      expect(safeParse(slugSchema, 'My Site').success).toBe(false); // Uppercase & spaces
      expect(safeParse(slugSchema, 'site_name').success).toBe(false); // Underscores
      expect(safeParse(slugSchema, '').success).toBe(false); // Empty
    });
  });

  describe('currencySchema', () => {
    it('validates currency codes', () => {
      expect(safeParse(currencySchema, 'USD').success).toBe(true);
      expect(safeParse(currencySchema, 'EUR').success).toBe(true);
      expect(safeParse(currencySchema, 'GBP').success).toBe(true);
    });

    it('rejects invalid currency codes', () => {
      expect(safeParse(currencySchema, 'usd').success).toBe(false); // Lowercase
      expect(safeParse(currencySchema, 'US').success).toBe(false); // Too short
      expect(safeParse(currencySchema, 'USDD').success).toBe(false); // Too long
    });
  });

  describe('urlSchema', () => {
    it('validates URLs', () => {
      expect(safeParse(urlSchema, 'https://example.com').success).toBe(true);
      expect(safeParse(urlSchema, 'http://localhost:3000').success).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(safeParse(urlSchema, 'not-a-url').success).toBe(false);
      expect(safeParse(urlSchema, '').success).toBe(false);
    });
  });
});

describe('Authentication Schemas', () => {
  describe('signupRequestSchema', () => {
    it('validates correct signup data', () => {
      const result = signupRequestSchema.safeParse({
        email: 'user@example.com',
        password: 'Password123',
        username: 'johndoe',
        fullName: 'John Doe',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing fields', () => {
      const result = signupRequestSchema.safeParse({
        email: 'user@example.com',
        password: 'Password123',
        // missing username and fullName
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid data', () => {
      const result = signupRequestSchema.safeParse({
        email: 'invalid-email',
        password: 'weak',
        username: 'ab',
        fullName: 'John Doe',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginRequestSchema', () => {
    it('validates correct login data', () => {
      const result = loginRequestSchema.safeParse({
        emailOrUsername: 'user@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing fields', () => {
      const result = loginRequestSchema.safeParse({
        emailOrUsername: 'user@example.com',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Client Schemas', () => {
  describe('createClientRequestSchema', () => {
    it('validates correct client data', () => {
      const result = createClientRequestSchema.safeParse({
        name: 'Acme Corporation',
        contactEmail: 'contact@acme.com',
        status: 'active',
      });
      expect(result.success).toBe(true);
    });

    it('uses default status when not provided', () => {
      const result = createClientRequestSchema.safeParse({
        name: 'Acme Corporation',
        contactEmail: 'contact@acme.com',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('active');
      }
    });

    it('rejects invalid data', () => {
      const result = createClientRequestSchema.safeParse({
        name: 'A', // Too short
        contactEmail: 'invalid-email',
        status: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Site Schemas', () => {
  describe('createSiteRequestSchema', () => {
    it('validates correct site data', () => {
      const result = createSiteRequestSchema.safeParse({
        clientId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Holiday Event 2024',
        slug: 'holiday-2024',
        validationMethods: [
          { type: 'email', enabled: true },
          { type: 'employeeId', enabled: false },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects sites without validation methods', () => {
      const result = createSiteRequestSchema.safeParse({
        clientId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Holiday Event 2024',
        slug: 'holiday-2024',
        validationMethods: [],
      });
      expect(result.success).toBe(false);
    });

    it('validates date ordering', () => {
      const result = createSiteRequestSchema.safeParse({
        clientId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Holiday Event 2024',
        slug: 'holiday-2024',
        validationMethods: [{ type: 'email', enabled: true }],
        selectionStartDate: '2024-12-31T00:00:00Z',
        selectionEndDate: '2024-12-01T00:00:00Z', // Before start date
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Gift Schemas', () => {
  describe('createGiftRequestSchema', () => {
    it('validates correct gift data', () => {
      const result = createGiftRequestSchema.safeParse({
        name: 'Wireless Headphones',
        description: 'Premium noise-cancelling headphones',
        sku: 'WH-1000XM4',
        price: 299.99,
        currency: 'USD',
      });
      expect(result.success).toBe(true);
    });

    it('rejects negative prices', () => {
      const result = createGiftRequestSchema.safeParse({
        name: 'Gift',
        description: 'Description',
        sku: 'SKU-123',
        price: -10,
      });
      expect(result.success).toBe(false);
    });

    it('uses default currency when not provided', () => {
      const result = createGiftRequestSchema.safeParse({
        name: 'Gift',
        description: 'Description',
        sku: 'SKU-123',
        price: 50,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('USD');
      }
    });
  });
});

describe('Employee Schemas', () => {
  describe('createEmployeeRequestSchema', () => {
    it('validates correct employee data', () => {
      const result = createEmployeeRequestSchema.safeParse({
        siteId: '550e8400-e29b-41d4-a716-446655440000',
        employeeId: 'EMP-12345',
        email: 'employee@company.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.success).toBe(true);
    });

    it('allows minimal employee data', () => {
      const result = createEmployeeRequestSchema.safeParse({
        siteId: '550e8400-e29b-41d4-a716-446655440000',
        employeeId: 'EMP-12345',
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('Shipping Address Schema', () => {
  it('validates complete shipping address', () => {
    const result = shippingAddressSchema.safeParse({
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    });
    expect(result.success).toBe(true);
  });

  it('rejects incomplete address', () => {
    const result = shippingAddressSchema.safeParse({
      street: '123 Main St',
      city: 'New York',
      // missing state, postalCode, country
    });
    expect(result.success).toBe(false);
  });
});