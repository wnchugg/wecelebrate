/**
 * Client Field Transformation Tests (Vitest)
 * Tests for client field mapping functions in helpers.ts
 * Feature: client-v2-field-audit
 */

import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import {
  mapClientFieldsToDatabase,
  mapClientFieldsFromDatabase,
} from '../helpers.ts';

describe('Client Field Transformation', () => {
  
  // ===== Property-Based Tests =====
  
  describe('Property 1: Field Transformation Round-Trip', () => {
    /**
     * Feature: client-v2-field-audit, Property 1: Field Transformation Round-Trip
     * Validates: Requirements 5.1, 5.2
     * 
     * For any client object with valid field names, transforming from frontend format
     * to database format and back to frontend format should produce an equivalent object
     * with the same field names and values.
     */
    it('should preserve field names and values through round-trip transformation', () => {
      fc.assert(
        fc.property(
          fc.record({
            // Required fields
            name: fc.string({ minLength: 2, maxLength: 100 }),
            contactEmail: fc.emailAddress(),
            status: fc.constantFrom('active', 'inactive'),
            
            // Optional fields - using fc.option for nullable fields
            clientCode: fc.option(fc.string({ maxLength: 50 })),
            clientRegion: fc.option(fc.constantFrom('US/CA', 'EMEA', 'APAC', 'LATAM', 'Global')),
            clientSourceCode: fc.option(fc.string({ maxLength: 50 })),
            clientContactName: fc.option(fc.string({ maxLength: 100 })),
            clientContactPhone: fc.option(fc.string({ maxLength: 20 })),
            clientTaxId: fc.option(fc.string({ maxLength: 50 })),
            clientAddressLine1: fc.option(fc.string({ maxLength: 200 })),
            clientAddressLine2: fc.option(fc.string({ maxLength: 200 })),
            clientAddressLine3: fc.option(fc.string({ maxLength: 200 })),
            clientCity: fc.option(fc.string({ maxLength: 100 })),
            clientPostalCode: fc.option(fc.string({ maxLength: 20 })),
            clientCountryState: fc.option(fc.string({ maxLength: 100 })),
            clientCountry: fc.option(fc.string({ maxLength: 100 })),
            clientAccountManager: fc.option(fc.string({ maxLength: 100 })),
            clientAccountManagerEmail: fc.option(fc.emailAddress()),
            clientImplementationManager: fc.option(fc.string({ maxLength: 100 })),
            clientImplementationManagerEmail: fc.option(fc.emailAddress()),
            technologyOwner: fc.option(fc.string({ maxLength: 100 })),
            technologyOwnerEmail: fc.option(fc.emailAddress()),
            clientUrl: fc.option(fc.webUrl()),
            clientAllowSessionTimeoutExtend: fc.option(fc.boolean()),
            clientAuthenticationMethod: fc.option(fc.constantFrom('SSO', 'Basic', 'OAuth')),
            clientCustomUrl: fc.option(fc.webUrl()),
            clientHasEmployeeData: fc.option(fc.boolean()),
            clientInvoiceType: fc.option(fc.string({ maxLength: 50 })),
            clientInvoiceTemplateType: fc.option(fc.string({ maxLength: 50 })),
            clientPoType: fc.option(fc.string({ maxLength: 50 })),
            clientPoNumber: fc.option(fc.string({ maxLength: 50 })),
            clientErpSystem: fc.option(fc.string({ maxLength: 50 })),
            clientSso: fc.option(fc.string({ maxLength: 50 })),
            clientHrisSystem: fc.option(fc.string({ maxLength: 50 })),
          }),
          (clientData) => {
            // Transform to database format
            const dbFormat = mapClientFieldsToDatabase(clientData);
            
            // Transform back to frontend format
            const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
            
            // All original fields should be present with same values
            expect(frontendFormat).toEqual(clientData);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Value Preservation During Transformation', () => {
    /**
     * Feature: client-v2-field-audit, Property 2: Value Preservation During Transformation
     * Validates: Requirements 5.5
     * 
     * For any client field value (string, boolean, number, null, undefined),
     * the transformation process should preserve the value without data loss or type coercion.
     */
    it('should preserve string values without modification', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (value) => {
            const input = { name: value };
            const dbFormat = mapClientFieldsToDatabase(input);
            const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
            
            expect(frontendFormat.name).toBe(value);
            expect(typeof frontendFormat.name).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve boolean values without coercion', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (value) => {
            const input = { clientAllowSessionTimeoutExtend: value };
            const dbFormat = mapClientFieldsToDatabase(input);
            const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
            
            expect(frontendFormat.clientAllowSessionTimeoutExtend).toBe(value);
            expect(typeof frontendFormat.clientAllowSessionTimeoutExtend).toBe('boolean');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve null values', () => {
      const input = { clientCode: null, clientRegion: null };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(frontendFormat.clientCode).toBeNull();
      expect(frontendFormat.clientRegion).toBeNull();
    });

    it('should handle undefined values', () => {
      const input = { name: 'Test', clientCode: undefined };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(frontendFormat.name).toBe('Test');
      expect(frontendFormat.clientCode).toBeUndefined();
    });

    it('should preserve special characters in strings', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (value) => {
            const input = { clientAddressLine1: value };
            const dbFormat = mapClientFieldsToDatabase(input);
            const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
            
            expect(frontendFormat.clientAddressLine1).toBe(value);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve empty strings', () => {
      const input = { name: '', clientCode: '' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(frontendFormat.name).toBe('');
      expect(frontendFormat.clientCode).toBe('');
    });

    it('should preserve mixed value types in a single object', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            status: fc.constantFrom('active', 'inactive'),
            clientAllowSessionTimeoutExtend: fc.boolean(),
            clientCode: fc.option(fc.string()),
            clientHasEmployeeData: fc.option(fc.boolean()),
          }),
          (input) => {
            const dbFormat = mapClientFieldsToDatabase(input);
            const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
            
            // Check each field preserves its type and value
            expect(frontendFormat.name).toBe(input.name);
            expect(typeof frontendFormat.name).toBe('string');
            
            expect(frontendFormat.status).toBe(input.status);
            expect(typeof frontendFormat.status).toBe('string');
            
            expect(frontendFormat.clientAllowSessionTimeoutExtend).toBe(input.clientAllowSessionTimeoutExtend);
            expect(typeof frontendFormat.clientAllowSessionTimeoutExtend).toBe('boolean');
            
            if (input.clientCode !== null) {
              expect(frontendFormat.clientCode).toBe(input.clientCode);
            }
            
            if (input.clientHasEmployeeData !== null) {
              expect(frontendFormat.clientHasEmployeeData).toBe(input.clientHasEmployeeData);
              expect(typeof frontendFormat.clientHasEmployeeData).toBe('boolean');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // ===== Unit Tests for Special Cases =====
  
  describe('Special Case Fields (no client_ prefix)', () => {
    /**
     * Tests for fields that don't follow the standard "client_" prefix pattern
     * Requirements: 5.3, 5.4
     */
    
    it('should map id field correctly', () => {
      const input = { id: '123e4567-e89b-12d3-a456-426614174000' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(dbFormat.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(frontendFormat.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should map name field correctly (no prefix)', () => {
      const input = { name: 'Acme Corporation' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(dbFormat.name).toBe('Acme Corporation');
      expect(frontendFormat.name).toBe('Acme Corporation');
    });

    it('should map contactEmail to contact_email', () => {
      const input = { contactEmail: 'contact@acme.com' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(dbFormat.contact_email).toBe('contact@acme.com');
      expect(frontendFormat.contactEmail).toBe('contact@acme.com');
    });

    it('should map status field correctly (no prefix)', () => {
      const input = { status: 'active' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(dbFormat.status).toBe('active');
      expect(frontendFormat.status).toBe('active');
    });

    it('should map technologyOwner to technology_owner', () => {
      const input = { technologyOwner: 'John Doe' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(dbFormat.technology_owner).toBe('John Doe');
      expect(frontendFormat.technologyOwner).toBe('John Doe');
    });

    it('should map technologyOwnerEmail to technology_owner_email', () => {
      const input = { technologyOwnerEmail: 'john@acme.com' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(dbFormat.technology_owner_email).toBe('john@acme.com');
      expect(frontendFormat.technologyOwnerEmail).toBe('john@acme.com');
    });

    it('should map createdAt to created_at', () => {
      const input = { createdAt: '2024-01-15T10:30:00Z' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(dbFormat.created_at).toBe('2024-01-15T10:30:00Z');
      expect(frontendFormat.createdAt).toBe('2024-01-15T10:30:00Z');
    });

    it('should map updatedAt to updated_at', () => {
      const input = { updatedAt: '2024-01-15T10:30:00Z' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(dbFormat.updated_at).toBe('2024-01-15T10:30:00Z');
      expect(frontendFormat.updatedAt).toBe('2024-01-15T10:30:00Z');
    });

    it('should handle all special case fields together', () => {
      const input = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Acme Corporation',
        contactEmail: 'contact@acme.com',
        status: 'active',
        technologyOwner: 'John Doe',
        technologyOwnerEmail: 'john@acme.com',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      };
      
      const dbFormat = mapClientFieldsToDatabase(input);
      
      expect(dbFormat.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(dbFormat.name).toBe('Acme Corporation');
      expect(dbFormat.contact_email).toBe('contact@acme.com');
      expect(dbFormat.status).toBe('active');
      expect(dbFormat.technology_owner).toBe('John Doe');
      expect(dbFormat.technology_owner_email).toBe('john@acme.com');
      expect(dbFormat.created_at).toBe('2024-01-15T10:30:00Z');
      expect(dbFormat.updated_at).toBe('2024-01-15T10:30:00Z');
      
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      expect(frontendFormat).toEqual(input);
    });
  });

  describe('Unknown Field Handling', () => {
    /**
     * Tests for handling unknown fields that aren't in the mapping
     * Requirements: 5.3, 5.4
     */
    
    it('should log warning for unknown fields in toDatabase', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const input = { unknownField: 'value', name: 'Test' };
      const dbFormat = mapClientFieldsToDatabase(input);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('[mapClientFieldsToDatabase] Unknown field: unknownField');
      expect(dbFormat.unknownField).toBeUndefined();
      expect(dbFormat.name).toBe('Test');
      
      consoleWarnSpy.mockRestore();
    });

    it('should silently ignore unknown fields in fromDatabase', () => {
      const input = { unknown_field: 'value', name: 'Test' };
      const frontendFormat = mapClientFieldsFromDatabase(input);
      
      expect(frontendFormat.unknownField).toBeUndefined();
      expect(frontendFormat.name).toBe('Test');
    });

    it('should handle multiple unknown fields', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const input = {
        name: 'Test',
        unknownField1: 'value1',
        unknownField2: 'value2',
        status: 'active',
      };
      const dbFormat = mapClientFieldsToDatabase(input);
      
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledWith('[mapClientFieldsToDatabase] Unknown field: unknownField1');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[mapClientFieldsToDatabase] Unknown field: unknownField2');
      expect(dbFormat.name).toBe('Test');
      expect(dbFormat.status).toBe('active');
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Standard Fields (with client_ prefix)', () => {
    /**
     * Tests for fields that follow the standard "client_" prefix pattern
     */
    
    it('should map clientCode to client_code', () => {
      const input = { clientCode: 'ACME001' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(dbFormat.client_code).toBe('ACME001');
      expect(frontendFormat.clientCode).toBe('ACME001');
    });

    it('should map clientRegion to client_region', () => {
      const input = { clientRegion: 'US/CA' };
      const dbFormat = mapClientFieldsToDatabase(input);
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      
      expect(dbFormat.client_region).toBe('US/CA');
      expect(frontendFormat.clientRegion).toBe('US/CA');
    });

    it('should map address fields correctly', () => {
      const input = {
        clientAddressLine1: '123 Main St',
        clientAddressLine2: 'Suite 100',
        clientAddressLine3: 'Building A',
        clientCity: 'San Francisco',
        clientPostalCode: '94102',
        clientCountryState: 'CA',
        clientCountry: 'USA',
      };
      
      const dbFormat = mapClientFieldsToDatabase(input);
      
      expect(dbFormat.client_address_line_1).toBe('123 Main St');
      expect(dbFormat.client_address_line_2).toBe('Suite 100');
      expect(dbFormat.client_address_line_3).toBe('Building A');
      expect(dbFormat.client_city).toBe('San Francisco');
      expect(dbFormat.client_postal_code).toBe('94102');
      expect(dbFormat.client_country_state).toBe('CA');
      expect(dbFormat.client_country).toBe('USA');
      
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      expect(frontendFormat).toEqual(input);
    });

    it('should map account management fields correctly', () => {
      const input = {
        clientAccountManager: 'Jane Smith',
        clientAccountManagerEmail: 'jane@company.com',
        clientImplementationManager: 'Bob Johnson',
        clientImplementationManagerEmail: 'bob@company.com',
      };
      
      const dbFormat = mapClientFieldsToDatabase(input);
      
      expect(dbFormat.client_account_manager).toBe('Jane Smith');
      expect(dbFormat.client_account_manager_email).toBe('jane@company.com');
      expect(dbFormat.client_implementation_manager).toBe('Bob Johnson');
      expect(dbFormat.client_implementation_manager_email).toBe('bob@company.com');
      
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      expect(frontendFormat).toEqual(input);
    });

    it('should map boolean fields correctly', () => {
      const input = {
        clientAllowSessionTimeoutExtend: true,
        clientHasEmployeeData: false,
      };
      
      const dbFormat = mapClientFieldsToDatabase(input);
      
      expect(dbFormat.client_allow_session_timeout_extend).toBe(true);
      expect(dbFormat.client_has_employee_data).toBe(false);
      
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      expect(frontendFormat).toEqual(input);
    });

    it('should map integration fields correctly', () => {
      const input = {
        clientErpSystem: 'SAP',
        clientSso: 'Okta',
        clientHrisSystem: 'Workday',
      };
      
      const dbFormat = mapClientFieldsToDatabase(input);
      
      expect(dbFormat.client_erp_system).toBe('SAP');
      expect(dbFormat.client_sso).toBe('Okta');
      expect(dbFormat.client_hris_system).toBe('Workday');
      
      const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
      expect(frontendFormat).toEqual(input);
    });
  });
});
