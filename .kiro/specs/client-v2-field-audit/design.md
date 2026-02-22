# Design Document: Client V2 Field Audit

## Overview

This design addresses the field mismatch between the frontend Client management interface and the PostgreSQL database schema after V2 API migration. The database contains 40+ client fields organized across multiple business domains, but the current frontend form only exposes 5 basic fields. This design provides a comprehensive solution for:

1. Complete field mapping between frontend camelCase and database snake_case with "client_" prefix
2. Organized, user-friendly form interface with tabbed sections
3. Robust field transformation logic in the backend
4. Comprehensive validation for all field types
5. Full CRUD operations supporting all client fields

The solution ensures type safety, data integrity, and a maintainable architecture that can accommodate future field additions.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ClientManagement.tsx                                 │  │
│  │  - ClientModal (Tabbed Form)                         │  │
│  │  - Field Validation                                  │  │
│  │  - State Management                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  api.types.ts                                        │  │
│  │  - Complete Client interface (40+ fields)           │  │
│  │  - Type definitions for all field types             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON (camelCase)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  helpers.ts                                          │  │
│  │  - mapClientFieldsToDatabase()                      │  │
│  │  - mapClientFieldsFromDatabase()                    │  │
│  │  - Field transformation logic                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  crud_db.ts                                          │  │
│  │  - CRUD operations with field mapping              │  │
│  │  - Validation and error handling                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL (snake_case with client_ prefix)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  clients table (PostgreSQL)                          │  │
│  │  - 40+ columns with proper constraints              │  │
│  │  - Indexes for performance                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Create Client**: User fills form → Frontend validates → Sends camelCase JSON → Backend transforms to snake_case with client_ prefix → Inserts to database → Returns camelCase response
2. **Read Client**: Frontend requests → Backend queries database → Transforms snake_case to camelCase → Returns to frontend → Displays in form
3. **Update Client**: User modifies fields → Frontend tracks changes → Sends only changed fields → Backend transforms and updates → Returns updated client
4. **Field Transformation**: Bidirectional mapping handles naming conventions automatically


## Components and Interfaces

### Frontend Type Definitions

The complete Client interface in `src/app/types/api.types.ts`:

```typescript
export interface Client {
  // System fields
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // Basic Information (Required)
  name: string;
  contactEmail: string;
  status: 'active' | 'inactive';
  
  // Client Identification
  clientCode?: string;
  clientRegion?: string;
  clientSourceCode?: string;
  
  // Contact Information
  clientContactName?: string;
  clientContactPhone?: string;
  clientTaxId?: string;
  
  // Address
  clientAddressLine1?: string;
  clientAddressLine2?: string;
  clientAddressLine3?: string;
  clientCity?: string;
  clientPostalCode?: string;
  clientCountryState?: string;
  clientCountry?: string;
  
  // Account Management
  clientAccountManager?: string;
  clientAccountManagerEmail?: string;
  clientImplementationManager?: string;
  clientImplementationManagerEmail?: string;
  technologyOwner?: string;
  technologyOwnerEmail?: string;
  
  // Application Settings
  clientUrl?: string;
  clientAllowSessionTimeoutExtend?: boolean;
  clientAuthenticationMethod?: string;
  clientCustomUrl?: string;
  clientHasEmployeeData?: boolean;
  
  // Billing Settings
  clientInvoiceType?: string;
  clientInvoiceTemplateType?: string;
  clientPoType?: string;
  clientPoNumber?: string;
  
  // Integration Settings
  clientErpSystem?: string;
  clientSso?: string;
  clientHrisSystem?: string;
}
```

### Form Organization

The ClientModal component will use Material-UI Tabs to organize fields into 6 sections:


**Tab 1: Basic Info**
- name (required, TextField)
- contactEmail (required, TextField with email validation)
- status (required, Select: active/inactive)
- clientCode (optional, TextField)
- clientRegion (optional, Select: US/CA, EMEA, APAC, LATAM, Global)
- clientSourceCode (optional, TextField)

