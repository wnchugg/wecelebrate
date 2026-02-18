/**
 * Block List Component
 * Requirements: 4.6, 4.7, 4.8
 */

import React from 'react';
import { Block } from './types';
import { ChevronUp, ChevronDown, Trash2, Copy, Edit } from 'lucide-react';

export interface BlockListProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
}

export const BlockList: React.FC<BlockListProps> = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
}) => {
  const handleDelete = (index: number, blockType: string) => {
    if (window.confirm(`Are you sure you want to delete this ${blockType} block?`)) {
      onDelete(index);
    }
  };

  return (
    <div className="space-y-2">
      {blocks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No blocks yet. Click "Add Block" to get started.</p>
        </div>
      ) : (
        blocks.map((block, index) => {
          const isSelected = block.id === selectedBlockId;
          const isFirst = index === 0;
          const isLast = index === blocks.length - 1;

          return (
            <div
              key={block.id}
              className={`
                border rounded-lg p-3 transition-all cursor-pointer
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
              onClick={() => onSelectBlock(block.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp(index);
                      }}
                      disabled={isFirst}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown(index);
                      }}
                      disabled={isLast}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <div className="font-medium text-sm capitalize">
                      {block.type.replace(/-/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Object.keys(block.content).length} properties
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBlock(block.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(index);
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(index, block.type);
                    }}
                    className="p-2 hover:bg-red-100 text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};