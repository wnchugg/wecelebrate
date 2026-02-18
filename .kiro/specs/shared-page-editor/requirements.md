# Requirements Document: Shared Page Editor

## Introduction

The Shared Page Editor is a refactoring initiative to consolidate duplicate code between the Landing Page Editor, Welcome Page Editor, and Home Page Editor into a reusable component system with Wix-like editing capabilities. Currently, all three editors share significant functionality (editing modes, live preview, save/reset, device switching) but maintain separate implementations, leading to code duplication and maintenance overhead. This refactoring will create a unified, extensible page editor architecture that eliminates duplication while preserving all existing functionality, adding advanced layout capabilities (columns, nested blocks), and enabling non-developers to design and build dynamic modern content pages.

## Glossary

- **Page_Editor**: The core reusable component that provides editing functionality for any page type
- **Visual_Mode**: Form-based editing interface with predefined fields
- **Blocks_Mode**: Drag-and-drop builder with composable content blocks
- **Custom_Code_Mode**: Direct HTML/CSS/JavaScript editing interface
- **Preview_Panel**: Live preview component showing page appearance across device sizes
- **Block_Type**: A specific type of content block (hero, text, image, video, etc.)
- **Page_Configuration**: Type-safe configuration object defining a page's content and settings
- **Block_Registry**: System for registering and managing available block types
- **Visual_Editor_Config**: Configuration defining available fields for visual mode per page type
- **Device_Mode**: Preview viewport size (desktop, tablet, mobile)
- **Site_Settings**: Persistent storage location for page configurations
- **Layout_Block**: A container block that can hold multiple child blocks in columns
- **Column**: A vertical section within a layout block that contains blocks
- **Drag_Handle**: UI element for dragging and reordering blocks
- **Drop_Zone**: Visual indicator showing where a block can be dropped
- **Block_Hierarchy**: Tree structure representing nested blocks and layouts
- **Global_Settings**: Application-wide settings storage (for Home Page)

## Requirements

### Requirement 1: Core Page Editor Component

**User Story:** As a developer, I want a reusable PageEditor component, so that I can eliminate code duplication and maintain consistent editing functionality across all page types.

#### Acceptance Criteria

1. THE Page_Editor SHALL accept a page type identifier as a required prop
2. THE Page_Editor SHALL accept a configuration object defining available modes and features
3. THE Page_Editor SHALL render mode selection UI (Visual, Blocks, Custom Code)
4. WHEN a user selects a mode, THE Page_Editor SHALL display the appropriate editor interface
5. THE Page_Editor SHALL maintain internal state for current configuration and unsaved changes
6. THE Page_Editor SHALL provide save and reset functionality through callback props
7. THE Page_Editor SHALL integrate the Preview_Panel component
8. THE Page_Editor SHALL track unsaved changes and display appropriate warnings

### Requirement 2: Mode Management System

**User Story:** As a user, I want to switch between different editing modes, so that I can choose the editing approach that best fits my needs and skill level.

#### Acceptance Criteria

1. THE Page_Editor SHALL support three editing modes: visual, blocks, and custom
2. WHEN a user switches modes, THE Page_Editor SHALL preserve the underlying configuration
3. THE Page_Editor SHALL display mode-specific UI based on the active mode
4. THE Page_Editor SHALL mark configuration as changed when mode is switched
5. WHERE a page type disables certain modes, THE Page_Editor SHALL hide those mode options
6. THE Page_Editor SHALL persist the selected mode in the page configuration

### Requirement 3: Visual Editor Configuration System

**User Story:** As a developer, I want to configure visual editor fields per page type, so that each page can have appropriate form fields without code duplication.

#### Acceptance Criteria

1. THE Page_Editor SHALL accept a Visual_Editor_Config defining available fields
2. THE Visual_Editor_Config SHALL specify field types (text, textarea, select, checkbox, color, etc.)
3. THE Visual_Editor_Config SHALL support field grouping into tabs or sections
4. WHEN rendering visual mode, THE Page_Editor SHALL dynamically generate form fields from config
5. THE Page_Editor SHALL validate field values according to field type specifications
6. THE Page_Editor SHALL support conditional field visibility based on other field values
7. THE Visual_Editor_Config SHALL support custom field components for specialized inputs

