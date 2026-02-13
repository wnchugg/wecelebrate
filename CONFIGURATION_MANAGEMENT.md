# Environment & Configuration Management

## Overview

The JALA 2 application includes a comprehensive environment-aware configuration system that supports:

- **Environment Detection**: Automatic detection of development, staging, and production environments
- **Configuration Management**: Global, client-level, and site-level configuration
- **Import/Export**: Full configuration backup and migration capabilities
- **Environment Variables**: Secure management of API keys and secrets

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Global Configuration](#global-configuration)
3. [Import/Export Features](#importexport-features)
4. [Admin Interface](#admin-interface)
5. [Configuration Structure](#configuration-structure)
6. [Best Practices](#best-practices)

---

## Environment Configuration

### Supported Environments

The application supports three environments:

- **Development**: Local development with debugging enabled
- **Staging**: Pre-production testing environment
- **Production**: Live production environment with enhanced security

### Environment Detection

The environment is automatically detected in the following order:

1. `VITE_APP_ENV` environment variable
2. `NODE_ENV` / Vite mode
3. Hostname patterns (localhost, staging domains, production domains)
4. Defaults to `development`

### Setting Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and configure your values:
   ```env
   VITE_APP_ENV=development
   VITE_API_URL=http://localhost:3001
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

3. Required variables by environment:

   **Development:**
   - None required (uses defaults)

   **Staging:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   **Production:**
   - `VITE_SUPABASE_URL` (required)
   - `VITE_SUPABASE_ANON_KEY` (required)
   - `VITE_SENTRY_DSN` (recommended)
   - `VITE_GA_ID` (recommended)

### Environment-Specific Features

Different features are enabled/disabled based on the environment:

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| Debug Logging | ✅ | ✅ | ❌ |
| Analytics | ❌ | ✅ | ✅ |
| Error Reporting | ❌ | ✅ | ✅ |
| Session Timeout | 8 hours | 2 hours | 1 hour |
| Import/Export | ✅ | ✅ | ✅ |
| Beta Features | ✅ | ✅ | ❌ |

### Using Environment Config in Code

```typescript
import env from '@/app/config/environment';

// Check current environment
if (env.isDevelopment) {
  console.log('Running in development mode');
}

// Access configuration
const apiUrl = env.config.apiBaseUrl;
const timeout = env.config.sessionTimeout;

// Check feature availability
if (env.hasFeature('enableImportExport')) {
  // Show import/export UI
}

// Get full API URL
const endpoint = env.getApiUrl('/api/clients');

// Environment-aware logging
env.debug('This only logs in dev/staging');
env.warn('Warning message');
env.error('Error message', error);
```

---

## Global Configuration

### What is Global Configuration?

Global configuration contains application-wide settings that apply across all clients and sites:

- Application branding and identity
- Default settings (language, currency, timezone)
- Security policies
- Email settings
- Feature flags
- Compliance settings
- Operational parameters

### Accessing Global Configuration

```typescript
import { getGlobalConfig, updateGlobalConfig } from '@/app/config/globalConfig';

// Get current configuration
const config = getGlobalConfig();

// Update configuration
updateGlobalConfig({
  branding: {
    defaultPrimaryColor: '#FF0000',
  },
  features: {
    enableMultiLanguage: true,
  },
});
```

### Global Configuration Structure

```typescript
{
  version: string;
  applicationName: string;
  supportEmail: string;
  
  branding: {
    defaultPrimaryColor: string;
    defaultSecondaryColor: string;
    defaultTertiaryColor: string;
  };
  
  defaults: {
    language: string;
    currency: string;
    country: string;
    timezone: string;
  };
  
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    // ... more security settings
  };
  
  features: {
    enableMultiLanguage: boolean;
    enableMultiCurrency: boolean;
    enableGiftWrap: boolean;
    // ... more feature flags
  };
  
  compliance: {
    enableGDPR: boolean;
    enableCCPA: boolean;
    dataRetentionDays: number;
    // ... more compliance settings
  };
}
```

---

## Import/Export Features

### Overview

The configuration management system provides comprehensive import/export capabilities for:

1. **Global Configuration**: Application-wide settings
2. **Client Configuration**: Individual client data with associated sites
3. **Site Configuration**: Individual site data
4. **Full Configuration**: Complete system backup (global + all clients + all sites)

### Export Formats

- **JSON**: Complete configuration data with full structure
- **CSV**: Tabular export for clients and sites (basic data only)

### Accessing Import/Export

Navigate to: **Admin Panel → Config Management**

### Export Operations

#### Export Global Configuration

```typescript
// Programmatic export
import { exportGlobalConfiguration, downloadConfiguration } from '@/app/utils/configImportExport';

const json = exportGlobalConfiguration(globalConfig);
downloadConfiguration(json, 'global-config.json');
```

**Via UI:**
1. Go to **Config Management → Global Config**
2. Click **Export Global Config**
3. File downloads automatically

#### Export Client Configuration

Exports a client with all associated sites.

**Via UI:**
1. Go to **Config Management → Export → Client Configurations**
2. Find the client you want to export
3. Click **Export** button
4. File downloads: `jala-client-{name}-{date}.json`

#### Export Site Configuration

**Via UI:**
1. Go to **Config Management → Export → Site Configurations**
2. Find the site you want to export
3. Click **Export** button
4. File downloads: `jala-site-{name}-{date}.json`

#### Export Full Configuration

Complete system backup including global config, all clients, and all sites.

**Via UI:**
1. Go to **Config Management → Export**
2. Click **Export Full Configuration**
3. File downloads: `jala-full-config-{date}.json`

#### Export to CSV

For reporting and external analysis:

**Via UI:**
1. Go to **Config Management → Export**
2. Click **Export All Clients (CSV)** or **Export All Sites (CSV)**
3. CSV file downloads with basic data

### Import Operations

#### Import Process

1. **Upload or Paste JSON**
   - Upload a previously exported JSON file
   - Or paste JSON directly into the text area

2. **Validate Configuration**
   - Click **Validate** button
   - System checks structure and data integrity
   - Shows validation results with details

3. **Configure Import Options**
   - **Generate New IDs**: Recommended to avoid conflicts
   - Creates new IDs for clients and sites
   - Preserves relationships between clients and sites

4. **Import**
   - Click **Import Configuration**
   - Data is imported into the system
   - Success/error notification displayed

#### Import via UI

1. Go to **Config Management → Import**
2. Upload JSON file or paste content
3. Enable "Generate new IDs" (recommended)
4. Click **Validate**
5. Review validation results
6. Click **Import Configuration**

#### Import Programmatically

```typescript
import { importConfiguration, parseImportData } from '@/app/utils/configImportExport';

// Validate first
const validation = importConfiguration(jsonString, { validateOnly: true });

if (validation.success) {
  // Parse and import
  const data = parseImportData(jsonString);
  // Process import...
}
```

### Export File Structure

#### Global Config Export

```json
{
  "type": "global",
  "version": "2.0.0",
  "exportedAt": "2026-02-06T10:00:00Z",
  "exportedBy": "admin@example.com",
  "data": {
    "global": {
      "version": "2.0.0",
      "applicationName": "JALA 2",
      // ... complete global config
    }
  }
}
```

#### Client Export

```json
{
  "type": "client",
  "version": "2.0.0",
  "exportedAt": "2026-02-06T10:00:00Z",
  "data": {
    "clients": [{
      "id": "client-001",
      "name": "TechCorp Inc.",
      // ... client data
    }],
    "sites": [{
      "id": "site-001",
      "clientId": "client-001",
      // ... site data
    }]
  }
}
```

#### Full Export

```json
{
  "type": "full",
  "version": "2.0.0",
  "exportedAt": "2026-02-06T10:00:00Z",
  "data": {
    "global": { /* global config */ },
    "clients": [ /* all clients */ ],
    "sites": [ /* all sites */ ]
  }
}
```

---

## Admin Interface

### Accessing Configuration Management

1. Log in to Admin Panel: `/admin/login`
2. Navigate to **Config Management** in the sidebar
3. Three tabs available:
   - **Global Config**: View and manage global settings
   - **Export**: Export configurations
   - **Import**: Import configurations

### Environment Information Panel

The configuration management page displays:

- Current environment (Development/Staging/Production)
- API Base URL
- Application version
- Feature flags status
- Session timeout
- Debug logging status
- Analytics status
- Error reporting status

### Global Configuration View

View current global configuration including:

- Application information
- Enabled features
- Security settings
- Default values
- Actions: Export, Reset to defaults

### Export Interface

Three sections:

1. **Full Configuration Export**
   - Single button to export everything
   - Creates comprehensive backup

2. **Client Configurations**
   - List of all clients
   - Individual export buttons
   - Shows site count per client
   - CSV export option

3. **Site Configurations**
   - List of all sites
   - Individual export buttons
   - Shows client and domain
   - CSV export option

### Import Interface

Features:

- File upload (drag-and-drop or browse)
- Manual JSON paste
- "Generate new IDs" toggle
- Validation button with detailed feedback
- Import button (enabled after successful validation)
- Real-time validation status
- Import guidelines and warnings

---

## Configuration Structure

### Hierarchy

```
Global Configuration (Application-wide)
└── Client (Company/Organization)
    └── Site (Individual gifting portal)
        ├── Branding
        ├── Settings
        ├── Gift Assignments
        └── Orders
```

### Client Configuration

```typescript
{
  id: string;
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Site Configuration

```typescript
{
  id: string;
  name: string;
  clientId: string; // Parent client
  domain: string;
  status: 'active' | 'inactive' | 'draft';
  type?: 'event-gifting' | 'onboarding-kit' | 'service-awards' | 'incentives' | 'custom';
  
  branding: {
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    logo?: string;
  };
  
  settings: {
    validationMethod: 'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso';
    allowQuantitySelection: boolean;
    showPricing: boolean;
    giftsPerUser: number;
    shippingMode: 'company' | 'employee' | 'store';
    defaultLanguage: string;
    enableLanguageSelector: boolean;
    defaultCurrency: string;
    allowedCountries: string[];
    defaultCountry: string;
    // ... more settings
  };
  
  createdAt: string;
  updatedAt: string;
}
```

---

## Best Practices

### Environment Variables

1. **Never commit `.env` files** to version control
2. **Use `.env.example`** as a template for required variables
3. **Different values per environment**: Use separate `.env` files for dev/staging/prod
4. **Rotate secrets regularly** in production
5. **Use environment variables for all secrets**: Never hardcode API keys

### Configuration Management

1. **Regular backups**: Export full configuration weekly in production
2. **Test imports in staging**: Never import directly to production without testing
3. **Generate new IDs on import**: Prevents conflicts with existing data
4. **Document changes**: Use the `exportedBy` field to track who made exports
5. **Version control exports**: Keep export files in a secure repository

### Security

1. **Limit access**: Only super_admin should access Config Management
2. **Audit exports**: Track who exports configuration and when
3. **Sanitize before sharing**: Remove sensitive data before sharing config files
4. **Validate imports**: Always validate before importing
5. **Backup before import**: Export current state before importing new configuration

### Performance

1. **Lazy load configuration**: Don't load all configs at app start
2. **Cache environment config**: Environment config is immutable during runtime
3. **Minimize config updates**: Global config updates trigger re-renders
4. **Use feature flags**: Better than environment checks for features

### Development Workflow

1. **Local development**:
   ```bash
   # .env
   VITE_APP_ENV=development
   VITE_API_URL=http://localhost:3001
   ```

2. **Staging deployment**:
   ```bash
   # .env.staging
   VITE_APP_ENV=staging
   VITE_API_URL=https://staging-api.jala.com
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

3. **Production deployment**:
   ```bash
   # .env.production
   VITE_APP_ENV=production
   VITE_API_URL=https://api.jala.com
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_SENTRY_DSN=...
   VITE_GA_ID=...
   ```

### Migration Between Environments

1. Export configuration from source environment
2. Sanitize data (remove production secrets, etc.)
3. Import to target environment with "Generate new IDs" enabled
4. Verify data integrity
5. Test functionality
6. Update environment-specific settings

### Troubleshooting

#### Import Fails

- Check JSON structure validity
- Ensure version compatibility
- Look for missing required fields
- Check client-site relationships

#### Environment Not Detected

- Verify `VITE_APP_ENV` is set correctly
- Check hostname patterns match expected values
- Clear browser cache and localStorage
- Restart development server

#### Configuration Not Persisting

- Check localStorage quotas
- Verify browser allows localStorage
- Check for JavaScript errors in console
- Try resetting configuration to defaults

---

## API Reference

### Environment Config

```typescript
import env from '@/app/config/environment';

// Properties
env.current: 'development' | 'staging' | 'production'
env.config: EnvironmentConfig
env.isDevelopment: boolean
env.isStaging: boolean
env.isProduction: boolean

// Methods
env.hasFeature(feature: string): boolean
env.getApiUrl(path?: string): string
env.debug(...args: unknown[]): void
env.warn(...args: unknown[]): void
env.error(...args: unknown[]): void
```

### Global Config

```typescript
import {
  getGlobalConfig,
  updateGlobalConfig,
  resetGlobalConfig,
  exportGlobalConfig,
  importGlobalConfig,
} from '@/app/config/globalConfig';

getGlobalConfig(): GlobalConfig
updateGlobalConfig(updates: Partial<GlobalConfig>): GlobalConfig
resetGlobalConfig(): GlobalConfig
exportGlobalConfig(): string
importGlobalConfig(json: string): { success: boolean; error?: string }
```

### Import/Export Utils

```typescript
import {
  exportGlobalConfiguration,
  exportClientConfiguration,
  exportSiteConfiguration,
  exportFullConfiguration,
  downloadConfiguration,
  importConfiguration,
  parseImportData,
  exportToCSV,
  downloadCSV,
} from '@/app/utils/configImportExport';

exportGlobalConfiguration(config: GlobalConfig, exportedBy?: string): string
exportClientConfiguration(client: Client, sites: Site[], exportedBy?: string): string
exportSiteConfiguration(site: Site, exportedBy?: string): string
exportFullConfiguration(global: GlobalConfig, clients: Client[], sites: Site[], exportedBy?: string): string
downloadConfiguration(json: string, filename: string): void
importConfiguration(json: string, options?: ImportOptions): ImportResult
parseImportData(json: string): ExportData | null
exportToCSV(data: (Client | Site)[], type: 'client' | 'site'): string
downloadCSV(csv: string, filename: string): void
```

---

## Support

For questions or issues with configuration management:

- Email: support@jala.com
- Documentation: This file
- Admin Panel: `/admin/config-management`

---

**Last Updated**: February 6, 2026  
**Version**: 2.0.0
