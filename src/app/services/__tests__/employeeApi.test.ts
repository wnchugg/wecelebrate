import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees,
  type Employee,
  type CreateEmployeeData,
} from '../employeeApi';

// Mock getAccessToken
vi.mock('../../lib/apiClient', () => ({
  getAccessToken: vi.fn(() => 'mock-token-123'),
}));

// Mock getCurrentEnvironment
vi.mock('../../config/deploymentEnvironments', () => ({
  getCurrentEnvironment: vi.fn(() => ({
    id: 'test-env',
    supabaseUrl: 'https://test-project.supabase.co',
  })),
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Employee API Service', () => {
  const mockSiteId = 'site-001';
  const mockEmployee: Employee = {
    id: 'emp-001',
    siteId: mockSiteId,
    email: 'john.doe@company.com',
    employeeId: 'EMP-001',
    serialCard: 'CARD-ABC123',
    name: 'John Doe',
    department: 'Engineering',
    status: 'active',
    createdAt: '2026-02-13T10:00:00.000Z',
    updatedAt: '2026-02-13T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getEmployees', () => {
    it('should fetch all employees for a site', async () => {
      const mockEmployees = [mockEmployee];
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockEmployees }),
      } as Response);

      const result = await getEmployees(mockSiteId);

      expect(result).toEqual(mockEmployees);
    });

    it('should return empty array when no employees exist', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response);

      const result = await getEmployees(mockSiteId);

      expect(result).toEqual([]);
    });
  });

  describe('getEmployee', () => {
    it('should fetch a single employee by ID', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockEmployee }),
      } as Response);

      const result = await getEmployee('emp-001', mockSiteId);

      expect(result).toEqual(mockEmployee);
    });
  });

  describe('createEmployee', () => {
    it('should create employee with email', async () => {
      const newEmployeeData: CreateEmployeeData = {
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        department: 'Marketing',
      };
      const createdEmployee = { ...mockEmployee, ...newEmployeeData, id: 'emp-002' };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: createdEmployee }),
      } as Response);

      const result = await createEmployee(mockSiteId, newEmployeeData);

      expect(result.email).toBe(newEmployeeData.email);
    });

    it('should create employee with employeeId', async () => {
      const newEmployeeData: CreateEmployeeData = {
        employeeId: 'EMP-002',
        name: 'Jane Smith',
      };
      const createdEmployee = { ...mockEmployee, ...newEmployeeData, id: 'emp-002' };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: createdEmployee }),
      } as Response);

      const result = await createEmployee(mockSiteId, newEmployeeData);

      expect(result.employeeId).toBe(newEmployeeData.employeeId);
    });

    it('should create employee with serialCard', async () => {
      const newEmployeeData: CreateEmployeeData = {
        serialCard: 'CARD-XYZ789',
        name: 'Jane Smith',
      };
      const createdEmployee = { ...mockEmployee, ...newEmployeeData, id: 'emp-002' };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: createdEmployee }),
      } as Response);

      const result = await createEmployee(mockSiteId, newEmployeeData);

      expect(result.serialCard).toBe(newEmployeeData.serialCard);
    });
  });

  describe('updateEmployee', () => {
    it('should update employee details', async () => {
      const updates = {
        name: 'John Updated Doe',
        department: 'Product',
      };
      const updatedEmployee = { ...mockEmployee, ...updates };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: updatedEmployee }),
      } as Response);

      const result = await updateEmployee('emp-001', mockSiteId, updates);

      expect(result.name).toBe(updates.name);
      expect(result.department).toBe(updates.department);
    });

    it('should update employee status to inactive', async () => {
      const updates = { status: 'inactive' as const };
      const updatedEmployee = { ...mockEmployee, ...updates };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: updatedEmployee }),
      } as Response);

      const result = await updateEmployee('emp-001', mockSiteId, updates);

      expect(result.status).toBe('inactive');
    });
  });

  describe('deleteEmployee', () => {
    it('should deactivate employee', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await deleteEmployee('emp-001', mockSiteId);

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('importEmployees', () => {
    it('should import multiple employees successfully', async () => {
      const employeesToImport: CreateEmployeeData[] = [
        { email: 'emp1@company.com', name: 'Employee 1' },
        { email: 'emp2@company.com', name: 'Employee 2' },
        { email: 'emp3@company.com', name: 'Employee 3' },
      ];
      const importedEmployees = employeesToImport.map((emp, idx) => ({
        ...mockEmployee,
        ...emp,
        id: `emp-${idx + 1}`,
      }));
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          imported: 3,
          employees: importedEmployees,
        }),
      } as Response);

      const result = await importEmployees(mockSiteId, employeesToImport);

      expect(result.imported).toBe(3);
      expect(result.employees).toHaveLength(3);
    });

    it('should handle import with errors', async () => {
      const employeesToImport: CreateEmployeeData[] = [
        { email: 'valid@company.com', name: 'Valid Employee' },
        { name: 'Invalid Employee' }, // Missing identifier
      ];
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          imported: 1,
          errors: [{ row: 2, error: 'Missing identifier' }],
          employees: [{ ...mockEmployee, email: 'valid@company.com', id: 'emp-1' }],
        }),
      } as Response);

      const result = await importEmployees(mockSiteId, employeesToImport);

      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].error).toBe('Missing identifier');
    });
  });
});