### Requirement 4: Block System Architecture

**User Story:** As a developer, I want an extensible block system, so that I can easily add new block types and reuse blocks across different page types.

#### Acceptance Criteria

1. THE Page_Editor SHALL maintain a Block_Registry of available block types
2. THE Block_Registry SHALL allow registration of new block types with metadata
3. WHEN a page type is configured, THE Page_Editor SHALL filter blocks based on allowed types
4. THE Page_Editor SHALL provide a block picker UI showing available blocks
5. WHEN a user adds a block, THE Page_Editor SHALL create it with default content
6. THE Page_Editor SHALL support block reordering through move up/down actions
7. THE Page_Editor SHALL support block deletion with confirmation
8. THE Page_Editor SHALL maintain block order in the configuration array

### Requirement 5: Block Content Editing

**User Story:** As a user, I want to edit block content and styling, so that I can customize each block to match my needs.

#### Acceptance Criteria

1. WHEN a user selects a block, THE Page_Editor SHALL display block-specific editing fields
2. THE Page_Editor SHALL render different field sets based on block type
3. THE Page_Editor SHALL support editing block content properties
4. THE Page_Editor SHALL support editing block style properties (padding, margin, backgroundColor)
5. WHEN block content changes, THE Page_Editor SHALL update the preview immediately
6. THE Page_Editor SHALL validate block content according to block type requirements
7. THE Page_Editor SHALL mark configuration as changed when blocks are modified

### Requirement 6: Block Type Definitions

**User Story:** As a developer, I want standardized block type definitions, so that blocks behave consistently across different page types.

#### Acceptance Criteria

1. THE Block_Registry SHALL define 10 standard block types: hero, text, image, video, celebration-wall, cta-button, testimonial, gift-preview, spacer, custom-html
2. WHEN a block type is registered, THE Block_Registry SHALL require a label, icon, description, and default content factory
3. THE Block_Registry SHALL require a content schema defining expected properties
4. THE Block_Registry SHALL require a render component for preview display
5. THE Block_Registry SHALL support block-specific validation rules
6. THE Block_Registry SHALL provide type-safe content interfaces for each block type

### Requirement 7: Preview Panel Component

**User Story:** As a user, I want to see a live preview of my page, so that I can visualize changes before saving.

#### Acceptance Criteria

1. THE Preview_Panel SHALL display a live preview of the current page configuration
2. THE Preview_Panel SHALL support three device modes: desktop, tablet, mobile
3. WHEN device mode changes, THE Preview_Panel SHALL adjust viewport width accordingly
4. THE Preview_Panel SHALL update immediately when configuration changes
5. THE Preview_Panel SHALL provide an "open in new tab" action
6. THE Preview_Panel SHALL render visual mode content using a preview renderer
7. THE Preview_Panel SHALL render blocks mode content by iterating through blocks
8. THE Preview_Panel SHALL render custom code mode content in an isolated iframe

### Requirement 8: Custom Code Editor

**User Story:** As a user, I want to write custom HTML/CSS/JavaScript, so that I have full control over page appearance and behavior.

#### Acceptance Criteria

1. THE Page_Editor SHALL provide separate editors for HTML, CSS, and JavaScript
2. THE Page_Editor SHALL display editors in tabs for easy switching
3. WHEN custom code changes, THE Page_Editor SHALL mark configuration as changed
4. THE Page_Editor SHALL validate that custom code includes required navigation elements
5. THE Page_Editor SHALL display warnings about security and code quality
6. THE Preview_Panel SHALL render custom code in a sandboxed iframe
7. THE Page_Editor SHALL preserve custom code when switching to other modes

### Requirement 9: Save and Reset Functionality

**User Story:** As a user, I want to save my changes and reset to defaults, so that I can persist my work or start over.

#### Acceptance Criteria

