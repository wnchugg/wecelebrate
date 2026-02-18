# Design Document: Shared Page Editor

## Overview

The Shared Page Editor is a comprehensive refactoring that consolidates three separate page editors (Landing, Welcome, Home) into a unified, extensible component system with advanced Wix-like editing capabilities. The design follows a component-based architecture with clear separation of concerns:

- **Core PageEditor Component**: Orchestrates all editing functionality
- **Mode System**: Pluggable editors for Visual, Blocks, and Custom Code modes
- **Block System**: Extensible registry with 10+ block types and layout support
- **Preview System**: Live preview with responsive device switching
- **Configuration System**: Type-safe configuration with validation
- **Persistence Layer**: Flexible storage adapters for different backends

The architecture prioritizes reusability, type safety, and extensibility to support current needs and future page types.

## Architecture

### High-Level Component Structure

```
PageEditor (Core Orchestrator)
├── EditorHeader (Save/Reset/Preview Controls)
├── ModeSelector (Visual/Blocks/Custom Code)
├── EditorContent (Mode-specific UI)
│   ├── VisualEditor (Form-based editing)
│   ├── BlocksEditor (Drag-and-drop builder)
│   │   ├── BlockList (Hierarchical block tree)
│   │   ├── BlockPicker (Add new blocks)
│   │   ├── BlockEditor (Edit selected block)
│   │   └── DragDropContext (Drag and drop logic)
│   └── CustomCodeEditor (HTML/CSS/JS editors)
└── PreviewPanel (Live preview with device modes)
```

### Data Flow

```
User Action → PageEditor State Update → Configuration Change → Preview Update
                                     ↓
                              Persistence Layer (on save)
```

### Module Organization

```
src/app/components/page-editor/
├── core/
│   ├── PageEditor.tsx              # Main component
│   ├── EditorHeader.tsx            # Header with actions
│   ├── ModeSelector.tsx            # Mode switching UI
│   └── types.ts                    # Core type definitions
├── modes/
│   ├── VisualEditor.tsx            # Visual mode implementation
│   ├── BlocksEditor.tsx            # Blocks mode implementation
│   ├── CustomCodeEditor.tsx        # Custom code mode
│   └── types.ts                    # Mode-specific types
├── blocks/
│   ├── BlockRegistry.ts            # Block type registry
│   ├── BlockList.tsx               # Block list UI
│   ├── BlockPicker.tsx             # Block selection modal
│   ├── BlockEditor.tsx             # Block editing panel
│   ├── DragDropProvider.tsx        # Drag and drop context
│   ├── LayoutBlock.tsx             # Column layout block
│   ├── types.ts                    # Block type definitions
│   └── block-types/                # Individual block implementations
│       ├── HeroBlock.tsx
│       ├── TextBlock.tsx
│       ├── ImageBlock.tsx
│       └── ...
├── preview/
│   ├── PreviewPanel.tsx            # Preview container
│   ├── PreviewRenderer.tsx         # Renders configuration
│   ├── DeviceModeSelector.tsx      # Device switching
│   └── types.ts                    # Preview types
├── styling/
│   ├── StylePanel.tsx              # Block styling UI
│   ├── StylePresets.tsx            # Preset styles
│   └── types.ts                    # Style types
├── persistence/
│   ├── ConfigurationManager.ts     # Save/load logic
│   ├── StorageAdapter.ts           # Storage interface
│   └── adapters/                   # Storage implementations
│       ├── SiteSettingsAdapter.ts
│       └── GlobalSettingsAdapter.ts
└── utils/
    ├── validation.ts               # Configuration validation
    ├── defaults.ts                 # Default configurations
    └── helpers.ts                  # Utility functions
```

## Components and Interfaces

### Core PageEditor Component

**Purpose**: Main orchestrator component that manages editor state and coordinates sub-components.

**Props Interface**:
```typescript
interface PageEditorProps {
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
```

**State Management**:
```typescript
interface PageEditorState {
  config: PageConfiguration;
  mode: EditorMode;
  selectedBlockId: string | null;
  previewDevice: DeviceMode;
  hasChanges: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  history: ConfigurationHistory;
  dragState: DragState | null;
}
```

**Key Methods**:
- `loadConfiguration()`: Load saved configuration from storage
- `saveConfiguration()`: Persist current configuration
- `resetConfiguration()`: Restore default configuration
- `updateConfiguration(updates)`: Apply configuration changes
- `switchMode(mode)`: Change editor mode
- `selectBlock(id)`: Select a block for editing
- `undo()`: Revert last change
- `redo()`: Reapply reverted change

