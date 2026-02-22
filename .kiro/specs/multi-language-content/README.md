# Multi-Language Content Management Spec

## Overview

This spec enables site administrators to configure which languages are available on their site and provide translated content for all user-facing text fields on 9 priority customer-facing pages.

**Feature Name**: multi-language-content  
**Status**: Ready for Implementation  
**Estimated Effort**: 22 hours (3 days)  
**Priority**: High

## Scope

### In Scope
- Per-site language configuration (select from 20 supported languages)
- Translation input interface with tabbed UI
- Translation progress tracking
- Validation before publishing
- 16 priority sections (2 global + 14 pages):
  1. Header (global)
  2. Welcome Page
  3. Landing Page
  4. Access Validation Page
  5. Catalog/Products Page
  6. Product Detail Page
  7. Cart Page
  8. Checkout Page
  9. Review Order Page
  10. Order Confirmation Page
  11. Order History Page
  12. Order Tracking Page
  13. Not Found (404) Page
  14. Privacy Policy Page
  15. Selection Period Expired Page
  16. Footer (global)
- Translation fallback chain
- Integration with draft/publish workflow
- Migration of existing content

### Out of Scope (Future Enhancements)
- Email template translations
- Page editor content translations
- Per-product translations
- Admin UI translations
- Translation memory/suggestions
- Machine translation integration
- Bulk import/export

## Relationship to Other Specs

This spec complements the **internationalization-improvements** spec (`.kiro/specs/internationalization-improvements/`):

| Spec | Responsibility |
|------|----------------|
| **multi-language-content** (this spec) | Site-specific translatable content (page titles, messages, labels) |
| **internationalization-improvements** | Formatting (currency, dates, numbers, RTL layout, name formatting) |

Together, they provide complete internationalization: translated content displayed with locale-appropriate formatting.

## Documents

### 1. Requirements (`requirements.md`)
Defines 12 functional requirements with acceptance criteria:
- Language Configuration
- Translation Input Interface
- Translation Storage
- Translation Progress Tracking
- Translation Validation
- Public Site Translation Retrieval
- Priority Page Translation Support
- Migration of Existing Content
- Draft and Publish Workflow Integration
- Translation Component Reusability
- Error Handling and Resilience
- Integration with Internationalization Formatting

### 2. Design (`design.md`)
Provides technical design including:
- Architecture diagrams
- Data models and database schema
- Component interfaces
- Translation fallback chain
- 7 correctness properties for testing
- Error handling strategies
- Integration points
- Performance considerations
- Security and accessibility

### 3. Tasks (`tasks.md`)
Actionable implementation plan with 19 top-level tasks organized into 5 phases:
- Phase 1: Database & Backend (4 hours)
- Phase 2: Core Components & Utilities (5 hours)
- Phase 3: Site Configuration Integration (5 hours)
- Phase 4: Public Site Integration (4 hours)
- Phase 5: Testing & Documentation (4 hours)

Each task references specific requirements for traceability.

## Key Features

### Admin Experience
1. **Language Configuration**
   - Select multiple languages from 20 supported
   - Set default language (required)
   - Search/filter languages

2. **Translation Input**
   - Tabbed interface for each language
   - Default language tab shown first
   - Status indicators (translated, empty, required)
   - Copy from default language button
   - Character count display

3. **Translation Progress**
   - Completion percentage per language
   - Progress bars with color coding
   - List of missing translations

4. **Validation**
   - Prevent publishing without default language translations
   - Warning for incomplete non-default languages
   - Clear error messages

### User Experience
1. **Language Selection**
   - Only configured languages shown
   - Language preference persists

2. **Content Display**
   - Content shown in selected language
   - Automatic fallback for missing translations
   - Seamless language switching

3. **Fallback Chain**
   ```
   Current Language → Default Language → English → First Available → Fallback String
   ```

## Database Schema

```sql
-- New columns
ALTER TABLE sites 
ADD COLUMN available_languages TEXT[] DEFAULT ARRAY['en'],
ADD COLUMN translations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN draft_available_languages TEXT[] DEFAULT NULL;

-- Indexes
CREATE INDEX idx_sites_available_languages ON sites USING GIN (available_languages);
CREATE INDEX idx_sites_translations ON sites USING GIN (translations);
```

## Translation Structure

