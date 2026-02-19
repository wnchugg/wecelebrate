export type CustomFieldType = 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'select' | 'checkbox' | 'date';

export type ShippingMode = 'employee' | 'company' | 'store';

export type AddressValidationService = 'none' | 'usps' | 'smarty' | 'google';

export interface CustomShippingField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: CustomFieldType;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  enabled: boolean;
  options?: string[]; // For select type
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    errorMessage?: string;
  };
  order: number; // For sorting fields
  // Field purpose/category
  category: 'invoicing' | 'distribution' | 'preferences' | 'other';
}

export interface CompanyAddress {
  companyName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  contactPerson?: string;
  contactEmail?: string;
  deliveryInstructions?: string;
}

export interface StoreLocation {
  id: string;
  storeName: string;
  storeCode?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  storeHours?: string;
  specialInstructions?: string;
  enabled: boolean;
}

export interface ShippingModeConfig {
  employee: {
    enabled: boolean;
    label?: string;
    description?: string;
  };
  company: {
    enabled: boolean;
    label?: string;
    description?: string;
    address?: CompanyAddress;
  };
  store: {
    enabled: boolean;
    label?: string;
    description?: string;
    stores: StoreLocation[];
    allowMultipleSelections?: boolean;
    requireStoreSelection: boolean;
    groupByState: boolean;
    customFields: CustomShippingField[]; // Custom fields for store pickup mode
  };
}

export interface ShippingPageConfiguration {
  id: string;
  siteId: string;
  // Shipping mode settings
  shippingModes: ShippingModeConfig;
  defaultShippingMode?: ShippingMode;
  // Standard field configuration (for employee mode)
  standardFields: {
    fullName: { enabled: boolean; required: boolean; label?: string };
    addressLine1: { enabled: boolean; required: boolean; label?: string };
    addressLine2: { enabled: boolean; required: boolean; label?: string };
    city: { enabled: boolean; required: boolean; label?: string };
    state: { enabled: boolean; required: boolean; label?: string };
    zipCode: { enabled: boolean; required: boolean; label?: string };
    country: { enabled: boolean; required: boolean; label?: string };
    phoneNumber: { enabled: boolean; required: boolean; label?: string };
    deliveryInstructions: { enabled: boolean; required: boolean; label?: string };
  };
  // Custom fields (for employee mode)
  customFields: CustomShippingField[];
  // Page settings
  pageSettings: {
    showPageTitle: boolean;
    pageTitle?: string;
    showPageDescription: boolean;
    pageDescription?: string;
    allowPOBox: boolean;
    requirePhoneNumber: boolean;
    allowInternational: boolean;
  };
  // Address validation settings
  addressValidation: {
    enabled: boolean;
    service: AddressValidationService;
    requireValidation: boolean;
    allowOverride: boolean;
    enableAutocomplete?: boolean; // Enable address autocomplete suggestions
  };
  createdAt: string;
  updatedAt: string;
}

export const defaultShippingConfig: Omit<ShippingPageConfiguration, 'id' | 'siteId' | 'createdAt' | 'updatedAt'> = {
  shippingModes: {
    employee: {
      enabled: true,
      label: 'Ship to My Address',
      description: 'Enter your personal shipping address',
    },
    company: {
      enabled: false,
      label: 'Ship to Company',
      description: 'Ship to our company headquarters',
    },
    store: {
      enabled: false,
      label: 'Ship to Store',
      description: 'Select a store location for pickup',
      stores: [],
      requireStoreSelection: true,
      groupByState: false,
      customFields: [],
    },
  },
  defaultShippingMode: 'employee',
  standardFields: {
    fullName: { enabled: true, required: true, label: 'Full Name' },
    addressLine1: { enabled: true, required: true, label: 'Address Line 1' },
    addressLine2: { enabled: true, required: false, label: 'Address Line 2 (Optional)' },
    city: { enabled: true, required: true, label: 'City' },
    state: { enabled: true, required: true, label: 'State / Province' },
    zipCode: { enabled: true, required: true, label: 'Postal / ZIP Code' },
    country: { enabled: true, required: true, label: 'Country' },
    phoneNumber: { enabled: true, required: false, label: 'Phone Number (Optional)' },
    deliveryInstructions: { enabled: true, required: false, label: 'Delivery Instructions (Optional)' },
  },
  customFields: [],
  pageSettings: {
    showPageTitle: true,
    pageTitle: 'Shipping Information',
    showPageDescription: true,
    pageDescription: 'Please provide your shipping address details.',
    allowPOBox: true,
    requirePhoneNumber: false,
    allowInternational: true,
  },
  addressValidation: {
    enabled: false,
    service: 'none',
    requireValidation: false,
    allowOverride: false,
    enableAutocomplete: true, // Default to enabled
  },
};

// Example custom fields
export const exampleCustomFields: CustomShippingField[] = [
  {
    id: 'custom-1',
    fieldName: 'company_name',
    fieldLabel: 'Company Name',
    fieldType: 'text',
    placeholder: 'Enter your company name',
    helpText: 'Required for invoicing purposes',
    required: true,
    enabled: true,
    order: 1,
    category: 'invoicing',
  },
  {
    id: 'custom-2',
    fieldName: 'tax_id',
    fieldLabel: 'Tax ID / VAT Number',
    fieldType: 'text',
    placeholder: 'XX-XXXXXXX',
    helpText: 'For international orders and tax purposes',
    required: false,
    enabled: true,
    order: 2,
    category: 'invoicing',
  },
  {
    id: 'custom-3',
    fieldName: 'department',
    fieldLabel: 'Department',
    fieldType: 'select',
    options: ['Sales', 'Marketing', 'Engineering', 'Operations', 'Other'],
    helpText: 'For internal distribution tracking',
    required: false,
    enabled: true,
    order: 3,
    category: 'distribution',
  },
  {
    id: 'custom-4',
    fieldName: 'preferred_delivery_time',
    fieldLabel: 'Preferred Delivery Time',
    fieldType: 'select',
    options: ['Morning (8AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-8PM)', 'Any Time'],
    required: false,
    enabled: true,
    order: 4,
    category: 'preferences',
  },
  {
    id: 'custom-5',
    fieldName: 'gift_message',
    fieldLabel: 'Gift Message',
    fieldType: 'textarea',
    placeholder: 'Add a personal message (optional)',
    helpText: 'This message will be included with your gift',
    required: false,
    enabled: true,
    validation: {
      maxLength: 500,
      errorMessage: 'Message must be 500 characters or less',
    },
    order: 5,
    category: 'preferences',
  },
  {
    id: 'custom-6',
    fieldName: 'building_access_code',
    fieldLabel: 'Building/Gate Access Code',
    fieldType: 'text',
    placeholder: 'Enter access code if applicable',
    helpText: 'Helps delivery personnel access your building',
    required: false,
    enabled: true,
    order: 6,
    category: 'distribution',
  },
  {
    id: 'custom-7',
    fieldName: 'po_number',
    fieldLabel: 'Purchase Order Number',
    fieldType: 'text',
    placeholder: 'PO-XXXX-XXXX',
    helpText: 'For tracking and billing purposes',
    required: false,
    enabled: true,
    order: 7,
    category: 'invoicing',
  },
];