1. THE Page_Editor SHALL provide a save button that triggers a save callback
2. THE Page_Editor SHALL disable the save button when no changes exist
3. WHEN save is triggered, THE Page_Editor SHALL pass the current configuration to the callback
4. THE Page_Editor SHALL display save status (idle, saving, saved, error)
5. THE Page_Editor SHALL provide a reset button that restores default configuration
6. WHEN reset is clicked, THE Page_Editor SHALL require user confirmation
7. WHEN reset is confirmed, THE Page_Editor SHALL restore default configuration and mark as changed
8. THE Page_Editor SHALL clear the "unsaved changes" flag after successful save

### Requirement 10: Unsaved Changes Tracking

**User Story:** As a user, I want to be warned about unsaved changes, so that I don't accidentally lose my work.

#### Acceptance Criteria

1. THE Page_Editor SHALL track whether the current configuration differs from saved state
2. WHEN configuration changes, THE Page_Editor SHALL set the unsaved changes flag
3. WHEN unsaved changes exist, THE Page_Editor SHALL display a warning alert
4. THE Page_Editor SHALL clear the unsaved changes flag after successful save
5. THE Page_Editor SHALL provide the unsaved changes state to parent components
6. WHERE browser navigation is attempted with unsaved changes, THE Page_Editor SHALL trigger a confirmation dialog

### Requirement 11: Type Safety and Validation

**User Story:** As a developer, I want type-safe configuration objects, so that I can catch errors at compile time and ensure data integrity.

#### Acceptance Criteria

1. THE Page_Editor SHALL define TypeScript interfaces for all configuration types
2. THE Page_Editor SHALL use discriminated unions for mode-specific configurations
3. THE Page_Editor SHALL validate configuration objects against their schemas
4. THE Page_Editor SHALL provide type-safe accessors for configuration properties
5. THE Page_Editor SHALL export all configuration types for use by page implementations
6. THE Page_Editor SHALL use generic types to allow page-specific configuration extensions

### Requirement 12: Landing Page Integration

**User Story:** As a developer, I want to migrate the Landing Page Editor to use the shared component, so that I can eliminate duplicate code while preserving all existing functionality.

#### Acceptance Criteria

1. THE Landing_Page_Editor SHALL use the Page_Editor component
2. THE Landing_Page_Editor SHALL configure visual mode with hero, features, and how-it-works sections
3. THE Landing_Page_Editor SHALL disable blocks mode (not used for landing pages)
4. THE Landing_Page_Editor SHALL enable custom code mode
5. THE Landing_Page_Editor SHALL provide default configuration matching current defaults
6. THE Landing_Page_Editor SHALL save configuration to site settings under landingPageConfig key
7. THE Landing_Page_Editor SHALL maintain backward compatibility with existing saved configurations

### Requirement 13: Welcome Page Integration

**User Story:** As a developer, I want to migrate the Welcome Page Editor to use the shared component, so that I can eliminate duplicate code while preserving all existing functionality.

#### Acceptance Criteria

1. THE Welcome_Page_Editor SHALL use the Page_Editor component
2. THE Welcome_Page_Editor SHALL configure visual mode with welcome message fields
3. THE Welcome_Page_Editor SHALL enable blocks mode with all 10 block types
4. THE Welcome_Page_Editor SHALL enable custom code mode
5. THE Welcome_Page_Editor SHALL provide default configuration matching current defaults
6. THE Welcome_Page_Editor SHALL save configuration to site settings under welcomePageConfig key
7. THE Welcome_Page_Editor SHALL maintain backward compatibility with existing saved configurations

### Requirement 14: Configuration Persistence

**User Story:** As a user, I want my page configurations to be saved and loaded automatically, so that my changes persist across sessions.

#### Acceptance Criteria

