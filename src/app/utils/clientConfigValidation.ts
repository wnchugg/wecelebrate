/**
 * Client Configuration Validation Utilities
 * Provides comprehensive validation for all client configuration fields
 * 
 * Created: February 12, 2026
 * Version: 1.0
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
  warnings: string[];
}

export interface ClientConfigData {
  // Basic Info
  clientName: string;
  description?: string;
  isActive: boolean;
  
  // Client Settings
  clientCode?: string;
  clientRegion?: string;
  clientSourceCode?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  taxId?: string;
  
  // Client Address
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  postalCode?: string;
  countryState?: string;
  country?: string;
  
  // Account Settings
  accountManager?: string;
  accountManagerEmail?: string;
  implementationManager?: string;
  implementationManagerEmail?: string;
  technologyOwner?: string;
  technologyOwnerEmail?: string;
  
  // Client App Settings
  clientUrl?: string;
  allowSessionTimeoutExtend?: boolean;
  authenticationMethod?: string;
  customUrl?: string;
  hasEmployeeData?: boolean;
  
  // Client Billing Settings
  invoiceType?: string;
  invoiceTemplateType?: string;
  poType?: string;
  poNumber?: string;
  
  // Client Integrations
  erpSystem?: string;
  sso?: string;
  hrisSystem?: string;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validates phone number format (international)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  // Allow common phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
  const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
}

/**
 * Validates alphanumeric code (with hyphens/underscores)
 */
export function isValidCode(code: string): boolean {
  if (!code) return false;
  return /^[a-zA-Z0-9\-_]+$/.test(code);
}

/**
 * Main validation function for client configuration
 */
