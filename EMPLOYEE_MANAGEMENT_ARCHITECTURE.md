# Employee Management Architecture

## Current State Analysis

### Existing Tables
1. **`employees`** table (site-level)
   - Stores employee records per site
   - Used for Simple Auth (email validation, serial cards, employee IDs)
   - Fields: `site_id`, `employee_id`, `email`, `serial_card_number`, `first_name`, `last_name`, `status`

### Current Issues
1. No client-level employee management
2. No way to map client employees to multiple sites
3. No distinction between "access list" (Simple Auth) and "user accounts" (Advanced Auth)
4. SFTP/HRIS/ERP integration not clearly defined
5. Duplicate employee data across sites for the same client

## Proposed Architecture

### 1. Three-Tier Employee Data Model

```
Client Level (Master Data)
    ↓
Site Assignments (Mapping)
    ↓
Site Level (Access/Auth)
```

### 2. Database Schema

#### A. Client Employees (Master Employee List)
```sql
CREATE TABLE client_employees (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  
  -- Identity
  employee_id TEXT NOT NULL,  -- Company employee ID
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  
  -- Additional Info
  department TEXT,
  job_title TEXT,
  manager_id UUID REFERENCES client_employees(id),
  hire_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',  -- active, inactive, terminated
  
  -- Data Source
  source TEXT NOT NULL DEFAULT 'manual',  -- manual, sftp, hris, erp
  source_system TEXT,  -- e.g., 'Workday', 'SAP', 'ADP'
  external_id TEXT,  -- ID in external system
  last_sync_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(client_id, employee_id),
  UNIQUE(client_id, email)
);
```

#### B. Site Employee Assignments (Mapping)
```sql
CREATE TABLE site_employee_assignments (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  client_employee_id UUID NOT NULL REFERENCES client_employees(id) ON DELETE CASCADE,
  
  -- Site-specific overrides (optional)
  site_employee_id TEXT,  -- Different ID for this site
  site_email TEXT,  -- Different email for this site
  
  -- Access Control
  access_level TEXT DEFAULT 'standard',  -- standard, manager, admin
  access_groups TEXT[],  -- Array of access group names
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(site_id, client_employee_id)
);
```

#### C. Site Users (Advanced Auth Only)
```sql
-- This is for sites with SSO/Advanced Auth
-- Extends site_employee_assignments with authentication data
CREATE TABLE site_users (
  id UUID PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES site_employee_assignments(id) ON DELETE CASCADE,
  
  -- Authentication
  username TEXT,
  password_hash TEXT,
  force_password_reset BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  
  -- SSO
  sso_provider_id TEXT,  -- ID from SSO provider
  sso_metadata JSONB,
  
  -- Roles & Permissions
  role TEXT NOT NULL DEFAULT 'employee',  -- admin, manager, employee, viewer
  permissions TEXT[],
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, active, suspended, locked
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(site_id, assignment_id)
);
```

#### D. Keep Existing `employees` Table for Backward Compatibility
```sql
-- Rename to site_access_list for clarity
-- Used for Simple Auth (email validation, serial cards)
-- This is the "access list" not "user accounts"
ALTER TABLE employees RENAME TO site_access_list;
```

### 3. Data Flow Patterns

#### Pattern A: Client-Level Employee Management
```
1. Import employees at client level (SFTP/HRIS/ERP/Manual)
   → client_employees table

2. Assign employees to sites
   → site_employee_assignments table

3. For Advanced Auth sites, create user accounts
   → site_users table
```

#### Pattern B: Site-Level Simple Auth (Current)
```
1. Import access list directly to site
   → site_access_list table (formerly employees)

2. No user accounts needed
   → Just validation against the list
```

#### Pattern C: Site-Level Advanced Auth
```
1. Import employees at client level OR site level
   → client_employees OR site_access_list

2. Create user accounts with authentication
   → site_users table

3. Manage passwords, roles, permissions
   → site_users table
```

### 4. Integration Points

#### SFTP Integration (Client Level)
```
Location: Client Settings → Employee Management → SFTP Configuration

Features:
- Configure SFTP server details
- Set sync schedule (daily, weekly, manual)
- Map CSV columns to employee fields
- Preview before import
- Sync history and logs
```

#### HRIS Integration (Client Level)
```
Location: Client Settings → Employee Management → HRIS Integration

Supported Systems:
- Workday
- ADP
- BambooHR
- Namely
- Custom API

Features:
- OAuth connection
- Field mapping
- Automatic sync
- Webhook support for real-time updates
```

