import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Package, Settings, AlertCircle, ChevronDown, ChevronUp, Building2, Store, MapPin, User, ShieldCheck } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { useShippingConfig } from '../../context/ShippingConfigContext';
import { CustomShippingField, CustomFieldType, StoreLocation, CompanyAddress, AddressValidationService } from '../../types/shippingConfig';
import { PhoneInput } from '../../components/ui/phone-input';
import { AddressInput, AddressData } from '../../components/ui/address-input';
import { toast } from 'sonner';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLanguage } from '../../context/LanguageContext';

const fieldTypeOptions: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date Picker' },
];

const categoryOptions = [
  { value: 'invoicing', label: 'Invoicing', color: 'bg-blue-100 text-blue-800' },
  { value: 'distribution', label: 'Distribution', color: 'bg-purple-100 text-purple-800' },
  { value: 'preferences', label: 'Preferences', color: 'bg-green-100 text-green-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const validationServiceOptions: { value: AddressValidationService; label: string; description: string }[] = [
  { value: 'none', label: 'No Validation', description: 'Do not validate addresses' },
  { value: 'usps', label: 'USPS Address Validation', description: 'Validate US addresses using USPS service' },
  { value: 'smarty', label: 'SmartyStreets', description: 'International and US address validation' },
  { value: 'google', label: 'Google Address Validation', description: 'Google Maps API address validation' },
  { value: 'geoapify', label: 'Geoapify', description: 'International address validation and geocoding' },
];

interface DraggableFieldProps {
  field: CustomShippingField;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (field: CustomShippingField) => void;
  onDelete: (fieldId: string) => void;
  onToggle: (fieldId: string, enabled: boolean) => void;
  getCategoryColor: (category: string) => string;
  currentSiteId: string;
}

const DraggableField = ({ field, index, moveField, onEdit, onDelete, onToggle, getCategoryColor, currentSiteId }: DraggableFieldProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CUSTOM_FIELD',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'CUSTOM_FIELD',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveField(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => { if (node) drop(node); }}
      className={`flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-opacity ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <button
        ref={drag}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-gray-900">{field.fieldLabel}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getCategoryColor(field.category)}`}>
            {field.category}
          </span>
          {field.required && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">Required</span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {fieldTypeOptions.find(opt => opt.value === field.fieldType)?.label} • {field.fieldName}
        </p>
        {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
      </div>

      <div className="flex items-center gap-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={field.enabled}
            onChange={(e) => onToggle(field.id, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
        </label>

        <button
          onClick={() => onEdit(field)}
          className="p-2 text-gray-600 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(field.id)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export function ShippingConfiguration() {
  const { currentSite } = useSite();
  const { getConfigBySiteId, updateConfig, addCustomField, updateCustomField, deleteCustomField, reorderCustomFields, addStoreCustomField, updateStoreCustomField, deleteStoreCustomField, reorderStoreCustomFields, addStore, updateStore, deleteStore, updateCompanyAddress, initializeConfig } = useShippingConfig();
  const { t } = useLanguage();
  
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomShippingField | null>(null);
  const [showStandardFields, setShowStandardFields] = useState(true);
  const [localFields, setLocalFields] = useState<CustomShippingField[]>([]);
  
  // Store management
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreLocation | null>(null);
  const [editingStoreAddress, setEditingStoreAddress] = useState<AddressData>({
    line1: '',
    line2: '',
    line3: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });
  const [filterState, setFilterState] = useState<string>('');
  
  // Store custom fields management
  const [isAddStoreFieldOpen, setIsAddStoreFieldOpen] = useState(false);
  const [editingStoreField, setEditingStoreField] = useState<CustomShippingField | null>(null);
  const [newStoreField, setNewStoreField] = useState<Partial<CustomShippingField>>({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    required: false,
    enabled: true,
    category: 'other',
    options: [],
  });

  // Section expansion states
  const [generalSettingsExpanded, setGeneralSettingsExpanded] = useState(true);
  const [employeeExpanded, setEmployeeExpanded] = useState(false);
  const [companyExpanded, setCompanyExpanded] = useState(false);
  const [storeExpanded, setStoreExpanded] = useState(false);

  // Get config for current site
  const config = currentSite ? getConfigBySiteId(currentSite.id) : undefined;

  // Initialize config if it doesn't exist for the current site
  useEffect(() => {
    if (currentSite && !config) {
      initializeConfig(currentSite.id);
    }
  }, [currentSite?.id, config]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update local fields when config changes
  useEffect(() => {
    if (config) {
      setLocalFields([...config.customFields].sort((a, b) => a.order - b.order));
    }
  }, [config]);

  const [newField, setNewField] = useState<Partial<CustomShippingField>>({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    required: false,
    enabled: true,
    category: 'other',
    options: [],
  });

  const [newStore, setNewStore] = useState({
    storeName: '',
    storeCode: '',
    phoneNumber: '',
    email: '',
    storeHours: '',
    specialInstructions: '',
    enabled: true,
  });

  const [newStoreAddress, setNewStoreAddress] = useState<AddressData>({
    line1: '',
    line2: '',
    line3: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [companyAddress, setCompanyAddress] = useState({
    companyName: '',
    phoneNumber: '',
    contactPerson: '',
    contactEmail: '',
    deliveryInstructions: '',
  });

  const [companyAddressData, setCompanyAddressData] = useState<AddressData>({
    line1: '',
    line2: '',
    line3: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  useEffect(() => {
    if (config?.shippingModes.company.address) {
      const addr = config.shippingModes.company.address;
      setCompanyAddress({
        companyName: addr.companyName || '',
        phoneNumber: addr.phoneNumber || '',
        contactPerson: addr.contactPerson || '',
        contactEmail: addr.contactEmail || '',
        deliveryInstructions: addr.deliveryInstructions || '',
      });
      setCompanyAddressData({
        line1: addr.addressLine1 || '',
        line2: addr.addressLine2 || '',
        line3: '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.zipCode || '',
        country: addr.country || 'United States',
      });
    }
  }, [config]);

  const moveField = (dragIndex: number, hoverIndex: number) => {
    if (!currentSite) return;
    
    const newFields = [...localFields];
    const [draggedField] = newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, draggedField);
    setLocalFields(newFields);
    
    // Update the order in the context
    reorderCustomFields(currentSite.id, newFields.map(field => field.id));
  };

  const handleAddField = () => {
    if (!currentSite || !newField.fieldName || !newField.fieldLabel) {
      toast.error('Please fill in all required fields');
      return;
    }

    addCustomField(currentSite.id, newField as Omit<CustomShippingField, 'id' | 'order'>);
    setIsAddFieldOpen(false);
    setNewField({
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      required: false,
      enabled: true,
      category: 'other',
      options: [],
    });
    toast.success('Custom field added successfully');
  };

  const handleUpdateField = () => {
    if (!currentSite || !editingField) return;

    updateCustomField(currentSite.id, editingField.id, editingField);
    setEditingField(null);
    toast.success('Field updated successfully');
  };

  const handleDeleteField = (fieldId: string) => {
    if (!currentSite) return;

    if (confirm('Are you sure you want to delete this custom field?')) {
      deleteCustomField(currentSite.id, fieldId);
      toast.success('Field deleted successfully');
    }
  };

  const handleToggleStandardField = (fieldKey: string, enabled: boolean) => {
    if (!currentSite || !config) return;

    updateConfig(currentSite.id, {
      standardFields: {
        ...config.standardFields,
        [fieldKey]: {
          ...config.standardFields[fieldKey as keyof typeof config.standardFields],
          enabled,
        },
      },
    });
  };

  const handleToggleStandardFieldRequired = (fieldKey: string, required: boolean) => {
    if (!currentSite || !config) return;

    updateConfig(currentSite.id, {
      standardFields: {
        ...config.standardFields,
        [fieldKey]: {
          ...config.standardFields[fieldKey as keyof typeof config.standardFields],
          required,
        },
      },
    });
  };

  const handleAddStore = () => {
    if (!currentSite || !newStore.storeName || !newStoreAddress.state) {
      toast.error('Please fill in store name and state');
      return;
    }

    const storeData: Omit<StoreLocation, 'id'> = {
      storeName: newStore.storeName,
      storeCode: newStore.storeCode || '',
      addressLine1: newStoreAddress.line1,
      addressLine2: newStoreAddress.line2 || '',
      city: newStoreAddress.city,
      state: newStoreAddress.state || '',
      zipCode: newStoreAddress.postalCode,
      country: newStoreAddress.country,
      phoneNumber: newStore.phoneNumber || '',
      email: newStore.email || '',
      storeHours: newStore.storeHours || '',
      specialInstructions: newStore.specialInstructions || '',
      enabled: newStore.enabled,
    };

    addStore(currentSite.id, storeData);
    setIsAddStoreOpen(false);
    setNewStore({
      storeName: '',
      storeCode: '',
      phoneNumber: '',
      email: '',
      storeHours: '',
      specialInstructions: '',
      enabled: true,
    });
    setNewStoreAddress({
      line1: '',
      line2: '',
      line3: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
    });
    toast.success('Store added successfully');
  };

  const handleUpdateStore = () => {
    if (!currentSite || !editingStore) return;

    const updatedStore: StoreLocation = {
      ...editingStore,
      addressLine1: editingStoreAddress.line1,
      addressLine2: editingStoreAddress.line2 || '',
      city: editingStoreAddress.city,
      state: editingStoreAddress.state || '',
      zipCode: editingStoreAddress.postalCode,
      country: editingStoreAddress.country,
    };

    updateStore(currentSite.id, editingStore.id, updatedStore);
    setEditingStore(null);
    toast.success('Store updated successfully');
  };

  const handleDeleteStore = (storeId: string) => {
    if (!currentSite) return;

    if (confirm('Are you sure you want to delete this store?')) {
      deleteStore(currentSite.id, storeId);
      toast.success('Store deleted successfully');
    }
  };

  const handleSaveCompanyAddress = () => {
    if (!currentSite) return;

    const addressToSave: CompanyAddress = {
      companyName: companyAddress.companyName,
      addressLine1: companyAddressData.line1,
      addressLine2: companyAddressData.line2 || '',
      city: companyAddressData.city,
      state: companyAddressData.state || '',
      zipCode: companyAddressData.postalCode,
      country: companyAddressData.country,
      phoneNumber: companyAddress.phoneNumber,
      contactPerson: companyAddress.contactPerson,
      contactEmail: companyAddress.contactEmail,
      deliveryInstructions: companyAddress.deliveryInstructions,
    };

    updateCompanyAddress(currentSite.id, addressToSave);
    toast.success('Company address saved successfully');
  };

  const handleToggleCustomField = (fieldId: string, enabled: boolean) => {
    if (!currentSite) return;
    updateCustomField(currentSite.id, fieldId, { enabled });
  };

  const getCategoryColor = (category: string) => {
    return categoryOptions.find(opt => opt.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStoresByState = () => {
    if (!config) return {};
    
    const stores = config.shippingModes.store.stores;
    const grouped: { [state: string]: StoreLocation[] } = {};
    
    stores.forEach(store => {
      if (!grouped[store.state]) {
        grouped[store.state] = [];
      }
      grouped[store.state].push(store);
    });
    
    return grouped;
  };

  if (!currentSite || !config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a site to configure shipping settings</p>
      </div>
    );
  }

  const storesByState = getStoresByState();
  const filteredStates = filterState 
    ? Object.keys(storesByState).filter(state => state.toLowerCase().includes(filterState.toLowerCase()))
    : Object.keys(storesByState).sort();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Shipping Mode Configuration</p>
              <p>Enable and configure shipping options: employee address entry, company headquarters, or store pickup locations.</p>
            </div>
          </div>
        </div>

        {/* General Settings Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setGeneralSettingsExpanded(!generalSettingsExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-[#7C3AED]" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-900">General Settings</h2>
                <p className="text-sm text-gray-600">Configure page settings, labels, and address validation</p>
              </div>
            </div>
            {generalSettingsExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {generalSettingsExpanded && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              {/* Page Display Settings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Page Display</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <input
                          type="checkbox"
                          checked={config.pageSettings.showPageTitle}
                          onChange={(e) =>
                            updateConfig(currentSite.id, {
                              pageSettings: { ...config.pageSettings, showPageTitle: e.target.checked },
                            })
                          }
                          className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                        />
                        Show Page Title
                      </label>
                      {config.pageSettings.showPageTitle && (
                        <input
                          type="text"
                          value={config.pageSettings.pageTitle || ''}
                          onChange={(e) =>
                            updateConfig(currentSite.id, {
                              pageSettings: { ...config.pageSettings, pageTitle: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                          placeholder="Shipping Information"
                        />
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <input
                          type="checkbox"
                          checked={config.pageSettings.showPageDescription}
                          onChange={(e) =>
                            updateConfig(currentSite.id, {
                              pageSettings: { ...config.pageSettings, showPageDescription: e.target.checked },
                            })
                          }
                          className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                        />
                        Show Description
                      </label>
                      {config.pageSettings.showPageDescription && (
                        <textarea
                          value={config.pageSettings.pageDescription || ''}
                          onChange={(e) =>
                            updateConfig(currentSite.id, {
                              pageSettings: { ...config.pageSettings, pageDescription: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                          placeholder="Please provide your shipping address..."
                          rows={2}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={config.pageSettings.allowInternational}
                        onChange={(e) =>
                          updateConfig(currentSite.id, {
                            pageSettings: { ...config.pageSettings, allowInternational: e.target.checked },
                          })
                        }
                        className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                      />
                      Allow International Shipping
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={config.pageSettings.requirePhoneNumber}
                        onChange={(e) =>
                          updateConfig(currentSite.id, {
                            pageSettings: { ...config.pageSettings, requirePhoneNumber: e.target.checked },
                          })
                        }
                        className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                      />
                      Require Phone Number
                    </label>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={config.pageSettings.allowPOBox}
                        onChange={(e) =>
                          updateConfig(currentSite.id, {
                            pageSettings: { ...config.pageSettings, allowPOBox: e.target.checked },
                          })
                        }
                        className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                      />
                      Allow PO Box Addresses
                    </label>
                  </div>
                </div>
              </div>

              {/* Shipping Mode Labels */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Shipping Mode Labels & Descriptions</h3>
                <div className="space-y-4">
                  {config.shippingModes.employee.enabled && (
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-[#D91C81]" />
                        <h4 className="font-semibold text-gray-900">Employee Address</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={config.shippingModes.employee.label || ''}
                            onChange={(e) =>
                              updateConfig(currentSite.id, {
                                shippingModes: {
                                  ...config.shippingModes,
                                  employee: { ...config.shippingModes.employee, label: e.target.value },
                                },
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                            placeholder="Ship to My Address"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={config.shippingModes.employee.description || ''}
                            onChange={(e) =>
                              updateConfig(currentSite.id, {
                                shippingModes: {
                                  ...config.shippingModes,
                                  employee: { ...config.shippingModes.employee, description: e.target.value },
                                },
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                            placeholder="Enter your personal shipping address"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {config.shippingModes.company.enabled && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-[#1B2A5E]" />
                        <h4 className="font-semibold text-gray-900">Company Address</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={config.shippingModes.company.label || ''}
                            onChange={(e) =>
                              updateConfig(currentSite.id, {
                                shippingModes: {
                                  ...config.shippingModes,
                                  company: { ...config.shippingModes.company, label: e.target.value },
                                },
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                            placeholder="Ship to Company"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={config.shippingModes.company.description || ''}
                            onChange={(e) =>
                              updateConfig(currentSite.id, {
                                shippingModes: {
                                  ...config.shippingModes,
                                  company: { ...config.shippingModes.company, description: e.target.value },
                                },
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                            placeholder="Ship to our company headquarters"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {config.shippingModes.store.enabled && (
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Store className="w-5 h-5 text-[#00B4CC]" />
                        <h4 className="font-semibold text-gray-900">Store Pickup</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={config.shippingModes.store.label || ''}
                            onChange={(e) =>
                              updateConfig(currentSite.id, {
                                shippingModes: {
                                  ...config.shippingModes,
                                  store: { ...config.shippingModes.store, label: e.target.value },
                                },
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                            placeholder="Ship to Store"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={config.shippingModes.store.description || ''}
                            onChange={(e) =>
                              updateConfig(currentSite.id, {
                                shippingModes: {
                                  ...config.shippingModes,
                                  store: { ...config.shippingModes.store, description: e.target.value },
                                },
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                            placeholder="Select a store location for pickup"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Validation */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
                  <h3 className="text-sm font-semibold text-gray-700">Address Validation Service</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={config.addressValidation?.enabled || false}
                        onChange={(e) =>
                          updateConfig(currentSite.id, {
                            addressValidation: {
                              ...config.addressValidation,
                              enabled: e.target.checked,
                              service: config.addressValidation?.service || 'none',
                              requireValidation: config.addressValidation?.requireValidation || false,
                              allowOverride: config.addressValidation?.allowOverride || false,
                            },
                          })
                        }
                        className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                      />
                      Enable Address Validation
                    </label>
                  </div>

                  {config.addressValidation?.enabled && (
                    <div className="pl-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Validation Service</label>
                        <select
                          value={config.addressValidation?.service || 'none'}
                          onChange={(e) =>
                            updateConfig(currentSite.id, {
                              addressValidation: {
                                ...config.addressValidation,
                                enabled: config.addressValidation?.enabled || false,
                                service: e.target.value as AddressValidationService,
                                requireValidation: config.addressValidation?.requireValidation || false,
                                allowOverride: config.addressValidation?.allowOverride || false,
                              },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                        >
                          {validationServiceOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label} - {option.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={config.addressValidation?.requireValidation || false}
                            onChange={(e) =>
                              updateConfig(currentSite.id, {
                                addressValidation: {
                                  ...config.addressValidation,
                                  enabled: config.addressValidation?.enabled || false,
                                  service: config.addressValidation?.service || 'none',
                                  requireValidation: e.target.checked,
                                  allowOverride: config.addressValidation?.allowOverride || false,
                                },
                              })
                            }
                            className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                          />
                          Require Valid Address
                        </label>

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={config.addressValidation?.allowOverride || false}
                            onChange={(e) =>
                              updateConfig(currentSite.id, {
                                addressValidation: {
                                  ...config.addressValidation,
                                  enabled: config.addressValidation?.enabled || false,
                                  service: config.addressValidation?.service || 'none',
                                  requireValidation: config.addressValidation?.requireValidation || false,
                                  allowOverride: e.target.checked,
                                },
                              })
                            }
                            className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                          />
                          Allow Users to Override Suggestions
                        </label>
                      </div>

                      {/* Address Autocomplete Toggle */}
                      <div className="pt-4 border-t border-gray-200">
                        <label className="flex items-start gap-3 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={config.addressValidation?.enableAutocomplete !== false} // Default to true
                            onChange={(e) =>
                              updateConfig(currentSite.id, {
                                addressValidation: {
                                  ...config.addressValidation,
                                  enabled: config.addressValidation?.enabled || false,
                                  service: config.addressValidation?.service || 'none',
                                  requireValidation: config.addressValidation?.requireValidation || false,
                                  allowOverride: config.addressValidation?.allowOverride || false,
                                  enableAutocomplete: e.target.checked,
                                },
                              })
                            }
                            className="mt-0.5 rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                          />
                          <div>
                            <div className="font-medium">Enable Address Autocomplete</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Show address suggestions as users type (powered by Geoapify or Google Places).
                              Helps users enter addresses quickly and accurately.
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee Address Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setEmployeeExpanded(!employeeExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-[#D91C81]" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-900">Ship to Employee Address</h2>
                <p className="text-sm text-gray-600">Allow employees to enter their own shipping address</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={config.shippingModes.employee.enabled}
                  onChange={(e) => {
                    updateConfig(currentSite.id, {
                      shippingModes: {
                        ...config.shippingModes,
                        employee: { ...config.shippingModes.employee, enabled: e.target.checked },
                      },
                    });
                    toast.success(`Employee shipping ${e.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
              </label>
              {employeeExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </button>

          {employeeExpanded && config.shippingModes.employee.enabled && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              {/* Standard Fields */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setShowStandardFields(!showStandardFields)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-gray-900">Standard Address Fields</h3>
                      <p className="text-xs text-gray-600">Configure which standard address fields are enabled</p>
                    </div>
                  </div>
                  {showStandardFields ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {showStandardFields && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(config.standardFields).map(([key, field]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{field.label}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => handleToggleStandardFieldRequired(key, e.target.checked)}
                                disabled={!field.enabled}
                                className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81] mr-1"
                              />
                              Required
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.enabled}
                                onChange={(e) => handleToggleStandardField(key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Fields */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Custom Fields</h3>
                    <p className="text-xs text-gray-600 mt-1">Add additional fields for employee address collection</p>
                  </div>
                  <button
                    onClick={() => setIsAddFieldOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#B71569] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Field
                  </button>
                </div>

                <div className="space-y-3">
                  {localFields.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No custom fields added yet</p>
                      <p className="text-gray-500 text-xs mt-1">Click "Add Custom Field" to create one</p>
                    </div>
                  ) : (
                    localFields.map((field, index) => (
                      <DraggableField
                        key={field.id}
                        field={field}
                        index={index}
                        moveField={moveField}
                        onEdit={setEditingField}
                        onDelete={handleDeleteField}
                        onToggle={handleToggleCustomField}
                        getCategoryColor={getCategoryColor}
                        currentSiteId={currentSite.id}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Company Address Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setCompanyExpanded(!companyExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#1B2A5E]" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-900">Ship to Company</h2>
                <p className="text-sm text-gray-600">Ship all orders to a single company headquarters address</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={config.shippingModes.company.enabled}
                  onChange={(e) => {
                    updateConfig(currentSite.id, {
                      shippingModes: {
                        ...config.shippingModes,
                        company: { ...config.shippingModes.company, enabled: e.target.checked },
                      },
                    });
                    toast.success(`Company shipping ${e.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
              </label>
              {companyExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </button>

          {companyExpanded && config.shippingModes.company.enabled && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              {/* Company Address Form */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Company Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={companyAddress.companyName}
                      onChange={(e) => setCompanyAddress({ ...companyAddress, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="Acme Corporation"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                      <input
                        type="text"
                        value={companyAddress.contactPerson}
                        onChange={(e) => setCompanyAddress({ ...companyAddress, contactPerson: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={companyAddress.contactEmail}
                        onChange={(e) => setCompanyAddress({ ...companyAddress, contactEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                        placeholder="john@acme.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
                    <AddressInput
                      value={companyAddressData}
                      onChange={setCompanyAddressData}
                      defaultCountry="US"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <PhoneInput
                      value={companyAddress.phoneNumber}
                      onChange={(value) => setCompanyAddress({ ...companyAddress, phoneNumber: value })}
                      defaultCountry="US"
                      placeholder={t('form.enterPhone')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Instructions (Optional)</label>
                    <textarea
                      value={companyAddress.deliveryInstructions}
                      onChange={(e) => setCompanyAddress({ ...companyAddress, deliveryInstructions: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="Enter any special delivery instructions..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveCompanyAddress}
                      className="px-6 py-2.5 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
                    >
                      Save Company Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Store Locations Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setStoreExpanded(!storeExpanded)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-[#00B4CC]" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-900">Ship to Store</h2>
                <p className="text-sm text-gray-600">Allow employees to select a store location for pickup ({config.shippingModes.store.stores.length} stores)</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={config.shippingModes.store.enabled}
                  onChange={(e) => {
                    updateConfig(currentSite.id, {
                      shippingModes: {
                        ...config.shippingModes,
                        store: { ...config.shippingModes.store, enabled: e.target.checked },
                      },
                    });
                    toast.success(`Store pickup ${e.target.checked ? 'enabled' : 'disabled'}`);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
              </label>
              {storeExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </button>

          {storeExpanded && config.shippingModes.store.enabled && (
            <div className="p-6 border-t border-gray-200 space-y-6">
              {/* Store Settings */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Store Display Settings</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={config.shippingModes.store.requireStoreSelection}
                      onChange={(e) =>
                        updateConfig(currentSite.id, {
                          shippingModes: {
                            ...config.shippingModes,
                            store: { ...config.shippingModes.store, requireStoreSelection: e.target.checked },
                          },
                        })
                      }
                      className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                    />
                    Require store selection
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={config.shippingModes.store.groupByState || false}
                      onChange={(e) =>
                        updateConfig(currentSite.id, {
                          shippingModes: {
                            ...config.shippingModes,
                            store: { ...config.shippingModes.store, groupByState: e.target.checked },
                          },
                        })
                      }
                      className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                    />
                    Group stores by state/province
                  </label>
                </div>
              </div>

              {/* Custom Fields for Store Pickup */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Custom Fields for Store Pickup</h3>
                    <p className="text-xs text-gray-600 mt-1">Add additional fields employees fill out when selecting store pickup</p>
                  </div>
                  <button
                    onClick={() => setIsAddStoreFieldOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#B71569] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Field
                  </button>
                </div>

                <div className="space-y-3">
                  {(config.shippingModes.store.customFields || []).length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                      <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No custom fields for store pickup</p>
                      <p className="text-gray-500 text-xs mt-1">Click "Add Custom Field" to create one</p>
                    </div>
                  ) : (
                    (config.shippingModes.store.customFields || []).map((field, index) => (
                      <DraggableField
                        key={field.id}
                        field={field}
                        index={index}
                        moveField={(dragIndex, hoverIndex) => {
                          const storeFields = [...(config.shippingModes.store.customFields || [])];
                          const [draggedField] = storeFields.splice(dragIndex, 1);
                          storeFields.splice(hoverIndex, 0, draggedField);
                          reorderStoreCustomFields(currentSite.id, storeFields.map(f => f.id));
                        }}
                        onEdit={(field) => setEditingStoreField(field)}
                        onDelete={(fieldId) => {
                          if (confirm('Are you sure you want to delete this store custom field?')) {
                            deleteStoreCustomField(currentSite.id, fieldId);
                            toast.success('Store field deleted successfully');
                          }
                        }}
                        onToggle={(fieldId, enabled) => updateStoreCustomField(currentSite.id, fieldId, { enabled })}
                        getCategoryColor={getCategoryColor}
                        currentSiteId={currentSite.id}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Store Locations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Store Locations</h3>
                    <p className="text-xs text-gray-600 mt-1">Manage store locations available for pickup</p>
                  </div>
                  <button
                    onClick={() => setIsAddStoreOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#B71569] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Store
                  </button>
                </div>

                {config.shippingModes.store.stores.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No store locations added yet</p>
                    <p className="text-gray-500 text-xs mt-1">Click "Add Store" to create one</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <input
                        type="text"
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        placeholder="Filter by state..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      />
                    </div>

                    <div className="space-y-4">
                      {filteredStates.map(state => (
                        <div key={state} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {state} ({storesByState[state].length})
                          </div>
                          <div className="p-4 space-y-3">
                            {storesByState[state].map(store => (
                              <div
                                key={store.id}
                                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-gray-900">{store.storeName}</p>
                                    {store.storeCode && (
                                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                                        {store.storeCode}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {store.addressLine1}
                                    {store.addressLine2 && `, ${store.addressLine2}`}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {store.city}, {store.state} {store.zipCode}
                                  </p>
                                  {store.phoneNumber && (
                                    <p className="text-sm text-gray-600 mt-1">📞 {store.phoneNumber}</p>
                                  )}
                                  {store.storeHours && (
                                    <p className="text-sm text-gray-600">🕐 {store.storeHours}</p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={store.enabled}
                                      onChange={(e) => {
                                        if (currentSite) {
                                          updateStore(currentSite.id, store.id, { enabled: e.target.checked });
                                        }
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
                                  </label>

                                  <button
                                    onClick={() => {
                                      setEditingStore(store);
                                      setEditingStoreAddress({
                                        line1: store.addressLine1 || '',
                                        line2: store.addressLine2 || '',
                                        line3: '',
                                        city: store.city || '',
                                        state: store.state || '',
                                        postalCode: store.zipCode || '',
                                        country: store.country || 'United States',
                                      });
                                    }}
                                    className="p-2 text-gray-600 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteStore(store.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Custom Field Modal */}
        {isAddFieldOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Custom Field</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Name (Key)</label>
                    <input
                      type="text"
                      value={newField.fieldName}
                      onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="company_name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
                    <input
                      type="text"
                      value={newField.fieldLabel}
                      onChange={(e) => setNewField({ ...newField, fieldLabel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="Company Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                    <select
                      value={newField.fieldType}
                      onChange={(e) => setNewField({ ...newField, fieldType: e.target.value as CustomFieldType })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                      {fieldTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newField.category}
                      onChange={(e) => setNewField({ ...newField, category: e.target.value as 'invoicing' | 'distribution' | 'preferences' | 'other' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
                  <input
                    type="text"
                    value={newField.placeholder || ''}
                    onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    placeholder="Enter placeholder text..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Help Text</label>
                  <input
                    type="text"
                    value={newField.helpText || ''}
                    onChange={(e) => setNewField({ ...newField, helpText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    placeholder="Additional help text for users..."
                  />
                </div>

                {newField.fieldType === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options (comma-separated)</label>
                    <input
                      type="text"
                      value={newField.options?.join(', ') || ''}
                      onChange={(e) => setNewField({ ...newField, options: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={newField.required}
                      onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                      className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                    />
                    Required Field
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={newField.enabled}
                      onChange={(e) => setNewField({ ...newField, enabled: e.target.checked })}
                      className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                    />
                    Enabled
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsAddFieldOpen(false);
                    setNewField({
                      fieldName: '',
                      fieldLabel: '',
                      fieldType: 'text',
                      required: false,
                      enabled: true,
                      category: 'other',
                      options: [],
                    });
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddField}
                  className="px-6 py-2.5 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Custom Field Modal */}
        {editingField && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Custom Field</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Name (Key)</label>
                    <input
                      type="text"
                      value={editingField.fieldName}
                      onChange={(e) => setEditingField({ ...editingField, fieldName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
                    <input
                      type="text"
                      value={editingField.fieldLabel}
                      onChange={(e) => setEditingField({ ...editingField, fieldLabel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                    <select
                      value={editingField.fieldType}
                      onChange={(e) => setEditingField({ ...editingField, fieldType: e.target.value as CustomFieldType })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                      {fieldTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={editingField.category}
                      onChange={(e) => setEditingField({ ...editingField, category: e.target.value as 'invoicing' | 'distribution' | 'preferences' | 'other' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
                  <input
                    type="text"
                    value={editingField.placeholder || ''}
                    onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Help Text</label>
                  <input
                    type="text"
                    value={editingField.helpText || ''}
                    onChange={(e) => setEditingField({ ...editingField, helpText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>

                {editingField.fieldType === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options (comma-separated)</label>
                    <input
                      type="text"
                      value={editingField.options?.join(', ') || ''}
                      onChange={(e) => setEditingField({ ...editingField, options: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editingField.required}
                      onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                      className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                    />
                    Required Field
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editingField.enabled}
                      onChange={(e) => setEditingField({ ...editingField, enabled: e.target.checked })}
                      className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                    />
                    Enabled
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingField(null)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateField}
                  className="px-6 py-2.5 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Store Modal */}
        {isAddStoreOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Store Location</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
                    <input
                      type="text"
                      value={newStore.storeName}
                      onChange={(e) => setNewStore({ ...newStore, storeName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="Downtown Store"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Code</label>
                    <input
                      type="text"
                      value={newStore.storeCode}
                      onChange={(e) => setNewStore({ ...newStore, storeCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="DT-001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                  <AddressInput
                    value={newStoreAddress}
                    onChange={setNewStoreAddress}
                    defaultCountry="US"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <PhoneInput
                      value={newStore.phoneNumber}
                      onChange={(value) => setNewStore({ ...newStore, phoneNumber: value })}
                      defaultCountry="US"
                      placeholder={t('form.enterPhone')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newStore.email}
                      onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="store@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Hours</label>
                  <input
                    type="text"
                    value={newStore.storeHours}
                    onChange={(e) => setNewStore({ ...newStore, storeHours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    placeholder="Mon-Fri 9am-5pm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                  <textarea
                    value={newStore.specialInstructions}
                    onChange={(e) => setNewStore({ ...newStore, specialInstructions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    placeholder="Enter any special pickup instructions..."
                    rows={3}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={newStore.enabled}
                    onChange={(e) => setNewStore({ ...newStore, enabled: e.target.checked })}
                    className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                  />
                  Enabled
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsAddStoreOpen(false);
                    setNewStore({
                      storeName: '',
                      storeCode: '',
                      phoneNumber: '',
                      email: '',
                      storeHours: '',
                      specialInstructions: '',
                      enabled: true,
                    });
                    setNewStoreAddress({
                      line1: '',
                      line2: '',
                      line3: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      country: 'United States',
                    });
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStore}
                  className="px-6 py-2.5 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
                >
                  Add Store
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Store Modal */}
        {editingStore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Store Location</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
                    <input
                      type="text"
                      value={editingStore.storeName}
                      onChange={(e) => setEditingStore({ ...editingStore, storeName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Code</label>
                    <input
                      type="text"
                      value={editingStore.storeCode}
                      onChange={(e) => setEditingStore({ ...editingStore, storeCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                  <AddressInput
                    value={editingStoreAddress}
                    onChange={setEditingStoreAddress}
                    defaultCountry="US"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <PhoneInput
                      value={editingStore.phoneNumber}
                      onChange={(value) => setEditingStore({ ...editingStore, phoneNumber: value })}
                      defaultCountry="US"
                      placeholder={t('form.enterPhone')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editingStore.email}
                      onChange={(e) => setEditingStore({ ...editingStore, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Hours</label>
                  <input
                    type="text"
                    value={editingStore.storeHours}
                    onChange={(e) => setEditingStore({ ...editingStore, storeHours: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                  <textarea
                    value={editingStore.specialInstructions}
                    onChange={(e) => setEditingStore({ ...editingStore, specialInstructions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    rows={3}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingStore.enabled}
                    onChange={(e) => setEditingStore({ ...editingStore, enabled: e.target.checked })}
                    className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                  />
                  Enabled
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingStore(null)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStore}
                  className="px-6 py-2.5 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Store Custom Field Modal */}
        {isAddStoreFieldOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Store Custom Field</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Name (Key)</label>
                    <input
                      type="text"
                      value={newStoreField.fieldName}
                      onChange={(e) => setNewStoreField({ ...newStoreField, fieldName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="pickup_contact"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
                    <input
                      type="text"
                      value={newStoreField.fieldLabel}
                      onChange={(e) => setNewStoreField({ ...newStoreField, fieldLabel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="Pickup Contact Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                    <select
                      value={newStoreField.fieldType}
                      onChange={(e) => setNewStoreField({ ...newStoreField, fieldType: e.target.value as CustomFieldType })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                      {fieldTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newStoreField.category}
                      onChange={(e) => setNewStoreField({ ...newStoreField, category: e.target.value as 'invoicing' | 'distribution' | 'preferences' | 'other' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
                  <input
                    type="text"
                    value={newStoreField.placeholder || ''}
                    onChange={(e) => setNewStoreField({ ...newStoreField, placeholder: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    placeholder="Enter placeholder text..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Help Text</label>
                  <input
                    type="text"
                    value={newStoreField.helpText || ''}
                    onChange={(e) => setNewStoreField({ ...newStoreField, helpText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    placeholder="Additional help text for users..."
                  />
                </div>

                {newStoreField.fieldType === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options (comma-separated)</label>
                    <input
                      type="text"
                      value={newStoreField.options?.join(', ') || ''}
                      onChange={(e) => setNewStoreField({ ...newStoreField, options: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={newStoreField.required}
                      onChange={(e) => setNewStoreField({ ...newStoreField, required: e.target.checked })}
                      className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                    />
                    Required Field
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={newStoreField.enabled}
                      onChange={(e) => setNewStoreField({ ...newStoreField, enabled: e.target.checked })}
                      className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                    />
                    Enabled
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsAddStoreFieldOpen(false);
                    setNewStoreField({
                      fieldName: '',
                      fieldLabel: '',
                      fieldType: 'text',
                      required: false,
                      enabled: true,
                      category: 'other',
                      options: [],
                    });
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!currentSite || !newStoreField.fieldName || !newStoreField.fieldLabel) {
                      toast.error('Please fill in field name and label');
                      return;
                    }
                    addStoreCustomField(currentSite.id, newStoreField as Omit<CustomShippingField, 'id' | 'order'>);
                    setIsAddStoreFieldOpen(false);
                    setNewStoreField({
                      fieldName: '',
                      fieldLabel: '',
                      fieldType: 'text',
                      required: false,
                      enabled: true,
                      category: 'other',
                      options: [],
                    });
                    toast.success('Store custom field added successfully');
                  }}
                  className="px-6 py-2.5 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Store Custom Field Modal */}
        {editingStoreField && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Store Custom Field</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Name (Key)</label>
                    <input
                      type="text"
                      value={editingStoreField.fieldName}
                      onChange={(e) => setEditingStoreField({ ...editingStoreField, fieldName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Label</label>
                    <input
                      type="text"
                      value={editingStoreField.fieldLabel}
                      onChange={(e) => setEditingStoreField({ ...editingStoreField, fieldLabel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                    <select
                      value={editingStoreField.fieldType}
                      onChange={(e) => setEditingStoreField({ ...editingStoreField, fieldType: e.target.value as CustomFieldType })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                      {fieldTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={editingStoreField.category}
                      onChange={(e) => setEditingStoreField({ ...editingStoreField, category: e.target.value as 'invoicing' | 'distribution' | 'preferences' | 'other' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
                  <input
                    type="text"
                    value={editingStoreField.placeholder || ''}
                    onChange={(e) => setEditingStoreField({ ...editingStoreField, placeholder: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Help Text</label>
                  <input
                    type="text"
                    value={editingStoreField.helpText || ''}
                    onChange={(e) => setEditingStoreField({ ...editingStoreField, helpText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>

                {editingStoreField.fieldType === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options (comma-separated)</label>
                    <input
                      type="text"
                      value={editingStoreField.options?.join(', ') || ''}
                      onChange={(e) => setEditingStoreField({ ...editingStoreField, options: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editingStoreField.required}
                      onChange={(e) => setEditingStoreField({ ...editingStoreField, required: e.target.checked })}
                      className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                    />
                    Required Field
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editingStoreField.enabled}
                      onChange={(e) => setEditingStoreField({ ...editingStoreField, enabled: e.target.checked })}
                      className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                    />
                    Enabled
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingStoreField(null)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!currentSite) return;
                    updateStoreCustomField(currentSite.id, editingStoreField.id, editingStoreField);
                    setEditingStoreField(null);
                    toast.success('Store field updated successfully');
                  }}
                  className="px-6 py-2.5 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
