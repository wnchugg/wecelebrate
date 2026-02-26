# Requirements Document: shadcn/ui Component Migration

## Introduction

This document specifies the requirements for systematically migrating the JALA 2 public-facing user flow from custom-built components to shadcn/ui primitives. The migration aims to improve consistency, accessibility, and maintainability while preserving the RecHUB design system and WCAG 2.0 Level AA compliance.

The public user flow consists of 6 steps: Landing → Access Validation → Welcome → Gift Selection → Shipping Information → Confirmation. Each page currently uses custom components with inline Tailwind classes, creating inconsistencies and accessibility gaps.

## Glossary

- **shadcn/ui**: A collection of reusable UI components built on Radix UI primitives with Tailwind CSS styling
- **Radix_UI**: Unstyled, accessible component primitives for building design systems
- **Form_System**: The combination of react-hook-form, Zod validation, and shadcn/ui Form components
- **RecHUB**: The JALA 2 design system with brand colors (Magenta #D91C81, Deep Blue #1B2A5E, Cyan #00B4CC)
- **WCAG_AA**: Web Content Accessibility Guidelines Level AA compliance standard
- **User_Flow**: The 6-step journey from landing page to order confirmation
- **Component_Migration**: The process of replacing custom components with shadcn/ui equivalents
- **ARIA_Linkage**: The automatic connection between form labels, inputs, and error messages via ARIA attributes
- **Keyboard_Navigation**: The ability to interact with UI elements using only keyboard input (Tab, Enter, Space, Escape)
- **Loading_State**: Visual feedback shown during asynchronous operations (Skeleton components, spinners)
- **Round_Trip_Property**: A property-based test pattern where parsing then printing then parsing produces equivalent output

## Requirements

### Requirement 1: Form Component Migration

**User Story:** As a user completing the shipping information form, I want proper validation feedback and keyboard navigation, so that I can efficiently enter my address without accessibility barriers.

#### Acceptance Criteria

1. WHEN a user interacts with the shipping form, THE Form_System SHALL use react-hook-form with Zod validation
2. THE Form_System SHALL wrap all input fields with FormField and FormControl components
3. WHEN a validation error occurs, THE Form_System SHALL display error messages using FormMessage components
4. THE Form_System SHALL link labels to inputs via htmlFor attributes
5. THE Form_System SHALL link error messages to inputs via aria-describedby attributes
6. WHEN a field has an error, THE Form_System SHALL mark it with aria-invalid="true"
7. THE Form_System SHALL validate full name with minimum 2 characters and only letters, spaces, hyphens, apostrophes
8. THE Form_System SHALL validate phone numbers with minimum 10 digits and only digits, spaces, parentheses, plus, hyphen
9. THE Form_System SHALL validate street addresses with minimum 5 characters
10. THE Form_System SHALL validate postal codes with minimum 3 characters
11. THE Form_System SHALL validate country codes as exactly 2 uppercase letters
12. WHERE company shipping mode is enabled, THE Form_System SHALL only require name and phone fields
13. WHEN form submission is in progress, THE Form_System SHALL display a loading state on the submit button
14. THE Form_System SHALL announce validation errors to screen readers via aria-live regions

### Requirement 2: Welcome Page Component Migration

**User Story:** As a user viewing celebration messages, I want to navigate them with keyboard and see loading states, so that I can access all messages regardless of my input method.

#### Acceptance Criteria

1. THE Welcome_Page SHALL render celebration message cards using Card, CardHeader, and CardContent components
2. THE Welcome_Page SHALL render sender information using Avatar and AvatarFallback components
3. THE Welcome_Page SHALL display sender initials in AvatarFallback components
4. WHEN celebration messages are loading, THE Welcome_Page SHALL display 6 Skeleton card components
5. THE Welcome_Page SHALL replace Skeleton components with actual cards after data loads
6. THE Welcome_Page SHALL render the video play button using Button component with size="icon"
7. THE Welcome_Page SHALL render the continue button using Button component with size="lg"
8. THE Welcome_Page SHALL provide aria-label="Play welcome video" on the video play button
9. THE Welcome_Page SHALL make celebration message cards keyboard navigable with proper tabIndex
10. WHEN a user presses Enter on a celebration card, THE Welcome_Page SHALL open a Dialog with the full message
11. WHEN a user presses Space on a celebration card, THE Welcome_Page SHALL open a Dialog with the full message
12. THE Welcome_Page SHALL render celebration cards as button elements (not div elements)
13. THE Welcome_Page SHALL provide proper role attributes on all interactive elements
14. WHEN a Dialog is open, THE Welcome_Page SHALL trap focus within the Dialog
15. WHEN a user presses Escape in an open Dialog, THE Welcome_Page SHALL close the Dialog

### Requirement 3: Button Component Standardization

**User Story:** As a user navigating the application, I want consistent button styling and keyboard interaction, so that I can predict how buttons will behave.

#### Acceptance Criteria

1. THE Application SHALL use Button component for all clickable actions
2. WHERE a button wraps a Link component, THE Application SHALL use Button with asChild pattern
3. THE Application SHALL provide aria-label attributes on all icon-only buttons
4. WHEN a button triggers an async operation, THE Application SHALL display a loading state with Loader2 icon
5. THE Application SHALL disable buttons during loading states
6. THE Application SHALL render buttons with consistent focus indicators matching RecHUB colors
7. THE Application SHALL support keyboard activation of buttons via Enter and Space keys
8. THE Application SHALL use Button variants (default, outline, ghost, destructive) consistently across pages
9. THE Application SHALL use Button sizes (default, sm, lg, icon) appropriately for context
10. THE Application SHALL maintain RecHUB brand colors in Button component styling

### Requirement 4: Card Component Standardization

**User Story:** As a user browsing gifts, I want consistent card layouts and loading states, so that I can easily scan available options.

#### Acceptance Criteria

1. THE Gift_Selection_Page SHALL render gift cards using Card, CardHeader, CardContent, CardTitle, and CardDescription components
2. THE Gift_Selection_Page SHALL display gift images in CardHeader with consistent aspect ratios
3. THE Gift_Selection_Page SHALL display gift categories using Badge components
4. WHEN gifts are loading, THE Gift_Selection_Page SHALL display 6 Skeleton card components matching actual card structure
5. THE Gift_Selection_Page SHALL make gift cards keyboard navigable with Tab key
6. WHEN a user presses Enter on a gift card, THE Gift_Selection_Page SHALL select that gift
7. WHEN a user presses Space on a gift card, THE Gift_Selection_Page SHALL select that gift
8. THE Confirmation_Page SHALL render order details using Card components
9. THE Application SHALL use Card components with consistent shadow, border, and padding styles
10. THE Application SHALL maintain RecHUB brand colors in Card component styling

### Requirement 5: Dialog and Alert Component Integration

**User Story:** As a user encountering errors or confirmations, I want clear, accessible notifications, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN a validation error occurs, THE Application SHALL display error messages using Alert component with variant="destructive"
2. THE Alert_Component SHALL include an icon (AlertCircle or similar) for visual identification
3. THE Alert_Component SHALL include AlertTitle and AlertDescription for structured content
4. WHEN a Dialog is opened, THE Application SHALL trap focus within the Dialog
5. WHEN a user presses Escape in a Dialog, THE Application SHALL close the Dialog
6. THE Dialog_Component SHALL include DialogHeader, DialogTitle, DialogContent, and DialogFooter
7. THE Dialog_Component SHALL provide proper ARIA attributes (aria-labelledby, aria-describedby)
8. THE Application SHALL use Dialog components for confirmation prompts
9. THE Application SHALL use Alert components for error states in AccessValidation, SSOValidation, and GiftDetail pages
10. THE Application SHALL announce Alert content to screen readers via aria-live regions

### Requirement 6: Loading State Standardization

**User Story:** As a user waiting for content to load, I want visual feedback that matches the expected layout, so that I understand the page is working and what to expect.

#### Acceptance Criteria

1. WHEN a page is loading, THE Application SHALL display Skeleton components matching the actual content structure
2. THE Landing_Page SHALL display a comprehensive Skeleton layout including hero section, features, and footer
3. THE Access_Validation_Page SHALL display a form-shaped Skeleton layout
4. THE Order_History_Page SHALL display a full page Skeleton layout with table structure
5. THE Order_Tracking_Page SHALL display an order list Skeleton layout
6. THE Skeleton_Components SHALL use consistent border radius, spacing, and animation timing
7. THE Skeleton_Components SHALL maintain RecHUB brand colors in animation effects
8. WHEN content loads, THE Application SHALL replace Skeleton components with actual content smoothly
9. THE Application SHALL use Skeleton components for all async data loading scenarios
10. THE Skeleton_Components SHALL have proper ARIA attributes (aria-busy="true", aria-label="Loading")

### Requirement 7: Accessibility Compliance

**User Story:** As a user with disabilities, I want all interactive elements to be keyboard accessible and properly labeled, so that I can use the application with assistive technologies.

#### Acceptance Criteria

1. THE Application SHALL meet WCAG 2.1 Level AA compliance for all migrated components
2. THE Application SHALL provide visible focus indicators on all interactive elements with 3:1 contrast ratio
3. THE Application SHALL support keyboard navigation for all interactive elements (Tab, Enter, Space, Escape)
4. THE Application SHALL provide aria-label attributes on all icon-only buttons
5. THE Application SHALL link form labels to inputs via htmlFor and id attributes
6. THE Application SHALL link error messages to inputs via aria-describedby attributes
7. WHEN a field has an error, THE Application SHALL mark it with aria-invalid="true"
8. THE Application SHALL announce dynamic content changes to screen readers via aria-live regions
9. THE Application SHALL trap focus within modal dialogs
10. THE Application SHALL provide proper role attributes on all interactive elements
11. THE Application SHALL ensure color contrast ratios meet WCAG AA standards (4.5:1 for text)
12. THE Application SHALL provide text alternatives for all non-text content
13. THE Application SHALL ensure touch targets are minimum 44x44 pixels
14. THE Application SHALL support screen reader navigation with proper heading hierarchy

### Requirement 8: Design System Preservation

**User Story:** As a stakeholder, I want the migrated components to maintain RecHUB brand identity, so that the application remains visually consistent with our brand guidelines.

#### Acceptance Criteria

1. THE Application SHALL preserve RecHUB primary color (Magenta #D91C81) for CTAs and primary actions
2. THE Application SHALL preserve RecHUB secondary color (Deep Blue #1B2A5E) for headers and navigation
3. THE Application SHALL preserve RecHUB accent color (Cyan #00B4CC) for highlights and links
4. THE Button_Component SHALL support custom RecHUB variant with gradient styling
5. THE Input_Component SHALL use #D91C81 for focus border and ring colors
6. THE Application SHALL maintain consistent border radius, shadow, and spacing values
7. THE Application SHALL use RecHUB typography scale and font families
8. THE Application SHALL preserve existing hover, active, and focus state styling
9. THE Application SHALL maintain consistent animation timing and easing functions
10. THE Application SHALL use CSS variables for theme colors to support future customization

### Requirement 9: Multi-Language Support

**User Story:** As a user in a non-English locale, I want all component text to be properly translated, so that I can use the application in my preferred language.

#### Acceptance Criteria

1. THE Application SHALL use i18n keys for all user-facing text in migrated components
2. THE Application SHALL support 12 languages (English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Turkish, Arabic, Hebrew, Japanese)
3. WHERE RTL languages are selected (Arabic, Hebrew), THE Application SHALL mirror layout direction
4. THE Application SHALL format dates and numbers according to selected locale
5. THE Application SHALL translate validation error messages from Zod schemas
6. THE Application SHALL translate Button, Dialog, Alert, and Form component text
7. THE Application SHALL persist language selection in LanguageContext
8. THE Application SHALL load translations before rendering components
9. THE Application SHALL provide fallback text for missing translation keys
10. THE Application SHALL not hardcode any user-facing strings in component JSX

### Requirement 10: Testing and Validation

**User Story:** As a developer, I want comprehensive automated tests for migrated components, so that I can confidently deploy changes without regressions.

#### Acceptance Criteria

1. THE Test_Suite SHALL include unit tests for all migrated components
2. THE Test_Suite SHALL verify Card, Button, Avatar, Skeleton, Dialog, Form, Alert, and Badge components render correctly
3. THE Test_Suite SHALL verify keyboard navigation works for all interactive elements
4. THE Test_Suite SHALL verify ARIA attributes are present and correct
5. THE Test_Suite SHALL verify form validation with react-hook-form and Zod
6. THE Test_Suite SHALL verify loading states display Skeleton components
7. THE Test_Suite SHALL verify Dialog components trap focus and close on Escape
8. THE Test_Suite SHALL verify Button components show loading states during async operations
9. THE Test_Suite SHALL include property-based tests for form validation schemas
10. FOR ALL valid shipping data, THE Test_Suite SHALL verify parsing with Zod then formatting then parsing produces equivalent data (round-trip property)
11. THE Test_Suite SHALL verify no TypeScript errors are introduced by migration
12. THE Test_Suite SHALL achieve minimum 80% code coverage for migrated components
13. THE Test_Suite SHALL include integration tests for complete user flows
14. THE Test_Suite SHALL include E2E tests with Playwright for critical paths
15. THE Test_Suite SHALL verify accessibility with automated tools (axe-core)

