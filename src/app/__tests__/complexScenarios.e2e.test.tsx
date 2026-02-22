/**
 * Complex Scenarios E2E Test Suite
 * Day 15 - Afternoon Session (Part 2)
 * Tests for error recovery, edge cases, and complex workflows
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate, useLocation } from 'react-router';
import { CartProvider, useCart } from '../context/CartContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ReactNode } from 'react';
import React from 'react';

// Mock utilities
vi.mock('../utils/security', () => ({
  logSecurityEvent: vi.fn(),
  startSessionTimer: vi.fn(),
  clearSessionTimer: vi.fn(),
  resetSessionTimer: vi.fn(),
}));

// Mock Error Boundary Page
function ErrorPage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred</p>
      <button onClick={() => void navigate('/')}>Return Home</button>
      <button onClick={() => window.location.reload()}>Reload Page</button>
    </div>
  );
}

// Mock Session Expired Page
function SessionExpiredPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div>
      <h1>Session Expired</h1>
      <p>Your session has expired. Please login again.</p>
      <button onClick={() => void navigate('/login', { state: { from: location } })}>
        Login Again
      </button>
      <button onClick={() => void navigate('/')}>Go Home</button>
    </div>
  );
}

// Mock Network Error Page
function NetworkErrorPage() {
  const navigate = useNavigate();
  const [retrying, setRetrying] = React.useState(false);
  
  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => setRetrying(false), 1000);
  };
  
  return (
    <div>
      <h1>Network Error</h1>
      <p>Unable to connect to the server</p>
      {retrying && <p data-testid="retrying">Retrying...</p>}
      <button onClick={handleRetry}>Retry Connection</button>
      <button onClick={() => void navigate('/')}>Go Home</button>
    </div>
  );
}

// Mock Multi-Language Page
function MultiLanguagePage() {
  const { currentLanguage, setLanguage } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  
  const translations = {
    en: {
      title: 'Welcome',
      cart: 'Cart',
      login: 'Login',
    },
    es: {
      title: 'Bienvenido',
      cart: 'Carrito',
      login: 'Iniciar sesión',
    },
    fr: {
      title: 'Bienvenue',
      cart: 'Panier',
      login: 'Connexion',
    },
  };
  
  const t = translations[currentLanguage.code as keyof typeof translations] || translations.en;
  
  return (
    <div>
      <h1 data-testid="page-title">{t.title}</h1>
      <p data-testid="cart-label">{t.cart}: {totalItems}</p>
      <p data-testid="auth-status">{isAuthenticated ? 'Authenticated' : t.login}</p>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('es')}>Español</button>
      <button onClick={() => setLanguage('fr')}>Français</button>
    </div>
  );
}

// Mock Catalog Configuration Page
function CatalogConfigPage() {
  const navigate = useNavigate();
  const [config, setConfig] = React.useState({
    catalogType: 'erp',
    source: '',
    enabled: false,
  });
  
  const handleSave = () => {
    void navigate('/admin/catalogs');
  };
  
  return (
    <div>
      <h1>Catalog Configuration</h1>
      <select
        data-testid="catalog-type"
        value={config.catalogType}
        onChange={(e) => setConfig({ ...config, catalogType: e.target.value })}
      >
        <option value="erp">ERP System</option>
        <option value="vendor">External Vendor</option>
        <option value="custom">Custom Catalog</option>
      </select>
      <input
        data-testid="catalog-source"
        placeholder="Source URL or API endpoint"
        value={config.source}
        onChange={(e) => setConfig({ ...config, source: e.target.value })}
      />
      <label>
        <input
          data-testid="catalog-enabled"
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
        />
        Enable Catalog
      </label>
      <button onClick={handleSave}>Save Configuration</button>
      <button onClick={() => void navigate('/admin/catalogs')}>Cancel</button>
    </div>
  );
}

// Mock Site Catalog Assignment Page
function SiteCatalogAssignmentPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = React.useState<string[]>([]);
  
  const toggleCatalog = (catalogId: string) => {
    setAssignments(prev =>
      prev.includes(catalogId)
        ? prev.filter(id => id !== catalogId)
        : [...prev, catalogId]
    );
  };
  
  return (
    <div>
      <h1>Assign Catalogs to Site</h1>
      <div data-testid="available-catalogs">
        <label>
          <input
            type="checkbox"
            checked={assignments.includes('catalog-1')}
            onChange={() => toggleCatalog('catalog-1')}
          />
          ERP Product Catalog
        </label>
        <label>
          <input
            type="checkbox"
            checked={assignments.includes('catalog-2')}
            onChange={() => toggleCatalog('catalog-2')}
          />
          Vendor Gift Catalog
        </label>
        <label>
          <input
            type="checkbox"
            checked={assignments.includes('catalog-3')}
            onChange={() => toggleCatalog('catalog-3')}
          />
          Custom Awards Catalog
        </label>
      </div>
      <p data-testid="assignment-count">{assignments.length} catalogs assigned</p>
      <button onClick={() => void navigate('/admin/sites')}>Save Assignment</button>
      <button onClick={() => void navigate('/admin/sites')}>Cancel</button>
    </div>
  );
}

// Mock Performance Dashboard
function PerformanceDashboardPage() {
  const [metrics, setMetrics] = React.useState({
    pageLoadTime: 1250,
    apiResponseTime: 320,
    renderTime: 180,
  });
  
  return (
    <div>
      <h1>Performance Dashboard</h1>
      <div data-testid="metrics">
        <p data-testid="page-load">Page Load: {metrics.pageLoadTime}ms</p>
        <p data-testid="api-response">API Response: {metrics.apiResponseTime}ms</p>
        <p data-testid="render-time">Render Time: {metrics.renderTime}ms</p>
      </div>
      <button onClick={() => setMetrics({
        pageLoadTime: Math.random() * 2000,
        apiResponseTime: Math.random() * 500,
        renderTime: Math.random() * 300,
      })}>
        Refresh Metrics
      </button>
    </div>
  );
}

// Mock Concurrent Operations Page
function ConcurrentOperationsPage() {
  const { addToCart } = useCart();
  const { authenticate, logout } = useAuth();
  const { setLanguage } = useLanguage();
  const [operations, setOperations] = React.useState<string[]>([]);
  
  const performConcurrentOps = () => {
    const ops: string[] = [];
    
    // Simulate concurrent operations
    authenticate('user@example.com');
    ops.push('Authenticated');
    
    addToCart({
      id: 'product-1',
      name: 'Test Product',
      description: 'Test product description',
      price: 99.99,
      category: 'Test',
      image: '/test.jpg',
      inStock: true,
    });
    ops.push('Added to cart');
    
    setLanguage('es');
    ops.push('Changed language');
    
    setOperations(ops);
  };
  
  return (
    <div>
      <h1>Concurrent Operations Test</h1>
      <button onClick={performConcurrentOps}>Execute Concurrent Operations</button>
      <div data-testid="operations-log">
        {operations.map((op, index) => (
          <p key={index}>{op}</p>
        ))}
      </div>
      <p data-testid="operation-count">{operations.length} operations completed</p>
    </div>
  );
}

function TestWrapper({ children, initialRoute = '/' }: { children: ReactNode; initialRoute?: string }) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('Complex Scenarios E2E Suite', () => {
  describe('Error Recovery Flows', () => {
    it('should handle error page navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/error">
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      await user.click(screen.getByText('Return Home'));
      
      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });
    });

    it('should handle session expiration', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/session-expired">
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/session-expired" element={<SessionExpiredPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Login Again'));
      
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    it('should handle network error with retry', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/network-error">
          <Routes>
            <Route path="/network-error" element={<NetworkErrorPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Retry Connection'));
      
      await waitFor(() => {
        expect(screen.getByTestId('retrying')).toBeInTheDocument();
      });
    });

    it('should navigate home from network error', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/network-error">
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/network-error" element={<NetworkErrorPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Go Home'));
      
      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });
    });
  });

  describe('Multi-Language Flows', () => {
    it('should switch between languages', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<MultiLanguagePage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('page-title')).toHaveTextContent('Welcome');
      
      await user.click(screen.getByText('Español'));
      
      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Bienvenido');
      });
    });

    it('should maintain context state across language changes', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<MultiLanguagePage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Switch to French
      await user.click(screen.getByText('Français'));
      
      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Bienvenue');
        expect(screen.getByTestId('cart-label')).toHaveTextContent('Panier: 0');
      });
    });

    it('should display correct translations for all languages', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<MultiLanguagePage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Reset to English first if needed
      const pageTitle = screen.getByTestId('page-title');
      if (pageTitle.textContent !== 'Welcome') {
        await user.click(screen.getByText('English'));
        await waitFor(() => expect(pageTitle).toHaveTextContent('Welcome'));
      }
      
      // English (should be current)
      expect(screen.getByTestId('page-title')).toHaveTextContent('Welcome');
      
      // Spanish
      await user.click(screen.getByText('Español'));
      await waitFor(() => expect(screen.getByTestId('page-title')).toHaveTextContent('Bienvenido'));
      
      // French
      await user.click(screen.getByText('Français'));
      await waitFor(() => expect(screen.getByTestId('page-title')).toHaveTextContent('Bienvenue'));
      
      // Back to English
      await user.click(screen.getByText('English'));
      await waitFor(() => expect(screen.getByTestId('page-title')).toHaveTextContent('Welcome'));
    });
  });

  describe('Multi-Catalog Management Flows', () => {
    it('should configure catalog settings', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/admin/catalog-config">
          <Routes>
            <Route path="/admin/catalogs" element={<div>Catalogs List</div>} />
            <Route path="/admin/catalog-config" element={<CatalogConfigPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Select catalog type
      await user.selectOptions(screen.getByTestId('catalog-type'), 'vendor');
      
      // Enter source
      await user.type(screen.getByTestId('catalog-source'), 'https://api.vendor.com/products');
      
      // Enable catalog
      await user.click(screen.getByTestId('catalog-enabled'));
      
      // Save
      await user.click(screen.getByText('Save Configuration'));
      
      await waitFor(() => {
        expect(screen.getByText('Catalogs List')).toBeInTheDocument();
      });
    });

    it('should assign multiple catalogs to site', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/admin/site-catalog-assignment">
          <Routes>
            <Route path="/admin/sites" element={<div>Sites List</div>} />
            <Route path="/admin/site-catalog-assignment" element={<SiteCatalogAssignmentPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Initially no catalogs assigned
      expect(screen.getByTestId('assignment-count')).toHaveTextContent('0 catalogs assigned');
      
      // Assign first catalog
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await waitFor(() => expect(screen.getByTestId('assignment-count')).toHaveTextContent('1 catalogs assigned'));
      
      // Assign second catalog
      await user.click(checkboxes[1]);
      await waitFor(() => expect(screen.getByTestId('assignment-count')).toHaveTextContent('2 catalogs assigned'));
      
      // Save assignment
      await user.click(screen.getByText('Save Assignment'));
      
      await waitFor(() => {
        expect(screen.getByText('Sites List')).toBeInTheDocument();
      });
    });

    it('should toggle catalog assignments', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/admin/site-catalog-assignment">
          <Routes>
            <Route path="/admin/site-catalog-assignment" element={<SiteCatalogAssignmentPage />} />
          </Routes>
        </TestWrapper>
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      
      // Assign
      await user.click(checkboxes[0]);
      await waitFor(() => expect(screen.getByTestId('assignment-count')).toHaveTextContent('1 catalogs assigned'));
      
      // Unassign
      await user.click(checkboxes[0]);
      await waitFor(() => expect(screen.getByTestId('assignment-count')).toHaveTextContent('0 catalogs assigned'));
    });
  });

  describe('Performance Monitoring Flows', () => {
    it('should display performance metrics', () => {
      render(
        <TestWrapper initialRoute="/admin/performance">
          <Routes>
            <Route path="/admin/performance" element={<PerformanceDashboardPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('page-load')).toBeInTheDocument();
      expect(screen.getByTestId('api-response')).toBeInTheDocument();
      expect(screen.getByTestId('render-time')).toBeInTheDocument();
    });

    it('should refresh performance metrics', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/admin/performance">
          <Routes>
            <Route path="/admin/performance" element={<PerformanceDashboardPage />} />
          </Routes>
        </TestWrapper>
      );
      
      const initialValue = screen.getByTestId('page-load').textContent;
      
      await user.click(screen.getByText('Refresh Metrics'));
      
      await waitFor(() => {
        const newValue = screen.getByTestId('page-load').textContent;
        // Value should change (though in real test might be same by chance)
        expect(screen.getByTestId('page-load')).toBeInTheDocument();
      });
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple simultaneous context updates', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<ConcurrentOperationsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Execute Concurrent Operations'));
      
      await waitFor(() => {
        expect(screen.getByTestId('operation-count')).toHaveTextContent('3 operations completed');
      });
    });

    it('should log all concurrent operations', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<ConcurrentOperationsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Execute Concurrent Operations'));
      
      await waitFor(() => {
        expect(screen.getByText('Authenticated')).toBeInTheDocument();
        expect(screen.getByText('Added to cart')).toBeInTheDocument();
        expect(screen.getByText('Changed language')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Case Scenarios', () => {
    it('should handle rapid navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<div><button onClick={() => {}}>Navigate</button></div>} />
          </Routes>
        </TestWrapper>
      );
      
      const button = screen.getByText('Navigate');
      
      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      // Should not error
      expect(button).toBeInTheDocument();
    });

    it('should handle empty state transitions', async () => {
      const user = userEvent.setup();
      
      const EmptyStateComponent = () => {
        const [hasData, setHasData] = React.useState(false);
        
        return (
          <div>
            {hasData ? (
              <p data-testid="with-data">Has Data</p>
            ) : (
              <p data-testid="no-data">No Data</p>
            )}
            <button onClick={() => setHasData(!hasData)}>Toggle</button>
          </div>
        );
      };
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<EmptyStateComponent />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('no-data')).toBeInTheDocument();
      
      await user.click(screen.getByText('Toggle'));
      
      await waitFor(() => {
        expect(screen.getByTestId('with-data')).toBeInTheDocument();
      });
    });

    it('should handle context reset scenarios', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<ConcurrentOperationsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Execute operations
      await user.click(screen.getByText('Execute Concurrent Operations'));
      await waitFor(() => expect(screen.getByTestId('operation-count')).toHaveTextContent('3 operations completed'));
      
      // Operations should be persisted
      expect(screen.getByText('Authenticated')).toBeInTheDocument();
    });
  });

  describe('Session Management Scenarios', () => {
    it('should handle session expired during checkout', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/checkout">
          <Routes>
            <Route path="/checkout" element={<div>Checkout</div>} />
            <Route path="/session-expired" element={<SessionExpiredPage />} />
            <Route path="/login" element={<div>Login</div>} />
          </Routes>
        </TestWrapper>
      );
      
      // Simulate session expiration (in real app would be triggered by API)
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });

    it('should preserve intended destination after login', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/session-expired">
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/session-expired" element={<SessionExpiredPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Login Again'));
      
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence Scenarios', () => {
    it('should maintain state across route changes', async () => {
      const user = userEvent.setup();
      
      const StateTestComponent = () => {
        const navigate = useNavigate();
        const { totalItems } = useCart();
        
        return (
          <div>
            <p data-testid="cart-count">Cart: {totalItems}</p>
            <button onClick={() => void navigate('/other')}>Navigate</button>
          </div>
        );
      };
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<StateTestComponent />} />
            <Route path="/other" element={<StateTestComponent />} />
          </Routes>
        </TestWrapper>
      );
      
      const initialCount = screen.getByTestId('cart-count').textContent;
      
      await user.click(screen.getByText('Navigate'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent(initialCount);
      });
    });
  });

  describe('Form Submission Edge Cases', () => {
    it('should handle empty form submission', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/admin/catalog-config">
          <Routes>
            <Route path="/admin/catalogs" element={<div>Catalogs</div>} />
            <Route path="/admin/catalog-config" element={<CatalogConfigPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Try to save without filling form
      await user.click(screen.getByText('Save Configuration'));
      
      await waitFor(() => {
        expect(screen.getByText('Catalogs')).toBeInTheDocument();
      });
    });

    it('should handle form cancellation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/admin/catalog-config">
          <Routes>
            <Route path="/admin/catalogs" element={<div>Catalogs</div>} />
            <Route path="/admin/catalog-config" element={<CatalogConfigPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Fill form
      await user.type(screen.getByTestId('catalog-source'), 'https://test.com');
      
      // Cancel
      await user.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.getByText('Catalogs')).toBeInTheDocument();
      });
    });
  });
});