1. WHEN a page editor loads, THE Page_Editor SHALL load saved configuration from site settings
2. WHEN no saved configuration exists, THE Page_Editor SHALL use the provided default configuration
3. WHEN save is triggered, THE Page_Editor SHALL persist configuration to the specified settings key
4. THE Page_Editor SHALL serialize configuration to JSON for storage
5. THE Page_Editor SHALL deserialize configuration from JSON when loading
6. THE Page_Editor SHALL handle missing or invalid saved configurations gracefully
7. THE Page_Editor SHALL validate loaded configurations against current schema

### Requirement 15: Responsive Preview

**User Story:** As a user, I want to preview my page at different screen sizes, so that I can ensure it looks good on all devices.

#### Acceptance Criteria

1. THE Preview_Panel SHALL provide device mode buttons (desktop, tablet, mobile)
2. WHEN desktop mode is selected, THE Preview_Panel SHALL display full-width preview
3. WHEN tablet mode is selected, THE Preview_Panel SHALL constrain preview to tablet width
4. WHEN mobile mode is selected, THE Preview_Panel SHALL constrain preview to mobile width
5. THE Preview_Panel SHALL apply smooth transitions when switching device modes
6. THE Preview_Panel SHALL highlight the active device mode button
7. THE Preview_Panel SHALL maintain device mode selection during configuration changes

### Requirement 16: Extensibility for Future Page Types

**User Story:** As a developer, I want to easily add new page types, so that I can expand the system without modifying core components.

#### Acceptance Criteria

1. THE Page_Editor SHALL accept configuration through props without hardcoded page types
2. THE Page_Editor SHALL support arbitrary visual field configurations
3. THE Page_Editor SHALL support arbitrary block type selections
4. THE Page_Editor SHALL support page-specific default configurations
5. THE Page_Editor SHALL support page-specific validation rules
6. THE Page_Editor SHALL provide hooks for page-specific customization
7. THE Page_Editor SHALL document the configuration API for adding new page types

### Requirement 17: Layout and Column System

**User Story:** As a user, I want to create multi-column layouts, so that I can build complex page designs like Wix without coding.

#### Acceptance Criteria

1. THE Block_Registry SHALL include a "layout" block type that supports columns
2. WHEN a layout block is added, THE Page_Editor SHALL allow configuration of column count (1-4 columns)
3. THE Page_Editor SHALL allow setting column width ratios (equal, 2:1, 1:2, 1:2:1, etc.)
4. WHEN a layout block is selected, THE Page_Editor SHALL display drop zones for each column
5. THE Page_Editor SHALL allow dragging blocks into column drop zones
6. THE Page_Editor SHALL support nested layouts (layouts within columns)
7. THE Page_Editor SHALL limit nesting depth to prevent excessive complexity
8. THE Page_Editor SHALL display column boundaries clearly in the editor
9. THE Page_Editor SHALL support responsive column behavior (stack on mobile)

### Requirement 18: Drag and Drop Interface

**User Story:** As a user, I want to drag and drop blocks to reorder them, so that I can quickly arrange my page layout.

#### Acceptance Criteria

1. THE Page_Editor SHALL display a drag handle on each block in blocks mode
2. WHEN a user drags a block, THE Page_Editor SHALL show a visual preview of the dragged item
3. THE Page_Editor SHALL display drop zones between existing blocks
4. WHEN a block is dragged over a drop zone, THE Page_Editor SHALL highlight that zone
5. WHEN a block is dropped, THE Page_Editor SHALL insert it at the drop location
6. THE Page_Editor SHALL support dragging blocks between columns
7. THE Page_Editor SHALL support dragging blocks into and out of layout blocks
8. THE Page_Editor SHALL prevent invalid drop operations (e.g., dropping a layout into itself)
9. THE Page_Editor SHALL update configuration immediately after drop operations

### Requirement 19: Visual Block Manipulation

**User Story:** As a user, I want intuitive controls for managing blocks, so that I can build pages without technical knowledge.

#### Acceptance Criteria

