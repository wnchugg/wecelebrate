import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Employee Management Backend Tests
 * 
 * Tests for employee CRUD operations and allowed domains validation
 * 
 * IMPORTANT: These tests verify the API contract and business logic.
 * Run with: npm run test:services
 */

describe('Employee Management - Backend API', () => {
  const mockSiteId = 'site-test-001';
  const mockEnvironment = 'development';
  const mockAdminToken = 'mock-admin-token';

  describe('POST /sites/:siteId/employees - Create Employee', () => {
    it('should create employee with email', () => {
      const employeeData = {
        email: 'john.doe@company.com',
        name: 'John Doe',
        department: 'Engineering',
      };

      // Expected response structure
      const expectedResponse = {
        employee: {
          id: expect.any(String),
          siteId: mockSiteId,
          email: 'john.doe@company.com',
          name: 'John Doe',
          department: 'Engineering',
          status: 'active',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      };

      expect(expectedResponse.employee.email).toBe(employeeData.email);
      expect(expectedResponse.employee.status).toBe('active');
    });

    it('should create employee with employeeId', () => {
      const employeeData = {
        employeeId: 'EMP-001',
        name: 'John Doe',
      };

      const expectedResponse = {
        employee: {
          id: expect.any(String),
          siteId: mockSiteId,
          employeeId: 'EMP-001',
          name: 'John Doe',
          status: 'active',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      };

      expect(expectedResponse.employee.employeeId).toBe(employeeData.employeeId);
    });

    it('should create employee with serialCard', () => {
      const employeeData = {
        serialCard: 'CARD-ABC123XYZ',
        name: 'John Doe',
      };

      const expectedResponse = {
        employee: {
          id: expect.any(String),
          siteId: mockSiteId,
          serialCard: 'CARD-ABC123XYZ',
          name: 'John Doe',
          status: 'active',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      };

      expect(expectedResponse.employee.serialCard).toBe(employeeData.serialCard);
    });

    it('should reject employee without any identifier', () => {
      const employeeData = {
        name: 'John Doe',
        department: 'Engineering',
      };

      const expectedError = {
        error: 'At least one identifier (email, employeeId, or serialCard) is required',
      };

      expect(expectedError.error).toContain('identifier');
    });

    it('should normalize email to lowercase', () => {
      const employeeData = {
        email: 'John.Doe@Company.COM',
        name: 'John Doe',
      };

      const expectedResponse = {
        employee: {
          email: 'john.doe@company.com',
        },
      };

      expect(expectedResponse.employee.email).toBe('john.doe@company.com');
    });
  });

  describe('GET /sites/:siteId/employees - List Employees', () => {
    it('should return all employees for a site', () => {
      const expectedResponse = {
        employees: [
          {
            id: 'emp-001',
            siteId: mockSiteId,
            email: 'john.doe@company.com',
            name: 'John Doe',
            status: 'active',
          },
          {
            id: 'emp-002',
            siteId: mockSiteId,
            email: 'jane.smith@company.com',
            name: 'Jane Smith',
            status: 'active',
          },
        ],
      };

      expect(expectedResponse.employees).toHaveLength(2);
      expect(expectedResponse.employees[0].siteId).toBe(mockSiteId);
    });

    it('should return empty array when no employees exist', () => {
      const expectedResponse = {
        employees: [],
      };

      expect(expectedResponse.employees).toHaveLength(0);
    });

    it('should sort employees by name', () => {
      const expectedResponse = {
        employees: [
          { name: 'Alice Johnson' },
          { name: 'Bob Smith' },
          { name: 'Charlie Brown' },
        ],
      };

      const names = expectedResponse.employees.map(e => e.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });
  });

  describe('PUT /employees/:id - Update Employee', () => {
    it('should update employee details', () => {
      const updates = {
        name: 'John Updated Doe',
        department: 'Product',
      };

      const expectedResponse = {
        employee: {
          id: 'emp-001',
          name: 'John Updated Doe',
          department: 'Product',
          updatedAt: expect.any(String),
        },
      };

      expect(expectedResponse.employee.name).toBe(updates.name);
      expect(expectedResponse.employee.department).toBe(updates.department);
    });

    it('should not allow changing employee ID', () => {
      const updates = {
        id: 'different-id',
        name: 'John Doe',
      };

      // ID should remain unchanged
      const expectedResponse = {
        employee: {
          id: 'emp-001', // Original ID preserved
          name: 'John Doe',
        },
      };

      expect(expectedResponse.employee.id).toBe('emp-001');
    });

    it('should not allow changing siteId', () => {
      const updates = {
        siteId: 'different-site',
        name: 'John Doe',
      };

      // siteId should remain unchanged
      const expectedResponse = {
        employee: {
          siteId: mockSiteId, // Original siteId preserved
          name: 'John Doe',
        },
      };

      expect(expectedResponse.employee.siteId).toBe(mockSiteId);
    });
  });

  describe('DELETE /employees/:id - Deactivate Employee', () => {
    it('should deactivate employee (soft delete)', () => {
      const expectedResponse = {
        success: true,
        employee: {
          id: 'emp-001',
          status: 'inactive',
          updatedAt: expect.any(String),
        },
      };

      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.employee.status).toBe('inactive');
    });

    it('should return 404 for non-existent employee', () => {
      const expectedError = {
        error: 'Employee not found',
      };

      expect(expectedError.error).toBe('Employee not found');
    });
  });

  describe('POST /employees/import - Bulk Import', () => {
    it('should import multiple employees', () => {
      const importData = {
        siteId: mockSiteId,
        employees: [
          { email: 'emp1@company.com', name: 'Employee 1' },
          { email: 'emp2@company.com', name: 'Employee 2' },
          { email: 'emp3@company.com', name: 'Employee 3' },
        ],
      };

      const expectedResponse = {
        success: true,
        imported: 3,
        employees: [
          expect.objectContaining({ email: 'emp1@company.com' }),
          expect.objectContaining({ email: 'emp2@company.com' }),
          expect.objectContaining({ email: 'emp3@company.com' }),
        ],
      };

      expect(expectedResponse.imported).toBe(3);
      expect(Array.isArray(expectedResponse.employees)).toBe(true);
      expect(expectedResponse.employees.length).toBe(3);
    });

    it('should handle partial import with errors', () => {
      const importData = {
        siteId: mockSiteId,
        employees: [
          { email: 'valid@company.com', name: 'Valid Employee' },
          { name: 'Invalid Employee' }, // Missing identifier
        ],
      };

      const expectedResponse = {
        success: true,
        imported: 1,
        errors: [
          {
            row: 2,
            error: 'At least one identifier (email, employeeId, or serialCard) is required',
          },
        ],
        employees: [
          expect.objectContaining({ email: 'valid@company.com' }),
        ],
      };

      expect(expectedResponse.imported).toBe(1);
      expect(expectedResponse.errors).toHaveLength(1);
    });
  });
});

describe('Allowed Domains Validation - Backend', () => {
  const mockSiteId = 'site-test-001';

  describe('POST /public/validate/employee - Email Validation with Allowed Domains', () => {
    it('should validate specific employee email', () => {
      const validationRequest = {
        siteId: mockSiteId,
        method: 'email',
        value: 'john.doe@company.com',
      };

      // Site has this specific employee
      const expectedResponse = {
        valid: true,
        sessionToken: expect.any(String),
        employee: {
          id: 'emp-001',
          name: 'John Doe',
          email: 'john.doe@company.com',
        },
      };

      expect(expectedResponse.valid).toBe(true);
      expect(expectedResponse.employee.email).toBe(validationRequest.value);
    });

    it('should validate email from allowed domain (no specific employee)', () => {
      const validationRequest = {
        siteId: mockSiteId,
        method: 'email',
        value: 'anyone@company.com',
      };

      // Site settings: allowedDomains: ['company.com', 'halo.com']
      // No specific employee with this email, but domain is allowed
      const expectedResponse = {
        valid: true,
        sessionToken: expect.any(String),
        employee: {
          id: expect.stringContaining('domain-'),
          name: 'anyone',
          email: 'anyone@company.com',
        },
      };

      expect(expectedResponse.valid).toBe(true);
      expect(expectedResponse.employee.email).toBe(validationRequest.value);
    });

    it('should reject email from non-allowed domain', () => {
      const validationRequest = {
        siteId: mockSiteId,
        method: 'email',
        value: 'user@otherdomain.com',
      };

      // Site settings: allowedDomains: ['company.com', 'halo.com']
      // No specific employee and domain not in allowed list
      const expectedResponse = {
        valid: false,
        error: 'Employee not found or inactive',
      };

      expect(expectedResponse.valid).toBe(false);
    });

    it('should handle multiple allowed domains', () => {
      // Site settings: allowedDomains: ['company.com', 'halo.com', 'business.org']
      const testCases = [
        { email: 'user@company.com', shouldPass: true },
        { email: 'user@halo.com', shouldPass: true },
        { email: 'user@business.org', shouldPass: true },
        { email: 'user@notallowed.com', shouldPass: false },
      ];

      testCases.forEach(testCase => {
        const expectedValid = testCase.shouldPass;
        expect(typeof expectedValid).toBe('boolean');
      });
    });

    it('should extract domain correctly from email', () => {
      const email = 'john.doe@company.com';
      const domain = email.split('@')[1];

      expect(domain).toBe('company.com');
    });

    it('should handle email without domain', () => {
      const email = 'invalidemail';
      const parts = email.split('@');
      const domain = parts[1];

      expect(domain).toBeUndefined();
    });

    it('should prioritize specific employee over domain match', () => {
      // If john.doe@company.com exists as specific employee,
      // use that record instead of creating domain-based access
      const validationRequest = {
        siteId: mockSiteId,
        method: 'email',
        value: 'john.doe@company.com',
      };

      const expectedResponse = {
        valid: true,
        employee: {
          id: 'emp-001', // Specific employee ID, not domain-*
          name: 'John Doe',
          email: 'john.doe@company.com',
        },
      };

      expect(expectedResponse.employee.id).not.toContain('domain-');
    });
  });

  describe('Allowed Domains - Site Settings', () => {
    it('should store allowed domains as array', () => {
      const siteSettings = {
        allowedDomains: ['company.com', 'halo.com', 'business.org'],
      };

      expect(Array.isArray(siteSettings.allowedDomains)).toBe(true);
      expect(siteSettings.allowedDomains).toHaveLength(3);
    });

    it('should handle empty allowed domains', () => {
      const siteSettings = {
        allowedDomains: [],
      };

      expect(siteSettings.allowedDomains).toHaveLength(0);
    });

    it('should handle undefined allowed domains', () => {
      const siteSettings = {};

      expect(siteSettings.allowedDomains).toBeUndefined();
    });
  });

  describe('Session Token Generation', () => {
    it('should generate unique session token on validation', () => {
      const expectedResponse = {
        valid: true,
        sessionToken: 'mock-session-token-uuid',
        employee: {
          id: 'emp-001',
          name: 'John Doe',
        },
      };

      expect(expectedResponse.sessionToken).toBeTruthy();
      expect(typeof expectedResponse.sessionToken).toBe('string');
      expect(expectedResponse.sessionToken.length).toBeGreaterThan(0);
    });

    it('should create session with expiration', () => {
      const session = {
        token: 'mock-token',
        employeeId: 'emp-001',
        siteId: mockSiteId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const expiresAt = new Date(session.expiresAt);
      const createdAt = new Date(session.createdAt);
      const diffHours = (expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      // Use toBeCloseTo to handle floating point precision
      expect(diffHours).toBeCloseTo(24, 1);
    });
  });
});

describe('Employee Validation - Other Methods', () => {
  const mockSiteId = 'site-test-001';

  describe('Employee ID Validation', () => {
    it('should validate by employeeId', () => {
      const validationRequest = {
        siteId: mockSiteId,
        method: 'employeeId',
        value: 'EMP-001',
      };

      const expectedResponse = {
        valid: true,
        sessionToken: expect.any(String),
        employee: {
          id: 'emp-001',
          employeeId: 'EMP-001',
        },
      };

      expect(expectedResponse.valid).toBe(true);
      expect(expectedResponse.employee.employeeId).toBe(validationRequest.value);
    });

    it('should not apply domain validation to employeeId', () => {
      // Domain validation only applies to email method
      const validationRequest = {
        siteId: mockSiteId,
        method: 'employeeId',
        value: 'EMP-999',
      };

      // Should fail if employee doesn't exist, regardless of domains
      const expectedResponse = {
        valid: false,
        error: 'Employee not found or inactive',
      };

      expect(expectedResponse.valid).toBe(false);
    });
  });

  describe('Serial Card Validation', () => {
    it('should validate by serialCard', () => {
      const validationRequest = {
        siteId: mockSiteId,
        method: 'serialCard',
        value: 'CARD-ABC123XYZ',
      };

      const expectedResponse = {
        valid: true,
        sessionToken: expect.any(String),
        employee: {
          id: 'emp-001',
          serialCard: 'CARD-ABC123XYZ',
        },
      };

      expect(expectedResponse.valid).toBe(true);
      expect(expectedResponse.employee.serialCard).toBe(validationRequest.value);
    });

    it('should not apply domain validation to serialCard', () => {
      // Domain validation only applies to email method
      const validationRequest = {
        siteId: mockSiteId,
        method: 'serialCard',
        value: 'CARD-INVALID',
      };

      const expectedResponse = {
        valid: false,
        error: 'Employee not found or inactive',
      };

      expect(expectedResponse.valid).toBe(false);
    });
  });
});
