/**
 * Configuration Import/Export Utilities
 * 
 * Handles import and export of configurations at all levels:
 * - Global Configuration
 * - Client Configuration
 * - Site Configuration
 */

import { GlobalConfig } from '../config/globalConfig';
import { Client, Site } from '../context/SiteContext';

export interface ExportData {
  type: 'global' | 'client' | 'site' | 'full';
  version: string;
  exportedAt: string;
  exportedBy?: string;
  data: {
    global?: GlobalConfig;
    clients?: Client[];
    sites?: Site[];
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
  errors?: string[];
  warnings?: string[];
  imported?: {
    global?: boolean;
    clientsCount?: number;
    sitesCount?: number;
  };
}

/**
 * Export global configuration
 */
export function exportGlobalConfiguration(
  config: GlobalConfig,
  exportedBy?: string
): string {
  const exportData: ExportData = {
    type: 'global',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    exportedBy,
    data: {
      global: config,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export client configuration
 */
export function exportClientConfiguration(
  client: Client,
  sites: Site[],
  exportedBy?: string
): string {
  const clientSites = sites.filter(s => s.clientId === client.id);

  const exportData: ExportData = {
    type: 'client',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    exportedBy,
    data: {
      clients: [client],
      sites: clientSites,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export site configuration
 */
export function exportSiteConfiguration(
  site: Site,
  exportedBy?: string
): string {
  const exportData: ExportData = {
    type: 'site',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    exportedBy,
    data: {
      sites: [site],
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export full configuration (global + all clients + all sites)
 */
export function exportFullConfiguration(
  globalConfig: GlobalConfig,
  clients: Client[],
  sites: Site[],
  exportedBy?: string
): string {
  const exportData: ExportData = {
    type: 'full',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    exportedBy,
    data: {
      global: globalConfig,
      clients,
      sites,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download export as JSON file
 */
export function downloadConfiguration(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate import data structure
 */
function validateImportData(data: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format');
    return { isValid: false, errors };
  }

  const exportData = data as Partial<ExportData>;

  if (!exportData.type) {
    errors.push('Missing export type');
  }

  if (!exportData.version) {
    errors.push('Missing export version');
  }

  if (!exportData.exportedAt) {
    errors.push('Missing export timestamp');
  }

  if (!exportData.data) {
    errors.push('Missing export data');
  }

  // Validate based on type
  if (exportData.type === 'global' && !exportData.data?.global) {
    errors.push('Global configuration data is missing');
  }

  if (exportData.type === 'client' && (!exportData.data?.clients || exportData.data.clients.length === 0)) {
    errors.push('Client configuration data is missing');
  }

  if (exportData.type === 'site' && (!exportData.data?.sites || exportData.data.sites.length === 0)) {
    errors.push('Site configuration data is missing');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate client data
 */
function validateClient(client: unknown): boolean {
  if (!client || typeof client !== 'object') return false;
  
  const c = client as Partial<Client>;
  return !!(c.id && c.name && typeof c.isActive === 'boolean');
}

/**
 * Validate site data
 */
function validateSite(site: unknown): boolean {
  if (!site || typeof site !== 'object') return false;
  
  const s = site as Partial<Site>;
  return !!(
    s.id && 
    s.name && 
    s.clientId && 
    s.domain && 
    s.status &&
    s.branding &&
    s.settings
  );
}

/**
 * Import configuration from JSON
 */
export function importConfiguration(
  json: string,
  options: {
    overwriteExisting?: boolean;
    generateNewIds?: boolean;
    validateOnly?: boolean;
  } = {}
): ImportResult {
  const {
    overwriteExisting = false,
    generateNewIds = false,
    validateOnly = false,
  } = options;

  try {
    // Parse JSON
    const data = JSON.parse(json);

    // Validate structure
    const validation = validateImportData(data);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Invalid configuration format',
        errors: validation.errors,
      };
    }

    const exportData = data as ExportData;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate global config
    if (exportData.data.global) {
      if (!exportData.data.global.version || !exportData.data.global.applicationName) {
        errors.push('Invalid global configuration: missing required fields');
      }
    }

    // Validate clients
    if (exportData.data.clients) {
      exportData.data.clients.forEach((client, index) => {
        if (!validateClient(client)) {
          errors.push(`Invalid client data at index ${index}`);
        }
      });
    }

    // Validate sites
    if (exportData.data.sites) {
      exportData.data.sites.forEach((site, index) => {
        if (!validateSite(site)) {
          errors.push(`Invalid site data at index ${index}`);
        }
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: 'Validation failed',
        errors,
      };
    }

    // If validate only, return success
    if (validateOnly) {
      return {
        success: true,
        message: 'Configuration is valid',
        warnings,
      };
    }

    // Return success with metadata (actual import is handled by context)
    return {
      success: true,
      message: 'Configuration ready to import',
      warnings,
      imported: {
        global: !!exportData.data.global,
        clientsCount: exportData.data.clients?.length || 0,
        sitesCount: exportData.data.sites?.length || 0,
      },
    };

  } catch (error) {
    return {
      success: false,
      message: 'Failed to parse configuration',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Parse imported configuration data
 */
export function parseImportData(json: string): ExportData | null {
  try {
    const data = JSON.parse(json);
    const validation = validateImportData(data);
    if (validation.isValid) {
      return data as ExportData;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate new IDs for imported data (to avoid conflicts)
 */
export function generateNewId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Process client import with ID generation
 */
export function processClientImport(
  client: Client,
  generateNewIds: boolean
): Client {
  if (generateNewIds) {
    return {
      ...client,
      id: generateNewId('client'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return client;
}

/**
 * Process site import with ID generation
 */
export function processSiteImport(
  site: Site,
  newClientId: string | null,
  generateNewIds: boolean
): Site {
  const processed: Site = { ...site };

  if (generateNewIds) {
    processed.id = generateNewId('site');
    processed.createdAt = new Date().toISOString();
    processed.updatedAt = new Date().toISOString();
  }

  if (newClientId) {
    processed.clientId = newClientId;
  }

  return processed;
}

/**
 * Export configuration to CSV (for clients/sites)
 */
export function exportToCSV(
  data: (Client | Site)[],
  type: 'client' | 'site'
): string {
  if (data.length === 0) return '';

  const headers = type === 'client' 
    ? ['ID', 'Name', 'Description', 'Contact Email', 'Contact Phone', 'Active', 'Created At']
    : ['ID', 'Name', 'Client ID', 'Domain', 'Status', 'Type', 'Primary Color', 'Created At'];

  const rows = data.map(item => {
    if (type === 'client') {
      const client = item as Client;
      return [
        client.id,
        client.name,
        client.description || '',
        client.contactEmail || '',
        client.contactPhone || '',
        client.isActive ? 'Yes' : 'No',
        client.createdAt,
      ];
    } else {
      const site = item as Site;
      return [
        site.id,
        site.name,
        site.clientId,
        site.domain,
        site.status,
        site.type || '',
        site.branding.primaryColor,
        site.createdAt,
      ];
    }
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Aliases for backward compatibility
export const exportConfiguration = exportFullConfiguration;
export const importSiteConfiguration = importConfiguration;
export const validateImportedConfig = validateImportData;
export const parseConfigurationFile = parseImportData;