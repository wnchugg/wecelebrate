# CLAUDE.md — WeCelebrate / JALA2

This file gives Claude context about the project so it can provide better assistance. The developer is a **product manager actively learning to code** — explanations should be clear and practical, avoiding unnecessary jargon. When suggesting code changes, Claude should explain *what* the change does and *why*, not just provide code.

---

## What This Application Does

**WeCelebrate** is a corporate gifting and employee recognition platform. Companies use it to run gift programs for employee milestones (work anniversaries, recognition awards, etc.).

**The two main user types:**

1. **Admins** — HR/Operations staff who set up and manage gift programs. They create "sites" (branded gift portals), upload employee lists, assign gift catalogs, and review orders.

2. **Employees** — Recipients who visit their company's branded portal, validate their identity, choose a gift from a curated catalog, and submit a shipping address.

**Core employee gift flow (in order):**
```
Access Validation → Welcome → Gift Selection → Gift Detail → Review Order → Confirmation
```

**Key admin capabilities:**
- Manage multiple clients and their branded sites
- Upload/manage employee lists (CSV import or manual)
- Configure how employees validate access (email, employee ID, magic link, SSO)
- Assign gift catalogs to sites with different selection strategies
- Track orders, run analytics, schedule email notifications

---

## Running the App Locally

```bash
# Install dependencies (only needed once, or after package.json changes)
npm install

# Start development server — opens at http://localhost:5173
npm run dev

# Check TypeScript for errors without building
npm run type-check

# Check code style/quality
npm run lint
```

**First-time setup:** Copy `.env.example` to `.env` and fill in the Supabase credentials. The app won't connect to the backend without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## Running Tests

The test suite uses **Vitest** (unit/integration tests) and **Playwright** (end-to-end browser tests).

```bash
# Run all unit/integration tests (safe for local — limits CPU usage)
npm run test:safe

# Run tests for a specific area
npm run test:pages-admin        # Admin pages only
npm run test:ui-components      # UI components only
npm run test:utils              # Utility functions only
npm run test:services           # Service layer only
npm run test:backend            # Backend (Supabase functions) only

# Watch mode — reruns tests when files change (useful while developing)
npm run test:watch

# Run end-to-end tests (requires the dev server to be running)
npm run test:e2e
```

**Important test notes:**
- `npm run test` intentionally fails — always use `test:safe` locally
- Tests live next to the code they test, in `__tests__/` folders
- When a component needs context (like `LanguageProvider` or `SiteContext`), tests must wrap it — this is a common source of test failures

---

## Building & Deploying

```bash
# Build for production
npm run build:production

# Build for staging
npm run build:staging
```

**Deployment:**
- **Frontend** → Netlify (auto-deploys from GitHub on push to `main` or `development`)
- **Backend** → Supabase Edge Functions (Deno serverless, auto-deployed to Supabase project `wjfcqqrlhwdvvjmefxky`)
- **Database** → Supabase-managed PostgreSQL (same project)

**Git branches:**
- `development` — active development branch, deploys to staging
- `main` — production branch, deploys to live site

---

## Project Structure

```
jala2-app/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── app/
│   │   ├── routes.tsx              # All URL routes defined here
│   │   ├── pages/                  # One file per page/screen
│   │   │   └── admin/             # Admin-only pages (~60 pages)
│   │   ├── components/             # Reusable UI pieces
│   │   │   ├── ui/                # Low-level components (Button, Card, etc.)
│   │   │   └── admin/             # Admin-specific components
│   │   ├── context/               # Global state (auth, site, cart, etc.)
│   │   ├── hooks/                 # Custom React hooks (data fetching, etc.)
│   │   ├── lib/
│   │   │   └── apiClient.ts       # All API calls go through here
│   │   ├── services/              # Business logic
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── utils/                 # Helper functions
│   │   └── i18n/                  # Translations (12 languages)
│   └── test/                      # Test setup/config
│
├── supabase/
│   └── functions/server/          # Backend API (Deno/Hono)
│       ├── index.tsx              # All API routes defined here
│       ├── crud_db.ts             # Database operations
│       ├── gifts_api_v2.ts        # Gift-specific API logic
│       ├── email_service.tsx      # Email sending
│       └── security.ts           # Auth/security middleware
│
├── .env                           # Local secrets (never commit this)
├── .env.example                   # Template showing required variables
├── package.json                   # Dependencies and npm scripts
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Build configuration
```

---

## Tech Stack (Plain English)

| Layer | Technology | What it does |
|-------|-----------|--------------|
| **Frontend framework** | React 18 + TypeScript | Builds the UI. TypeScript adds type checking to catch bugs before they run. |
| **Routing** | React Router 7 | Maps URLs like `/admin/dashboard` to specific page components |
| **Styling** | Tailwind CSS 4 | Utility CSS classes (e.g., `className="text-red-500 p-4"`) instead of writing CSS files |
| **UI components** | Shadcn/ui (Radix UI) | Pre-built accessible components (dialogs, dropdowns, tabs, etc.) |
| **Forms** | React Hook Form + Zod | Handles form state and validation. Zod defines the rules (e.g., "email must be valid format") |
| **Build tool** | Vite | Compiles and bundles the React app. Much faster than older tools like Webpack |
| **Backend** | Supabase Edge Functions (Deno) | Serverless API running on Supabase. Written in Hono (a lightweight web framework for Deno) |
| **Database** | PostgreSQL via Supabase | Relational database. All data (clients, employees, gifts, orders) lives here |
| **Auth** | JWT tokens | When a user logs in, they get a signed token. The backend checks this token on every request |
| **Testing (unit)** | Vitest + Testing Library | Runs component and function tests in isolation |
| **Testing (e2e)** | Playwright | Runs real browser tests — clicks through the app like a real user |
| **State management** | React Context API | Shares data across components without passing props everywhere. No Redux. |

