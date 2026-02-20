/**
 * Block Editor Component
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import React from 'react';
import { Block } from './types';
import { blockRegistry } from './BlockRegistry';

export interface BlockEditorProps {
  block: Block | null;
  onChange: (updates: Partial<Block>) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ block, onChange }) => {
  if (!block) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Select a block to edit its properties</p>
      </div>
    );
  }

  const definition = blockRegistry.get(block.type);

  if (!definition) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Block type "{block.type}" not found in registry</p>
      </div>
    );
  }

  const handleContentChange = (key: string, value: any) => {
    onChange({
      content: {
        ...block.content,
        [key]: value,
      },
    });
  };

  const handleStyleChange = (key: string, value: any) => {
    onChange({
      styles: {
        ...block.styles,
        [key]: value,
      },
    });
  };

  return (
    <div className="p-6 overflow-auto">
      <h3 className="text-lg font-semibold mb-4 capitalize">
        Edit {block.type.replace(/-/g, ' ')} Block
      </h3>

      {/* Content Section */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Content</h4>
        <div className="space-y-4">
          {Object.entries(definition.contentSchema).map(([key, schema]) => {
            const value = block.content[key] ?? schema.default;

            return (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  {schema.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {schema.type === 'string' && key.includes('text') ? (
                  <textarea
                    value={value || ''}
                    onChange={(e) => handleContentChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                ) : schema.type === 'string' ? (
                  <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleContentChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : schema.type === 'number' ? (
                  <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => handleContentChange(key, Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : schema.type === 'boolean' ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) => handleContentChange(key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleContentChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Styles Section */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Styles</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={block.styles.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <input
                type="text"
                value={block.styles.backgroundColor || ''}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                placeholder="#ffffff"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Padding
            </label>
            <input
              type="text"
              value={typeof block.styles.padding === 'string' ? block.styles.padding : ''}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              placeholder="20px"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Align
            </label>
            <select
              value={typeof block.styles.textAlign === 'string' ? block.styles.textAlign : 'left'}
              onChange={(e) => handleStyleChange('textAlign', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};