**Tab 2: Contact**
- clientContactName (optional, TextField)
- clientContactPhone (optional, TextField with phone validation)
- clientTaxId (optional, TextField)

**Tab 3: Address**
- clientAddressLine1 (optional, TextField)
- clientAddressLine2 (optional, TextField)
- clientAddressLine3 (optional, TextField)
- clientCity (optional, TextField)
- clientPostalCode (optional, TextField)
- clientCountryState (optional, TextField)
- clientCountry (optional, Select with country list)

**Tab 4: Account Management**
- clientAccountManager (optional, TextField)
- clientAccountManagerEmail (optional, TextField with email validation)
- clientImplementationManager (optional, TextField)
- clientImplementationManagerEmail (optional, TextField with email validation)
- technologyOwner (optional, TextField)
- technologyOwnerEmail (optional, TextField with email validation)

**Tab 5: App Settings**
- clientUrl (optional, TextField with URL validation)
- clientCustomUrl (optional, TextField with URL validation)
- clientAllowSessionTimeoutExtend (optional, Checkbox)
- clientAuthenticationMethod (optional, Select: SSO, Basic, OAuth)
- clientHasEmployeeData (optional, Checkbox)

**Tab 6: Billing & Integrations**
- clientInvoiceType (optional, TextField)
- clientInvoiceTemplateType (optional, TextField)
- clientPoType (optional, TextField)
- clientPoNumber (optional, TextField)
- clientErpSystem (optional, TextField)
- clientSso (optional, TextField)
- clientHrisSystem (optional, TextField)

### Form State Management

```typescript
interface FormState {
  values: Partial<Client>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  activeTab: number;
  isDirty: boolean;
}
```

The form will:
- Track all field values in a single state object
- Preserve state when switching tabs
- Track which fields have been modified (for partial updates)
- Validate on blur and on submit
- Display inline errors below each field


## Data Models

### Field Mapping Table

Complete mapping between frontend camelCase and database snake_case:

| Frontend Field (camelCase) | Database Column (snake_case) | Type | Required | Validation |
|---------------------------|------------------------------|------|----------|------------|
| id | id | UUID | Yes | Auto-generated |
| name | name | string | Yes | Min 2 chars |
| contactEmail | contact_email | string | Yes | Email format |
| status | status | string | Yes | 'active' or 'inactive' |
| clientCode | client_code | string | No | Unique if provided |
| clientRegion | client_region | string | No | - |
| clientSourceCode | client_source_code | string | No | - |
| clientContactName | client_contact_name | string | No | - |
| clientContactPhone | client_contact_phone | string | No | Phone format |
| clientTaxId | client_tax_id | string | No | - |
| clientAddressLine1 | client_address_line_1 | string | No | - |
| clientAddressLine2 | client_address_line_2 | string | No | - |
| clientAddressLine3 | client_address_line_3 | string | No | - |
| clientCity | client_city | string | No | - |
| clientPostalCode | client_postal_code | string | No | - |
| clientCountryState | client_country_state | string | No | - |
| clientCountry | client_country | string | No | - |
| clientAccountManager | client_account_manager | string | No | - |
| clientAccountManagerEmail | client_account_manager_email | string | No | Email format |
| clientImplementationManager | client_implementation_manager | string | No | - |
| clientImplementationManagerEmail | client_implementation_manager_email | string | No | Email format |
| technologyOwner | technology_owner | string | No | - |
| technologyOwnerEmail | technology_owner_email | string | No | Email format |
| clientUrl | client_url | string | No | URL format |
| clientAllowSessionTimeoutExtend | client_allow_session_timeout_extend | boolean | No | - |
| clientAuthenticationMethod | client_authentication_method | string | No | - |
| clientCustomUrl | client_custom_url | string | No | URL format |
| clientHasEmployeeData | client_has_employee_data | boolean | No | - |
| clientInvoiceType | client_invoice_type | string | No | - |
| clientInvoiceTemplateType | client_invoice_template_type | string | No | - |
| clientPoType | client_po_type | string | No | - |
| clientPoNumber | client_po_number | string | No | - |
| clientErpSystem | client_erp_system | string | No | - |
| clientSso | client_sso | string | No | - |
| clientHrisSystem | client_hris_system | string | No | - |
| createdAt | created_at | timestamp | Yes | Auto-generated |
| updatedAt | updated_at | timestamp | Yes | Auto-updated |

