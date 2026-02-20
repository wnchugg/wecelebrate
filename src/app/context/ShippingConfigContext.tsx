import { createContext, useContext, useState, ReactNode } from 'react';
import { ShippingPageConfiguration, CustomShippingField, defaultShippingConfig, StoreLocation, CompanyAddress } from '../types/shippingConfig';

interface ShippingConfigContextType {
  configurations: ShippingPageConfiguration[];
  getConfigBySiteId: (siteId: string) => ShippingPageConfiguration | undefined;
  updateConfig: (siteId: string, updates: Partial<ShippingPageConfiguration>) => void;
  addCustomField: (siteId: string, field: Omit<CustomShippingField, 'id' | 'order'>) => void;
  updateCustomField: (siteId: string, fieldId: string, updates: Partial<CustomShippingField>) => void;
  deleteCustomField: (siteId: string, fieldId: string) => void;
  reorderCustomFields: (siteId: string, fieldIds: string[]) => void;
  // Store custom fields
  addStoreCustomField: (siteId: string, field: Omit<CustomShippingField, 'id' | 'order'>) => void;
  updateStoreCustomField: (siteId: string, fieldId: string, updates: Partial<CustomShippingField>) => void;
  deleteStoreCustomField: (siteId: string, fieldId: string) => void;
  reorderStoreCustomFields: (siteId: string, fieldIds: string[]) => void;
  // Store management
  addStore: (siteId: string, store: Omit<StoreLocation, 'id'>) => void;
  updateStore: (siteId: string, storeId: string, updates: Partial<StoreLocation>) => void;
  deleteStore: (siteId: string, storeId: string) => void;
  // Company address
  updateCompanyAddress: (siteId: string, address: CompanyAddress) => void;
  // Initialize config
  initializeConfig: (siteId: string) => ShippingPageConfiguration;
}

const ShippingConfigContext = createContext<ShippingConfigContextType | undefined>(undefined);

// Demo shipping configurations
const demoConfigurations: ShippingPageConfiguration[] = [
  {
    ...defaultShippingConfig,
    id: 'shipping-config-001',
    siteId: 'site-001',
    customFields: [
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
        fieldName: 'department',
        fieldLabel: 'Department',
        fieldType: 'select',
        options: ['Sales', 'Marketing', 'Engineering', 'Operations', 'Other'],
        helpText: 'For internal distribution tracking',
        required: false,
        enabled: true,
        order: 2,
        category: 'distribution',
      },
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-01T14:30:00Z',
  },
  {
    ...defaultShippingConfig,
    id: 'shipping-config-002',
    siteId: 'site-002',
    customFields: [],
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2026-01-20T11:15:00Z',
  },
];

