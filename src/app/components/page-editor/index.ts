/**
 * Page Editor main exports
 */

// Core types and interfaces
export * from './core';

// Block system
export { blockRegistry } from './blocks/BlockRegistry';
export { BlockList } from './blocks/BlockList';
export { BlockPicker } from './blocks/BlockPicker';
export { BlockEditor } from './blocks/BlockEditor';
export type { Block, BlockType, BlockDefinition, BlockContent, BlockStyles, BlockMetadata } from './blocks/types';

// Editor modes
export * from './modes';

// Preview system
export * from './preview';
