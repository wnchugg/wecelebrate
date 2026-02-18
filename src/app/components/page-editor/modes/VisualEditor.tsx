/**
 * Visual Editor Component
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import React, { useState, useEffect } from 'react';
import { VisualEditorProps, VisualField, VisualSection } from './types';
import { configValidator } from '../utils/validation';

export const VisualEditor: React.FC<VisualEditorProps> = ({
  config,
  values,
  onChange,
  errors: externalErrors,
}) => {
  const [localValues, setLocalValues] = useState(values);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  const handleFieldChange = (fieldId: string, value: any, field: VisualField) => {
    const newValues = { ...localValues, [fieldId]: value };
    setLocalValues(newValues);

    // Validate field
    const result = configValidator.validateField(field, value);
    if (!result.valid && result.errors.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        [fieldId]: result.errors[0].message,
      }));
    } else {
      setValidationErrors((prev) => {
        const { [fieldId]: _, ...rest } = prev;
        return rest;
      });
    }

    onChange(newValues);
  };

  const shouldShowField = (field: VisualField): boolean => {
    if (!field.conditional) return true;

    const { field: condField, operator, value: condValue } = field.conditional;
    const fieldValue = localValues[condField];

    switch (operator) {
      case 'equals':
        return fieldValue === condValue;
      case 'notEquals':
        return fieldValue !== condValue;
      case 'contains':
        return String(fieldValue).includes(String(condValue));
      case 'notContains':
        return !String(fieldValue).includes(String(condValue));
      default:
        return true;
    }
  };

  const renderField = (field: VisualField) => {
    if (!shouldShowField(field)) return null;

    const value = localValues[field.id] ?? field.defaultValue;
    const error = validationErrors[field.id] || externalErrors?.[field.id];

    const commonClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-500' : 'border-gray-300'
    }`;

    return (
      <div key={field.id} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.validation?.some((r) => r.type === 'required') && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>

        {field.type === 'text' && (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
            placeholder={field.placeholder}
            className={commonClasses}
          />
        )}

        {field.type === 'textarea' && (
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
            placeholder={field.placeholder}
            rows={4}
            className={commonClasses}
          />
        )}

        {field.type === 'number' && (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, Number(e.target.value), field)}
            placeholder={field.placeholder}
            className={commonClasses}
          />
        )}

        {field.type === 'checkbox' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.id, e.target.checked, field)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">{field.helpText}</span>
          </div>
        )}

        {field.type === 'select' && field.options && (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
            className={commonClasses}
          >
            <option value="">Select...</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {field.type === 'color' && (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              className="w-12 h-10 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              placeholder="#000000"
              className={commonClasses}
            />
          </div>
        )}

        {field.type === 'image' && (
          <div>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value, field)}
              placeholder="Enter image URL"
              className={commonClasses}
            />
            {value && (
              <img
                src={value}
                alt="Preview"
                className="mt-2 max-w-xs rounded border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        )}

        {field.type === 'custom' && field.customComponent && (
          <field.customComponent
            value={value}
            onChange={(newValue: any) => handleFieldChange(field.id, newValue, field)}
            field={field}
          />
        )}

        {field.helpText && field.type !== 'checkbox' && (
          <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
        )}

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  };

  const renderSection = (section: VisualSection) => {
    return (
      <div key={section.id} className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
          {section.icon && <span className="mr-2">{section.icon}</span>}
          {section.title}
        </h4>
        <div className="space-y-4">
          {section.fields.map((field) => renderField(field))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 overflow-auto">
      <h3 className="text-lg font-semibold mb-6">Visual Editor</h3>
      {config.sections.map((section) => renderSection(section))}
    </div>
  );
};