### Configuration Types

**Base Configuration**:
```typescript
interface PageConfiguration {
  version: string;
  mode: EditorMode;
  visual?: VisualConfiguration;
  blocks?: Block[];
  custom?: CustomCodeConfiguration;
  metadata?: PageMetadata;
}

type EditorMode = 'visual' | 'blocks' | 'custom';

interface PageMetadata {
  lastModified: string;
  modifiedBy?: string;
  pageTitle?: string;
  pageDescription?: string;
}
```

**Visual Configuration**:
```typescript
interface VisualConfiguration {
  [key: string]: any; // Dynamic fields based on VisualEditorConfig
}

interface VisualEditorConfig {
  sections: VisualSection[];
}

interface VisualSection {
  id: string;
  title: string;
  icon?: string;
  fields: VisualField[];
}

interface VisualField {
  id: string;
  label: string;
  type: FieldType;
  defaultValue: any;
  validation?: ValidationRule[];
  conditional?: ConditionalRule;
  placeholder?: string;
  helpText?: string;
}

type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'color' 
  | 'image' 
  | 'number'
  | 'array'
  | 'custom';
```

**Block Configuration**:
```typescript
interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  styles: BlockStyles;
  children?: Block[]; // For layout blocks
  metadata?: BlockMetadata;
}

interface BlockMetadata {
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

interface BlockStyles {
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

type ResponsiveValue<T> = T | {
  desktop?: T;
  tablet?: T;
  mobile?: T;
};
```

**Custom Code Configuration**:
```typescript
interface CustomCodeConfiguration {
  html: string;
  css: string;
  javascript: string;
}
```

### Block System

**Block Registry**:
```typescript
class BlockRegistry {
  private blocks: Map<BlockType, BlockDefinition>;
  
  register(type: BlockType, definition: BlockDefinition): void;
  unregister(type: BlockType): void;
  get(type: BlockType): BlockDefinition | undefined;
  getAll(): BlockDefinition[];
  getByCategory(category: string): BlockDefinition[];
  createBlock(type: BlockType): Block;
}

interface BlockDefinition {
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

type BlockType = 
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
```

**Layout Block**:
```typescript
interface LayoutBlockContent {
  columnCount: number;
  columnRatios: number[]; // e.g., [1, 2] for 1:2 ratio
  gap: string;
  stackOnMobile: boolean;
  verticalAlign: 'top' | 'center' | 'bottom' | 'stretch';
}

interface LayoutBlock extends Block {
  type: 'layout';
  content: LayoutBlockContent;
  children: Block[][]; // Array of columns, each containing blocks
}
```

### Drag and Drop System

**Drag State**:
```typescript
interface DragState {
  draggedBlockId: string;
  draggedBlock: Block;
  sourceParentId: string | null;
  sourceIndex: number;
  currentDropTarget: DropTarget | null;
}

interface DropTarget {
  parentId: string | null;
  index: number;
  columnIndex?: number; // For layout blocks
  isValid: boolean;
}
```

**Drag and Drop Provider**:
```typescript
interface DragDropContextValue {
  dragState: DragState | null;
  startDrag: (blockId: string, sourceParentId: string | null, sourceIndex: number) => void;
  updateDropTarget: (target: DropTarget | null) => void;
  completeDrop: () => void;
  cancelDrag: () => void;
  canDrop: (blockId: string, targetParentId: string | null) => boolean;
}
```

### Preview System

**Preview Renderer**:
```typescript
interface PreviewRendererProps {
  config: PageConfiguration;
  device: DeviceMode;
  interactive?: boolean;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const deviceWidths = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};
```

**Preview Panel**:
```typescript
interface PreviewPanelProps {
  config: PageConfiguration;
  device: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
  showDeviceControls?: boolean;
  showExternalLink?: boolean;
  externalUrl?: string;
}
```

### Storage System

**Storage Adapter Interface**:
```typescript
interface StorageAdapter {
  load(key: string): Promise<PageConfiguration | null>;
  save(key: string, config: PageConfiguration): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
```

**Site Settings Adapter** (for Landing/Welcome pages):
```typescript
class SiteSettingsAdapter implements StorageAdapter {
  constructor(
    private siteId: string,
    private updateSite: (id: string, updates: any) => Promise<void>
  ) {}
  
  async load(key: string): Promise<PageConfiguration | null> {
    // Load from currentSite.settings[key]
  }
  
  async save(key: string, config: PageConfiguration): Promise<void> {
    // Save to currentSite.settings[key]
  }
}
```