### Special Cases

Fields that don't follow the "client_" prefix pattern:
- `id` → `id` (no prefix)
- `name` → `name` (no prefix)
- `contactEmail` → `contact_email` (no prefix)
- `status` → `status` (no prefix)
- `technologyOwner` → `technology_owner` (no prefix)
- `technologyOwnerEmail` → `technology_owner_email` (no prefix)
- `createdAt` → `created_at` (no prefix)
- `updatedAt` → `updated_at` (no prefix)


### Backend Transformation Functions

Two new functions in `helpers.ts`:

```typescript
/**
 * Maps frontend Client fields to database column names
 * Handles the "client_" prefix and special cases
 */
export function mapClientFieldsToDatabase(input: Record<string, any>): Record<string, any> {
  const fieldMapping: Record<string, string> = {
    // Special cases (no client_ prefix)
    'id': 'id',
    'name': 'name',
    'contactEmail': 'contact_email',
    'status': 'status',
    'technologyOwner': 'technology_owner',
    'technologyOwnerEmail': 'technology_owner_email',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at',
    
    // Standard fields (with client_ prefix)
    'clientCode': 'client_code',
    'clientRegion': 'client_region',
    'clientSourceCode': 'client_source_code',
    'clientContactName': 'client_contact_name',
    'clientContactPhone': 'client_contact_phone',
    'clientTaxId': 'client_tax_id',
    'clientAddressLine1': 'client_address_line_1',
    'clientAddressLine2': 'client_address_line_2',
    'clientAddressLine3': 'client_address_line_3',
    'clientCity': 'client_city',
    'clientPostalCode': 'client_postal_code',
    'clientCountryState': 'client_country_state',
    'clientCountry': 'client_country',
    'clientAccountManager': 'client_account_manager',
    'clientAccountManagerEmail': 'client_account_manager_email',
    'clientImplementationManager': 'client_implementation_manager',
    'clientImplementationManagerEmail': 'client_implementation_manager_email',
    'clientUrl': 'client_url',
    'clientAllowSessionTimeoutExtend': 'client_allow_session_timeout_extend',
    'clientAuthenticationMethod': 'client_authentication_method',
    'clientCustomUrl': 'client_custom_url',
    'clientHasEmployeeData': 'client_has_employee_data',
    'clientInvoiceType': 'client_invoice_type',
    'clientInvoiceTemplateType': 'client_invoice_template_type',
    'clientPoType': 'client_po_type',
    'clientPoNumber': 'client_po_number',
    'clientErpSystem': 'client_erp_system',
    'clientSso': 'client_sso',
    'clientHrisSystem': 'client_hris_system',
  };

  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(input)) {
    const dbColumn = fieldMapping[key];
    if (dbColumn) {
      result[dbColumn] = value;
    } else {
      console.warn(`[mapClientFieldsToDatabase] Unknown field: ${key}`);
    }
  }
  
  return result;
}

/**
 * Maps database Client columns to frontend field names
 * Handles the "client_" prefix and special cases
 */
export function mapClientFieldsFromDatabase(dbRow: Record<string, any>): Record<string, any> {
  const reverseMapping: Record<string, string> = {
    // Special cases (no client_ prefix)
    'id': 'id',
    'name': 'name',
    'contact_email': 'contactEmail',
    'status': 'status',
    'technology_owner': 'technologyOwner',
    'technology_owner_email': 'technologyOwnerEmail',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt',
    
    // Standard fields (with client_ prefix)
    'client_code': 'clientCode',
    'client_region': 'clientRegion',
    'client_source_code': 'clientSourceCode',
    'client_contact_name': 'clientContactName',
    'client_contact_phone': 'clientContactPhone',
    'client_tax_id': 'clientTaxId',
    'client_address_line_1': 'clientAddressLine1',
    'client_address_line_2': 'clientAddressLine2',
    'client_address_line_3': 'clientAddressLine3',
    'client_city': 'clientCity',
    'client_postal_code': 'clientPostalCode',
    'client_country_state': 'clientCountryState',
    'client_country': 'clientCountry',
    'client_account_manager': 'clientAccountManager',
    'client_account_manager_email': 'clientAccountManagerEmail',
    'client_implementation_manager': 'clientImplementationManager',
    'client_implementation_manager_email': 'clientImplementationManagerEmail',
    'client_url': 'clientUrl',
    'client_allow_session_timeout_extend': 'clientAllowSessionTimeoutExtend',
    'client_authentication_method': 'clientAuthenticationMethod',
    'client_custom_url': 'clientCustomUrl',
    'client_has_employee_data': 'clientHasEmployeeData',
    'client_invoice_type': 'clientInvoiceType',
    'client_invoice_template_type': 'clientInvoiceTemplateType',
    'client_po_type': 'clientPoType',
    'client_po_number': 'clientPoNumber',
    'client_erp_system': 'clientErpSystem',
    'client_sso': 'clientSso',
    'client_hris_system': 'clientHrisSystem',
  };

  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(dbRow)) {
    const frontendField = reverseMapping[key];
    if (frontendField) {
      result[frontendField] = value;
    }
  }
  
  return result;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Field Transformation Round-Trip

*For any* client object with valid field names, transforming from frontend format to database format and back to frontend format should produce an equivalent object with the same field names and values.

**Validates: Requirements 5.1, 5.2**

### Property 2: Value Preservation During Transformation

*For any* client field value (string, boolean, number, null, undefined), the transformation process should preserve the value without data loss or type coercion.

**Validates: Requirements 5.5**

### Property 3: Email Format Validation

*For any* string that does not match the email regex pattern `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`, the validation function should reject it and return an error.

**Validates: Requirements 2.4, 4.2**

### Property 4: Phone Format Validation

*For any* string that does not match a valid phone format (digits, spaces, hyphens, parentheses, plus sign), the validation function should reject it and return an error.

**Validates: Requirements 2.5, 4.3**

### Property 5: URL Format Validation

*For any* string that does not match a valid URL format (http/https protocol, valid domain), the validation function should reject it and return an error.

**Validates: Requirements 4.4**

### Property 6: Form State Preservation Across Navigation

*For any* form state with populated fields, navigating between tabs and back should preserve all field values without data loss.

**Validates: Requirements 3.5**

### Property 7: Required Field Validation

*For any* required field (name, contactEmail, status), submitting the form with that field empty should prevent submission and display a validation error.

**Validates: Requirements 4.1**

### Property 8: All Populated Fields Sent to API

*For any* form submission with N populated fields, the API request payload should contain exactly N fields (excluding empty optional fields).

**Validates: Requirements 6.1**

### Property 9: Create Operation Returns Complete Object

*For any* valid client creation request, the API response should include all fields that were sent in the request plus system-generated fields (id, createdAt, updatedAt).

**Validates: Requirements 6.2, 6.4**

### Property 10: Required Field Error Handling

*For any* client creation request missing a required field (name, contactEmail, or status), the API should return a 400 error with a message identifying the missing field.

**Validates: Requirements 6.3**

### Property 11: Load All Existing Fields

*For any* existing client record in the database, the GET endpoint should return all non-null fields in camelCase format.

**Validates: Requirements 7.1**

### Property 12: Send Only Changed Fields

*For any* client update operation where K out of N fields are modified, the API request should contain exactly K fields (not including unchanged fields).

**Validates: Requirements 7.2**

### Property 13: Update Returns Complete Object

*For any* valid client update request, the API response should include all current field values (both changed and unchanged) for the client.

**Validates: Requirements 7.3, 7.4**

### Property 14: Preserve Unchanged Fields

*For any* client update operation that modifies K fields, the remaining N-K fields should retain their original values in the database.

**Validates: Requirements 7.5, 10.3**

### Property 15: Retrieve and Transform All Fields

*For any* client record retrieved from the database, all database columns should be transformed to their corresponding camelCase frontend field names.

**Validates: Requirements 8.1, 8.2**


## Error Handling

### Frontend Validation Errors

The form will display inline validation errors for:

1. **Required Field Errors**: "This field is required"
2. **Email Format Errors**: "Please enter a valid email address"
3. **Phone Format Errors**: "Please enter a valid phone number"
4. **URL Format Errors**: "Please enter a valid URL (must start with http:// or https://)"
5. **Length Errors**: "Name must be at least 2 characters"

Validation triggers:
- On blur for individual fields
- On submit for all fields
- Errors clear when user starts typing

### Backend API Errors

The backend will return structured error responses:

```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    field?: string,
    details?: any
  }
}
```

Error codes:
- `VALIDATION_ERROR`: Field validation failed (400)
- `MISSING_REQUIRED_FIELD`: Required field not provided (400)
- `INVALID_FIELD_FORMAT`: Field format invalid (400)
- `DUPLICATE_CLIENT_CODE`: Client code already exists (409)
- `CLIENT_NOT_FOUND`: Client ID not found (404)
- `DATABASE_ERROR`: Database operation failed (500)
- `TRANSFORMATION_ERROR`: Field transformation failed (500)

### Error Logging

All transformation errors will be logged with:
- Timestamp
- Operation type (toDatabase/fromDatabase)
- Field name that caused the error
- Input value
- Error message

Example log:
```
[ERROR] [mapClientFieldsToDatabase] Unknown field: legacyAddress
  Input: { legacyAddress: "123 Main St" }
  Timestamp: 2024-01-15T10:30:00Z