```typescript
{
  "header": {
    "logoAlt": { "en": "Company Logo", "es": "Logo de la Empresa", "fr": "Logo de l'Entreprise" },
    "homeLink": { "en": "Home", "es": "Inicio", "fr": "Accueil" },
    "productsLink": { "en": "Products", "es": "Productos", "fr": "Produits" },
    "ctaButton": { "en": "Get Started", "es": "Comenzar", "fr": "Commencer" }
  },
  "welcomePage": {
    "title": { "en": "Welcome", "es": "Bienvenido", "fr": "Bienvenue" },
    "message": { "en": "...", "es": "...", "fr": "..." },
    "buttonText": { "en": "...", "es": "...", "fr": "..." }
  },
  "landingPage": { ... },
  "accessPage": { ... },
  "catalogPage": { ... },
  "productDetail": { ... },
  "checkoutPage": { ... },
  "reviewOrder": { ... },
  "confirmation": { ... },
  "footer": { ... }
}
```

## Core Components

### Admin Components
- `MultiLanguageSelector`: Language configuration UI
- `TranslatableInput`: Single-line translation input
- `TranslatableTextarea`: Multi-line translation input
- `TranslationProgress`: Completion tracking

### Public Site
- `useSiteContent`: Hook for retrieving translations

### Utilities
- `validateTranslations`: Calculate completion and find missing translations
- `canPublishTranslations`: Validate before publishing

## Testing Strategy

### Unit Tests
- Translation retrieval with valid/invalid paths
- Fallback chain behavior
- Validation logic
- Component rendering
- Error handling

### Property-Based Tests
1. Translation retrieval always returns a string
2. Fallback chain always terminates with a value
3. Completion percentage is always between 0 and 100
4. Default language validation is strict
5. Language switching updates all content
6. Draft changes don't affect live site

### Integration Tests
- Language switching updates content
- Draft/publish workflow
- Migration preserves content
- RTL layout with translations

### E2E Tests
- Complete admin workflow
- Complete user workflow
- All 9 pages in multiple languages

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1: Database & Backend | 4 hours | Schema, migration, API |
| Phase 2: Core Components | 5 hours | Components, hooks, utilities |
| Phase 3: Site Configuration | 5 hours | Admin UI integration |
| Phase 4: Public Site | 4 hours | Update all 9 pages |
| Phase 5: Testing & Docs | 4 hours | Tests, fixes, documentation |
| **Total** | **22 hours** | **19 top-level tasks** |

## Getting Started

### For Implementers

1. **Read the requirements** (`requirements.md`)
   - Understand all 12 requirements
   - Review acceptance criteria

2. **Study the design** (`design.md`)
   - Understand architecture
   - Review data models
   - Study correctness properties

3. **Follow the tasks** (`tasks.md`)
   - Start with Phase 1 (Database & Backend)
   - Complete tasks sequentially
   - Run tests after each phase
   - Use checkpoints to validate progress

4. **Reference existing specs**
   - Review internationalization-improvements spec
   - Understand how formatting hooks work
   - Plan integration points

### For Reviewers

1. **Verify requirements coverage**
   - All acceptance criteria testable
   - No ambiguous requirements
   - Requirements traceable to tasks

2. **Review design decisions**
   - Architecture sound
   - Data models efficient
   - Error handling comprehensive

3. **Validate task plan**
   - Tasks actionable
   - Dependencies clear
   - Timeline realistic

## Success Criteria

✅ All 16 sections support multi-language content (2 global + 14 pages)  
✅ Admin can configure available languages per site  
✅ Admin can enter translations for each language  
✅ Translation progress indicator shows completeness  
✅ Validation prevents publishing incomplete default language translations  
✅ Public site displays correct language content  
✅ Language switching works seamlessly  
✅ Fallback chain works correctly  
✅ All tests pass (unit, property-based, integration)  
✅ RTL layout works with translated content  
✅ Integration with i18n formatting works  

## Next Steps

1. ✅ Spec created and reviewed
2. Begin implementation following tasks.md
3. Start with Phase 1 (Database & Backend)
4. Run tests after each phase
5. Use checkpoints to validate progress
6. Deploy to production after all tests pass

---

*Spec Created: February 19, 2026*  
*Status: Ready for Implementation*  
*Feature: multi-language-content*
