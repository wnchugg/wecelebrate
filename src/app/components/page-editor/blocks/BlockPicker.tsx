/**
 * Block Picker Component
 * Requirements: 4.3, 4.4, 4.5
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BlockType, BlockDefinition } from './types';
import { blockRegistry } from './BlockRegistry';

export interface BlockPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (blockType: BlockType) => void;
  allowedBlockTypes?: BlockType[];
}

export const BlockPicker: React.FC<BlockPickerProps> = ({
  isOpen,
  onClose,
  onSelectBlock,
  allowedBlockTypes,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const allBlocks = blockRegistry.getAll();
  const categories = ['all', ...blockRegistry.getCategories()];

  // Filter blocks by allowed types
  const availableBlocks = allowedBlockTypes
    ? allBlocks.filter((block) => allowedBlockTypes.includes(block.type))
    : allBlocks;

  // Filter by category
  const filteredBlocks =
    selectedCategory === 'all'
      ? availableBlocks
      : availableBlocks.filter((block) => block.category === selectedCategory);

  const handleSelectBlock = (blockType: BlockType) => {
    onSelectBlock(blockType);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add Block</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 p-4 border-b overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Block Grid */}
        <div className="flex-1 overflow-auto p-6">
          {filteredBlocks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No blocks available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredBlocks.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.type}
                    onClick={() => handleSelectBlock(block.type)}
                    className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-3 text-blue-600">
                      <Icon />
                    </div>
                    <div className="font-medium text-sm mb-1">{block.label}</div>
                    <div className="text-xs text-gray-500">{block.description}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};