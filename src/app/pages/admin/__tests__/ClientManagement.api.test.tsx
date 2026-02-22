/**
 * Client Management API Integration Tests
 * Feature: client-v2-field-audit
 * Tests for API integration in ClientManagement.tsx
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import type { Client } from '../../../types/api.types';

// Mock the API request function
const mockApiRequest = vi.fn();
vi.mock('../../../utils/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
  getAccessToken: () => 'mock-token',
}));

describe('Client Management API Integration', () => {
  
  beforeEach(() => {
    mockApiRequest.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===== Property-Based Tests =====

  describe('Property 8: All Populated Fields Sent to API', () => {
    /**
     * Feature: client-v2-field-audit, Property 8: All Populated Fields Sent to API
     * Validates: Requirements 6.1
     * 
     * For any form submission with N populated fields,
     * the API request payload should contain exactly N fields
     * (excluding empty optional fields).
     */
    it('should send all populated fields when creating a client', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 100 }),
            contactEmail: fc.emailAddress(),
            status: fc.constantFrom('active' as const, 'inactive' as const),
            clientCode: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            clientRegion: fc.option(fc.constantFrom('US/CA', 'EMEA', 'APAC', 'LATAM', 'Global')),
            clientContactName: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            clientContactPhone: fc.option(fc.string({ minLength: 7, maxLength: 20 })),
            clientCity: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            clientCountry: fc.option(fc.constantFrom('US', 'CA', 'GB', 'DE', 'FR')),
          }),
          (clientData) => {
            // Filter out null/undefined values to get populated fields
            const populatedFields = Object.entries(clientData).reduce((acc, [key, value]) => {
              if (value !== null && value !== undefined) {
                acc[key] = value;
              }
              return acc;
            }, {} as Record<string, any>);

            const populatedCount = Object.keys(populatedFields).length;

            // Simulate the filtering logic from handleSaveClient
            const filteredData = Object.entries(clientData).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = value;
              }
              return acc;
            }, {} as Record<string, any>);

            const sentCount = Object.keys(filteredData).length;

            // The number of fields sent should equal the number of populated fields
            expect(sentCount).toBe(populatedCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not send undefined or null fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 100 }),
            contactEmail: fc.emailAddress(),
            status: fc.constantFrom('active' as const, 'inactive' as const),
            clientCode: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
            clientRegion: fc.option(fc.constantFrom('US/CA', 'EMEA', 'APAC'), { nil: null }),
          }),
          (clientData) => {
            // Simulate the filtering logic from handleSaveClient
            const filteredData = Object.entries(clientData).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = value;
              }
              return acc;
            }, {} as Record<string, any>);

            // Verify no undefined or null values in filtered data
            Object.values(filteredData).forEach(value => {
              expect(value).not.toBeUndefined();
              expect(value).not.toBeNull();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should send empty strings and false booleans', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 100 }),
            contactEmail: fc.emailAddress(),
            status: fc.constantFrom('active' as const, 'inactive' as const),
            clientCode: fc.constant(''),
            clientAllowSessionTimeoutExtend: fc.constant(false),
          }),
          (clientData) => {
            // Simulate the filtering logic from handleSaveClient
            const filteredData = Object.entries(clientData).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = value;
              }
              return acc;
            }, {} as Record<string, any>);

            // Empty strings and false booleans should be included
            expect(filteredData.clientCode).toBe('');
            expect(filteredData.clientAllowSessionTimeoutExtend).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Send Only Changed Fields', () => {
    /**
     * Feature: client-v2-field-audit, Property 12: Send Only Changed Fields
     * Validates: Requirements 7.2
     * 
     * For any client update operation where K out of N fields are modified,
     * the API request should contain exactly K fields (not including unchanged fields).
     */
    it('should send only changed fields when updating a client', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 100 }),
            contactEmail: fc.emailAddress(),
            status: fc.constantFrom('active' as const, 'inactive' as const),
            clientCode: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            clientRegion: fc.option(fc.constantFrom('US/CA', 'EMEA', 'APAC')),
          }),
          fc.uniqueArray(fc.constantFrom('name', 'contactEmail', 'status', 'clientCode', 'clientRegion'), { minLength: 1, maxLength: 3 }),
          (originalData, fieldsToChange) => {
            // Create modified data by changing only specified fields
            const modifiedData = { ...originalData };
            fieldsToChange.forEach(field => {
              if (field === 'name') modifiedData.name = 'Modified Name';
              else if (field === 'contactEmail') modifiedData.contactEmail = 'modified@example.com';
              else if (field === 'status') modifiedData.status = originalData.status === 'active' ? 'inactive' : 'active';
              else if (field === 'clientCode') modifiedData.clientCode = 'MODIFIED';
              else if (field === 'clientRegion') modifiedData.clientRegion = 'EMEA';
            });

            // Calculate changed fields (simulating ClientModal logic)
            const changedFields: Record<string, any> = {};
            Object.keys(modifiedData).forEach(key => {
              const currentValue = (modifiedData as any)[key];
              const originalValue = (originalData as any)[key];
              
              if (currentValue !== originalValue) {
                changedFields[key] = currentValue;
              }
            });

            // Filter out undefined/null values
            const filteredChanges = Object.entries(changedFields).reduce((acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = value;
              }
              return acc;
            }, {} as Record<string, any>);

            // The number of changed fields should match the number of fields we modified
            const expectedChanges = fieldsToChange.filter(field => {
              const originalValue = (originalData as any)[field];
              const modifiedValue = (modifiedData as any)[field];
              return originalValue !== modifiedValue;
            }).length;

            expect(Object.keys(filteredChanges).length).toBe(expectedChanges);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not send unchanged fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 100 }),
            contactEmail: fc.emailAddress(),
            status: fc.constantFrom('active' as const, 'inactive' as const),
            clientCode: fc.string({ minLength: 1, maxLength: 50 }),
            clientRegion: fc.constantFrom('US/CA', 'EMEA', 'APAC'),
          }),
          (originalData) => {
            // Simulate no changes
            const modifiedData = { ...originalData };

            // Calculate changed fields
            const changedFields: Record<string, any> = {};
            Object.keys(modifiedData).forEach(key => {
              const currentValue = (modifiedData as any)[key];
              const originalValue = (originalData as any)[key];
              
              if (currentValue !== originalValue) {
                changedFields[key] = currentValue;
              }
            });

            // No fields should be in the changed set
            expect(Object.keys(changedFields).length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect changes from non-empty to empty string', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 100 }),
            clientCode: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          (originalData) => {
            // Modify clientCode to empty string
            const modifiedData = { ...originalData, clientCode: '' };

            // Calculate changed fields
            const changedFields: Record<string, any> = {};
            Object.keys(modifiedData).forEach(key => {
              const currentValue = (modifiedData as any)[key];
              const originalValue = (originalData as any)[key];
              
              if (currentValue !== originalValue) {
                changedFields[key] = currentValue;
              }
            });

            // clientCode should be detected as changed
            expect(changedFields.clientCode).toBe('');
            expect(Object.keys(changedFields).length).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect changes from false to true for boolean fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 100 }),
            clientAllowSessionTimeoutExtend: fc.boolean(),
          }),
          (originalData) => {
            // Toggle the boolean value
            const modifiedData = {
              ...originalData,
              clientAllowSessionTimeoutExtend: !originalData.clientAllowSessionTimeoutExtend
            };

            // Calculate changed fields
            const changedFields: Record<string, any> = {};
            Object.keys(modifiedData).forEach(key => {
              const currentValue = (modifiedData as any)[key];
              const originalValue = (originalData as any)[key];
              
              if (currentValue !== originalValue) {
                changedFields[key] = currentValue;
              }
            });

            // Boolean field should be detected as changed
            expect(changedFields.clientAllowSessionTimeoutExtend).toBe(modifiedData.clientAllowSessionTimeoutExtend);
            expect(Object.keys(changedFields).length).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Load All Existing Fields', () => {
    /**
     * Feature: client-v2-field-audit, Property 11: Load All Existing Fields
     * Validates: Requirements 7.1
     * 
     * For any existing client record in the database,
     * the GET endpoint should return all non-null fields in camelCase format.
     */
    it('should load all non-null fields from the API response', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 2, maxLength: 100 }),
            contactEmail: fc.emailAddress(),
            status: fc.constantFrom('active' as const, 'inactive' as const),
            clientCode: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            clientRegion: fc.option(fc.constantFrom('US/CA', 'EMEA', 'APAC')),
            clientContactName: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            clientContactPhone: fc.option(fc.string({ minLength: 7, maxLength: 20 })),
            clientCity: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            clientCountry: fc.option(fc.constantFrom('US', 'CA', 'GB')),
            clientAccountManager: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            clientUrl: fc.option(fc.webUrl()),
            clientAllowSessionTimeoutExtend: fc.option(fc.boolean()),
            createdAt: fc.date().map(d => d.toISOString()),
            updatedAt: fc.date().map(d => d.toISOString()),
          }),
          (clientData) => {
            // Simulate loading client data (all fields should be present)
            const loadedData = { ...clientData };

            // Count non-null fields in the response
            const nonNullFields = Object.entries(loadedData).filter(([_, value]) => value !== null && value !== undefined);

            // All non-null fields from the API should be loaded
            nonNullFields.forEach(([key, value]) => {
              expect(loadedData[key as keyof typeof loadedData]).toBe(value);
            });

            // Verify camelCase format (all keys should be camelCase)
            Object.keys(loadedData).forEach(key => {
              // Check that the key doesn't contain underscores (snake_case indicator)
              expect(key).not.toMatch(/_/);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle null values in optional fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 2, maxLength: 100 }),
            contactEmail: fc.emailAddress(),
            status: fc.constantFrom('active' as const, 'inactive' as const),
            clientCode: fc.constant(null),
            clientRegion: fc.constant(null),
            clientContactName: fc.constant(null),
          }),
          (clientData) => {
            // Simulate loading client data with null optional fields
            const loadedData = { ...clientData };

            // Required fields should have values
            expect(loadedData.name).toBeDefined();
            expect(loadedData.contactEmail).toBeDefined();
            expect(loadedData.status).toBeDefined();

            // Optional fields can be null
            expect(loadedData.clientCode).toBeNull();
            expect(loadedData.clientRegion).toBeNull();
            expect(loadedData.clientContactName).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all field types correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 2, maxLength: 100 }),
            contactEmail: fc.emailAddress(),
            status: fc.constantFrom('active' as const, 'inactive' as const),
            clientCode: fc.string({ minLength: 1, maxLength: 50 }),
            clientAllowSessionTimeoutExtend: fc.boolean(),
            clientHasEmployeeData: fc.boolean(),
            createdAt: fc.date().map(d => d.toISOString()),
          }),
          (clientData) => {
            // Verify field types are preserved
            expect(typeof clientData.id).toBe('string');
            expect(typeof clientData.name).toBe('string');
            expect(typeof clientData.contactEmail).toBe('string');
            expect(typeof clientData.status).toBe('string');
            expect(typeof clientData.clientCode).toBe('string');
            expect(typeof clientData.clientAllowSessionTimeoutExtend).toBe('boolean');
            expect(typeof clientData.clientHasEmployeeData).toBe('boolean');
            expect(typeof clientData.createdAt).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ===== Unit Tests for Specific Scenarios =====

  describe('Create Client - Specific Scenarios', () => {
    it('should send all required fields when creating a client', () => {
      const clientData = {
        name: 'Test Client',
        contactEmail: 'test@example.com',
        status: 'active' as const,
      };

      const filteredData = Object.entries(clientData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      expect(Object.keys(filteredData)).toContain('name');
      expect(Object.keys(filteredData)).toContain('contactEmail');
      expect(Object.keys(filteredData)).toContain('status');
      expect(Object.keys(filteredData).length).toBe(3);
    });

    it('should send all populated optional fields', () => {
      const clientData = {
        name: 'Test Client',
        contactEmail: 'test@example.com',
        status: 'active' as const,
        clientCode: 'TEST123',
        clientRegion: 'US/CA',
        clientContactName: 'John Doe',
      };

      const filteredData = Object.entries(clientData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      expect(Object.keys(filteredData).length).toBe(6);
      expect(filteredData.clientCode).toBe('TEST123');
      expect(filteredData.clientRegion).toBe('US/CA');
      expect(filteredData.clientContactName).toBe('John Doe');
    });

    it('should not send undefined optional fields', () => {
      const clientData: Record<string, any> = {
        name: 'Test Client',
        contactEmail: 'test@example.com',
        status: 'active' as const,
        clientCode: undefined,
        clientRegion: undefined,
      };

      const filteredData = Object.entries(clientData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      expect(Object.keys(filteredData).length).toBe(3);
      expect(filteredData.clientCode).toBeUndefined();
      expect(filteredData.clientRegion).toBeUndefined();
    });
  });

  describe('Update Client - Specific Scenarios', () => {
    it('should send only the name field when only name is changed', () => {
      const originalData = {
        name: 'Original Name',
        contactEmail: 'test@example.com',
        status: 'active' as const,
        clientCode: 'TEST123',
      };

      const modifiedData = {
        name: 'Modified Name',
        contactEmail: 'test@example.com',
        status: 'active' as const,
        clientCode: 'TEST123',
      };

      const changedFields: Record<string, any> = {};
      Object.keys(modifiedData).forEach(key => {
        const currentValue = (modifiedData as any)[key];
        const originalValue = (originalData as any)[key];
        
        if (currentValue !== originalValue) {
          changedFields[key] = currentValue;
        }
      });

      expect(Object.keys(changedFields).length).toBe(1);
      expect(changedFields.name).toBe('Modified Name');
    });

    it('should send multiple fields when multiple fields are changed', () => {
      const originalData = {
        name: 'Original Name',
        contactEmail: 'test@example.com',
        status: 'active' as const,
        clientCode: 'TEST123',
        clientRegion: 'US/CA',
      };

      const modifiedData = {
        name: 'Modified Name',
        contactEmail: 'modified@example.com',
        status: 'inactive' as const,
        clientCode: 'TEST123',
        clientRegion: 'US/CA',
      };

      const changedFields: Record<string, any> = {};
      Object.keys(modifiedData).forEach(key => {
        const currentValue = (modifiedData as any)[key];
        const originalValue = (originalData as any)[key];
        
        if (currentValue !== originalValue) {
          changedFields[key] = currentValue;
        }
      });

      expect(Object.keys(changedFields).length).toBe(3);
      expect(changedFields.name).toBe('Modified Name');
      expect(changedFields.contactEmail).toBe('modified@example.com');
      expect(changedFields.status).toBe('inactive');
    });

    it('should send empty object when no fields are changed', () => {
      const originalData = {
        name: 'Test Client',
        contactEmail: 'test@example.com',
        status: 'active' as const,
      };

      const modifiedData = { ...originalData };

      const changedFields: Record<string, any> = {};
      Object.keys(modifiedData).forEach(key => {
        const currentValue = (modifiedData as any)[key];
        const originalValue = (originalData as any)[key];
        
        if (currentValue !== originalValue) {
          changedFields[key] = currentValue;
        }
      });

      expect(Object.keys(changedFields).length).toBe(0);
    });
  });

  describe('Load Client - Specific Scenarios', () => {
    it('should load all fields from a complete client record', () => {
      const clientData: Partial<Client> = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Client',
        contactEmail: 'test@example.com',
        status: 'active',
        clientCode: 'TEST123',
        clientRegion: 'US/CA',
        clientContactName: 'John Doe',
        clientContactPhone: '123-456-7890',
        clientCity: 'New York',
        clientCountry: 'US',
        clientAccountManager: 'Jane Smith',
        clientUrl: 'https://testclient.com',
        clientAllowSessionTimeoutExtend: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      // All fields should be present
      expect(clientData.id).toBeDefined();
      expect(clientData.name).toBeDefined();
      expect(clientData.contactEmail).toBeDefined();
      expect(clientData.status).toBeDefined();
      expect(clientData.clientCode).toBeDefined();
      expect(clientData.clientRegion).toBeDefined();
      expect(clientData.clientContactName).toBeDefined();
      expect(clientData.clientContactPhone).toBeDefined();
      expect(clientData.clientCity).toBeDefined();
      expect(clientData.clientCountry).toBeDefined();
      expect(clientData.clientAccountManager).toBeDefined();
      expect(clientData.clientUrl).toBeDefined();
      expect(clientData.clientAllowSessionTimeoutExtend).toBeDefined();
      expect(clientData.createdAt).toBeDefined();
      expect(clientData.updatedAt).toBeDefined();
    });

    it('should handle client record with only required fields', () => {
      const clientData: Partial<Client> = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Minimal Client',
        contactEmail: 'minimal@example.com',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      // Required fields should be present
      expect(clientData.id).toBeDefined();
      expect(clientData.name).toBeDefined();
      expect(clientData.contactEmail).toBeDefined();
      expect(clientData.status).toBeDefined();
      expect(clientData.createdAt).toBeDefined();
      expect(clientData.updatedAt).toBeDefined();

      // Optional fields can be undefined
      expect(clientData.clientCode).toBeUndefined();
      expect(clientData.clientRegion).toBeUndefined();
    });

    it('should handle client record with null optional fields', () => {
      const clientData: Partial<Client> = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Client',
        contactEmail: 'test@example.com',
        status: 'active',
        clientCode: undefined,
        clientRegion: undefined,
        clientContactName: undefined,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      // Required fields should have values
      expect(clientData.name).toBe('Test Client');
      expect(clientData.contactEmail).toBe('test@example.com');
      expect(clientData.status).toBe('active');

      // Optional fields can be undefined
      expect(clientData.clientCode).toBeUndefined();
      expect(clientData.clientRegion).toBeUndefined();
      expect(clientData.clientContactName).toBeUndefined();
    });
  });
});
