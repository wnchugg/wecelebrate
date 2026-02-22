/**
 * Mode-specific type definitions
 * Requirements: 2.1, 3.1, 3.2, 8.1
 */

import { ValidationRule } from '../core/types';
import { BlockType } from '../blocks/types';

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
  value: any;
}

/**
 * Visual field definition
 */
export interface VisualField {
  id: string;
  label: string;
  type: FieldType;
  defaultValue: any;
  validation?: ValidationRule[];
  conditional?: ConditionalRule;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: any }>; // For select fields
  customComponent?: React.ComponentType<any>; // For custom field types
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
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  errors?: Record<string, string>;
}

/**
 * Props for BlocksEditor component
 */
export interface BlocksEditorProps {
  blocks: any[]; // Block[] from blocks/types
  onChange: (blocks: any[]) => void;
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