**Brand colors:**
- Magenta: `#D91C81`
- Deep Blue: `#1B2A5E`
- Cyan: `#00B4CC`

---

## Architecture: How Frontend Talks to Backend

All API calls go through `src/app/lib/apiClient.ts`. This is a type-safe wrapper around `fetch()`.

```
Page Component
  → calls apiClient (e.g., apiClient.gifts.list())
    → sends HTTP request to Supabase Edge Function
      → Edge Function queries PostgreSQL
        → returns JSON back through the chain
```

**Authentication flow:**
- Admin logs in → backend returns a JWT token
- Token is stored in `sessionStorage` under key `jala_access_token`
- Every subsequent API request includes the token in the `Authorization` header
- Token expires after 30 minutes of inactivity and the user is automatically logged out
- Public employee-facing routes use a different session token (`X-Session-Token` header), not a JWT

**Public vs. admin endpoints:**
- `/public/...` routes — accessible by employees without a JWT (validated via session token)
- `/admin/...` routes — require a valid admin JWT
- `/...` (no prefix) — authenticated admin endpoints

---

## Important Conventions

**File naming:**
- Page components: `PascalCase.tsx` (e.g., `GiftDetail.tsx`)
- Hooks: `camelCase.ts` starting with `use` (e.g., `useGifts.ts`)
- Utilities: `camelCase.ts` (e.g., `formSchemas.ts`)
- Tests: same name as file with `.test.tsx` suffix in `__tests__/` folder

**Imports — use the `@/` path alias instead of relative paths:**
```typescript
// Good
import { Button } from '@/components/ui/button';

// Avoid (fragile relative paths)
import { Button } from '../../../components/ui/button';
```

**All user-visible strings must support translation.** The app supports 12 languages. Use the `useLanguage()` hook to get translations rather than hardcoding English strings.

**Component testing pattern:** Any component that uses context (auth, site, language) must be wrapped in the corresponding provider in tests. The most commonly needed wrapper is `LanguageProvider`.

**Backend CRUD operations** follow a factory pattern — new resources should use `createCrudFactory()` rather than writing individual route handlers.

**Linting:** The codebase has 0 errors and ~4,700 warnings. The warnings are intentionally non-blocking (mostly around async/await patterns). New code should not introduce new errors.

---

## Key Files to Know

| File | Why it matters |
|------|---------------|
| `src/app/routes.tsx` | Every URL in the app is defined here — good starting point to understand navigation |
| `src/app/lib/apiClient.ts` | All frontend API calls go through this — search here when you want to know how data is fetched |
| `supabase/functions/server/index.tsx` | All backend API routes — search here when you want to know what the server does |
| `src/app/context/` | Global state — AuthContext, SiteContext, GiftContext, CartContext are the most important |
| `src/app/utils/formSchemas.ts` | Zod validation rules for all forms |
| `.env` | Local environment variables (never commit, contains secrets) |

---

## Common Tasks

**Adding a new admin page:**
1. Create `src/app/pages/admin/MyNewPage.tsx`
2. Add a lazy import and route in `src/app/routes.tsx`
3. Add navigation link in the admin sidebar component

**Adding a new API endpoint:**
1. Add the route handler in `supabase/functions/server/index.tsx`
2. Add the corresponding method to `src/app/lib/apiClient.ts`
3. Add TypeScript types in `src/app/types/api.types.ts`

**Adding a new form field:**
1. Add the field to the Zod schema in `formSchemas.ts`
2. Register the field with React Hook Form in the component
3. Add the UI input element connected to the form

**Debugging a failing test:**
- Check if the component needs a context provider wrapper (most common issue)
- Run a single test file: `npx vitest run path/to/test.test.tsx`
- Check the error message — Testing Library errors usually tell you exactly what element it couldn't find

---

## Supabase Project

- **Project ID:** `wjfcqqrlhwdvvjmefxky`
- **Dashboard:** https://supabase.com/dashboard/project/wjfcqqrlhwdvvjmefxky
- **Backend URL:** `https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3`
- **Health check:** `GET /public/health-check`

---

## Known Gaps / Work In Progress

- **Public order endpoints are missing** — `POST /public/orders` and `GET /public/orders/:id` need to be added to `index.tsx`. The frontend pages `ReviewOrder.tsx` and `Confirmation.tsx` expect these to exist. This is the main blocker for the end-to-end employee gift flow.
- **Gift detail endpoint** — `GET /public/gifts/:giftId` may need to be verified/added for the `GiftDetail.tsx` page.
- **Lint warnings** — ~4,749 warnings remain (intentional, non-blocking). Do not add new ones without good reason.
- **Two gift configuration pages** — `SiteGiftAssignment.tsx` and `SiteGiftConfiguration.tsx` both exist. The canonical one for admin routes needs to be clarified.
