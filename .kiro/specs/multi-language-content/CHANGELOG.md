# Changelog: Multi-Language Content Management Spec

## [1.1.0] - 2026-02-19 - Header Section Added

### Added
- **Header section** to translation support (10th priority section)
- Header translatable fields:
  - `logoAlt` - Logo alt text for accessibility
  - `homeLink` - Home navigation link text
  - `productsLink` - Products navigation link text
  - `aboutLink` - About navigation link text
  - `contactLink` - Contact navigation link text
  - `ctaButton` - Call-to-action button text

### Changed
- Updated scope from "9 priority pages" to "10 priority sections (1 global header + 9 pages)"
- Updated requirements.md:
  - Requirement 7: Added header as first item in acceptance criteria
  - Requirement 8: Added header migration as first item
- Updated design.md:
  - Added header section to SiteTranslations interface
- Updated tasks.md:
  - Task 2.1: Added header to migration script
  - Task 11: Added 11.1 for replacing header inputs (renumbered subsequent tasks)
  - Task 13: Added 13.1 for updating header component (renumbered subsequent tasks)
  - Task 16.3: Added header to testing checklist
  - Task 19: Updated final checkpoint to mention 10 sections
- Updated README.md:
  - Updated scope to list header as first section
  - Updated translation structure example to include header
  - Updated success criteria to mention 10 sections

### Impact
- **Requirements**: 2 acceptance criteria added (total: 91, was 89)
- **Tasks**: 2 subtasks added (header admin input + header public component)
- **Estimated Effort**: Remains 22 hours (header work absorbed into existing phases)
- **Migration**: Header content now included in migration script

---

## [1.0.0] - 2026-02-19 - Initial Spec

### Added
- Complete formal spec structure
- requirements.md with 12 functional requirements and 89 acceptance criteria
- design.md with architecture, data models, and 7 correctness properties
- tasks.md with 19 top-level tasks organized into 5 phases
- README.md with overview and getting started guide
- Support for 9 priority customer-facing pages
- Translation fallback chain
- Draft/publish workflow integration
- Migration strategy for existing content

---

*Changelog Format: [Version] - Date - Description*

## [1.2.0] - 2026-02-19

### Added
- **6 Additional Customer-Facing Pages**: Expanded translation support from 10 to 16 sections
  - Cart Page (shopping cart with items, totals, checkout)
  - Order History Page (list of past orders with status)
  - Order Tracking Page (detailed order status timeline)
  - Not Found (404) Page (error page with suggestions)
  - Privacy Policy Page (privacy information and settings)
  - Selection Period Expired Page (expired selection period message)

### Changed
- **Scope Expansion**: Now covers 16 sections (2 global + 14 pages) instead of 10 sections (1 global + 9 pages)
- **Requirements**: Updated Requirement 7 to include 6 new pages (7.7, 7.11-7.15)
- **Requirements**: Updated Requirement 8 to include migration for 6 new pages (8.6, 8.10-8.14)
- **Design**: Expanded SiteTranslations interface with 6 new page sections
- **Tasks**: Added Task 11.11-11.16 for admin input replacement (6 new pages)
- **Tasks**: Added Task 13.11-13.16 for public site integration (6 new pages)
- **Tasks**: Updated Task 2.1 to migrate 16 sections instead of 10
- **Tasks**: Updated Task 16.3 to test 16 sections instead of 10
- **Tasks**: Updated Task 19 final checkpoint to verify 16 sections

### Rationale
After reviewing all public-facing pages in `src/app/pages/`, identified 6 additional customer-facing pages with hardcoded text that need translation support:
- Cart, OrderHistory, OrderTracking: Core e-commerce flow pages
- NotFound: Error handling page visible to all users
- PrivacyPolicy: Legal/compliance page with extensive text
- SelectionPeriodExpired: User-facing message page

These pages are essential for a complete multilingual user experience and should be included in the initial implementation rather than deferred to future enhancements.

### Impact
- **Estimated Effort**: Remains 22 hours (additional pages are similar in complexity to existing ones)
- **Database Schema**: No changes (same structure accommodates additional pages)
- **Component Reusability**: Same TranslatableInput/Textarea components work for all pages
- **Testing**: Additional integration tests for 6 new pages