export function validateClientConfiguration(data: ClientConfigData): ValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  const warnings: string[] = [];
  
  // ========== CRITICAL VALIDATIONS ==========
  
  // 1. Client Name (REQUIRED)
  if (!data.clientName?.trim()) {
    errors.push('Client name is required');
    fieldErrors.clientName = 'This field is required';
  } else if (data.clientName.length < 2) {
    errors.push('Client name must be at least 2 characters');
    fieldErrors.clientName = 'Minimum 2 characters required';
  } else if (data.clientName.length > 100) {
    errors.push('Client name must not exceed 100 characters');
    fieldErrors.clientName = 'Maximum 100 characters allowed';
  } else if (!/^[a-zA-Z0-9\s\-_&.']+$/.test(data.clientName)) {
    errors.push('Client name contains invalid characters');
    fieldErrors.clientName = 'Only letters, numbers, spaces, and basic punctuation allowed';
  }
  
  // ========== CLIENT SETTINGS VALIDATIONS ==========
  
  // 2. Client Code (Optional but must be valid if provided)
  if (data.clientCode && data.clientCode.trim()) {
    if (!isValidCode(data.clientCode)) {
      errors.push('Client code can only contain letters, numbers, hyphens, and underscores');
      fieldErrors.clientCode = 'Invalid format (alphanumeric, hyphens, underscores only)';
    } else if (data.clientCode.length > 50) {
      errors.push('Client code must not exceed 50 characters');
      fieldErrors.clientCode = 'Maximum 50 characters';
    }
  }
  
  // 3. Client Source Code
  if (data.clientSourceCode && data.clientSourceCode.trim()) {
    if (!isValidCode(data.clientSourceCode)) {
      errors.push('Client source code can only contain letters, numbers, hyphens, and underscores');
      fieldErrors.clientSourceCode = 'Invalid format';
    } else if (data.clientSourceCode.length > 50) {
      errors.push('Client source code must not exceed 50 characters');
      fieldErrors.clientSourceCode = 'Maximum 50 characters';
    }
  }
  
  // 4. Contact Email
  if (data.contactEmail && data.contactEmail.trim()) {
    if (!isValidEmail(data.contactEmail)) {
      errors.push('Contact email is invalid');
      fieldErrors.contactEmail = 'Invalid email format (e.g., user@example.com)';
    }
  }
  
  // 5. Contact Phone
  if (data.contactPhone && data.contactPhone.trim()) {
    if (!isValidPhone(data.contactPhone)) {
      errors.push('Contact phone number is invalid');
      fieldErrors.contactPhone = 'Invalid phone format or too short';
    }
  }
  
  // 6. Tax ID (basic validation)
  if (data.taxId && data.taxId.trim()) {
    if (data.taxId.length > 50) {
      errors.push('Tax ID must not exceed 50 characters');
      fieldErrors.taxId = 'Maximum 50 characters';
    }
  }
  
  // ========== ADDRESS VALIDATIONS ==========
  
  // 7. Postal Code (if provided)
  if (data.postalCode && data.postalCode.trim()) {
    if (data.postalCode.length > 20) {
      errors.push('Postal code must not exceed 20 characters');
      fieldErrors.postalCode = 'Maximum 20 characters';
    }
  }
  
  // 8. Country (2-letter code if provided)
  if (data.country && data.country.trim()) {
    if (data.country.length === 2 && !/^[A-Z]{2}$/.test(data.country)) {
      warnings.push('Country code should be uppercase (e.g., US, CA, GB)');
    }
  }
  
  // ========== ACCOUNT TEAM VALIDATIONS ==========
  
  // 9. Account Manager Email
  if (data.accountManagerEmail && data.accountManagerEmail.trim()) {
    if (!isValidEmail(data.accountManagerEmail)) {
      errors.push('Account manager email is invalid');
      fieldErrors.accountManagerEmail = 'Invalid email format';
    }
  }
  
  // 10. Implementation Manager Email
  if (data.implementationManagerEmail && data.implementationManagerEmail.trim()) {
    if (!isValidEmail(data.implementationManagerEmail)) {
      errors.push('Implementation manager email is invalid');
      fieldErrors.implementationManagerEmail = 'Invalid email format';
    }
  }
  
  // 11. Technology Owner Email
  if (data.technologyOwnerEmail && data.technologyOwnerEmail.trim()) {
    if (!isValidEmail(data.technologyOwnerEmail)) {
      errors.push('Technology owner email is invalid');
      fieldErrors.technologyOwnerEmail = 'Invalid email format';
    }
  }
  
  // Warn if manager name is provided but email is missing
  if (data.accountManager && data.accountManager.trim() && !data.accountManagerEmail) {
    warnings.push('Account manager name is set but email is missing');
  }
  
  if (data.implementationManager && data.implementationManager.trim() && !data.implementationManagerEmail) {
    warnings.push('Implementation manager name is set but email is missing');
  }
  
  if (data.technologyOwner && data.technologyOwner.trim() && !data.technologyOwnerEmail) {
    warnings.push('Technology owner name is set but email is missing');
  }
  
  // ========== APP SETTINGS VALIDATIONS ==========
  
  // 12. Client URL
  if (data.clientUrl && data.clientUrl.trim()) {
    if (!isValidUrl(data.clientUrl)) {
      errors.push('Client URL must be a valid URL');
      fieldErrors.clientUrl = 'Invalid URL format (e.g., https://example.com)';
    } else if (data.clientUrl.length > 255) {
      errors.push('Client URL must not exceed 255 characters');
      fieldErrors.clientUrl = 'URL too long';
    }
  }
  
  // 13. Custom URL
  if (data.customUrl && data.customUrl.trim()) {
    if (!isValidUrl(data.customUrl)) {
      errors.push('Custom URL must be a valid URL');
      fieldErrors.customUrl = 'Invalid URL format';
    } else if (data.customUrl.length > 255) {
      errors.push('Custom URL must not exceed 255 characters');
      fieldErrors.customUrl = 'URL too long';
    }
  }
  
  // 14. Authentication Method
  const validAuthMethods = ['password', 'sso', 'saml', 'oauth', 'ldap', 'custom'];
  if (data.authenticationMethod && data.authenticationMethod.trim()) {
    if (!validAuthMethods.includes(data.authenticationMethod.toLowerCase())) {
      warnings.push(`Authentication method "${data.authenticationMethod}" is not standard. Verify it's supported.`);
    }
  }
  
  // ========== BILLING VALIDATIONS ==========
  
  // 15. PO Number (if provided)
  if (data.poNumber && data.poNumber.trim()) {
    if (data.poNumber.length > 100) {
      errors.push('PO number must not exceed 100 characters');
      fieldErrors.poNumber = 'Maximum 100 characters';
    }
  }
  
  // Warn if PO Type is set but PO Number is missing
  if (data.poType && data.poType.trim() && !data.poNumber) {
    warnings.push('PO type is set but PO number is missing');
  }
  
  // ========== INTEGRATION VALIDATIONS ==========
  
  // 16. ERP System
  const validErpSystems = ['NAJ', 'Fourgen', 'Netsuite', 'GRS', 'SAP', 'Oracle', 'Manual', 'None'];
  if (data.erpSystem && data.erpSystem.trim()) {
    if (!validErpSystems.includes(data.erpSystem)) {
      warnings.push(`ERP system "${data.erpSystem}" is not in the standard list: ${validErpSystems.join(', ')}`);
    }
  }
  
  // 17. SSO Configuration
  const validSsoProviders = ['Google', 'Microsoft', 'Okta', 'Azure', 'SAML', 'OAuth2', 'Custom', 'None'];
  if (data.sso && data.sso.trim()) {
    if (!validSsoProviders.includes(data.sso)) {
      warnings.push(`SSO provider "${data.sso}" is not in the standard list: ${validSsoProviders.join(', ')}`);
    }
  }
  
  // 18. HRIS System
  const validHrisSystems = ['Workday', 'ADP', 'BambooHR', 'SAP SuccessFactors', 'Oracle HCM', 'Namely', 'Custom', 'None'];
  if (data.hrisSystem && data.hrisSystem.trim()) {
    if (!validHrisSystems.includes(data.hrisSystem)) {
      warnings.push(`HRIS system "${data.hrisSystem}" is not in the standard list`);
    }
  }
  
  // ========== TEXT LENGTH VALIDATIONS ==========
  
  if (data.description && data.description.length > 500) {
    errors.push('Description must not exceed 500 characters');
    fieldErrors.description = 'Maximum 500 characters';
  }
  
  if (data.contactName && data.contactName.length > 100) {
    errors.push('Contact name must not exceed 100 characters');
    fieldErrors.contactName = 'Maximum 100 characters';
  }
  
  if (data.addressLine1 && data.addressLine1.length > 100) {
    errors.push('Address line 1 must not exceed 100 characters');
    fieldErrors.addressLine1 = 'Maximum 100 characters';
  }
  
  if (data.addressLine2 && data.addressLine2.length > 100) {
    errors.push('Address line 2 must not exceed 100 characters');
    fieldErrors.addressLine2 = 'Maximum 100 characters';
  }
  
  if (data.addressLine3 && data.addressLine3.length > 100) {
    errors.push('Address line 3 must not exceed 100 characters');
    fieldErrors.addressLine3 = 'Maximum 100 characters';
  }
  
  if (data.city && data.city.length > 100) {
    errors.push('City must not exceed 100 characters');
    fieldErrors.city = 'Maximum 100 characters';
  }
  
  if (data.countryState && data.countryState.length > 100) {
    errors.push('State/Province must not exceed 100 characters');
    fieldErrors.countryState = 'Maximum 100 characters';
  }
  
  return {
    valid: errors.length === 0,
    errors,
    fieldErrors,
    warnings
  };
}