1. WHEN a block is hovered, THE Page_Editor SHALL display action buttons (edit, duplicate, delete, move)
2. THE Page_Editor SHALL provide a duplicate action that creates a copy of the block
3. THE Page_Editor SHALL provide quick actions for common styling (alignment, spacing, colors)
4. THE Page_Editor SHALL display a floating toolbar when a block is selected
5. THE Page_Editor SHALL support keyboard shortcuts for common actions (delete, duplicate, undo)
6. THE Page_Editor SHALL provide undo/redo functionality for all block operations
7. THE Page_Editor SHALL maintain an operation history for the current editing session

### Requirement 20: Home Page Integration

**User Story:** As a developer, I want to migrate the Home Page Editor to use the shared component, so that I can eliminate duplicate code while preserving all existing functionality.

#### Acceptance Criteria

1. THE Home_Page_Editor SHALL use the Page_Editor component
2. THE Home_Page_Editor SHALL configure visual mode with hero, delivery section, and features fields
3. THE Home_Page_Editor SHALL disable blocks mode (not used for home page)
4. THE Home_Page_Editor SHALL disable custom code mode (not used for home page)
5. THE Home_Page_Editor SHALL provide default configuration matching current defaults
6. THE Home_Page_Editor SHALL save configuration to global settings endpoint
7. THE Home_Page_Editor SHALL load configuration from global settings endpoint
8. THE Home_Page_Editor SHALL maintain backward compatibility with existing saved configurations

### Requirement 21: Advanced Block Styling

**User Story:** As a user, I want to customize block appearance, so that I can create visually distinct sections.

#### Acceptance Criteria

1. THE Page_Editor SHALL provide a styling panel for the selected block
2. THE Page_Editor SHALL support setting background color/gradient/image per block
3. THE Page_Editor SHALL support setting padding and margin with visual controls
4. THE Page_Editor SHALL support setting text alignment (left, center, right)
5. THE Page_Editor SHALL support setting border radius and border styles
6. THE Page_Editor SHALL support setting shadow effects
7. THE Page_Editor SHALL provide preset style templates for common designs
8. THE Page_Editor SHALL support copying styles from one block to another
9. THE Page_Editor SHALL validate style values to prevent invalid CSS

### Requirement 22: Responsive Design Controls

**User Story:** As a user, I want to control how my page looks on different devices, so that I can ensure a good experience on mobile, tablet, and desktop.

#### Acceptance Criteria

1. THE Page_Editor SHALL allow setting device-specific visibility for blocks
2. THE Page_Editor SHALL support device-specific spacing values
3. THE Page_Editor SHALL support device-specific text sizes
4. THE Page_Editor SHALL automatically stack columns on mobile devices
5. THE Page_Editor SHALL provide breakpoint indicators in the preview
6. THE Page_Editor SHALL allow testing responsive behavior by switching device modes
7. THE Page_Editor SHALL display warnings for content that may not fit on smaller screens

### Requirement 23: Block Library and Templates

**User Story:** As a user, I want pre-built block templates, so that I can quickly add professional-looking sections to my page.

#### Acceptance Criteria

1. THE Page_Editor SHALL provide a template library with pre-configured block combinations
2. THE Page_Editor SHALL categorize templates (hero sections, feature grids, testimonials, CTAs)
3. WHEN a template is selected, THE Page_Editor SHALL insert all template blocks
4. THE Page_Editor SHALL allow saving custom block combinations as templates
5. THE Page_Editor SHALL support importing templates from a template marketplace
6. THE Page_Editor SHALL display template previews before insertion
7. THE Page_Editor SHALL allow editing template content after insertion

### Requirement 24: Content Reusability

**User Story:** As a user, I want to reuse content across pages, so that I can maintain consistency and save time.

#### Acceptance Criteria

1. THE Page_Editor SHALL allow marking blocks as "global" or "reusable"
2. WHEN a global block is edited, THE Page_Editor SHALL update all instances
3. THE Page_Editor SHALL provide a library of reusable blocks
4. THE Page_Editor SHALL allow converting a regular block to a reusable block
5. THE Page_Editor SHALL allow detaching a block instance from its reusable source
6. THE Page_Editor SHALL display indicators for blocks that are instances of reusable blocks
7. THE Page_Editor SHALL prevent circular dependencies in reusable blocks