**Global Settings Adapter** (for Home page):
```typescript
class GlobalSettingsAdapter implements StorageAdapter {
  constructor(
    private endpoint: string,
    private authToken: string
  ) {}
  
  async load(key: string): Promise<PageConfiguration | null> {
    // Fetch from global settings API
  }
  
  async save(key: string, config: PageConfiguration): Promise<void> {
    // POST to global settings API
  }
}
```

## Data Models

### Block Hierarchy

Blocks are organized in a tree structure to support nesting and layouts:

```
Root
├── Block 1 (Hero)
├── Block 2 (Layout)
│   ├── Column 1
│   │   ├── Block 3 (Text)
│   │   └── Block 4 (Image)
│   └── Column 2
│       └── Block 5 (CTA Button)
└── Block 3 (Text)
```

**Tree Operations**:
- `findBlock(id)`: Locate a block by ID
- `getParent(id)`: Get parent block or null for root
- `getChildren(id)`: Get direct children
- `getPath(id)`: Get path from root to block
- `insertBlock(block, parentId, index)`: Add block at position
- `moveBlock(id, newParentId, newIndex)`: Relocate block
- `deleteBlock(id)`: Remove block and descendants
- `duplicateBlock(id)`: Create copy of block

### Configuration History

For undo/redo functionality:

```typescript
interface ConfigurationHistory {
  past: PageConfiguration[];
  present: PageConfiguration;
  future: PageConfiguration[];
  maxSize: number;
}

class HistoryManager {
  push(config: PageConfiguration): void;
  undo(): PageConfiguration | null;
  redo(): PageConfiguration | null;
  clear(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}
```

### Validation System

