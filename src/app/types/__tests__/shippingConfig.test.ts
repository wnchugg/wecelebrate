/**
 * Shipping Config Types Tests
 * Day 9 - Week 2: Type Testing
 * Target: 8 tests
 */

import { describe, it, expect } from 'vitest';
import {
  ShippingPageConfiguration,
  CustomShippingField,
  CompanyAddress,
  StoreLocation,
  defaultShippingConfig,
  exampleCustomFields,
  ShippingMode,
  CustomFieldType,
  AddressValidationService,
} from '../shippingConfig';

describe('Shipping Config Types', () => {
  describe('defaultShippingConfig', () => {
    it('should export default configuration', () => {
      expect(defaultShippingConfig).toBeDefined();
      expect(defaultShippingConfig).toHaveProperty('shippingModes');
      expect(defaultShippingConfig).toHaveProperty('standardFields');
      expect(defaultShippingConfig).toHaveProperty('pageSettings');
    });

    it('should have employee mode enabled by default', () => {
      expect(defaultShippingConfig.shippingModes.employee.enabled).toBe(true);
    });

    it('should have all standard fields defined', () => {
      const fields = [
        'fullName',
        'addressLine1',
        'addressLine2',
        'city',
        'state',
        'zipCode',
        'country',
        'phoneNumber',
        'deliveryInstructions',
      ];
      
      fields.forEach(field => {
        expect(defaultShippingConfig.standardFields).toHaveProperty(field);
        expect((defaultShippingConfig.standardFields as Record<string, any>)[field]).toHaveProperty('enabled');
        expect((defaultShippingConfig.standardFields as Record<string, any>)[field]).toHaveProperty('required');
      });
    });

    it('should have page settings configured', () => {
      expect(defaultShippingConfig.pageSettings.showPageTitle).toBe(true);
      expect(defaultShippingConfig.pageSettings.pageTitle).toBeDefined();
    });

    it('should have address validation disabled by default', () => {
      expect(defaultShippingConfig.addressValidation.enabled).toBe(false);
      expect(defaultShippingConfig.addressValidation.service).toBe('none');
    });
  });

  describe('exampleCustomFields', () => {
    it('should export example custom fields', () => {
      expect(exampleCustomFields).toBeDefined();
      expect(Array.isArray(exampleCustomFields)).toBe(true);
      expect(exampleCustomFields.length).toBeGreaterThan(0);
    });

    it('should have valid field structure', () => {
      exampleCustomFields.forEach(field => {
        expect(field).toHaveProperty('id');
        expect(field).toHaveProperty('fieldName');
        expect(field).toHaveProperty('fieldLabel');
        expect(field).toHaveProperty('fieldType');
        expect(field).toHaveProperty('required');
        expect(field).toHaveProperty('enabled');
        expect(field).toHaveProperty('order');
        expect(field).toHaveProperty('category');
      });
    });

    it('should include different field types', () => {
      const fieldTypes = new Set(exampleCustomFields.map(f => f.fieldType));
      expect(fieldTypes.size).toBeGreaterThan(1);
      expect(fieldTypes).toContain('text');
      expect(fieldTypes).toContain('select');
    });

    it('should have unique field IDs', () => {
      const ids = exampleCustomFields.map(f => f.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should include fields from different categories', () => {
      const categories = new Set(exampleCustomFields.map(f => f.category));
      expect(categories.size).toBeGreaterThan(1);
    });
  });

  describe('CustomShippingField Type', () => {
    it('should accept valid custom field object', () => {
      const field: CustomShippingField = {
        id: 'field-1',
        fieldName: 'department',
        fieldLabel: 'Department',
        fieldType: 'select',
        required: false,
        enabled: true,
        order: 1,
        category: 'distribution',
        options: ['Sales', 'Marketing', 'Engineering'],
      };
      
      expect(field.fieldType).toBe('select');
      expect(field.options).toBeDefined();
    });

    it('should accept field with validation', () => {
      const field: CustomShippingField = {
        id: 'field-1',
        fieldName: 'message',
        fieldLabel: 'Message',
        fieldType: 'textarea',
        required: false,
        enabled: true,
        order: 1,
        category: 'preferences',
        validation: {
          maxLength: 500,
          errorMessage: 'Too long',
        },
      };
      
      expect(field.validation).toBeDefined();
      expect(field.validation?.maxLength).toBe(500);
    });
  });

  describe('CompanyAddress Type', () => {
    it('should accept valid company address', () => {
      const address: CompanyAddress = {
        companyName: 'TechCorp Inc.',
        addressLine1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
      };
      
      expect(address.companyName).toBe('TechCorp Inc.');
    });

    it('should accept optional properties', () => {
      const address: CompanyAddress = {
        companyName: 'TechCorp Inc.',
        addressLine1: '123 Main St',
        addressLine2: 'Suite 200',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        phoneNumber: '555-1234',
        contactPerson: 'John Doe',
        contactEmail: 'john@example.com',
        deliveryInstructions: 'Use back entrance',
      };
      
      expect(address.contactPerson).toBeDefined();
      expect(address.deliveryInstructions).toBeDefined();
    });
  });

  describe('StoreLocation Type', () => {
    it('should accept valid store location', () => {
      const store: StoreLocation = {
        id: 'store-1',
        storeName: 'Downtown Store',
        addressLine1: '456 Market St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        country: 'USA',
        enabled: true,
      };
      
      expect(store.id).toBe('store-1');
      expect(store.enabled).toBe(true);
    });

    it('should accept optional store properties', () => {
      const store: StoreLocation = {
        id: 'store-1',
        storeName: 'Downtown Store',
        storeCode: 'SF-001',
        addressLine1: '456 Market St',
        addressLine2: 'Floor 2',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        country: 'USA',
        phoneNumber: '555-5678',
        email: 'store@example.com',
        storeHours: '9AM-6PM Mon-Fri',
        specialInstructions: 'Ring bell for pickup',
        enabled: true,
      };
      
      expect(store.storeCode).toBeDefined();
      expect(store.storeHours).toBeDefined();
    });
  });

  describe('ShippingPageConfiguration Type', () => {
    it('should accept complete configuration', () => {
      const config: ShippingPageConfiguration = {
        id: 'config-1',
        siteId: 'site-1',
        shippingModes: defaultShippingConfig.shippingModes,
        defaultShippingMode: 'employee',
        standardFields: defaultShippingConfig.standardFields,
        customFields: [],
        pageSettings: defaultShippingConfig.pageSettings,
        addressValidation: defaultShippingConfig.addressValidation,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      
      expect(config.siteId).toBe('site-1');
      expect(config.defaultShippingMode).toBe('employee');
    });

    it('should accept all shipping modes', () => {
      const validModes: ShippingMode[] = ['employee', 'company', 'store'];
      
      validModes.forEach(mode => {
        const config: Partial<ShippingPageConfiguration> = {
          defaultShippingMode: mode,
        };
        expect(config.defaultShippingMode).toBe(mode);
      });
    });

    it('should accept all validation services', () => {
      const services: AddressValidationService[] = ['none', 'usps', 'smarty', 'google'];
      
      services.forEach(service => {
        const config: Partial<ShippingPageConfiguration> = {
          addressValidation: {
            enabled: true,
            service,
            requireValidation: false,
            allowOverride: true,
          },
        };
        expect(config.addressValidation?.service).toBe(service);
      });
    });

    it('should accept all custom field types', () => {
      const fieldTypes: CustomFieldType[] = [
        'text',
        'textarea',
        'number',
        'email',
        'phone',
        'select',
        'checkbox',
        'date',
      ];
      
      fieldTypes.forEach(fieldType => {
        const field: CustomShippingField = {
          id: `field-${fieldType}`,
          fieldName: fieldType,
          fieldLabel: fieldType,
          fieldType,
          required: false,
          enabled: true,
          order: 1,
          category: 'other',
        };
        expect(field.fieldType).toBe(fieldType);
      });
    });
  });
});
