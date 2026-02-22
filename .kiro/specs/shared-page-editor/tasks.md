# Implementation Plan: Shared Page Editor

## Overview

This implementation plan refactors three existing page editors (Landing, Welcome, Home) into a unified, extensible component system with Wix-like editing capabilities. The approach follows an incremental strategy: build core infrastructure first, then migrate existing editors one by one, and finally add advanced features. Each task builds on previous work to ensure continuous integration and testability.

## Tasks

- [x] 1. Set up project structure and core types
  - Create directory structure under `src/app/components/page-editor/`
  - Define core TypeScript interfaces in `core/types.ts`
  - Define block types in `blocks/types.ts`
  - Define mode types in `modes/types.ts`
  - Define preview types in `preview/types.ts`
  - Set up barrel exports for clean imports
  - _Requirements: 11.1, 11.2, 11.5_

- [ ] 2. Implement configuration system
  - [x] 2.1 Create configuration type definitions
    - Define `PageConfiguration` interface with discriminated unions
    - Define `VisualConfiguration` with dynamic fields
    - Define `BlockConfiguration` with hierarchy support
    - Define `CustomCodeConfiguration` for HTML/CSS/JS
    - Define `PageMetadata` for tracking changes
    - _Requirements: 11.1, 11.2_
  
  - [ ]* 2.2 Write property test for configuration serialization
    - **Property 3: Configuration Serialization Round-Trip**
    - **Validates: Requirements 14.4, 14.5, 2.6**
  
  - [x] 2.3 Create configuration validator
    - Implement `ConfigurationValidator` class
    - Add validation rules for required fields, types, and values
    - Add schema validation for block content
    - Add validation for nesting depth limits
    - _Requirements: 11.3, 14.7_
  
  - [ ]* 2.4 Write property test for configuration validation
    - **Property 17: Configuration Validation**
    - **Validates: Requirements 11.3, 14.7**

- [ ] 3. Implement Block Registry
  - [x] 3.1 Create BlockRegistry class
    - Implement block registration with metadata
    - Implement block lookup by type and category
    - Implement block creation with default content
    - Add validation for block definitions
    - _Requirements: 4.1, 4.2, 6.1, 6.2_
  
  - [ ]* 3.2 Write property test for block registry
    - **Property 4: Block Registry Consistency**
    - **Validates: Requirements 4.2, 4.5, 6.2**
  
  - [x] 3.3 Register standard block types
    - Register hero block with default content and schema
    - Register text block with default content and schema
    - Register image block with default content and schema
    - Register video block with default content and schema
    - Register CTA button block with default content and schema
    - Register spacer block with default content and schema
    - Register custom HTML block with default content and schema
    - _Requirements: 6.1_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement storage adapters
  - [x] 5.1 Create StorageAdapter interface
    - Define interface with load, save, delete, exists methods
    - Add TypeScript generics for type-safe configuration
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [x] 5.2 Implement SiteSettingsAdapter
    - Implement load from site settings
    - Implement save to site settings
    - Add error handling for missing sites
    - _Requirements: 12.6, 13.6_
  
  - [x] 5.3 Implement GlobalSettingsAdapter
    - Implement load from global settings API
    - Implement save to global settings API
    - Add authentication header handling
    - Add error handling for network failures
    - _Requirements: 20.6, 20.7_
  
  - [ ]* 5.4 Write unit tests for storage adapters
    - Test successful load/save operations
    - Test error handling for network failures
    - Test fallback to default configuration
    - _Requirements: 14.1, 14.2, 14.3, 14.6_

- [ ] 6. Implement configuration history for undo/redo
  - [x] 6.1 Create HistoryManager class
    - Implement history stack with configurable max size
    - Implement push operation to add new states
    - Implement undo operation to revert changes
    - Implement redo operation to reapply changes
    - Implement canUndo and canRedo checks
    - _Requirements: 19.6, 19.7_
  
  - [ ]* 6.2 Write property test for undo/redo
    - **Property 22: Undo/Redo Correctness**
    - **Validates: Requirements 19.6**

