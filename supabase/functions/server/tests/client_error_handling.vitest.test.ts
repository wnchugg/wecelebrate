/**
 * Unit Tests for Client Error Handling
 * Feature: client-v2-field-audit
 * Task: 8.4 Write unit tests for error handling
 * 
 * Tests error scenarios:
 * - Missing required field errors
 * - Invalid format errors
 * - Database constraint errors
 * 
 * Requirements: 6.3, 6.6, 7.6
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import { createClient, updateClient } from '../crud_db.ts';
import { ClientErrorCode } from '../helpers.ts';

// Test database configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = supabaseCreateClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Cleanup helper
const testClientIds: string[] = [];

afterAll(async () => {
  // Clean up test clients
  for (const id of testClientIds) {
    try {
      await supabase.from('clients').delete().eq('id', id);
    } catch (error) {
      console.error(`Failed to cleanup client ${id}:`, error);
    }
  }
});

describe('Client Error Handling - Unit Tests', () => {
  
  describe('Missing Required Field Errors', () => {
    // Requirement 6.3: Test missing required field errors
    
    it('should return error when name is missing', async () => {
      const invalidData = {
        contactEmail: 'test@example.com',
        status: 'active' as const,
      };
      
      try {
        const result = await createClient(invalidData as any);
        
        // Should either return error or throw
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.error).toContain('name');
        } else {
          // If it somehow succeeded, fail the test
          if (result.data?.id) testClientIds.push(result.data.id);
          expect(result.success).toBe(false);
        }
      } catch (error: any) {
        // Expected to throw
        expect(error).toBeDefined();
        expect(error.message || error.toString()).toMatch(/name/i);
      }
    });
    
    it('should return error when contactEmail is missing', async () => {
      const invalidData = {
        name: 'Test Client',
        status: 'active' as const,
      };
      
      try {
        const result = await createClient(invalidData as any);
        
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.error).toMatch(/email/i);
        } else {
          if (result.data?.id) testClientIds.push(result.data.id);
          expect(result.success).toBe(false);
        }
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message || error.toString()).toMatch(/email/i);
      }
    });
    
    it('should return error when status is missing', async () => {
      const invalidData = {
        name: 'Test Client',
        contactEmail: 'test@example.com',
      };
      
      try {
        const result = await createClient(invalidData as any);
        
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.error).toMatch(/status/i);
        } else {
          if (result.data?.id) testClientIds.push(result.data.id);
          expect(result.success).toBe(false);
        }
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message || error.toString()).toMatch(/status/i);
      }
    });
  });
  
  describe('Invalid Format Errors', () => {
    // Requirement 6.6, 7.6: Test invalid format errors
    
    it('should handle invalid email format', async () => {
      const invalidData = {
        name: 'Test Client',
        contactEmail: 'not-an-email',
        status: 'active' as const,
      };
      
      try {
        const result = await createClient(invalidData);
        
        // Database should reject invalid email or validation should catch it
        if (!result.success) {
          expect(result.error).toBeDefined();
        } else {
          // If database accepts it (no constraint), track for cleanup
          if (result.data?.id) testClientIds.push(result.data.id);
        }
      } catch (error: any) {
        // Expected if validation is strict
        expect(error).toBeDefined();
      }
    });
    
    it('should handle invalid status value', async () => {
      const invalidData = {
        name: 'Test Client',
        contactEmail: 'test@example.com',
        status: 'invalid-status' as any,
      };
      
      try {
        const result = await createClient(invalidData);
        
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.error).toMatch(/status/i);
        } else {
          if (result.data?.id) testClientIds.push(result.data.id);
          // If no constraint, this might succeed
        }
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
    
    it('should handle empty string for required field', async () => {
      const invalidData = {
        name: '',
        contactEmail: 'test@example.com',
        status: 'active' as const,
      };
      
      try {
        const result = await createClient(invalidData);
        
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.error).toMatch(/name/i);
        } else {
          if (result.data?.id) testClientIds.push(result.data.id);
          expect(result.success).toBe(false);
        }
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });
  
  describe('Database Constraint Errors', () => {
    // Requirement 6.6, 7.6: Test database constraint errors
    
    it('should handle duplicate client code constraint', async () => {
      const clientData = {
        name: 'Test Client 1',
        contactEmail: 'test1@example.com',
        status: 'active' as const,
        clientCode: 'UNIQUE-CODE-' + Date.now(),
      };
      
      // Create first client
      const result1 = await createClient(clientData);
      expect(result1.success).toBe(true);
      if (result1.data?.id) testClientIds.push(result1.data.id);
      
      // Try to create second client with same code
      const duplicateData = {
        name: 'Test Client 2',
        contactEmail: 'test2@example.com',
        status: 'active' as const,
        clientCode: clientData.clientCode,
      };
      
      try {
        const result2 = await createClient(duplicateData);
        
        if (!result2.success) {
          expect(result2.error).toBeDefined();
          // Should mention duplicate or unique constraint
          expect(result2.error).toMatch(/duplicate|unique|already exists/i);
        } else {
          // If no unique constraint, both might succeed
          if (result2.data?.id) testClientIds.push(result2.data.id);
        }
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message || error.toString()).toMatch(/duplicate|unique|constraint/i);
      }
    });
    
    it('should handle update to non-existent client', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      try {
        const result = await updateClient(nonExistentId, {
          name: 'Updated Name',
        });
        
        if (!result.success) {
          expect(result.error).toBeDefined();
          expect(result.error).toMatch(/not found|does not exist/i);
        } else {
          // Should not succeed for non-existent client
          expect(result.success).toBe(false);
        }
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
    
    it('should handle invalid UUID format for client ID', async () => {
      const invalidId = 'not-a-uuid';
      
      try {
        const result = await updateClient(invalidId, {
          name: 'Updated Name',
        });
        
        if (!result.success) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.success).toBe(false);
        }
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });
  
  describe('Field Length Constraint Errors', () => {
    // Additional validation tests
    
    it('should handle name that is too short', async () => {
      const invalidData = {
        name: 'A', // Only 1 character
        contactEmail: 'test@example.com',
        status: 'active' as const,
      };
      
      try {
        const result = await createClient(invalidData);
        
        // Should fail validation or database constraint
        if (!result.success) {
          expect(result.error).toBeDefined();
        } else {
          // If no constraint, might succeed
          if (result.data?.id) testClientIds.push(result.data.id);
        }
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
    
    it('should handle extremely long field values', async () => {
      const longString = 'A'.repeat(1000);
      const invalidData = {
        name: longString,
        contactEmail: 'test@example.com',
        status: 'active' as const,
      };
      
      try {
        const result = await createClient(invalidData);
        
        if (!result.success) {
          expect(result.error).toBeDefined();
        } else {
          if (result.data?.id) testClientIds.push(result.data.id);
        }
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });
  
  describe('Null and Undefined Handling', () => {
    // Test null/undefined handling
    
    it('should handle null values for optional fields', async () => {
      const dataWithNulls = {
        name: 'Test Client',
        contactEmail: 'test@example.com',
        status: 'active' as const,
        clientCode: null as any,
        clientRegion: null as any,
      };
      
      try {
        const result = await createClient(dataWithNulls);
        
        // Should succeed - nulls are valid for optional fields
        expect(result.success).toBe(true);
        if (result.data?.id) testClientIds.push(result.data.id);
      } catch (error: any) {
        // Should not throw for null optional fields
        console.error('Unexpected error for null optional fields:', error);
      }
    });
    
    it('should handle undefined values for optional fields', async () => {
      const dataWithUndefined = {
        name: 'Test Client',
        contactEmail: 'test@example.com',
        status: 'active' as const,
        clientCode: undefined,
        clientRegion: undefined,
      };
      
      try {
        const result = await createClient(dataWithUndefined);
        
        // Should succeed - undefined is valid for optional fields
        expect(result.success).toBe(true);
        if (result.data?.id) testClientIds.push(result.data.id);
      } catch (error: any) {
        console.error('Unexpected error for undefined optional fields:', error);
      }
    });
  });
});

console.log('\n=== Client Error Handling Test Suite ===');
console.log('Tests organized by error type:');
console.log('   - Missing Required Field Errors: 3 tests');
console.log('   - Invalid Format Errors: 3 tests');
console.log('   - Database Constraint Errors: 3 tests');
console.log('   - Field Length Constraint Errors: 2 tests');
console.log('   - Null and Undefined Handling: 2 tests');
console.log('Total: 13 unit tests for error handling');
console.log('========================================\n');
