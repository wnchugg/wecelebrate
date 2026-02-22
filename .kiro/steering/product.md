---
inclusion: always
---

# Product Domain: JALA 2

JALA 2 is a B2B SaaS corporate gifting and employee recognition platform for anniversary celebrations and award programs.

## Core Business Logic

### User Flow (6 Steps)
1. Landing page (white-labeled per site)
2. Access validation (5 methods: email, employee ID, serial card, magic link, SSO)
3. Welcome screen
4. Gift selection (catalog filtered by assignment strategy)
5. Shipping information
6. Confirmation

### Gift Assignment Strategies
When implementing gift-related features, respect these 4 strategies:
- **All Gifts**: User can select any gift in catalog
- **Price Levels**: Gifts filtered by user's assigned price tier
- **Exclusions**: Specific gifts excluded for user
- **Explicit Selection**: Only pre-selected gifts available

### Validation Methods
- **Email**: Token-based email verification
- **Employee ID**: Direct ID lookup against client database
- **Serial Card**: Physical card with unique code
- **Magic Link**: Pre-generated authenticated URL
- **SSO**: Single sign-on integration (client-specific)

## User Roles & Permissions

### End Users
- Access through validation flow only
- Single-use gift selection per validation
- No persistent authentication
- Site-scoped experience (white-labeled)

### Admin Users
- Full system access across all clients/sites
- Manage 11 CRUD resources: clients, sites, gifts, orders, users, validation methods, price levels, categories, brands, shipping addresses, analytics
- Access to both development and production environments

### Client Admins
- Scoped access to specific client's sites and data
- Cannot access other clients' information
- Limited to client-specific configuration and reporting

## Design System (RecHUB)

### Brand Colors
- **Primary (Magenta)**: #D91C81 - CTAs, primary actions, brand elements
- **Secondary (Deep Blue)**: #1B2A5E - Headers, navigation, trust elements
- **Accent (Cyan)**: #00B4CC - Highlights, links, interactive states

### Accessibility Requirements
- WCAG 2.0 Level AA compliance mandatory
- All interactive elements must have proper ARIA labels
- Color contrast ratios must meet AA standards
- Keyboard navigation required for all flows
- Screen reader compatibility essential

## Multi-Language Support

### Supported Languages (12)
English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Turkish, Arabic (RTL), Hebrew (RTL), Japanese

### Implementation Rules
- All user-facing text must use i18n keys (no hardcoded strings)
- RTL languages require layout mirroring
- Date/number formatting must respect locale
- Language selection persists in LanguageContext

## Environment Awareness

### Development Environment
- Supabase Project: wjfcqqrlhwdvjmefxky
- Use for testing, experimentation, breaking changes
- Safe to reset/modify data

### Production Environment
- Supabase Project: lmffeqwhrnbsbhdztwyv
- Live customer data - handle with extreme care
- Requires migration testing in dev first
- Never expose production credentials in code

## White-Label Architecture

### Site-Level Customization
- Each site has unique branding (logo, colors, domain)
- Landing page content varies per site
- Email templates customized per client
- Gift catalogs filtered per site configuration

### Client-Level Isolation
- Data strictly isolated between clients
- Row-Level Security (RLS) enforces boundaries
- Admin access scoped by client relationship
- Cross-client queries forbidden

## Key Business Rules

### Order Processing
- Orders are immutable once confirmed
- Shipping address required before confirmation
- Gift availability checked at selection time
- Price validation against user's assigned level

### Validation Tokens
- Single-use only (consumed on successful validation)
- Expiration enforced for time-sensitive methods
- Cannot be reused or shared
- Tied to specific site and user

### Gift Catalog Management
- Gifts can be active/inactive per site
- Price levels determine gift eligibility
- Categories and brands for filtering/organization
- Stock levels tracked (if applicable)

## Common Pitfalls to Avoid

- Don't bypass validation flow for end users
- Don't expose admin routes to unauthenticated users
- Don't mix client data in queries (respect RLS)
- Don't hardcode environment-specific URLs
- Don't skip i18n for any user-facing text
- Don't ignore accessibility requirements
- Don't assume single-language context