- [ ] 7. Implement core PageEditor component
  - [x] 7.1 Create PageEditor component structure
    - Set up component with props interface
    - Initialize state management (config, mode, selectedBlock, etc.)
    - Implement useEffect for loading saved configuration
    - Add error boundary for graceful error handling
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [x] 7.2 Implement configuration change tracking
    - Add hasChanges state tracking
    - Implement updateConfiguration method
    - Track changes on all configuration updates
    - _Requirements: 1.8, 10.1, 10.2_
  
  - [ ]* 7.3 Write property test for change tracking
    - **Property 1: Configuration Change Detection**
    - **Validates: Requirements 1.8, 2.4, 5.7, 8.3, 10.2**
  
  - [x] 7.4 Implement save and reset functionality
    - Implement handleSave with callback invocation
    - Implement handleReset with confirmation
    - Update save status state (idle, saving, saved, error)
    - Clear hasChanges flag after successful save
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.7, 9.8_
  
  - [ ]* 7.5 Write property tests for save/reset
    - **Property 14: Save Button State**
    - **Property 15: Reset Restoration**
    - **Property 16: Save Clears Unsaved Flag**
    - **Validates: Requirements 9.2, 9.5, 9.7, 9.8**

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement EditorHeader component
  - [x] 9.1 Create EditorHeader UI
    - Add save button with loading state
    - Add reset button with confirmation
    - Add unsaved changes warning alert
    - Add save status indicator
    - Style with Tailwind CSS matching existing editors
    - _Requirements: 9.1, 9.4, 10.3_
  
  - [ ]* 9.2 Write unit tests for EditorHeader
    - Test save button disabled state
    - Test reset confirmation dialog
    - Test unsaved changes warning display
    - _Requirements: 9.2, 10.3_

- [ ] 10. Implement ModeSelector component
  - [x] 10.1 Create ModeSelector UI
    - Add mode selection buttons (Visual, Blocks, Custom Code)
    - Implement mode switching logic
    - Filter modes based on allowedModes prop
    - Highlight active mode
    - _Requirements: 1.3, 1.4, 2.1, 2.5_
  
  - [ ]* 10.2 Write property test for mode switching
    - **Property 2: Mode Switching Preservation**
    - **Validates: Requirements 2.2, 8.7**
  
  - [ ]* 10.3 Write unit tests for ModeSelector
    - Test mode filtering based on allowedModes
    - Test active mode highlighting
    - _Requirements: 2.5_

- [ ] 11. Implement VisualEditor component
  - [x] 11.1 Create VisualEditor component
    - Accept VisualEditorConfig prop
    - Dynamically generate form fields from config
    - Implement field rendering for all field types (text, textarea, select, checkbox, color, number)
    - Add tabs/sections for field grouping
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 11.2 Write property test for field generation
    - **Property 11: Visual Field Generation**
    - **Validates: Requirements 3.4, 3.6**
  
  - [x] 11.3 Implement field validation
    - Add validation rule evaluation
    - Display inline error messages
    - Prevent invalid values from being saved
    - _Requirements: 3.5_
  
  - [ ]* 11.4 Write property test for field validation
    - **Property 12: Field Validation Enforcement**
    - **Validates: Requirements 3.5, 5.6, 11.3, 21.9**
  
  - [x] 11.5 Implement conditional field visibility
    - Evaluate conditional rules on field value changes
    - Show/hide fields based on conditions
    - _Requirements: 3.6_

- [ ] 12. Implement PreviewPanel component
  - [x] 12.1 Create PreviewPanel structure
    - Add device mode selector (desktop, tablet, mobile)
    - Add preview container with responsive width
    - Add "open in new tab" link
    - _Requirements: 7.1, 7.2, 7.5, 15.1_
  
  - [ ]* 12.2 Write property test for device modes
    - **Property 9: Device Mode Width Mapping**
    - **Validates: Requirements 7.3, 15.2, 15.3, 15.4**
  
  - [x] 12.3 Implement PreviewRenderer
    - Render visual mode configurations
    - Render blocks mode configurations
    - Render custom code in sandboxed iframe
    - _Requirements: 7.6, 7.7, 7.8_
  
  - [ ]* 12.4 Write property test for preview reactivity
    - **Property 10: Preview Reactivity**
    - **Validates: Requirements 5.5, 7.4**
  
  - [ ]* 12.5 Write unit tests for PreviewPanel
    - Test device mode button states
    - Test iframe sandboxing for custom code
    - _Requirements: 7.8, 15.6_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement CustomCodeEditor component
  - [x] 14.1 Create CustomCodeEditor UI
    - Add tabs for HTML, CSS, JavaScript
    - Add textarea editors with syntax highlighting
    - Add warning alerts about security
    - _Requirements: 8.1, 8.2, 8.5_
  
  - [ ]* 14.2 Write unit tests for CustomCodeEditor
    - Test tab switching
    - Test code preservation when switching tabs
    - _Requirements: 8.2, 8.7_

