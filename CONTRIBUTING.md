# Contributing to JALA2

Thank you for your interest in contributing to JALA2! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Documentation](#documentation)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behaviors include:**
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without permission

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Read the documentation**:
   - [README.md](/README.md) - Project overview
   - [DEVELOPER_GUIDE.md](/DEVELOPER_GUIDE.md) - Development setup
   - [ARCHITECTURE.md](/ARCHITECTURE.md) - System architecture

2. **Set up your environment**:
   ```bash
   # Clone the repository
   git clone [repo-url]
   cd jala2
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Verify everything works**:
   ```bash
   # Run type check
   npm run type-check
   
   # Run tests
   npm test
   
   # Run linter
   npm run lint
   ```

### Finding Issues to Work On

- Check the **Issues** tab for open issues
- Look for issues labeled `good first issue` for beginners
- Look for issues labeled `help wanted` for experienced contributors
- Comment on the issue to let others know you're working on it

---

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b fix/bug-description
```

#### Branch Naming Convention

- **Features**: `feature/add-user-profile`
- **Bug Fixes**: `fix/login-error`
- **Documentation**: `docs/update-readme`
- **Refactoring**: `refactor/api-client`
- **Testing**: `test/add-validation-tests`

### 2. Make Your Changes

- Write clean, readable code
- Follow the [coding standards](#coding-standards)
- Add comments where necessary
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run type check
npm run type-check

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

### 4. Commit Your Changes

Follow the [commit guidelines](#commit-guidelines):

```bash
git add .
git commit -m "feat: add user profile component"
```

### 5. Push and Create Pull Request

```bash
# Push to your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
# Fill out the PR template completely
```

---

## 📝 Coding Standards

### TypeScript

#### Type Safety

```typescript
// ✅ DO: Use strict types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  return apiClient.users.get(id);
}

// ❌ DON'T: Use any
function getUser(id: any): Promise<any> {
  return fetch(`/users/${id}`);
}
```

#### Naming Conventions

```typescript
// Interfaces: PascalCase
interface UserProfile { }

// Types: PascalCase
type Status = 'active' | 'inactive';

// Variables/Functions: camelCase
const userName = 'John';
function getUserName() { }

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Components: PascalCase
function UserCard() { }

// Private functions: _prefixed (optional)
function _internalHelper() { }
```

### React Components

#### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import type { User } from '@/app/types/api.types';

// 2. Types/Interfaces
interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
}

// 3. Component
export function UserCard({ user, onSelect }: UserCardProps) {
  // 4. Hooks
  const [isHovered, setIsHovered] = useState(false);
  
  // 5. Event handlers
  const handleClick = () => {
    onSelect(user);
  };
  
  // 6. Render
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <Button>Select</Button>
    </div>
  );
}
```

#### Props Validation

```typescript
// ✅ DO: Define prop types
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// ❌ DON'T: Use any or loose types
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### File Organization

```
src/app/components/
├── ui/                   # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── admin/                # Admin-specific components
│   ├── UserTable.tsx
│   └── ...
├── Header.tsx            # Shared components
├── Footer.tsx
└── ...
```

### Import Order

```typescript
// 1. React and external libraries
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// 2. Internal utilities and types
import { apiClient } from '@/app/lib/apiClient';
import type { Client } from '@/app/types/api.types';

// 3. Components
import { Button } from '@/app/components/ui/button';
import { ClientCard } from '@/app/components/ClientCard';

// 4. Styles (if any)
import './styles.css';
```

---

## 💬 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, config, etc.)

### Examples

```bash
# Feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(api): resolve token expiration issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(components): extract reusable Button component"

# Test
git commit -m "test(validation): add tests for email schema"

# With body and breaking change
git commit -m "feat(api): change authentication method

Use JWT tokens instead of session cookies.
This improves scalability and security.

BREAKING CHANGE: Session-based auth is no longer supported."
```

### Commit Best Practices

- **Write clear, concise messages**
- **Use present tense** ("add feature" not "added feature")
- **Keep subject line under 72 characters**
- **Reference issues** when applicable (#123)
- **Explain the why, not just the what** in the body

---

## 🔍 Pull Request Process

### Before Creating a PR

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Commits follow guidelines

### Creating a PR

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**:
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Title**: Follow commit message format
   ```
   feat(auth): add password reset functionality
   ```

### PR Description Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Commits follow guidelines

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: CI runs tests and linting
2. **Code Review**: Team members review your code
3. **Address Feedback**: Make requested changes
4. **Approval**: At least one approval required
5. **Merge**: Maintainer merges the PR

### After Merge

- Delete your feature branch
- Pull latest main branch
- Start next feature!

---

## ✅ Testing Requirements

### Required Tests

#### 1. **Unit Tests**

Test individual functions and utilities:

```typescript
// utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/app/utils/currency';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
  
  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});
```

#### 2. **Validation Tests**

Test Zod schemas:

```typescript
// validation.test.ts
import { emailSchema } from '@/app/schemas/validation.schemas';

it('validates correct email', () => {
  const result = emailSchema.safeParse('user@example.com');
  expect(result.success).toBe(true);
});
```

#### 3. **Component Tests** (Optional but Recommended)

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/app/components/ui/button';

it('calls onClick when clicked', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Test Coverage Goals

- **Critical functionality**: 100%
- **Utilities**: 80%+
- **Components**: 50%+ (focus on complex logic)

---

## 📚 Documentation

### When to Update Documentation

Update documentation when you:

- Add a new feature
- Change existing functionality
- Fix a bug that affects usage
- Refactor public APIs
- Add new configuration options

### Documentation Files to Update

#### README.md
- Project overview
- Quick start guide
- Feature list

#### DEVELOPER_GUIDE.md
- Development setup
- Common tasks
- New patterns or conventions

#### ARCHITECTURE.md
- System design changes
- New architectural patterns
- Data flow changes

#### Inline Comments
- Complex logic
- Non-obvious solutions
- Important business rules

### JSDoc for Functions

```typescript
/**
 * Calculate the total price of items in cart
 * @param items - Array of cart items
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price including tax
 * @example
 * ```typescript
 * const total = calculateTotal(
 *   [{ price: 100, quantity: 2 }],
 *   0.08
 * );
 * // Returns 216 (200 + 8% tax)
 * ```
 */
export function calculateTotal(
  items: CartItem[],
  taxRate: number
): number {
  const subtotal = items.reduce((sum, item) => 
    sum + item.price * item.quantity, 0
  );
  return subtotal * (1 + taxRate);
}
```

---

## 🎯 Review Checklist

Before submitting your PR, verify:

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code is formatted with Prettier
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code

### Functionality
- [ ] Feature works as expected
- [ ] Edge cases are handled
- [ ] Error states are handled
- [ ] Loading states are shown

### Testing
- [ ] Tests are added for new functionality
- [ ] All tests pass
- [ ] Manual testing completed

### Documentation
- [ ] Code is self-documenting or has comments
- [ ] README updated if needed
- [ ] JSDoc added for exported functions
- [ ] CHANGELOG updated (if maintained)

### Performance
- [ ] No unnecessary re-renders
- [ ] API calls are optimized
- [ ] Large lists are paginated

### Security
- [ ] User input is validated
- [ ] No sensitive data in logs
- [ ] Authentication is required where needed

---

## 🙏 Thank You!

Your contributions make JALA2 better for everyone. We appreciate your time and effort!

If you have questions, please:
1. Check the documentation
2. Search existing issues
3. Ask in discussions
4. Reach out to maintainers

**Happy contributing!** 🎉

---

*Last Updated: February 7, 2026*  
*Version: 1.0.0*
