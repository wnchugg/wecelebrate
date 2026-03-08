/**
 * Mode-specific type definitions
 * Requirements: 2.1, 3.1, 3.2, 8.1
 */

import { ValidationRule } from '../core/types';
import { BlockType, Block } from '../blocks/types';

/**
 * Field types for visual editor
 */
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'color' 
  | 'image' 
  | 'number'
  | 'array'
  | 'custom';

/**
 * Conditional rule for field visibility
 */
export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains';
  value: unknown;
}

/**
 * Visual field definition
 */
export interface VisualField {
  id: string;
  label: string;
  type: FieldType;
  defaultValue: unknown;
  validation?: ValidationRule[];
  conditional?: ConditionalRule;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: unknown }>; // For select fields
  customComponent?: React.ComponentType<unknown>; // For custom field types
}

/**
 * Visual section grouping
 */
export interface VisualSection {
  id: string;
  title: string;
  icon?: string;
  fields: VisualField[];
}

/**
 * Visual editor configuration
 */
export interface VisualEditorConfig {
  sections: VisualSection[];
}

/**
 * Props for VisualEditor component
 */
export interface VisualEditorProps {
  config: VisualEditorConfig;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  errors?: Record<string, string>;
}

/**
 * Props for BlocksEditor component
 */
export interface BlocksEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  allowedBlockTypes?: BlockType[];
  enableDragDrop?: boolean;
  enableLayouts?: boolean;
  maxNestingDepth?: number;
}

/**
 * Props for CustomCodeEditor component
 */
export interface CustomCodeEditorProps {
  html: string;
  css: string;
  javascript: string;
  onChange: (code: { html?: string; css?: string; javascript?: string }) => void;
}

/**
 * Custom code tab type
 */
export type CustomCodeTab = 'html' | 'css' | 'javascript';