- [ ] 15. Implement basic BlocksEditor (without drag-drop)
  - [x] 15.1 Create BlockList component
    - Display list of blocks in configuration
    - Show block type and preview
    - Add move up/down buttons
    - Add delete button with confirmation
    - _Requirements: 4.6, 4.7, 4.8_
  
  - [ ]* 15.2 Write property tests for block operations
    - **Property 5: Block Order Preservation**
    - **Property 6: Block Movement Correctness**
    - **Property 7: Block Deletion Completeness**
    - **Validates: Requirements 4.6, 4.7, 4.8**
  
  - [x] 15.3 Create BlockPicker component
    - Display modal with available block types
    - Filter blocks based on allowedBlockTypes
    - Add block on selection
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [ ]* 15.4 Write property test for block filtering
    - **Property 13: Block Type Filtering**
    - **Validates: Requirements 4.3**
  
  - [x] 15.5 Create BlockEditor component
    - Display block-specific editing fields
    - Render different fields based on block type
    - Update block content on field changes
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 15.6 Write property test for block editing
    - **Property 5.1: Block-specific editing fields**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 16. Implement block duplication
  - [x] 16.1 Add duplicate button to BlockList
    - Add duplicate action to block toolbar
    - Implement duplication logic (copy content, generate new ID)
    - _Requirements: 19.2_
  
  - [ ]* 16.2 Write property test for duplication
    - **Property 8: Block Duplication Equivalence**
    - **Validates: Requirements 19.2**

- [ ] 17. Migrate Landing Page Editor
  - [x] 17.1 Create LandingPageEditor wrapper
    - Import PageEditor component
    - Configure visual mode with landing page fields
    - Disable blocks mode
    - Enable custom code mode
    - Provide default configuration
    - Set up SiteSettingsAdapter with 'landingPageConfig' key
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [ ]* 17.2 Write integration test for Landing Page Editor
    - Test loading existing configuration
    - Test saving configuration
    - Test backward compatibility
    - _Requirements: 12.7_
  
  - [x] 17.3 Replace old LandingPageEditor component
    - Update imports in routing
    - Remove old component file
    - Test in development environment

- [x] 18. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Register additional block types
  - [x] 19.1 Register celebration-wall block
    - Define content schema
    - Implement preview renderer
    - Implement editor fields
    - _Requirements: 6.1_
  
  - [x] 19.2 Register testimonial block
    - Define content schema
    - Implement preview renderer
    - Implement editor fields
    - _Requirements: 6.1_
  
  - [x] 19.3 Register gift-preview block
    - Define content schema
    - Implement preview renderer
    - Implement editor fields
    - _Requirements: 6.1_

- [ ] 20. Migrate Welcome Page Editor
  - [x] 20.1 Create WelcomePageEditor wrapper
    - Import PageEditor component
    - Configure visual mode with welcome page fields
    - Enable blocks mode with all block types
    - Enable custom code mode
    - Provide default configuration
    - Set up SiteSettingsAdapter with 'welcomePageConfig' key
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
  
  - [ ]* 20.2 Write integration test for Welcome Page Editor
    - Test loading existing configuration
    - Test saving configuration
    - Test backward compatibility
    - _Requirements: 13.7_
  
  - [x] 20.3 Replace old WelcomePageEditor component
    - Update imports in routing
    - Remove old component file
    - Test in development environment

