/**
 * Layout Block Component
 * Provides column-based layout with responsive stacking
 * Requirements: 17.1, 17.2, 17.3, 17.9
 */

import React from 'react';
import { Block, LayoutBlock as LayoutBlockType, LayoutBlockContent } from './types';
import { Plus, Trash2, Settings } from 'lucide-react';

interface LayoutBlockProps {
  block: LayoutBlockType;
  onChange: (updates: Partial<LayoutBlockType>) => void;
  onAddBlock: (columnIndex: number) => void;
  onRemoveBlock: (columnIndex: number, blockIndex: number) => void;
  onEditBlock: (columnIndex: number, blockIndex: number) => void;
  renderBlock: (block: Block, columnIndex: number, blockIndex: number) => React.ReactNode;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
}

export const LayoutBlock: React.FC<LayoutBlockProps> = ({
  block,
  onChange,
  onAddBlock,
  onRemoveBlock,
  onEditBlock,
  renderBlock,
  deviceMode,
}) => {
  const content = block.content as LayoutBlockContent;
  const { columnCount, columnRatios, gap, stackOnMobile, verticalAlign } = content;

  // Calculate column widths based on ratios
  const totalRatio = columnRatios.reduce((sum, ratio) => sum + ratio, 0);
  const columnWidths = columnRatios.map(ratio => `${(ratio / totalRatio) * 100}%`);

  // Determine if columns should stack
  const shouldStack = stackOnMobile && (deviceMode === 'mobile' || deviceMode === 'tablet');

  const handleColumnCountChange = (newCount: number) => {
    const newRatios = Array(newCount).fill(1);
    const newChildren: Block[][] = [];
    
    // Preserve existing columns
    for (let i = 0; i < newCount; i++) {
      newChildren[i] = block.children[i] || [];
    }

    onChange({
      content: {
        ...content,
        columnCount: newCount,
        columnRatios: newRatios,
      },
      children: newChildren,
    });
  };

  const handleRatioChange = (index: number, value: number) => {
    const newRatios = [...columnRatios];
    newRatios[index] = value;
    onChange({
      content: {
        ...content,
        columnRatios: newRatios,
      },
    });
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      {/* Configuration Panel */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Layout Configuration</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Columns
            </label>
            <select
              value={columnCount}
              onChange={(e) => handleColumnCountChange(Number(e.target.value))}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              {[1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Gap
            </label>
            <input
              type="text"
              value={gap}
              onChange={(e) => onChange({
                content: { ...content, gap: e.target.value }
              })}
              placeholder="e.g., 1rem"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Vertical Align
            </label>
            <select
              value={verticalAlign}
              onChange={(e) => onChange({
                content: { ...content, verticalAlign: e.target.value as any }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
              <option value="stretch">Stretch</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={stackOnMobile}
                onChange={(e) => onChange({
                  content: { ...content, stackOnMobile: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
              Stack on Mobile
            </label>
          </div>
        </div>

        {/* Column Ratios */}
        {columnCount > 1 && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Column Ratios
            </label>
            <div className="flex gap-2">
              {columnRatios.map((ratio, index) => (
                <input
                  key={index}
                  type="number"
                  min="1"
                  value={ratio}
                  onChange={(e) => handleRatioChange(index, Number(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md"
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current: {columnRatios.join(':')}
            </p>
          </div>
        )}
      </div>

      {/* Columns */}
      <div
        className={`grid ${shouldStack ? 'grid-cols-1' : ''}`}
        style={{
          gridTemplateColumns: shouldStack ? '1fr' : columnWidths.join(' '),
          gap: gap,
          alignItems: verticalAlign === 'stretch' ? 'stretch' : 
                      verticalAlign === 'center' ? 'center' :
                      verticalAlign === 'bottom' ? 'end' : 'start',
        }}
      >
        {Array.from({ length: columnCount }).map((_, columnIndex) => (
          <div
            key={columnIndex}
            className="border-2 border-dashed border-gray-300 rounded-md p-3 min-h-[100px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">
                Column {columnIndex + 1}
              </span>
              <button
                onClick={() => onAddBlock(columnIndex)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus className="w-3 h-3" />
                Add Block
              </button>
            </div>

            {/* Blocks in this column */}
            <div className="space-y-2">
              {block.children[columnIndex]?.map((childBlock, blockIndex) => (
                <div key={childBlock.id} className="relative group">
                  {renderBlock(childBlock, columnIndex, blockIndex)}
                  
                  {/* Block actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => onEditBlock(columnIndex, blockIndex)}
                      className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
                      title="Edit block"
                    >
                      <Settings className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onRemoveBlock(columnIndex, blockIndex)}
                      className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-red-50"
                      title="Remove block"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}

              {(!block.children[columnIndex] || block.children[columnIndex].length === 0) && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No blocks yet. Click "Add Block" to get started.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