```typescript
interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

class ConfigurationValidator {
  validate(config: PageConfiguration): ValidationResult;
  validateBlock(block: Block): ValidationResult;
  validateField(field: VisualField, value: any): ValidationResult;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following groups of related properties that can be consolidated:

**Configuration Change Tracking (1.8, 2.4, 5.7, 8.3, 10.2)**: All test that various operations set the unsaved changes flag. These can be combined into one comprehensive property.

**Mode Switching Preservation (2.2, 8.7)**: Both test that switching modes preserves data. Can be combined into one round-trip property.

**Device Mode Behavior (7.3, 15.2, 15.3, 15.4)**: All test that device modes set correct widths. Can be combined into one property with multiple cases.

**Block Operations and Configuration (4.6, 4.7, 4.8, 18.5, 18.9)**: Multiple properties about block manipulation. Can consolidate into fewer comprehensive properties.

**Validation Properties (3.5, 5.6, 11.3, 14.7, 21.9)**: Multiple validation properties. Can consolidate into one comprehensive validation property.

**Styling Properties (21.2-21.6)**: Multiple styling capabilities. Can consolidate into one property about style application.

**Responsive Properties (22.1-22.4)**: Multiple responsive behaviors. Can consolidate into fewer properties.

### Correctness Properties

Property 1: Configuration Change Detection
*For any* valid page configuration and any modification operation (mode switch, block add/edit/delete, style change, content edit), performing that operation should set the unsaved changes flag to true.
**Validates: Requirements 1.8, 2.4, 5.7, 8.3, 10.2**

Property 2: Mode Switching Preservation
*For any* valid page configuration and any sequence of mode switches, switching modes and returning to the original mode should preserve the configuration data (round-trip property).
**Validates: Requirements 2.2, 8.7**

Property 3: Configuration Serialization Round-Trip
*For any* valid page configuration, serializing to JSON and then deserializing should produce an equivalent configuration object.
**Validates: Requirements 14.4, 14.5, 2.6**

Property 4: Block Registry Consistency
*For any* block type registered in the Block_Registry, creating a block of that type should produce a block with content matching the registered default content schema.
**Validates: Requirements 4.2, 4.5, 6.2**

Property 5: Block Order Preservation
*For any* list of blocks, the visual rendering order should match the order in the configuration array (invariant property).
**Validates: Requirements 4.8**

Property 6: Block Movement Correctness
*For any* block in a configuration and any valid move operation (up, down, or drag-drop), the block should appear at the new position and all other blocks should maintain their relative order.
**Validates: Requirements 4.6, 18.5, 18.9**

Property 7: Block Deletion Completeness
*For any* block with ID in a configuration, deleting that block should result in a configuration where no block with that ID exists (including nested blocks).
**Validates: Requirements 4.7**

Property 8: Block Duplication Equivalence
*For any* block in a configuration, duplicating that block should create a new block with identical content and styles but a different ID.
**Validates: Requirements 19.2**

Property 9: Device Mode Width Mapping
*For any* device mode (desktop, tablet, mobile), the preview panel width should match the defined width for that device mode.
**Validates: Requirements 7.3, 15.2, 15.3, 15.4**

Property 10: Preview Reactivity
*For any* configuration change, the preview should update to reflect the new configuration within the next render cycle.
**Validates: Requirements 5.5, 7.4**

Property 11: Visual Field Generation
*For any* valid VisualEditorConfig, the rendered form should contain input elements for all non-conditional fields, and conditional fields should appear when their conditions are met.
**Validates: Requirements 3.4, 3.6**

Property 12: Field Validation Enforcement
*For any* field with validation rules and any invalid value, attempting to set that value should be rejected and an error message should be displayed.
**Validates: Requirements 3.5, 5.6, 11.3, 21.9**

Property 13: Block Type Filtering
*For any* page configuration with allowed block types specified, the block picker should only display blocks whose types are in the allowed list.
**Validates: Requirements 4.3**

Property 14: Save Button State
*For any* editor state, the save button should be disabled if and only if the unsaved changes flag is false.
**Validates: Requirements 9.2**

Property 15: Reset Restoration
*For any* editor state with a default configuration, triggering reset should restore the configuration to match the default configuration exactly.
**Validates: Requirements 9.5, 9.7**

Property 16: Save Clears Unsaved Flag
*For any* editor state with unsaved changes, successfully completing a save operation should set the unsaved changes flag to false.
**Validates: Requirements 9.8**

Property 17: Configuration Validation
*For any* configuration object, validation should reject configurations that violate schema constraints (missing required fields, invalid types, invalid values).
**Validates: Requirements 11.3, 14.7**

Property 18: Backward Compatibility
*For any* valid configuration from a previous version, loading that configuration should either succeed with the configuration intact or succeed with a migrated equivalent configuration.
**Validates: Requirements 12.7, 13.7, 20.8**

Property 19: Layout Column Nesting
*For any* layout block with N columns, each column should be able to contain blocks, and those blocks can include layout blocks up to the maximum nesting depth.
**Validates: Requirements 17.6, 17.7**

Property 20: Drag and Drop Validity
*For any* drag operation, dropping a block should only succeed if the drop target is valid (not dropping a layout into itself, not exceeding nesting depth).
**Validates: Requirements 18.8**

Property 21: Drag and Drop Between Columns
*For any* block in column A of a layout, dragging it to column B should remove it from column A and add it to column B at the drop position.
**Validates: Requirements 18.6, 18.7**

Property 22: Undo/Redo Correctness
*For any* sequence of operations, performing undo should restore the previous configuration, and performing redo should restore the configuration before the undo.
**Validates: Requirements 19.6**

Property 23: Style Application
*For any* block and any valid style property (background, padding, margin, border, shadow), setting that style should result in the block's styles object containing that property with the specified value.
**Validates: Requirements 21.2, 21.3, 21.4, 21.5, 21.6**

Property 24: Style Copying
*For any* two blocks A and B, copying styles from A to B should result in B having identical style properties to A (but maintaining its own content).
**Validates: Requirements 21.8**

Property 25: Device-Specific Visibility
*For any* block with device visibility settings, the block should only render in the preview when the current device mode matches a device where the block is visible.
**Validates: Requirements 22.1**

Property 26: Responsive Column Stacking
*For any* layout block with multiple columns, switching to mobile device mode should cause columns to stack vertically.
**Validates: Requirements 17.9, 22.4**

Property 27: Template Insertion
*For any* template containing N blocks, inserting that template should add exactly N blocks to the configuration at the insertion point.
**Validates: Requirements 23.3**

Property 28: Template Editability
*For any* blocks inserted from a template, those blocks should be editable independently (not linked to the template).
**Validates: Requirements 23.7**

Property 29: Global Block Synchronization
*For any* global block with ID X, editing the content of any instance of X should update the content of all other instances of X.
**Validates: Requirements 24.2**

Property 30: Global Block Detachment
*For any* block instance linked to a global block, detaching it should create an independent copy that no longer synchronizes with the global block.
**Validates: Requirements 24.5**

Property 31: Circular Dependency Prevention
*For any* attempt to create a global block that references itself (directly or through a chain), the operation should be rejected.
**Validates: Requirements 24.7**

## Error Handling

### Error Categories

1. **Validation Errors**: Invalid configuration values, schema violations
2. **Storage Errors**: Failed save/load operations, network issues
3. **User Errors**: Invalid drag-drop operations, circular dependencies
4. **System Errors**: Component rendering failures, unexpected state

### Error Handling Strategy

**Validation Errors**:
- Display inline error messages next to invalid fields
- Prevent save operations when validation errors exist
- Highlight invalid blocks in the block list
- Provide clear error messages with correction guidance

**Storage Errors**:
- Display toast notifications for save/load failures
- Retry failed operations with exponential backoff
- Preserve unsaved changes in local storage as backup
- Provide manual retry option for failed operations

**User Errors**:
- Prevent invalid operations (disable invalid drop zones)
- Show warning messages for potentially destructive actions
- Provide undo capability for accidental operations
- Display helpful tooltips explaining why operations are disabled

**System Errors**:
- Catch and log all component errors
- Display error boundaries with recovery options
- Provide "reset to last saved" option
- Report errors to monitoring service

### Error Recovery

```typescript
interface ErrorRecovery {
  // Automatic recovery
  autoSave: boolean;              // Save to local storage every N seconds
  autoSaveInterval: number;       // Interval in milliseconds
  