- [ ] 21. Migrate Home Page Editor
  - [x] 21.1 Create HomePageEditor wrapper
    - Import PageEditor component
    - Configure visual mode with home page fields
    - Disable blocks mode
    - Disable custom code mode
    - Provide default configuration
    - Set up GlobalSettingsAdapter with home page endpoint
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_
  
  - [ ]* 21.2 Write integration test for Home Page Editor
    - Test loading from global settings API
    - Test saving to global settings API
    - Test backward compatibility
    - _Requirements: 20.8_
  
  - [x] 21.3 Replace old HomePageEditor component
    - Update imports in routing
    - Remove old component file
    - Test in development environment

- [x] 22. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Implement layout block system
  - [x] 23.1 Create LayoutBlock component
    - Define layout block content schema (columnCount, columnRatios, gap)
    - Implement column rendering
    - Add column configuration UI
    - Support responsive stacking on mobile
    - _Requirements: 17.1, 17.2, 17.3, 17.9_
  
  - [ ]* 23.2 Write property tests for layout blocks
    - **Property 19: Layout Column Nesting**
    - **Property 26: Responsive Column Stacking**
    - **Validates: Requirements 17.6, 17.7, 17.9, 22.4**
  
  - [x] 23.3 Register layout block in BlockRegistry
    - Add layout block definition
    - Set allowChildren to true
    - Set maxChildren based on column count
    - _Requirements: 17.1_

- [ ] 24. Implement drag and drop system
  - [ ] 24.1 Create DragDropProvider context
    - Implement drag state management
    - Implement startDrag, updateDropTarget, completeDrop, cancelDrag
    - Implement canDrop validation
    - _Requirements: 18.1, 18.2, 18.8_
  
  - [ ]* 24.2 Write property tests for drag and drop
    - **Property 20: Drag and Drop Validity**
    - **Property 21: Drag and Drop Between Columns**
    - **Validates: Requirements 18.5, 18.6, 18.7, 18.8, 18.9**
  
  - [ ] 24.3 Add drag handles to BlockList
    - Add drag handle icon to each block
    - Implement onDragStart handler
    - Implement onDragEnd handler
    - _Requirements: 18.1_
  
  - [ ] 24.4 Implement drop zones
    - Display drop zones between blocks
    - Display drop zones in layout columns
    - Highlight drop zone on drag over
    - _Requirements: 18.3, 18.4, 17.4_
  
  - [ ] 24.5 Implement drop logic
    - Handle drop events
    - Update configuration on successful drop
    - Prevent invalid drops (circular nesting, depth limits)
    - _Requirements: 18.5, 18.6, 18.7, 18.8, 18.9_

- [ ] 25. Implement StylePanel component
  - [ ] 25.1 Create StylePanel UI
    - Add background color/gradient/image controls
    - Add padding and margin controls
    - Add text alignment controls
    - Add border radius and border style controls
    - Add shadow effect controls
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_
  
  - [ ]* 25.2 Write property tests for styling
    - **Property 23: Style Application**
    - **Property 24: Style Copying**
    - **Validates: Requirements 21.2, 21.3, 21.4, 21.5, 21.6, 21.8**
  
  - [ ] 25.3 Implement style presets
    - Create preset style templates
    - Add preset selection UI
    - Apply preset styles to blocks
    - _Requirements: 21.7_
  
  - [ ] 25.4 Implement style copying
    - Add "copy styles" button
    - Add "paste styles" button
    - Copy styles between blocks
    - _Requirements: 21.8_
  
  - [ ] 25.5 Add style validation
    - Validate CSS values
    - Display error messages for invalid styles
    - Prevent saving invalid styles
    - _Requirements: 21.9_

- [x] 26. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 27. Implement responsive design controls
  - [ ] 27.1 Add device-specific visibility controls
    - Add checkboxes for desktop/tablet/mobile visibility
    - Update block metadata with visibility settings
    - Filter blocks in preview based on device mode
    - _Requirements: 22.1_
  
  - [ ]* 27.2 Write property test for device visibility
    - **Property 25: Device-Specific Visibility**
    - **Validates: Requirements 22.1**
  
  - [ ] 27.3 Add responsive spacing controls
    - Add device-specific padding inputs
    - Add device-specific margin inputs
    - Apply responsive values in preview
    - _Requirements: 22.2_
  
  - [ ] 27.4 Add responsive text size controls
    - Add device-specific font size inputs
    - Apply responsive values in preview
    - _Requirements: 22.3_
  
  - [ ] 27.5 Add content overflow warnings
    - Detect content that exceeds viewport width
    - Display warnings for problematic content
    - _Requirements: 22.7_

