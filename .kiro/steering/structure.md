---
inclusion: always
---

# Project Structure & Organization

## Directory Structure

### Root Layout
- `src/` - Frontend React application
- `supabase/` - Backend Edge Functions and database migrations
- `.kiro/` - Kiro AI configuration, specs, and steering files
- `scripts/` - Build and utility scripts
- `e2e/` - Playwright E2E tests (separate from Vitest)
- `docs/` - Project documentation (10 categories)

### Frontend (`src/app/`)
- `components/` - React components organized by domain
  - `ui/` - Shadcn/ui primitives (Button, Input, Dialog, etc.)
  - `admin/` - Admin dashboard components
  - `[feature]/` - Feature-specific components (e.g., `gift-selection/`, `validation/`)
- `pages/` - Route components (all lazy loaded via React Router)
  - `admin/` - Admin dashboard pages
  - Root level - Public user flow pages
- `context/` - React Context providers (LanguageContext, AdminContext, AuthContext, SiteContext, PrivacyContext)
- `hooks/` - Custom React hooks
- `lib/` - Third-party library configurations (Supabase client singleton)
- `services/` - API service layers (backend communication)
- `utils/` - Pure utility functions
- `types/` - TypeScript type definitions
- `schemas/` - Zod validation schemas
- `i18n/` - Internationalization files (12 languages)
- `config/` - Application configuration
- `data/` - Static data and constants
- `App.tsx` - Root component with provider nesting
- `routes.tsx` - React Router 7 configuration

### Supporting Directories
- `src/assets/` - Static assets (images, fonts)
- `src/styles/` - Global CSS (index.css, tailwind.css, theme.css, fonts.css)
- `src/test/` - Test utilities, mocks, and setup
- `src/db-optimizer/` - Database performance analysis tools

### Backend (`supabase/`)
- `functions/server/` - Main Edge Function (Hono framework)
  - `routes/` - API route handlers
  - `middleware/` - Auth, CORS, rate limiting
  - `services/` - Business logic
  - `types/` - TypeScript types
  - `tests/` - Deno tests
- `functions/make-server-6fcaeea3/` - Function entry point
- `migrations/` - Database schema migrations

## File Placement Rules

### When creating new files:
1. **Components** - Place in `src/app/components/[feature]/` if feature-specific, or `src/app/components/ui/` if reusable UI primitive
2. **Pages** - Place in `src/app/pages/` (admin pages in `admin/` subdirectory)
3. **Hooks** - Place in `src/app/hooks/` with descriptive names (e.g., `useGiftSelection.ts`)
4. **Services** - Place in `src/app/services/` for API communication logic
5. **Utils** - Place in `src/app/utils/` for pure functions with no side effects
6. **Types** - Place in `src/app/types/` for shared TypeScript definitions
7. **Tests** - Co-locate with source files using `*.test.tsx` or `*.test.ts` suffix, or use `__tests__/` folder

### When modifying existing files:
- Check for existing similar functionality before creating new files
- Respect the separation of concerns (components vs services vs utils)
- Keep components focused on UI, move business logic to services

## Naming Conventions

### Files (strictly enforced)
- Components: `PascalCase.tsx` (e.g., `GiftCard.tsx`, `ValidationForm.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`, `validateEmail.ts`)
- Types: `PascalCase.ts` (e.g., `User.ts`, `GiftAssignment.ts`)
- Tests: `[filename].test.ts[x]` (e.g., `GiftCard.test.tsx`)
- Hooks: `use[Name].ts` (e.g., `useGiftSelection.ts`, `useValidation.ts`)

### Code Identifiers
- Components: `PascalCase` (e.g., `function GiftCard()`)
- Functions: `camelCase` (e.g., `function formatPrice()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `const MAX_GIFTS = 100`)
- Types/Interfaces: `PascalCase` (e.g., `type User`, `interface ApiResponse`)
- Context Hooks: `use[Context]` (e.g., `useLanguage()`, `useAdmin()`)

## Import Patterns

### Path Aliases (always use these)
```typescript
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import { formatDate } from '@/utils/date'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/User'
```

### Route Lazy Loading (required for all pages)
```typescript
const Dashboard = lazy(() => import('./pages/admin/Dashboard')
  .then(m => ({ default: m.Dashboard })))
```

### Context Provider Nesting Order (in App.tsx)
```typescript
<LanguageProvider>      {/* Outermost - language must be available first */}
  <PrivacyProvider>     {/* Privacy settings */}
    <SiteProvider>      {/* Site context */}
      <AuthProvider>    {/* Authentication */}
        <AdminProvider> {/* Admin-specific context */}
          {/* App content */}
        </AdminProvider>
      </AuthProvider>
    </SiteProvider>
  </PrivacyProvider>
</LanguageProvider>
```

## Architecture Patterns

### Component Organization
- Keep components small and focused (single responsibility)
- Extract complex logic into custom hooks
- Use composition over prop drilling
- Prefer controlled components for forms

### State Management
- Use React Context for global state (language, auth, site)
- Use local state (useState) for component-specific state
- Use React Hook Form for form state
- Avoid prop drilling beyond 2 levels (use context or composition)

### API Communication
- All backend calls go through service layer (`src/app/services/`)
- Use Supabase client singleton from `@/lib/supabase`
- Handle errors consistently (try/catch with user-friendly messages)
- Respect Row Level Security (RLS) - never bypass with service role key in frontend

### Code Splitting
- All routes must be lazy loaded
- Heavy components should be lazy loaded
- Use React.lazy() and Suspense for code splitting

## Test Organization

### Test Placement
- Unit tests: Co-located with source (e.g., `GiftCard.test.tsx` next to `GiftCard.tsx`)
- Integration tests: `src/app/__tests__/integration/`
- E2E tests: `e2e/` directory (Playwright, not Vitest)
- Test utilities: `src/test/` (setup, mocks, helpers)
- Backend tests: `supabase/functions/server/tests/` (Deno)

### Test Naming
- Test files: `[component].test.tsx` or `[module].test.ts`
- Test descriptions: Use descriptive strings (e.g., `'renders gift card with correct price'`)
- Property-based tests: Annotate with `**Validates: Requirements X.Y**`

## Common Pitfalls to Avoid

- Don't create files outside the established structure
- Don't use relative imports when path aliases are available
- Don't bypass the service layer for API calls
- Don't create new context providers without considering existing ones
- Don't place business logic in components (move to services or hooks)
- Don't create duplicate utility functions (search first)
- Don't forget to lazy load new route components
- Don't mix frontend and backend code (strict separation)
- Don't create tests in wrong locations (respect test organization)
