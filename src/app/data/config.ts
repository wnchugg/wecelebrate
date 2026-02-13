export interface CompanyConfig {
  companyName: string;
  brandColor: string;
  validationMethod: 'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'none';
  defaultSiteId?: string; // Site ID to use for validation (in production, get from subdomain/path)
  allowedDomains?: string[]; // For email domain validation
  employeeList?: string[]; // For email list validation
  employeeIds?: string[]; // For employee ID validation
  serialCards?: string[]; // For serial card validation
  shippingMethod: 'company' | 'employee'; // company = ship to company address, employee = allow employee to choose address
  companyAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  allowQuantitySelection: boolean; // Allow users to select quantity
  maxQuantity?: number; // Maximum quantity per gift (default: 1)
  // International settings
  defaultCurrency: string; // e.g., 'USD', 'EUR', 'GBP'
  allowedCountries: string[]; // ISO country codes, empty array = all countries
  defaultCountry: string; // ISO country code
}

// Demo configuration - in production this would come from an API or admin panel
export const companyConfig: CompanyConfig = {
  companyName: 'HALO',
  brandColor: '#FF6B35', // HALO orange
  validationMethod: 'email', // Can be changed to 'employeeId', 'serialCard', 'magic_link', or 'none'
  defaultSiteId: '', // Will be set by admin - leave empty for demo
  allowedDomains: ['company.com', 'example.com'],
  employeeList: [
    'john.doe@company.com',
    'jane.smith@company.com',
    'demo@company.com',
  ],
  employeeIds: ['EMP001', 'EMP002', 'EMP003'],
  serialCards: ['CARD-ABC-123', 'CARD-DEF-456', 'CARD-GHI-789'],
  shippingMethod: 'employee', // Change to 'company' to ship all gifts to company address
  companyAddress: {
    street: '123 Corporate Plaza, Suite 500',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States',
  },
  allowQuantitySelection: true, // Set to false to disable quantity selection
  maxQuantity: 10, // Maximum quantity allowed per gift
  // International settings
  defaultCurrency: 'USD',
  allowedCountries: [], // Empty array = all countries allowed
  defaultCountry: 'US',
};

// Validation functions
export function validateEmail(email: string, config: CompanyConfig): boolean {
  if (!email) return false;
  
  // Check employee list first
  if (config.employeeList && config.employeeList.length > 0) {
    return config.employeeList.includes(email.toLowerCase());
  }
  
  // Check domain
  if (config.allowedDomains && config.allowedDomains.length > 0) {
    const domain = email.split('@')[1]?.toLowerCase();
    return config.allowedDomains.includes(domain);
  }
  
  return false;
}

export function validateEmployeeId(employeeId: string, config: CompanyConfig): boolean {
  if (!employeeId || !config.employeeIds) return false;
  return config.employeeIds.includes(employeeId.toUpperCase());
}

export function validateSerialCard(serialCard: string, config: CompanyConfig): boolean {
  if (!serialCard || !config.serialCards) return false;
  return config.serialCards.includes(serialCard.toUpperCase());
}