import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRight, Save, RotateCcw } from 'lucide-react';

interface FieldMapping {
  source: string;
  target: string;
}

interface FieldMapperProps {
  title: string;
  mappings: Record<string, string>;
  onMappingsChange: (mappings: Record<string, string>) => void;
  sourceFields?: string[];
  targetFields?: string[];
  placeholder?: {
    source: string;
    target: string;
  };
}

export function FieldMapper({
  title,
  mappings,
  onMappingsChange,
  sourceFields = [],
  targetFields = [],
  placeholder = { source: 'wecelebrate field', target: 'ERP field' }
}: FieldMapperProps) {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Convert mappings object to array on mount
  useEffect(() => {
    const mappingsArray = Object.entries(mappings).map(([source, target]) => ({
      source,
      target
    }));
    setFieldMappings(mappingsArray.length > 0 ? mappingsArray : [{ source: '', target: '' }]);
  }, [mappings]);

  const handleAddMapping = () => {
    setFieldMappings([...fieldMappings, { source: '', target: '' }]);
    setHasChanges(true);
  };

  const handleRemoveMapping = (index: number) => {
    const updated = fieldMappings.filter((_, i) => i !== index);
    setFieldMappings(updated.length > 0 ? updated : [{ source: '', target: '' }]);
    setHasChanges(true);
  };

  const handleMappingChange = (index: number, field: 'source' | 'target', value: string) => {
    const updated = [...fieldMappings];
    updated[index][field] = value;
    setFieldMappings(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    // Convert array back to object, filtering out empty mappings
    const mappingsObject = fieldMappings
      .filter(m => m.source && m.target)
      .reduce((acc, m) => {
        acc[m.source] = m.target;
        return acc;
      }, {} as Record<string, string>);
    
    onMappingsChange(mappingsObject);
    setHasChanges(false);
  };

  const handleReset = () => {
    const mappingsArray = Object.entries(mappings).map(([source, target]) => ({
      source,
      target
    }));
    setFieldMappings(mappingsArray.length > 0 ? mappingsArray : [{ source: '', target: '' }]);
    setHasChanges(false);
  };

  // Common wecelebrate fields
  const commonJalaFields = [
    'orderId',
    'orderNumber',
    'customerInfo.name',
    'customerInfo.email',
    'customerInfo.phone',
    'items[].sku',
    'items[].name',
    'items[].quantity',
    'items[].price',
    'totalAmount',
    'shippingAddress.street',
    'shippingAddress.city',
    'shippingAddress.state',
    'shippingAddress.zip',
    'shippingAddress.country',
    'status',
    'createdAt',
    'updatedAt',
    // Product fields
    'sku',
    'name',
    'description',
    'price',
    'stockQuantity',
    'category',
    'imageUrl',
    'weight',
    'dimensions',
    // Inventory fields
    'quantity',
    'location',
    'warehouseId',
    'lastUpdated',
    'reservedQuantity',
    'availableQuantity'
  ];

  const allSourceFields = [...new Set([...sourceFields, ...commonJalaFields])];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#1B2A5E]">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Map wecelebrate platform fields to your ERP system fields
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-white bg-[#D91C81] rounded-lg hover:bg-[#B91870] transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Mappings
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-[1fr_40px_1fr_40px] gap-3 pb-2 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-700">wecelebrate Field</div>
          <div></div>
          <div className="text-sm font-medium text-gray-700">ERP Field</div>
          <div></div>
        </div>

        {/* Mappings */}
        {fieldMappings.map((mapping, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_40px_1fr_40px] gap-3 items-center group"
          >
            {/* Source Field */}
            <div className="relative">
              {allSourceFields.length > 0 ? (
                <select
                  value={mapping.source}
                  onChange={(e) => handleMappingChange(index, 'source', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent text-sm"
                >
                  <option value="">Select {placeholder.source}</option>
                  {allSourceFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={mapping.source}
                  onChange={(e) => handleMappingChange(index, 'source', e.target.value)}
                  placeholder={placeholder.source}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent text-sm"
                />
              )}
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>

            {/* Target Field */}
            <div className="relative">
              {targetFields.length > 0 ? (
                <select
                  value={mapping.target}
                  onChange={(e) => handleMappingChange(index, 'target', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent text-sm"
                >
                  <option value="">Select {placeholder.target}</option>
                  {targetFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={mapping.target}
                  onChange={(e) => handleMappingChange(index, 'target', e.target.value)}
                  placeholder={placeholder.target}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent text-sm"
                />
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemoveMapping(index)}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              disabled={fieldMappings.length === 1}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Mapping Button */}
      <button
        onClick={handleAddMapping}
        className="mt-4 flex items-center gap-2 px-4 py-2 text-[#D91C81] border border-[#D91C81] rounded-lg hover:bg-pink-50 transition-colors w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add Field Mapping
      </button>

      {/* Helper Text */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Use dot notation for nested fields (e.g., <code className="bg-white px-1 py-0.5 rounded">customerInfo.email</code>) 
          and array notation for list items (e.g., <code className="bg-white px-1 py-0.5 rounded">items[].sku</code>).
        </p>
      </div>
    </div>
  );
}

export default FieldMapper;