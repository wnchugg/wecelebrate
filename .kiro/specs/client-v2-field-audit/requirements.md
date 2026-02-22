# Requirements Document: Client V2 Field Audit

## Introduction

This feature addresses the field mismatch between the frontend Client form and the database schema after V2 API migration. The database schema contains 40+ client fields across multiple categories (basic info, contact, address, account management, billing, integrations), but the frontend form only exposes 5 basic fields. This creates an incomplete user experience and prevents users from managing critical client data through the UI.

The system must provide a complete, organized interface for managing all client fields while ensuring proper field name transformation between frontend camelCase and database snake_case with the "client_" prefix.

## Glossary

- **Client_Entity**: The database table and associated data structures representing client organizations
- **Frontend_Form**: The React component (ClientManagement.tsx) that provides the UI for creating and editing clients
- **Field_Mapping**: The transformation logic that converts field names between frontend camelCase and database snake_case with "client_" prefix
- **API_Types**: TypeScript interfaces that define the shape of data exchanged between frontend and backend
- **Database_Schema**: The PostgreSQL table definition in schema.sql that defines all client columns
- **Transformation_Helper**: Backend utility functions (objectToSnakeCase/objectToCamelCase) that convert field naming conventions
- **Client_Prefix**: The "client_" prefix used on most database columns to namespace client-specific fields

## Requirements

### Requirement 1: Complete Field Mapping

**User Story:** As a developer, I want a complete mapping between frontend field names and database column names, so that I can ensure all fields are properly transformed during API operations.

#### Acceptance Criteria

1. THE System SHALL maintain a documented mapping of all frontend camelCase field names to their corresponding database snake_case column names with "client_" prefix
2. WHEN a field name does not follow the standard "client_" prefix pattern, THE System SHALL document the exception explicitly
3. THE System SHALL identify all fields present in the database schema but missing from the frontend interface
4. THE System SHALL identify all fields present in the frontend interface but missing from the database schema
5. THE System SHALL validate that the field mapping covers all 40+ database columns in the clients table

### Requirement 2: Frontend Type Definitions

**User Story:** As a frontend developer, I want complete TypeScript interfaces for the Client entity, so that I have type safety when working with client data.

#### Acceptance Criteria

1. THE Frontend_API_Types SHALL include all client fields from the database schema in camelCase format
2. THE Frontend_API_Types SHALL mark required fields as non-optional and optional fields as optional
3. THE Frontend_API_Types SHALL use appropriate TypeScript types for each field (string, boolean, Date, etc.)
4. WHEN a field represents an email address, THE Frontend_API_Types SHALL use string type with validation
5. WHEN a field represents a phone number, THE Frontend_API_Types SHALL use string type with validation
6. THE Frontend_API_Types SHALL include JSDoc comments describing the purpose of each field

### Requirement 3: Organized Form Interface

**User Story:** As an administrator, I want the client form organized into logical sections, so that I can efficiently manage 40+ client fields without being overwhelmed.

#### Acceptance Criteria

1. THE Frontend_Form SHALL organize fields into logical sections: Basic Info, Contact, Address, Account Management, Billing, and Integrations
2. WHEN the form contains more than 15 fields, THE Frontend_Form SHALL use tabs or accordion sections to group related fields
3. THE Frontend_Form SHALL display required fields with visual indicators (asterisks or labels)
4. THE Frontend_Form SHALL display optional fields without required indicators
5. WHEN a user navigates between sections, THE Frontend_Form SHALL preserve entered data in all sections
6. THE Frontend_Form SHALL provide clear section labels that describe the category of fields contained within

### Requirement 4: Field Validation

**User Story:** As an administrator, I want field validation on the client form, so that I can catch data entry errors before submitting.

#### Acceptance Criteria

1. WHEN a required field is empty, THE Frontend_Form SHALL prevent form submission and display an error message
2. WHEN an email field contains invalid format, THE Frontend_Form SHALL display a validation error
3. WHEN a phone field contains invalid format, THE Frontend_Form SHALL display a validation error
4. WHEN a URL field contains invalid format, THE Frontend_Form SHALL display a validation error
5. THE Frontend_Form SHALL validate field length constraints match database column definitions
6. THE Frontend_Form SHALL display validation errors inline near the relevant field
7. WHEN all validation passes, THE Frontend_Form SHALL enable the submit button

### Requirement 5: Backend Field Transformation