- [ ] 28. Implement block templates system
  - [ ] 28.1 Create TemplateLibrary component
    - Display template categories
    - Show template previews
    - Implement template selection
    - _Requirements: 23.1, 23.6_
  
  - [ ]* 28.2 Write property tests for templates
    - **Property 27: Template Insertion**
    - **Property 28: Template Editability**
    - **Validates: Requirements 23.3, 23.7**
  
  - [ ] 28.3 Implement template insertion
    - Insert all blocks from template
    - Generate new IDs for inserted blocks
    - _Requirements: 23.3_
  
  - [ ] 28.4 Implement custom template saving
    - Add "save as template" action
    - Store custom templates
    - Display custom templates in library
    - _Requirements: 23.4_

- [ ] 29. Implement global blocks system
  - [ ] 29.1 Add global block marking
    - Add "make global" action to blocks
    - Store global block definitions
    - Link block instances to global definitions
    - _Requirements: 24.1_
  
  - [ ]* 29.2 Write property tests for global blocks
    - **Property 29: Global Block Synchronization**
    - **Property 30: Global Block Detachment**
    - **Property 31: Circular Dependency Prevention**
    - **Validates: Requirements 24.2, 24.5, 24.7**
  
  - [ ] 29.3 Implement global block synchronization
    - Detect changes to global blocks
    - Update all instances when global block changes
    - _Requirements: 24.2_
  
  - [ ] 29.4 Create ReusableBlockLibrary component
    - Display list of global blocks
    - Allow inserting global block instances
    - Show indicators for global block instances
    - _Requirements: 24.3, 24.6_
  
  - [ ] 29.5 Implement block detachment
    - Add "detach from global" action
    - Convert global instance to regular block
    - _Requirements: 24.5_
  
  - [ ] 29.6 Add circular dependency prevention
    - Detect circular references when making blocks global
    - Prevent circular dependencies
    - Display error messages
    - _Requirements: 24.7_

- [ ] 30. Implement visual block manipulation enhancements
  - [ ] 30.1 Add hover action buttons
    - Display action buttons on block hover
    - Add edit, duplicate, delete, move actions
    - _Requirements: 19.1_
  
  - [ ] 30.2 Add floating toolbar
    - Display toolbar when block is selected
    - Add quick styling actions
    - _Requirements: 19.3, 19.4_
  
  - [ ] 30.3 Add keyboard shortcuts
    - Implement delete shortcut (Delete key)
    - Implement duplicate shortcut (Ctrl+D)
    - Implement undo shortcut (Ctrl+Z)
    - Implement redo shortcut (Ctrl+Y)
    - _Requirements: 19.5_

- [x] 31. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 32. Integration and polish
  - [x] 32.1 Add loading states
    - Show loading spinner while loading configuration
    - Show loading state during save operations
    - _Requirements: 9.4_
  
  - [x] 32.2 Add error handling
    - Display error messages for failed operations
    - Implement error recovery options
    - Add error boundaries
    - _Requirements: 14.6_
  
  - [x] 32.3 Add browser navigation warning
    - Implement beforeunload event handler
    - Show confirmation dialog when leaving with unsaved changes
    - _Requirements: 10.6_
  
  - [ ]* 32.4 Write end-to-end integration tests
    - Test complete user workflows
    - Test all three page editors
    - Test backward compatibility with existing data
    - _Requirements: 18**

- [ ] 33. Documentation and cleanup
  - [ ] 33.1 Write API documentation
    - Document PageEditor props interface
    - Document configuration types
    - Document storage adapter interface
    - Document block registry API
    - _Requirements: 16.7_
  
  - [ ] 33.2 Create usage examples
    - Add example for creating new page types
    - Add example for custom block types
    - Add example for custom storage adapters
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [x] 33.3 Clean up old code
    - Remove old editor components
    - Remove unused imports
    - Update routing configuration
    - Run linter and fix issues

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The migration strategy (tasks 17, 20, 21) allows testing each editor independently
- Advanced features (drag-drop, templates, global blocks) are implemented after core functionality is stable
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
