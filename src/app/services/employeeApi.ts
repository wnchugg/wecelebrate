import { getAccessToken } from '../lib/apiClient';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';
import { projectId } from '../../../utils/supabase/info';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
 * Get API base URL
 */
function getApiBaseUrl(): string {
  const env = getCurrentEnvironment();
  const urlMatch = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const envProjectId = urlMatch ? urlMatch[1] : projectId;
  return `https://${envProjectId}.supabase.co/functions/v1/make-server-6fcaeea3`;
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const token = getAccessToken();
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Access-Token': token,
    'Authorization': `Bearer ${token}`,
    ...((options.headers as Record<string, string>) || {}),
  };
  
  const env = getCurrentEnvironment();
  headers['X-Environment-ID'] = env.id;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  
  return data as T;
}

/**
 * Get all employees for a site
 */
export async function getEmployees(siteId: string): Promise<Employee[]> {
  const data = await apiRequest<{ success: boolean; data: Employee[] }>(
    `/v2/employees?site_id=${siteId}`
  );
  return data.data;
}

/**
 * Get a single employee
 */
export async function getEmployee(employeeId: string, siteId: string): Promise<Employee> {
  const data = await apiRequest<{ success: boolean; data: Employee }>(
    `/v2/employees/${employeeId}`
  );
  return data.data;
}

/**
 * Create a new employee
 */
export async function createEmployee(siteId: string, employeeData: CreateEmployeeData): Promise<Employee> {
  const data = await apiRequest<{ success: boolean; data: Employee }>(
    '/v2/employees',
    {
      method: 'POST',
      body: JSON.stringify({ site_id: siteId, ...employeeData }),
    }
  );
  return data.data;
}

/**
 * Update an employee
 */
export async function updateEmployee(
  employeeId: string,
  siteId: string,
  employeeData: UpdateEmployeeData
): Promise<Employee> {
  const data = await apiRequest<{ success: boolean; data: Employee }>(
    `/v2/employees/${employeeId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ site_id: siteId, ...employeeData }),
    }
  );
  return data.data;
}

/**
 * Delete (deactivate) an employee
 */
export async function deleteEmployee(employeeId: string, siteId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(
    `/v2/employees/${employeeId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * Import employees from CSV
 */
export async function importEmployees(
  siteId: string,
  employees: CreateEmployeeData[]
): Promise<{ imported: number; errors?: Array<{ row: number; error: string }>; employees: Employee[] }> {
  const data = await apiRequest<{
    success: boolean;
    imported: number;
    errors?: Array<{ row: number; error: string }>;
    employees: Employee[];
  }>(
    '/v2/employees/bulk-import',
    {
      method: 'POST',
      body: JSON.stringify({ site_id: siteId, employees }),
    }
  );
  
  return {
    imported: data.imported,
    errors: data.errors,
    employees: data.employees,
  };
}
