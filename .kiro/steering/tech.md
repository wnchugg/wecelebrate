---
inclusion: always
---

# Technology Stack & Development Patterns

## Stack Overview

### Frontend
- React 18 + TypeScript 5.7.3
- Vite 6.4.1 (build tool)
- React Router 7 (data mode with lazy loading)
- Tailwind CSS v4 (via @tailwindcss/vite)
- Shadcn/ui (Radix UI primitives)
- React Hook Form + Zod validation
- React Context for state (LanguageContext, AdminContext, PrivacyContext, AuthContext, SiteContext)

### Backend
- Supabase (PostgreSQL + Edge Functions)
- Deno runtime for Edge Functions
- Hono web framework
- Supabase Auth (JWT tokens)
- Row Level Security (RLS) enforced

### Testing
- Vitest 3.2.4 (jsdom environment)
- @testing-library/react
- @fast-check/vitest (property-based testing)
- Playwright (E2E, separate from Vitest)

## Critical Development Rules

### TypeScript
- Use gradual strict mode (noImplicitAny, noFallthroughCasesInSwitch, noImplicitReturns enabled)
- Always run `npm run type-check` before committing
- Use path aliases (`@/` for `./src/`) - never use relative imports across directories
- Target ES2020, module ESNext with bundler resolution

### React Patterns
- All route components MUST be lazy loaded via React.lazy()
- Heavy components should be lazy loaded
- Use React Context for global state, useState for local state
- Never prop drill beyond 2 levels - use context or composition
- Keep components focused on UI - move business logic to services or hooks

### Forms & Validation
- Use React Hook Form for all forms
- Define Zod schemas in `src/app/schemas/`
- Co-locate form validation logic with form components
- Handle validation errors with user-friendly messages

### Styling
- Use Tailwind CSS v4 utility classes
- Follow Shadcn/ui component patterns
- Never write custom CSS unless absolutely necessary
- Use Lucide React for icons

### State Management
- Context provider nesting order (in App.tsx):
  1. LanguageProvider (outermost)
  2. PrivacyProvider
  3. SiteProvider
  4. AuthProvider
  5. AdminProvider (innermost)
- Access contexts via custom hooks (useLanguage, useAdmin, etc.)
- Never bypass context hierarchy

### API & Backend Communication
- All Supabase calls go through service layer (`src/app/services/`)
- Use singleton Supabase client from `@/lib/supabase`
- Respect RLS - never use service role key in frontend
- Handle errors consistently with try/catch and user-friendly messages
- Never expose environment-specific URLs or credentials

### Testing Requirements
- Co-locate unit tests with source files (`.test.tsx` or `.test.ts` suffix)
- Use `npm run test:safe` for local development (limited concurrency)
- Use `npm run test:full` for CI (higher concurrency)
- Property-based tests MUST annotate with `**Validates: Requirements X.Y**`
- Max 10s timeout per test/hook
- E2E tests go in `e2e/` directory (Playwright, not Vitest)
- Backend tests use Deno in `supabase/functions/server/tests/`

### Code Quality
- Run `npm run lint` before committing
- Use `npm run lint:validate` to check against baseline
- ESLint 9 with TypeScript ESLint enforced
- Prettier formatting via eslint-config-prettier
- Remove unused imports (eslint-plugin-unused-imports)

### Build & Deployment
- Environment variables MUST be prefixed with `VITE_` for client-side access
- Tree shaking excludes development-only routes/components in production
- Code splitting via lazy loading for all routes
- Use `npm run build` for production builds
- Deploy backend with `./deploy-backend.sh` (Mac/Linux) or `deploy-backend.bat` (Windows)

## Common Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run type-check             # TypeScript validation

# Testing
npm run test:safe              # Local tests (4 concurrent)
npm run test:full              # CI tests (higher concurrency)
npm run test:coverage          # Coverage report

# Code Quality
npm run lint                   # Run ESLint
npm run lint:validate          # Validate against baseline

# Database
npm run db-optimizer:analyze   # Analyze performance
npm run db-optimizer:generate  # Generate migrations
```

## Anti-Patterns to Avoid

- Don't use relative imports when path aliases are available
- Don't bypass service layer for API calls
- Don't use service role key in frontend code
- Don't create non-lazy-loaded route components
- Don't write custom CSS without justification
- Don't prop drill beyond 2 levels
- Don't mix frontend and backend code
- Don't skip type checking before committing
- Don't hardcode environment-specific values
- Don't create tests outside established structure
