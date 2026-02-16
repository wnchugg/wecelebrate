import { apiClient } from '../lib/apiClient';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export interface Employee {
  id: string;
  siteId: string;
  email?: string;
  employeeId?: string;
  serialCard?: string;
  name?: string;
  department?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  email?: string;
  employeeId?: string;
  serialCard?: string;
  name?: string;
  department?: string;
}

export interface UpdateEmployeeData {
  email?: string;
  employeeId?: string;
  serialCard?: string;
  name?: string;
  department?: string;
  status?: 'active' | 'inactive';
}

/**
 * Get all employees for a site
 */
export async function getEmployees(siteId: string): Promise<Employee[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (apiClient as any).get(`/v2/employees?site_id=${siteId}`);
  const data = (await response.json()) as { success: boolean; data: Employee[] };
  return data.data;
}

/**
 * Get a single employee
 */
export async function getEmployee(employeeId: string, siteId: string): Promise<Employee> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (apiClient as any).get(`/v2/employees/${employeeId}`);
  const data = (await response.json()) as { success: boolean; data: Employee };
  return data.data;
}

/**
 * Create a new employee
 */
export async function createEmployee(siteId: string, data: CreateEmployeeData): Promise<Employee> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (apiClient as any).post(`/v2/employees`, { site_id: siteId, ...data });
  const result = (await response.json()) as { success: boolean; data: Employee };
  return result.data;
}

/**
 * Update an employee
 */
export async function updateEmployee(
  employeeId: string,
  siteId: string,
  data: UpdateEmployeeData
): Promise<Employee> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (apiClient as any).put(`/v2/employees/${employeeId}`, {
    site_id: siteId,
    ...data,
  });
  const result = (await response.json()) as { success: boolean; data: Employee };
  return result.data;
}

/**
 * Delete (deactivate) an employee
 */
export async function deleteEmployee(employeeId: string, siteId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (apiClient as any).delete(`/v2/employees/${employeeId}`);
}

/**
 * Import employees from CSV
 */
export async function importEmployees(
  siteId: string,
  employees: CreateEmployeeData[]
): Promise<{ imported: number; errors?: Array<{ row: number; error: string }>; employees: Employee[] }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (apiClient as any).post('/v2/employees/bulk-import', {
    site_id: siteId,
    employees,
  });
  const data = (await response.json()) as {
    success: boolean;
    imported: number;
    errors?: Array<{ row: number; error: string }>;
    employees: Employee[];
  };
  return {
    imported: data.imported,
    errors: data.errors,
    employees: data.employees,
  };
}
