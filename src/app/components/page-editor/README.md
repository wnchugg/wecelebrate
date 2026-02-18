# Shared Page Editor

A comprehensive, reusable page editor component system with Wix-like editing capabilities for building dynamic content pages.

## Overview

The Shared Page Editor consolidates three separate page editors (Landing, Welcome, Home) into a unified, extensible component system. It provides:

- **Visual Mode**: Form-based editing with dynamic field generation
- **Blocks Mode**: Drag-and-drop builder with composable content blocks
- **Custom Code Mode**: Direct HTML/CSS/JavaScript editing
- **Live Preview**: Responsive preview with device switching (desktop/tablet/mobile)
- **Undo/Redo**: Full history management for all operations
- **Type Safety**: Complete TypeScript support with strict typing
- **Extensibility**: Easy to add new page types, block types, and storage adapters

## Architecture

```
page-editor/
├── core/              # Core orchestrator and types
│   ├── PageEditor.tsx
│   ├── EditorHeader.tsx
│   ├── ModeSelector.tsx
│   └── types.ts
├── modes/             # Editor mode implementations
│   ├── VisualEditor.tsx
│   ├── BlocksEditor.tsx
│   ├── CustomCodeEditor.tsx
│   └── types.ts
├── blocks/            # Block system
│   ├── BlockRegistry.ts
│   ├── block-types/
│   └── types.ts
├── preview/           # Preview system
│   ├── PreviewPanel.tsx
│   └── types.ts
├── persistence/       # Storage adapters
│   └── adapters/
│       ├── SiteSettingsAdapter.ts
│       └── GlobalSettingsAdapter.ts
└── utils/             # Utilities
    ├── validation.ts
    └── HistoryManager.ts
```

## Quick Start

```tsx
import { PageEditor } from './components/page-editor';
import { SiteSettingsAdapter } from './components/page-editor/persistence';

const MyPageEditor = () => {
  const defaultConfig = {
    version: '1.0.0',
    mode: 'visual',
    visual: { title: 'My Page' },
  };

  const storageAdapter = new SiteSettingsAdapter(
    siteId,
    updateSite,
    getCurrentSite
  );

  return (
    <PageEditor
      pageType="my-page"
      defaultConfig={defaultConfig}
      storageAdapter={storageAdapter}
      storageKey="myPageConfig"
      allowedModes={['visual', 'blocks', 'custom']}
    />
  );
};
```

## Components

### PageEditor (Main Component)

The core orchestrator that manages editor state and coordinates sub-components.

**Props:**
- `pageType`: Identifier for the page type
- `defaultConfig`: Default page configuration
- `visualConfig`: Configuration for visual mode fields
- `allowedModes`: Array of enabled editor modes
- `storageAdapter`: Storage adapter for persistence
- `storageKey`: Key for storing configuration
- `onSave`: Callback when configuration is saved
- `onChange`: Callback when configuration changes

### EditorHeader

Header component with save/reset buttons and status indicators.

### ModeSelector

Tab-based mode switcher for Visual/Blocks/Custom Code modes.

### VisualEditor

Form-based editor with dynamic field generation from configuration.

### BlocksEditor

Drag-and-drop block builder (placeholder - to be fully implemented).

### CustomCodeEditor

HTML/CSS/JavaScript code editor with tab switching.

### PreviewPanel

Live preview with responsive device mode switching.

## Block System

### BlockRegistry

Central registry for managing block types.

```typescript
import { blockRegistry } from './components/page-editor/blocks';

// Register a custom block
blockRegistry.register('my-block', {
  type: 'my-block',
  label: 'My Block',
  description: 'Custom block type',
  icon: MyIcon,
  category: 'custom',
  defaultContent: { text: '' },
  defaultStyles: {},
  contentSchema: { text: { type: 'string', required: true } },
  renderPreview: (block) => <div>{block.content.text}</div>,
  renderEditor: (block, onChange) => <input />,
});
```

### Standard Block Types

- **hero**: Large header section with title, subtitle, and CTA
- **text**: Rich text content block
- **image**: Image with optional caption
- **video**: Embedded video player
- **cta-button**: Call-to-action button with link
- **spacer**: Vertical spacing
- **custom-html**: Custom HTML content

## Storage Adapters

### SiteSettingsAdapter

Stores configurations in site settings (for Landing/Welcome pages).

```typescript
const adapter = new SiteSettingsAdapter(
  siteId,
  updateSite,
  getCurrentSite
);
```

### GlobalSettingsAdapter

Stores configurations in global settings API (for Home page).

```typescript
const adapter = new GlobalSettingsAdapter(
  endpoint,
  authToken
);
```

## Configuration Types

### PageConfiguration

```typescript
interface PageConfiguration {
  version: string;
  mode: 'visual' | 'blocks' | 'custom';
  visual?: VisualConfiguration;
  blocks?: Block[];
  custom?: CustomCodeConfiguration;
  metadata?: PageMetadata;
}
```

### Block

```typescript
interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  styles: BlockStyles;
  children?: Block[];
  metadata?: BlockMetadata;
}
```

## Validation

The `ConfigurationValidator` class provides comprehensive validation:

```typescript
import { configValidator } from './components/page-editor/utils';

const result = configValidator.validate(config);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## History Management

Undo/redo functionality is built-in:

```typescript
const historyManager = new HistoryManager(initialConfig);

// Push new state
historyManager.push(newConfig);

// Undo/redo
const previous = historyManager.undo();
const next = historyManager.redo();

// Check availability
if (historyManager.canUndo()) {
  // Undo is available
}
```

## Implementation Status

### Completed (Core Infrastructure)
- ✅ Type definitions for all modules
- ✅ PageEditor component with state management
- ✅ EditorHeader with save/reset/undo/redo
- ✅ ModeSelector with tab switching
- ✅ VisualEditor (placeholder)
- ✅ BlocksEditor (placeholder)
- ✅ CustomCodeEditor with HTML/CSS/JS tabs
- ✅ PreviewPanel with device modes
- ✅ BlockRegistry with 7 standard block types
- ✅ SiteSettingsAdapter for site-based storage
- ✅ GlobalSettingsAdapter for global settings
- ✅ ConfigurationValidator with comprehensive rules
- ✅ HistoryManager for undo/redo

### To Be Implemented
- ⏳ Visual editor dynamic field generation
- ⏳ Blocks editor with drag-and-drop
- ⏳ Layout blocks with columns
- ⏳ Block picker modal
- ⏳ Block editor panel
- ⏳ Preview renderer for all modes
- ⏳ Style panel for block styling
- ⏳ Template library
- ⏳ Global blocks system
- ⏳ Property-based tests
- ⏳ Integration tests
- ⏳ Migration of existing page editors

## Next Steps

1. Implement visual editor field generation (Task 11)
2. Implement blocks editor with block list (Task 15)
3. Implement preview renderer (Task 12.3)
4. Migrate Landing Page Editor (Task 17)
5. Migrate Welcome Page Editor (Task 20)
6. Migrate Home Page Editor (Task 21)

## Testing

Property-based tests and unit tests will be added for:
- Configuration serialization
- Block operations
- Validation rules
- Drag and drop
- Mode switching
- Undo/redo

## Contributing

When adding new features:
1. Update type definitions first
2. Implement core logic
3. Add validation rules
4. Write tests
5. Update documentation

## License

Internal use only.
