# 🎉 wecelebrate - Corporate Gifting & Employee Recognition Platform

[![Tests](https://img.shields.io/badge/tests-853%20passing-brightgreen)](/)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](/)
[![React](https://img.shields.io/badge/React-18.3-blue)](/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-passing-brightgreen)](/)

> A modern, enterprise-grade platform for corporate event gifting and service award anniversary recognition with comprehensive testing infrastructure.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Run with coverage
pnpm run test:coverage

# Run visual regression tests
pnpm run test:visual
```

## 📊 Test Infrastructure

### Test Suite Overview

| Test Type | Count | Status | Coverage |
|-----------|-------|--------|----------|
| **Unit Tests** | 652 | ✅ 100% | UI Components |
| **Integration Tests** | 201 | ✅ 100% | Workflows & Routes |
| **Performance Benchmarks** | 15+ | ✅ Passing | Critical Paths |
| **Visual Regression** | 30+ | ✅ Passing | UI Consistency |
| **E2E Tests** | Configured | ✅ Ready | User Journeys |
| **Total** | **853+** | ✅ **100%** | **~85%** |

### Test Commands

```bash
# Unit & Integration Tests
pnpm test                          # Run all tests
pnpm test:watch                    # Watch mode
pnpm test:ui                       # Vitest UI
pnpm test:coverage                 # With coverage report

# Specific Test Suites
pnpm test:ui-components            # UI component tests
pnpm test:integration              # Integration tests
pnpm test:performance              # Performance benchmarks

# Visual Regression
pnpm test:visual                   # Run visual tests
pnpm test:visual:update            # Update snapshots
pnpm test:visual:ui                # Playwright UI

# E2E Tests
pnpm test:e2e                      # Run E2E tests
pnpm test:e2e:ui                   # Playwright UI
pnpm test:e2e:debug                # Debug mode

# Combined
pnpm test:all                      # All test suites
pnpm ci                            # CI pipeline tests
```

### Performance Thresholds

| Metric | Fast | Acceptable | Slow |
|--------|------|------------|------|
| Page Load | < 1s | < 2.5s | < 5s |
| Render (60fps) | < 16.67ms | < 33.33ms | < 100ms |
| API Calls | < 100ms | < 500ms | < 2s |
| User Interaction | < 50ms | < 100ms | < 300ms |

## 🏗️ Architecture

### Technology Stack

- **Frontend:** React 18.3 + TypeScript 5.7
- **Router:** React Router 7.13
- **Styling:** Tailwind CSS 4.1
- **UI Components:** Radix UI + Custom Components
- **State Management:** React Context API
- **Backend:** Supabase (Auth, Database, Storage)
- **Testing:** Vitest + Testing Library + Playwright
- **CI/CD:** GitHub Actions

### Project Structure

```
wecelebrate-app/
├── src/
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── context/          # Context providers
│   │   ├── pages/            # Page components
│   │   ├── routes.ts         # Route configuration
│   │   └── __tests__/        # Integration tests
│   ├── test/
│   │   └── utils/            # Test utilities
│   ├── i18n/                 # Translations
│   └── styles/               # Global styles
├── .github/
│   └── workflows/            # CI/CD pipelines
├── coverage/                 # Coverage reports
├── test-results/             # Test results
└── TESTING.md               # Testing documentation
```

## 🧪 Testing

### Coverage Reports

Generate and view coverage:

```bash
# Generate coverage
pnpm run test:coverage

# Open HTML report
open coverage/index.html

# Generate badge
pnpm run coverage:badge
```

### Performance Benchmarking

Monitor performance of critical paths:

```bash
# Run performance tests
pnpm run test:performance

# Results include:
# - Component rendering speed
# - User interaction responsiveness
# - Context update performance
# - Memory usage tracking
```

### Visual Regression Testing

Ensure UI consistency across changes:

```bash
# Run visual tests
pnpm test:visual

# Update baselines (after intentional UI changes)
pnpm test:visual:update

# View test results
npx playwright show-report test-results/visual-report
```

**Visual Tests Cover:**
- ✅ All major pages
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode
- ✅ Multi-language UI
- ✅ Component states (hover, focus, active)
- ✅ Error states

## 🔄 CI/CD Pipeline

### Automated Pipeline

Our CI/CD pipeline runs on every push and PR:

```
┌─────────────────┐
│  Code Quality   │ → ESLint, Prettier, TypeScript
├─────────────────┤
│  Unit Tests     │ → 652 tests
├─────────────────┤
│  Integration    │ → 201 tests
├─────────────────┤
│  Performance    │ → Benchmarks
├─────────────────┤
│  Visual Tests   │ → Screenshot comparison
├─────────────────┤
│  Security Scan  │ → Trivy + npm audit
├─────────────────┤
│  Build          │ → Staging + Production
├─────────────────┤
│  Deploy         │ → Auto-deploy on success
└─────────────────┘
```

### Deployment Environments

| Environment | Branch | URL | Auto-Deploy |
|-------------|--------|-----|-------------|
| **Production** | `main` | https://wecelebrate.app | ✅ |
| **Staging** | `develop` | https://staging.wecelebrate.app | ✅ |
| **Development** | feature/* | - | ❌ |

## 📈 Monitoring & Metrics

### Performance Monitoring

The application tracks:
- Page load times
- Component render performance
- API response times
- User interaction latency
- Memory usage

### Test Coverage Tracking

- **Statements:** ~85%
- **Branches:** ~80%
- **Functions:** ~82%
- **Lines:** ~85%

Coverage reports are generated automatically and stored for 30 days.

## 🛠️ Development

### Prerequisites

- Node.js 20+
- pnpm 8+
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/wecelebrate-app.git
cd wecelebrate-app

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

### Code Quality

```bash
# Lint code
pnpm lint

# Fix lint issues
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm type-check

# Run all quality checks
pnpm ci
```

## 📚 Documentation

- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture
- **[API.md](./docs/API.md)** - API documentation
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines

## 🎯 Key Features

### ✅ Implemented
- Multi-catalog product management
- Event gifting workflows
- Service award anniversaries
- Multi-language support (20+ languages)
- Responsive design (mobile, tablet, desktop)
- Dark mode
- Admin dashboard
- Role-based access control
- Shopping cart & checkout
- Order management

### 🔜 Upcoming
- Email notifications
- Advanced analytics
- Bulk order processing
- Integration APIs
- Mobile app

## 🧩 Core Components

### UI Component Library (652 tests)
- Buttons, inputs, forms
- Cards, dialogs, modals
- Navigation, menus
- Data tables, lists
- Charts, graphs
- All Radix UI primitives

### Integration Tests (201 tests)
- Route navigation (81 tests)
- Shopping flows (22 tests)
- User journeys (25 tests)
- Context integration (26 tests)
- Complex scenarios (22 tests)
- Navigation patterns (25 tests)

## 🔒 Security

- **Authentication:** Supabase Auth with JWT
- **Authorization:** Role-based access control (RBAC)
- **Data Encryption:** TLS/SSL in transit, encryption at rest
- **Security Scans:** Automated vulnerability scanning
- **Audit Logging:** Comprehensive activity logs

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Create feature branch from `develop`
2. Make changes with tests
3. Run `pnpm ci` locally
4. Submit pull request
5. Wait for CI checks to pass
6. Request review from team
7. Merge after approval

## 📄 License

Copyright © 2026 wecelebrate. All rights reserved.

## 🙏 Acknowledgments

- React team for amazing framework
- Radix UI for accessible components
- Supabase for backend infrastructure
- Testing Library for testing utilities
- Playwright for E2E and visual testing

---

**Built with ❤️ by the wecelebrate Engineering Team**

For questions or support, contact: engineering@wecelebrate.app