```


## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of field transformations
- Edge cases (null values, empty strings, special characters)
- Error conditions (missing required fields, invalid formats)
- Integration points (API endpoints, database operations)
- UI behavior (tab navigation, form submission)

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Field transformation correctness across all field names
- Validation rules across all possible invalid inputs
- Data preservation across operations
- Comprehensive input coverage through randomization

Together, unit tests catch concrete bugs while property tests verify general correctness.

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each test must reference its design document property
- Tag format: `Feature: client-v2-field-audit, Property {number}: {property_text}`

**Example Property Test Structure**:

```typescript
import fc from 'fast-check';

describe('Client Field Transformation', () => {
  // Feature: client-v2-field-audit, Property 1: Field Transformation Round-Trip
  it('should preserve field names and values through round-trip transformation', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 2 }),
          contactEmail: fc.emailAddress(),
          status: fc.constantFrom('active', 'inactive'),
          clientCode: fc.option(fc.string()),
          clientRegion: fc.option(fc.string()),
          // ... other fields
        }),
        (clientData) => {
          const dbFormat = mapClientFieldsToDatabase(clientData);
          const frontendFormat = mapClientFieldsFromDatabase(dbFormat);
          
          // All original fields should be present with same values
          expect(frontendFormat).toEqual(clientData);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Coverage

Unit tests should cover:

1. **Field Mapping**:
   - Test each special case field (id, name, contactEmail, status, technologyOwner, etc.)
   - Test standard fields with client_ prefix
   - Test unknown field handling

2. **Validation**:
   - Valid email formats (user@domain.com, user+tag@domain.co.uk)
   - Invalid email formats (no @, no domain, no TLD)
   - Valid phone formats (123-456-7890, (123) 456-7890, +1-123-456-7890)
   - Invalid phone formats (letters, too short, invalid characters)
   - Valid URLs (http://example.com, https://example.com/path)
   - Invalid URLs (no protocol, invalid domain)

3. **CRUD Operations**:
   - Create client with all fields
   - Create client with only required fields
   - Update client with partial data
   - Retrieve client and verify all fields
   - Error handling for missing required fields

4. **Form Behavior**:
   - Tab navigation preserves form state
   - Validation triggers on blur and submit
   - Error messages display correctly
   - Submit button enables/disables based on validation

### Integration Tests

Integration tests should verify:
- End-to-end client creation flow
- End-to-end client update flow
- Database constraints are enforced
- API responses match expected format
- Error responses are properly formatted

