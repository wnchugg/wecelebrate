/**
 * Core type definitions for the Shared Page Editor
 * Requirements: 11.1, 11.2, 11.5
 */

import { BlockType, Block } from '../blocks/types';
import { VisualEditorConfig } from '../modes/types';
import { DeviceMode } from '../preview/types';

/**
 * Editor mode types
 */
export type EditorMode = 'visual' | 'blocks' | 'custom';

/**
 * Save status states
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Page metadata for tracking changes
 */
export interface PageMetadata {
  lastModified: string;
  modifiedBy?: string;
  pageTitle?: string;
  pageDescription?: string;
}

/**
 * Visual mode configuration
 */
export interface VisualConfiguration {
  [key: string]: any; // Dynamic fields based on VisualEditorConfig
}

/**
 * Custom code configuration
 */
export interface CustomCodeConfiguration {
  html: string;
  css: string;
  javascript: string;
}

/**
 * Main page configuration object
 */
export interface PageConfiguration {
  version: string;
  mode: EditorMode;
  visual?: VisualConfiguration;
  blocks?: Block[];
  custom?: CustomCodeConfiguration;
  metadata?: PageMetadata;
}

/**
 * Configuration history for undo/redo
 */
export interface ConfigurationHistory {
  past: PageConfiguration[];
  present: PageConfiguration;
  future: PageConfiguration[];
  maxSize: number;
}

/**
 * Storage adapter interface for persistence
 */
export interface StorageAdapter {
  load(key: string): Promise<PageConfiguration | null>;
  save(key: string, config: PageConfiguration): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/**
 * Props for the main PageEditor component
 */
export interface PageEditorProps {
  // Page identification
  pageType: string;
  pageId?: string;
  
  // Configuration
  defaultConfig: PageConfiguration;
  visualConfig?: VisualEditorConfig;
  allowedBlockTypes?: BlockType[];
  allowedModes?: EditorMode[];
  
  // Persistence
  storageAdapter: StorageAdapter;
  storageKey: string;
  
  // Callbacks
  onSave?: (config: PageConfiguration) => Promise<void>;
  onLoad?: (config: PageConfiguration) => void;
  onChange?: (config: PageConfiguration) => void;
  
  // Feature flags
  enableDragDrop?: boolean;
  enableLayouts?: boolean;
  enableTemplates?: boolean;
  enableGlobalBlocks?: boolean;
  maxNestingDepth?: number;
}

/**
 * Internal state for PageEditor component
 */
export interface PageEditorState {
  config: PageConfiguration;
  mode: EditorMode;
  selectedBlockId: string | null;
  previewDevice: DeviceMode;
  hasChanges: boolean;
  saveStatus: SaveStatus;
  history: ConfigurationHistory;
  dragState: DragState | null;
}

/**
 * Drag state for drag-and-drop operations
 */
export interface DragState {
  draggedBlockId: string;
  draggedBlock: Block;
  sourceParentId: string | null;
  sourceIndex: number;
  currentDropTarget: DropTarget | null;
}

/**
 * Drop target for drag-and-drop operations
 */
export interface DropTarget {
  parentId: string | null;
  index: number;
  columnIndex?: number; // For layout blocks
  isValid: boolean;
}

/**
 * Validation rule types
 */
export type ValidationRuleType = 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';

/**
 * Validation rule definition
 */
export interface ValidationRule {
  type: ValidationRuleType;
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