export function ShippingConfigProvider({ children }: { children: ReactNode }) {
  const [configurations, setConfigurations] = useState<ShippingPageConfiguration[]>(demoConfigurations);

  const getConfigBySiteId = (siteId: string): ShippingPageConfiguration | undefined => {
    return configurations.find(config => config.siteId === siteId);
  };

  const updateConfig = (siteId: string, updates: Partial<ShippingPageConfiguration>) => {
    setConfigurations(prev =>
      prev.map(config =>
        config.siteId === siteId
          ? { ...config, ...updates, updatedAt: new Date().toISOString() }
          : config
      )
    );
  };

  const addCustomField = (siteId: string, field: Omit<CustomShippingField, 'id' | 'order'>) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          const maxOrder = config.customFields.reduce((max, f) => Math.max(max, f.order), 0);
          const newField: CustomShippingField = {
            ...field,
            id: `custom-${Date.now()}`,
            order: maxOrder + 1,
          };
          return {
            ...config,
            customFields: [...config.customFields, newField],
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  const updateCustomField = (siteId: string, fieldId: string, updates: Partial<CustomShippingField>) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          return {
            ...config,
            customFields: config.customFields.map(field =>
              field.id === fieldId ? { ...field, ...updates } : field
            ),
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  const deleteCustomField = (siteId: string, fieldId: string) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          return {
            ...config,
            customFields: config.customFields.filter(field => field.id !== fieldId),
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  const reorderCustomFields = (siteId: string, fieldIds: string[]) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          const reordered = fieldIds.map((id, index) => {
            const field = config.customFields.find(f => f.id === id);
            return field ? { ...field, order: index + 1 } : null;
          }).filter((f): f is CustomShippingField => f !== null);
          
          return {
            ...config,
            customFields: reordered,
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  // Store custom fields
  const addStoreCustomField = (siteId: string, field: Omit<CustomShippingField, 'id' | 'order'>) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          const maxOrder = config.shippingModes.store.customFields.reduce((max, f) => Math.max(max, f.order), 0);
          const newField: CustomShippingField = {
            ...field,
            id: `store-custom-${Date.now()}`,
            order: maxOrder + 1,
          };
          return {
            ...config,
            shippingModes: {
              ...config.shippingModes,
              store: {
                ...config.shippingModes.store,
                customFields: [...config.shippingModes.store.customFields, newField],
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  const updateStoreCustomField = (siteId: string, fieldId: string, updates: Partial<CustomShippingField>) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          return {
            ...config,
            shippingModes: {
              ...config.shippingModes,
              store: {
                ...config.shippingModes.store,
                customFields: config.shippingModes.store.customFields.map(field =>
                  field.id === fieldId ? { ...field, ...updates } : field
                ),
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  const deleteStoreCustomField = (siteId: string, fieldId: string) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          return {
            ...config,
            shippingModes: {
              ...config.shippingModes,
              store: {
                ...config.shippingModes.store,
                customFields: config.shippingModes.store.customFields.filter(field => field.id !== fieldId),
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  const reorderStoreCustomFields = (siteId: string, fieldIds: string[]) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          const reordered = fieldIds.map((id, index) => {
            const field = config.shippingModes.store.customFields.find(f => f.id === id);
            return field ? { ...field, order: index + 1 } : null;
          }).filter((f): f is CustomShippingField => f !== null);
          
          return {
            ...config,
            shippingModes: {
              ...config.shippingModes,
              store: {
                ...config.shippingModes.store,
                customFields: reordered,
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  // Store management
  const addStore = (siteId: string, store: Omit<StoreLocation, 'id'>) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          const newStore: StoreLocation = {
            ...store,
            id: `store-${Date.now()}`,
          };
          return {
            ...config,
            shippingModes: {
              ...config.shippingModes,
              store: {
                ...config.shippingModes.store,
                stores: [...config.shippingModes.store.stores, newStore],
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  const updateStore = (siteId: string, storeId: string, updates: Partial<StoreLocation>) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          return {
            ...config,
            shippingModes: {
              ...config.shippingModes,
              store: {
                ...config.shippingModes.store,
                stores: config.shippingModes.store.stores.map(store =>
                  store.id === storeId ? { ...store, ...updates } : store
                ),
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  const deleteStore = (siteId: string, storeId: string) => {
    setConfigurations(prev =>
      prev.map(config => {
        if (config.siteId === siteId) {
          return {
            ...config,
            shippingModes: {
              ...config.shippingModes,
              store: {
                ...config.shippingModes.store,
                stores: config.shippingModes.store.stores.filter(store => store.id !== storeId),
              },
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return config;
      })
    );
  };

  // Company address
  const updateCompanyAddress = (siteId: string, address: CompanyAddress) => {
    setConfigurations(prev =>
      prev.map(config =>
        config.siteId === siteId
          ? {
              ...config,
              shippingModes: {
                ...config.shippingModes,
                company: {
                  ...config.shippingModes.company,
                  address,
                },
              },
              updatedAt: new Date().toISOString(),
            }
          : config
      )
    );
  };

  // Initialize config for a site if it doesn't exist
  const initializeConfig = (siteId: string) => {
    const existingConfig = getConfigBySiteId(siteId);
    if (!existingConfig) {
      const newConfig: ShippingPageConfiguration = {
        ...defaultShippingConfig,
        id: `shipping-config-${Date.now()}`,
        siteId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConfigurations(prev => [...prev, newConfig]);
      return newConfig;
    }
    return existingConfig;
  };

  return (
    <ShippingConfigContext.Provider
      value={{
        configurations,
        getConfigBySiteId,
        updateConfig,
        addCustomField,
        updateCustomField,
        deleteCustomField,
        reorderCustomFields,
        // Store custom fields
        addStoreCustomField,
        updateStoreCustomField,
        deleteStoreCustomField,
        reorderStoreCustomFields,
        // Store management
        addStore,
        updateStore,
        deleteStore,
        // Company address
        updateCompanyAddress,
        // Initialize config
        initializeConfig,
      }}
    >
      {children}
    </ShippingConfigContext.Provider>
  );
}

export function useShippingConfig() {
  const context = useContext(ShippingConfigContext);
  if (context === undefined) {
    throw new Error('useShippingConfig must be used within a ShippingConfigProvider');
  }
  return context;
}