/**
 * Quick validation for individual fields (for real-time feedback)
 */
export function validateField(fieldName: string, value: any): string | null {
  switch (fieldName) {
    case 'clientName':
      if (!value?.trim()) return 'Required';
      if (value.length < 2) return 'Minimum 2 characters';
      if (value.length > 100) return 'Maximum 100 characters';
      if (!/^[a-zA-Z0-9\s\-_&.']+$/.test(value)) return 'Invalid characters';
      return null;
      
    case 'clientCode':
    case 'clientSourceCode':
      if (value && value.trim()) {
        if (!isValidCode(value)) return 'Alphanumeric, hyphens, underscores only';
        if (value.length > 50) return 'Maximum 50 characters';
      }
      return null;
      
    case 'contactEmail':
    case 'accountManagerEmail':
    case 'implementationManagerEmail':
    case 'technologyOwnerEmail':
      if (value && value.trim() && !isValidEmail(value)) {
        return 'Invalid email format';
      }
      return null;
      
    case 'contactPhone':
      if (value && value.trim() && !isValidPhone(value)) {
        return 'Invalid phone format';
      }
      return null;
      
    case 'clientUrl':
    case 'customUrl':
      if (value && value.trim()) {
        if (!isValidUrl(value)) return 'Invalid URL format';
        if (value.length > 255) return 'URL too long';
      }
      return null;
      
    case 'description':
      if (value && value.length > 500) return 'Maximum 500 characters';
      return null;
      
    default:
      return null;
  }
}
