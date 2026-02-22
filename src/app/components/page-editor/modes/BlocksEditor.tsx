/**
 * Blocks Editor Component
 * Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { BlocksEditorProps } from './types';
import { Block, BlockType } from '../blocks/types';
import { blockRegistry } from '../blocks/BlockRegistry';
import { BlockList } from '../blocks/BlockList';
import { BlockPicker } from '../blocks/BlockPicker';
import { BlockEditor } from '../blocks/BlockEditor';

export const BlocksEditor: React.FC<BlocksEditorProps> = ({
  blocks,
  onChange,
  allowedBlockTypes,
  enableDragDrop,
  enableLayouts,
  maxNestingDepth,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  const handleAddBlock = (blockType: BlockType) => {
    const newBlock = blockRegistry.createBlock(blockType);
    onChange([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    onChange(newBlocks);
  };

  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    onChange(newBlocks);
  };

  const handleDelete = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
    if (blocks[index].id === selectedBlockId) {
      setSelectedBlockId(null);
    }
  };

  const handleDuplicate = (index: number) => {
    const blockToDuplicate = blocks[index];
    const newBlock = {
      ...JSON.parse(JSON.stringify(blockToDuplicate)),
      id: `${blockToDuplicate.type}-${Date.now()}`,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
  };

  const handleBlockChange = (updates: Partial<Block>) => {
    if (!selectedBlockId) return;

    const newBlocks = blocks.map((block) =>
      block.id === selectedBlockId ? { ...block, ...updates } : block
    );
    onChange(newBlocks);
  };

  return (
    <div className="flex h-full">
      {/* Block List Panel */}
      <div className="w-1/2 border-r p-6 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Blocks</h3>
          <button
            onClick={() => setIsPickerOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Block
          </button>
        </div>

        <BlockList
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      </div>

      {/* Block Editor Panel */}
      <div className="w-1/2 overflow-auto">
        <BlockEditor block={selectedBlock} onChange={handleBlockChange} />
      </div>

      {/* Block Picker Modal */}
      <BlockPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectBlock={handleAddBlock}
        allowedBlockTypes={allowedBlockTypes}
      />
    </div>
  );
};