  // Manual recovery
  recoverFromLocalStorage(): PageConfiguration | null;
  resetToLastSaved(): void;
  resetToDefault(): void;
  
  // Error reporting
  reportError(error: Error, context: ErrorContext): void;
}
```

## Testing Strategy

### Dual Testing Approach

The Shared Page Editor requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Component rendering with specific configurations
- User interaction flows (click, drag, type)
- Error boundary behavior
- Storage adapter integration
- Specific block type implementations

**Property-Based Tests**: Verify universal properties across all inputs
- Configuration serialization/deserialization
- Block operations (add, move, delete, duplicate)
- Validation rules across all field types
- Drag and drop operations
- Mode switching preservation
- Undo/redo correctness

### Property Test Configuration

All property-based tests should:
- Run minimum 100 iterations per test
- Use the project's property-based testing library (fast-check for TypeScript)
- Tag each test with: **Feature: shared-page-editor, Property N: [property text]**
- Generate random but valid configurations using generators
- Test edge cases (empty configs, maximum nesting, large block counts)

### Test Organization

```
src/app/components/page-editor/__tests__/
├── unit/
│   ├── PageEditor.test.tsx
│   ├── BlocksEditor.test.tsx
│   ├── VisualEditor.test.tsx
│   ├── PreviewPanel.test.tsx
│   └── ...
├── properties/
│   ├── configuration.properties.test.ts
│   ├── blocks.properties.test.ts
│   ├── drag-drop.properties.test.ts
│   ├── validation.properties.test.ts
│   └── ...
├── integration/
│   ├── landing-page.integration.test.tsx
│   ├── welcome-page.integration.test.tsx
│   ├── home-page.integration.test.tsx
│   └── ...
└── generators/
    ├── configurationGenerators.ts
    ├── blockGenerators.ts
    └── styleGenerators.ts
```

### Example Property Test

```typescript
import * as fc from 'fast-check';

// Feature: shared-page-editor, Property 3: Configuration Serialization Round-Trip
describe('Configuration Serialization', () => {
  it('should preserve configuration through JSON round-trip', () => {
    fc.assert(
      fc.property(
        configurationGenerator(),
        (config) => {
          const serialized = JSON.stringify(config);
          const deserialized = JSON.parse(serialized);
          expect(deserialized).toEqual(config);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Testing Priorities

1. **Critical Path**: Configuration persistence, block operations, mode switching
2. **User Safety**: Validation, error handling, unsaved changes warnings
3. **Data Integrity**: Serialization, backward compatibility, global block sync
4. **User Experience**: Drag and drop, preview updates, responsive behavior
5. **Extensibility**: Block registry, custom fields, storage adapters

### Integration Testing

Integration tests should verify:
- Landing Page Editor uses PageEditor correctly
- Welcome Page Editor uses PageEditor correctly
- Home Page Editor uses PageEditor correctly
- Storage adapters work with real backends
- Preview renders match actual page rendering
- Backward compatibility with existing saved configurations

### Manual Testing Checklist

Before release, manually verify:
- [ ] All three page editors load existing configurations
- [ ] Drag and drop works smoothly across all scenarios
- [ ] Preview updates immediately on all changes
- [ ] Save/load works with both storage adapters
- [ ] Undo/redo works for all operations
- [ ] Responsive preview shows correct layouts
- [ ] Global blocks synchronize correctly
- [ ] Templates insert and remain editable
- [ ] Validation prevents invalid configurations
- [ ] Error messages are clear and helpful
