/**
 * Block system type definitions
 * Requirements: 4.1, 4.2, 6.1, 6.2
 */

import React from 'react';
import { ValidationResult } from '../core/types';

/**
 * Available block types
 */
export type BlockType = 
  | 'hero'
  | 'text'
  | 'image'
  | 'video'
  | 'celebration-wall'
  | 'cta-button'
  | 'testimonial'
  | 'gift-preview'
  | 'spacer'
  | 'custom-html'
  | 'layout'
  | 'columns';

/**
 * Responsive value that can vary by device
 */
export type ResponsiveValue<T> = T | {
  desktop?: T;
  tablet?: T;
  mobile?: T;
};

/**
 * Block metadata
 */
export interface BlockMetadata {
  isGlobal?: boolean;
  globalId?: string;
  templateId?: string;
  locked?: boolean;
  hidden?: boolean;
  deviceVisibility?: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
}

/**
 * Block styles
 */
export interface BlockStyles {
  // Layout
  padding?: ResponsiveValue<string>;
  margin?: ResponsiveValue<string>;
  width?: ResponsiveValue<string>;
  height?: ResponsiveValue<string>;
  
  // Background
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  
  // Border
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  
  // Effects
  boxShadow?: string;
  opacity?: number;
  
  // Typography
  textAlign?: ResponsiveValue<'left' | 'center' | 'right'>;
  fontSize?: ResponsiveValue<string>;
  fontWeight?: string;
  color?: string;
  
  // Custom CSS
  customCSS?: string;
}

/**
 * Base block content (extended by specific block types)
 */
export interface BlockContent {
  [key: string]: any;
}

/**
 * Block structure
 */
export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  styles: BlockStyles;
  children?: Block[]; // For layout blocks
  metadata?: BlockMetadata;
}

/**
 * Layout block specific content
 */
export interface LayoutBlockContent extends BlockContent {
  columnCount: number;
  columnRatios: number[]; // e.g., [1, 2] for 1:2 ratio
  gap: string;
  stackOnMobile: boolean;
  verticalAlign: 'top' | 'center' | 'bottom' | 'stretch';
}

/**
 * Layout block with typed children structure
 */
export interface LayoutBlock extends Omit<Block, 'children'> {
  type: 'layout';
  content: LayoutBlockContent;
  children: Block[][]; // Array of columns, each containing blocks
}

/**
 * Content schema for validation
 */
export interface ContentSchema {
  [key: string]: {
    type: string;
    required?: boolean;
    default?: any;
  };
}

/**
 * Block definition for registry
 */
export interface BlockDefinition {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType;
  category: string;
  defaultContent: BlockContent;
  defaultStyles: BlockStyles;
  contentSchema: ContentSchema;
  renderPreview: (block: Block) => React.ReactNode;
  renderEditor: (block: Block, onChange: (updates: Partial<Block>) => void) => React.ReactNode;
  validate?: (block: Block) => ValidationResult;
  allowChildren?: boolean;
  maxChildren?: number;
}

/**
 * Drag and drop context value
 */
export interface DragDropContextValue {
  dragState: DragState | null;
  startDrag: (blockId: string, sourceParentId: string | null, sourceIndex: number) => void;
  updateDropTarget: (target: DropTarget | null) => void;
  completeDrop: () => void;
  cancelDrag: () => void;
  canDrop: (blockId: string, targetParentId: string | null) => boolean;
}

/**
 * Drag state (re-exported from core for convenience)
 */
export interface DragState {
  draggedBlockId: string;
  draggedBlock: Block;
  sourceParentId: string | null;
  sourceIndex: number;
  currentDropTarget: DropTarget | null;
}

/**
 * Drop target (re-exported from core for convenience)
 */
export interface DropTarget {
  parentId: string | null;
  index: number;
  columnIndex?: number;
  isValid: boolean;
}
