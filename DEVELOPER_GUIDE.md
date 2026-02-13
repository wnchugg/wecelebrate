# JALA2 Developer Guide

Welcome to the JALA2 development team! This guide will help you get started with development, understand the codebase, and contribute effectively.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Common Tasks](#common-tasks)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **pnpm** (pnpm recommended)
- **Git**
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

### Quick Start

```bash
# Clone the repository
git clone [repo-url]
cd jala2

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev

# Open browser
# http://localhost:5173
```

---

## ⚙️ Development Setup

### Environment Configuration

1. **Create environment file** (if needed):
   ```bash
   cp .env.example .env
   ```

2. **Configure Supabase**:
   - Development Project: `wjfcqqrlhwdvvjmefxky`
   - Production Project: `lmffeqwhrnbsbhdztwyv`

3. **Set up the backend** (see [DEPLOYMENT_GUIDE.md](/DEPLOYMENT_GUIDE.md))

### Editor Setup

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

#### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Environment-specific builds
npm run build:staging     # Build for staging
npm run build:production  # Build for production

# Quality Checks
npm run type-check       # TypeScript type checking
npm run lint             # ESLint
npm run format           # Prettier formatting

# Testing
npm test                 # Run tests once
npm run test:watch       # Watch mode
```

---

## 📁 Project Structure

```
jala2/
├── src/
│   ├── app/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # Base UI components
│   │   │   ├── admin/      # Admin components
│   │   │   └── *.tsx       # Shared components
│   │   ├── pages/          # Route pages
│   │   │   ├── admin/      # Admin pages
│   │   │   └── *.tsx       # Public pages
│   │   ├── context/        # React Context
│   │   ├── hooks/          # Custom hooks
│   │   │   ├── useApi.ts   # Base hooks
│   │   │   ├── useAuth.ts  # Auth hooks
│   │   │   └── ...
│   │   ├── lib/            # Libraries
│   │   │   └── apiClient.ts
│   │   ├── types/          # TypeScript types
│   │   │   └── api.types.ts
│   │   ├── schemas/        # Zod schemas
│   │   │   └── validation.schemas.ts
│   │   ├── utils/          # Utilities
│   │   ├── config/         # Configuration
│   │   ├── data/           # Static data
│   │   └── routes.tsx      # Routes
│   ├── styles/             # Global styles
│   ├── tests/              # Frontend tests
│   └── env.d.ts            # Type definitions
├── supabase/
│   └── functions/
│       └── server/         # Backend code
├── docs/                   # Documentation
├── scripts/                # Deployment scripts
└── package.json
```

### Key Directories

#### `/src/app/components/`
Reusable React components. Organized by:
- `ui/` - Base components (buttons, inputs, etc.)
- `admin/` - Admin-specific components
- Root - Shared components (Header, Footer, etc.)

#### `/src/app/pages/`
Page components corresponding to routes:
- `admin/` - Admin dashboard pages
- Root - Public pages

#### `/src/app/hooks/`
Custom React hooks:
- `useApi.ts` - Base hooks (useQuery, useMutation, usePagination)
- `useAuth.ts` - Authentication hooks
- `useClients.ts`, `useSites.ts`, `useGifts.ts` - Domain hooks

#### `/src/app/lib/`
Library code:
- `apiClient.ts` - Type-safe API client

---

## 📝 Coding Standards

### TypeScript

#### Always Use Strict Types

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  return apiClient.users.get(id);
}

// ❌ Bad
function getUser(id: any): Promise<any> {
  return apiClient.users.get(id);
}
```

#### Prefer Interfaces Over Types (for objects)

```typescript
// ✅ Good
interface Client {
  id: string;
  name: string;
}

// ⚠️ Use types for unions/primitives
type Status = 'active' | 'inactive';
type ID = string;
```

#### Use Type Guards

```typescript
// ✅ Good
if (isErrorResponse(response)) {
  console.error(response.error);
} else {
  console.log(response.data);
}

// Type guard function
function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return 'error' in response;
}
```

### React

#### Function Components with TypeScript

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ❌ Bad
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

#### Use Custom Hooks

```typescript
// ✅ Good - Use custom hooks
function ClientList() {
  const { data: clients, isLoading, error } = useClients();
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {clients?.data.map(client => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}

// ❌ Bad - Manual state management
function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/clients')
      .then(r => r.json())
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);
  
  // ...
}
```

#### Always Handle Loading and Error States

```typescript
// ✅ Good
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <NotFound />;
  
  return <div>{user.name}</div>;
}

// ❌ Bad
function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  return <div>{user.name}</div>; // Could crash!
}
```

### Validation

#### Always Validate User Input

```typescript
// ✅ Good
import { createClientRequestSchema } from '@/app/schemas/validation.schemas';

function handleSubmit(formData: unknown) {
  const result = createClientRequestSchema.safeParse(formData);
  
  if (!result.success) {
    const errors = getValidationErrors(result.error);
    showErrors(errors);
    return;
  }
  
  // result.data is now typed and validated
  createClient(result.data);
}

// ❌ Bad
function handleSubmit(formData: any) {
  createClient(formData); // No validation!
}
```

### Styling

#### Use Tailwind CSS Classes

```typescript
// ✅ Good
<button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
  Click me
</button>

// ⚠️ Avoid inline styles
<button style={{ padding: '8px 16px', backgroundColor: '#D91C81' }}>
  Click me
</button>
```

#### Use the `cn()` Helper for Conditional Classes

```typescript
import { cn } from '@/app/components/ui/utils';

// ✅ Good
<button
  className={cn(
    "px-4 py-2 rounded-md",
    isPrimary && "bg-primary text-white",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</button>
```

### File Organization

#### One Component Per File

```typescript
// ✅ Good - ClientCard.tsx
export function ClientCard({ client }: { client: Client }) {
  return <div>{client.name}</div>;
}

// ❌ Bad - components.tsx
export function ClientCard() { /* ... */ }
export function SiteCard() { /* ... */ }
export function GiftCard() { /* ... */ }
```

#### Named Exports for Components

```typescript
// ✅ Good
export function ClientCard() { /* ... */ }

// ❌ Bad
export default function ClientCard() { /* ... */ }
```

#### Index Files for Barrel Exports (Optional)

```typescript
// components/index.ts
export { ClientCard } from './ClientCard';
export { SiteCard } from './SiteCard';
export { GiftCard } from './GiftCard';

// Usage
import { ClientCard, SiteCard, GiftCard } from './components';
```

---

## 🔧 Common Tasks

### Adding a New Page

1. **Create the page component**:
   ```typescript
   // src/app/pages/NewPage.tsx
   export function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. **Add route**:
   ```typescript
   // src/app/routes.tsx
   import { NewPage } from './pages/NewPage';
   
   {
     path: '/new-page',
     Component: NewPage
   }
   ```

### Adding a New API Endpoint

1. **Define types**:
   ```typescript
   // src/app/types/api.types.ts
   export interface NewEntity {
     id: string;
     name: string;
   }
   ```

2. **Create Zod schema**:
   ```typescript
   // src/app/schemas/validation.schemas.ts
   export const newEntitySchema = z.object({
     id: z.string().uuid(),
     name: z.string().min(1),
   });
   ```

3. **Add to API client**:
   ```typescript
   // src/app/lib/apiClient.ts
   export const apiClient = {
     // ... existing code
     newEntities: {
       async list() { /* ... */ },
       async get(id: string) { /* ... */ },
       async create(data: CreateNewEntityRequest) { /* ... */ }
     }
   };
   ```

4. **Create custom hook**:
   ```typescript
   // src/app/hooks/useNewEntities.ts
   export function useNewEntities() {
     return useQuery(['newEntities'], () => apiClient.newEntities.list());
   }
   ```

### Adding a New Component

1. **Create component file**:
   ```typescript
   // src/app/components/MyComponent.tsx
   interface MyComponentProps {
     title: string;
     onAction: () => void;
   }
   
   export function MyComponent({ title, onAction }: MyComponentProps) {
     return (
       <div>
         <h2>{title}</h2>
         <button onClick={onAction}>Action</button>
       </div>
     );
   }
   ```

2. **Add tests** (optional but recommended):
   ```typescript
   // src/tests/MyComponent.test.tsx
   import { render, screen } from '@testing-library/react';
   import { MyComponent } from '@/app/components/MyComponent';
   
   it('renders title', () => {
     render(<MyComponent title="Test" onAction={() => {}} />);
     expect(screen.getByText('Test')).toBeInTheDocument();
   });
   ```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Specific test file
npm test MyComponent.test
```

### Writing Tests

#### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { emailSchema } from '@/app/schemas/validation.schemas';

describe('emailSchema', () => {
  it('validates correct email', () => {
    const result = emailSchema.safeParse('user@example.com');
    expect(result.success).toBe(true);
  });
  
  it('rejects invalid email', () => {
    const result = emailSchema.safeParse('not-an-email');
    expect(result.success).toBe(false);
  });
});
```

#### Component Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/app/components/ui/button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

---

## 🐛 Debugging

### Browser DevTools

1. **React DevTools**:
   - Install React Developer Tools extension
   - Inspect component props and state
   - Profile performance

2. **Network Tab**:
   - Monitor API requests
   - Check request/response headers
   - Verify authentication tokens

3. **Console**:
   - Check for errors and warnings
   - Use `console.log()` for debugging
   - Use `console.table()` for arrays/objects

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### Common Issues

#### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
npm run type-check
```

#### Build Errors

```bash
# Clear build cache
rm -rf dist
npm run build
```

#### Dependency Issues

```bash
# Reinstall dependencies
rm -rf node_modules
rm -f pnpm-lock.yaml  # or package-lock.json
npm install
```

---

## ✅ Best Practices

### 1. **Keep Components Small**
   - Single responsibility
   - Extract complex logic to hooks
   - Reuse components

### 2. **Use TypeScript Strictly**
   - No `any` types
   - Define interfaces for all props
   - Use type guards for runtime checks

### 3. **Validate All Inputs**
   - Use Zod schemas
   - Validate on both client and server
   - Show user-friendly error messages

### 4. **Handle All States**
   - Loading states
   - Error states
   - Empty states
   - Success states

### 5. **Write Tests**
   - Test critical functionality
   - Test edge cases
   - Keep tests simple and readable

### 6. **Document Your Code**
   - Add JSDoc comments for exported functions
   - Explain complex logic
   - Update README when adding features

### 7. **Follow Security Best Practices**
   - Never expose service role key
   - Sanitize user input
   - Use HTTPS in production
   - Validate authentication

---

## 🆘 Troubleshooting

### "Module not found" Error

```bash
# Check import path
# Use @ for absolute imports from src/app/
import { apiClient } from '@/app/lib/apiClient';

# Not relative paths like
import { apiClient } from '../../../lib/apiClient';
```

### "Cannot read property of undefined"

```typescript
// Always check for null/undefined
if (!user) return null;
return <div>{user.name}</div>;

// Or use optional chaining
return <div>{user?.name}</div>;
```

### API 401 Errors

```typescript
// Check if token is set
const token = getAccessToken();
console.log('Token:', token);

// Check if token is being sent
// Open Network tab → Check request headers
```

### Styling Not Applied

```bash
# Restart Vite dev server
# Tailwind sometimes needs a restart

# Check className spelling
<div className="bg-primary"> ✅
<div class="bg-primary"> ❌ (use className in React)
```

---

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)

---

## 🤝 Getting Help

1. **Check Documentation**: Start with this guide and the README
2. **Search Issues**: Look for similar problems
3. **Ask Team**: Reach out to team members
4. **Debug**: Use browser DevTools and console logs

---

**Happy coding!** 🎉

*Last Updated: February 7, 2026*