**User Story:** As a backend developer, I want automatic field name transformation between frontend and database formats, so that API operations handle all client fields correctly.

#### Acceptance Criteria

1. WHEN the backend receives client data from the frontend, THE Transformation_Helper SHALL convert camelCase field names to snake_case with "client_" prefix
2. WHEN the backend sends client data to the frontend, THE Transformation_Helper SHALL convert snake_case fields with "client_" prefix to camelCase
3. THE Transformation_Helper SHALL handle fields without "client_" prefix (id, name, status, created_at, updated_at) as special cases
4. WHEN a field name transformation fails, THE Transformation_Helper SHALL log the error and include the field name
5. THE Transformation_Helper SHALL preserve field values during transformation without data loss
6. THE Transformation_Helper SHALL handle null and undefined values correctly during transformation

### Requirement 6: Create Client Operations

**User Story:** As an administrator, I want to create new clients with all available fields, so that I can capture complete client information from the start.

#### Acceptance Criteria

1. WHEN a user submits the create client form, THE System SHALL send all populated fields to the backend API
2. WHEN the backend receives create client data, THE System SHALL transform field names and insert all fields into the database
3. WHEN a required field is missing, THE System SHALL return a validation error with the field name
4. WHEN the client is created successfully, THE System SHALL return the complete client object with all fields
5. THE System SHALL assign default values to optional fields when not provided (e.g., status defaults to 'active')
6. WHEN the database insert fails, THE System SHALL return a descriptive error message

### Requirement 7: Update Client Operations

**User Story:** As an administrator, I want to update existing clients with all available fields, so that I can maintain accurate client information over time.

#### Acceptance Criteria

1. WHEN a user opens the edit client form, THE System SHALL load and display all existing field values
2. WHEN a user modifies any field and submits, THE System SHALL send only changed fields to the backend API
3. WHEN the backend receives update client data, THE System SHALL transform field names and update the database
4. WHEN an update operation completes, THE System SHALL return the updated client object with all current field values
5. THE System SHALL preserve unchanged fields during partial updates
6. WHEN the database update fails, THE System SHALL return a descriptive error message

### Requirement 8: Read Client Operations

**User Story:** As an administrator, I want to view complete client information, so that I can see all stored data for any client.

#### Acceptance Criteria

1. WHEN a user requests client details, THE System SHALL retrieve all client fields from the database
2. WHEN the backend returns client data, THE System SHALL transform all field names from snake_case to camelCase
3. THE Frontend_Form SHALL display all retrieved fields in their appropriate sections
4. WHEN a field has no value, THE Frontend_Form SHALL display an empty input or placeholder
5. THE System SHALL handle null values and display them appropriately in the UI

### Requirement 9: Field Organization by Category

**User Story:** As a product manager, I want client fields organized by business function, so that users can quickly find and update relevant information.

#### Acceptance Criteria

1. THE System SHALL group Basic Info fields: name, clientCode, clientRegion, clientSourceCode, status
2. THE System SHALL group Contact fields: contactEmail, clientContactName, clientContactPhone, clientTaxId
3. THE System SHALL group Address fields: clientAddressLine1, clientAddressLine2, clientAddressLine3, clientCity, clientPostalCode, clientCountryState, clientCountry
4. THE System SHALL group Account Management fields: clientAccountManager, clientAccountManagerEmail, clientImplementationManager, clientImplementationManagerEmail, technologyOwner, technologyOwnerEmail
5. THE System SHALL group App Settings fields: clientUrl, clientAllowSessionTimeoutExtend, clientAuthenticationMethod, clientCustomUrl, clientHasEmployeeData
6. THE System SHALL group Billing fields: clientInvoiceType, clientInvoiceTemplateType, clientPoType, clientPoNumber
7. THE System SHALL group Integration fields: clientErpSystem, clientSso, clientHrisSystem

### Requirement 10: Backward Compatibility

**User Story:** As a system administrator, I want the updated client management to work with existing client records, so that no data is lost during the migration.

#### Acceptance Criteria

1. WHEN the system loads existing client records, THE System SHALL correctly read all fields regardless of when they were created
2. THE System SHALL handle clients created before the field audit that may have null values in newer fields
3. WHEN updating an old client record, THE System SHALL preserve all existing field values not being modified
4. THE System SHALL not require previously optional fields to be populated when updating existing records
5. THE System SHALL maintain compatibility with any external systems that read client data via API