#### ERP Integration (Client Level)
```
Location: Client Settings → Employee Management → ERP Integration

Supported Systems:
- SAP
- Oracle
- NetSuite
- Dynamics 365

Features:
- API connection
- Employee data sync
- Department/cost center mapping
```

### 5. UI/UX Flow

#### Client Settings → Employee Management
```
Tabs:
1. Master Employee List
   - View all client employees
   - Import from CSV
   - Configure SFTP/HRIS/ERP
   - Bulk actions

2. Site Assignments
   - View which employees are assigned to which sites
   - Bulk assign/unassign
   - Access level management

3. Integration Settings
   - SFTP configuration
   - HRIS connection
   - ERP connection
   - Sync schedules
```

#### Site Settings → Access Tab
```
For Simple Auth:
- Import access list (emails, employee IDs, serial cards)
- OR inherit from client employee list
- Validation method selection

For Advanced Auth:
- Inherit from client employee list (recommended)
- OR manage site-specific users
- User account management (passwords, roles)
- SSO configuration
```

### 6. Migration Strategy

#### Phase 1: Add New Tables (Non-Breaking)
1. Create `client_employees` table
2. Create `site_employee_assignments` table
3. Create `site_users` table (new, different from current employees)
4. Keep existing `employees` table as-is

#### Phase 2: Rename for Clarity (Breaking)
1. Rename `employees` → `site_access_list`
2. Update all references in code
3. Update API endpoints

#### Phase 3: Data Migration
1. Optionally migrate existing `site_access_list` to `client_employees`
2. Create assignments in `site_employee_assignments`
3. For Advanced Auth sites, create records in `site_users`

### 7. API Endpoints

#### Client-Level Employees
```
GET    /v2/clients/:clientId/employees
POST   /v2/clients/:clientId/employees
PUT    /v2/clients/:clientId/employees/:employeeId
DELETE /v2/clients/:clientId/employees/:employeeId
POST   /v2/clients/:clientId/employees/import
POST   /v2/clients/:clientId/employees/sync  (SFTP/HRIS/ERP)
```

#### Site Assignments
```
GET    /v2/sites/:siteId/assignments
POST   /v2/sites/:siteId/assignments
DELETE /v2/sites/:siteId/assignments/:assignmentId
POST   /v2/sites/:siteId/assignments/bulk
```

#### Site Users (Advanced Auth)
```
GET    /v2/sites/:siteId/users
POST   /v2/sites/:siteId/users
PUT    /v2/sites/:siteId/users/:userId
DELETE /v2/sites/:siteId/users/:userId
POST   /v2/sites/:siteId/users/:userId/password
POST   /v2/sites/:siteId/users/:userId/proxy-session
```

#### Site Access List (Simple Auth)
```
GET    /v2/sites/:siteId/access-list
POST   /v2/sites/:siteId/access-list
PUT    /v2/sites/:siteId/access-list/:id
DELETE /v2/sites/:siteId/access-list/:id
POST   /v2/sites/:siteId/access-list/import
```

### 8. Benefits of This Architecture

1. **Single Source of Truth**: Client-level employee data
2. **Reusability**: Assign same employee to multiple sites
3. **Flexibility**: Support both Simple and Advanced Auth
4. **Integration**: Clear integration points for SFTP/HRIS/ERP
5. **Scalability**: Separate concerns (identity vs access vs authentication)
6. **Backward Compatible**: Existing `employees` table still works

### 9. Implementation Priority

#### High Priority (Now)
1. Keep current `employees` table working for Simple Auth
2. Create `site_users` table for Advanced Auth user accounts
3. Distinguish between "access list" and "user accounts"

#### Medium Priority (Next Quarter)
1. Create `client_employees` table
2. Create `site_employee_assignments` table
3. Build client-level employee management UI
4. SFTP integration

#### Low Priority (Future)
1. HRIS integration
2. ERP integration
3. Advanced role-based access control
4. Employee self-service portal

### 10. Decision Points

**Question 1**: Should we rename `employees` to `site_access_list` now?
- **Recommendation**: Yes, for clarity, but with backward compatibility

**Question 2**: Should `site_users` reference `client_employees` or be independent?
- **Recommendation**: Start independent, add client reference later

**Question 3**: Where should SFTP configuration live?
- **Recommendation**: Client level, with ability to override at site level

**Question 4**: Should we support both client-level and site-level employee import?
- **Recommendation**: Yes, with client-level as recommended approach

