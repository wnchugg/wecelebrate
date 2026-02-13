/**
 * Cross-Component Feature Integration Test Suite
 * Day 14 - Afternoon Session
 * Tests for interactions between multiple contexts and components
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import React, { ReactNode } from 'react';
import { CartProvider, useCart } from '../context/CartContext';
import { AdminProvider } from '../context/AdminContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

// Mock product for testing
const mockProduct = {
  id: 'product-1',
  name: 'Test Product',
  price: 299.99,
  category: 'Electronics',
  image: '/test.jpg',
  description: 'Test description',
  inStock: true,
  sku: 'TEST-001',
  status: 'active' as const,
};

// Mock security utilities
vi.mock('../utils/security', () => ({
  logSecurityEvent: vi.fn(),
  startSessionTimer: vi.fn(),
  clearSessionTimer: vi.fn(),
  resetSessionTimer: vi.fn(),
}));

// Test component using multiple contexts
function MultiContextComponent() {
  const { isAuthenticated, authenticate, logout, user } = useAuth();
  const { items, addToCart, clearCart, totalItems, totalPrice } = useCart();
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <div>
      {/* Auth State */}
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'none'}</div>
      
      {/* Cart State */}
      <div data-testid="cart-items">{totalItems}</div>
      <div data-testid="cart-price">{totalPrice.toFixed(2)}</div>
      <div data-testid="cart-count">{items.length}</div>
      
      {/* Language State */}
      <div data-testid="current-language">{currentLanguage.code}</div>
      
      {/* Actions */}
      <button onClick={() => authenticate('user@example.com', {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User'
      })}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => addToCart(mockProduct)}>Add to Cart</button>
      <button onClick={clearCart}>Clear Cart</button>
      <button onClick={() => setLanguage('es')}>Switch to Spanish</button>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
      
      {/* Conditional rendering based on auth */}
      {isAuthenticated && (
        <div data-testid="authenticated-content">
          <p>Welcome, {user?.name}!</p>
          <p>Cart has {totalItems} items</p>
        </div>
      )}
      
      {!isAuthenticated && (
        <div data-testid="guest-content">
          <p>Please login</p>
        </div>
      )}
    </div>
  );
}

// Test component for checkout flow
function CheckoutFlowComponent() {
  const { isAuthenticated, authenticate } = useAuth();
  const { items, addToCart, clearCart, totalPrice, shippingType, setShippingType } = useCart();
  
  const canCheckout = isAuthenticated && items.length > 0 && shippingType !== null;

  return (
    <div>
      <div data-testid="can-checkout">{canCheckout ? 'yes' : 'no'}</div>
      <div data-testid="checkout-total">{totalPrice.toFixed(2)}</div>
      
      <button onClick={() => authenticate('user@example.com')}>Login</button>
      <button onClick={() => addToCart(mockProduct)}>Add Product</button>
      <button onClick={() => setShippingType('company')}>Set Shipping</button>
      <button onClick={clearCart}>Clear Cart</button>
      
      {canCheckout && (
        <button data-testid="checkout-button">Proceed to Checkout</button>
      )}
    </div>
  );
}

function AllProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

describe('Cross-Component Feature Integration Suite', () => {
  describe('Multi-Context Integration', () => {
    it('should provide all contexts to children', () => {
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      expect(screen.getByTestId('auth-status')).toBeInTheDocument();
      expect(screen.getByTestId('cart-items')).toBeInTheDocument();
      expect(screen.getByTestId('current-language')).toBeInTheDocument();
    });

    it('should initialize all contexts with default values', () => {
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    it('should allow independent context updates', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      // Update auth
      await user.click(screen.getByText('Login'));
      await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
      
      // Cart should still be empty
      expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
      
      // Language should still be default
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    it('should allow simultaneous context updates', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Add to Cart'));
      await user.click(screen.getByText('Switch to Spanish'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
        expect(screen.getByTestId('current-language')).toHaveTextContent('es');
      });
    });
  });

  describe('Auth and Cart Integration', () => {
    it('should allow cart operations without authentication', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Add to Cart'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });

    it('should preserve cart when logging in', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      // Add to cart as guest
      await user.click(screen.getByText('Add to Cart'));
      await waitFor(() => expect(screen.getByTestId('cart-items')).toHaveTextContent('1'));
      
      // Login
      await user.click(screen.getByText('Login'));
      
      // Cart should be preserved
      await waitFor(() => {
        expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });

    it('should clear cart independently of auth state', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Add to Cart'));
      await waitFor(() => expect(screen.getByTestId('cart-items')).toHaveTextContent('1'));
      
      await user.click(screen.getByText('Clear Cart'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });

    it('should maintain cart when logging out', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Add to Cart'));
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });
  });

  describe('Conditional Rendering Based on Context', () => {
    it('should show guest content when not authenticated', () => {
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      expect(screen.getByTestId('guest-content')).toBeInTheDocument();
      expect(screen.queryByTestId('authenticated-content')).not.toBeInTheDocument();
    });

    it('should show authenticated content when logged in', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated-content')).toBeInTheDocument();
        expect(screen.queryByTestId('guest-content')).not.toBeInTheDocument();
      });
    });

    it('should display user name in authenticated content', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      
      await waitFor(() => {
        expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument();
      });
    });

    it('should display cart count in authenticated content', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Add to Cart'));
      await user.click(screen.getByText('Login'));
      
      await waitFor(() => {
        expect(screen.getByText('Cart has 1 items')).toBeInTheDocument();
      });
    });
  });

  describe('Checkout Flow Integration', () => {
    it('should not allow checkout without authentication', () => {
      renderWithRouter(
        <AllProvidersWrapper>
          <CheckoutFlowComponent />
        </AllProvidersWrapper>
      );
      
      expect(screen.getByTestId('can-checkout')).toHaveTextContent('no');
      expect(screen.queryByTestId('checkout-button')).not.toBeInTheDocument();
    });

    it('should not allow checkout without cart items', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <CheckoutFlowComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      
      await waitFor(() => {
        expect(screen.getByTestId('can-checkout')).toHaveTextContent('no');
      });
    });

    it('should not allow checkout without shipping type', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <CheckoutFlowComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Add Product'));
      
      await waitFor(() => {
        expect(screen.getByTestId('can-checkout')).toHaveTextContent('no');
      });
    });

    it('should allow checkout when all conditions met', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <CheckoutFlowComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Add Product'));
      await user.click(screen.getByText('Set Shipping'));
      
      await waitFor(() => {
        expect(screen.getByTestId('can-checkout')).toHaveTextContent('yes');
        expect(screen.getByTestId('checkout-button')).toBeInTheDocument();
      });
    });

    it('should disable checkout when cart cleared', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <CheckoutFlowComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Add Product'));
      await user.click(screen.getByText('Set Shipping'));
      await waitFor(() => expect(screen.getByTestId('can-checkout')).toHaveTextContent('yes'));
      
      await user.click(screen.getByText('Clear Cart'));
      
      await waitFor(() => {
        expect(screen.getByTestId('can-checkout')).toHaveTextContent('no');
        expect(screen.queryByTestId('checkout-button')).not.toBeInTheDocument();
      });
    });

    it('should show correct checkout total', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <CheckoutFlowComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Add Product'));
      
      await waitFor(() => {
        expect(screen.getByTestId('checkout-total')).toHaveTextContent('299.99');
      });
    });
  });

  describe('Language and Context Integration', () => {
    it('should allow language change while authenticated', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Switch to Spanish'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('es');
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });

    it('should preserve language when logging out', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Switch to Spanish'));
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('es');
      });
    });
  });

  describe('State Persistence', () => {
    it('should maintain all context states across re-renders', async () => {
      const user = userEvent.setup();
      
      const { rerender } = renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Add to Cart'));
      await user.click(screen.getByText('Switch to Spanish'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
        expect(screen.getByTestId('current-language')).toHaveTextContent('es');
      });
      
      // Force re-render
      rerender(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      // All states should be preserved
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
      expect(screen.getByTestId('current-language')).toHaveTextContent('es');
    });
  });

  describe('Complex Workflows', () => {
    it('should handle complete shopping flow with authentication', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      // Start as guest
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      
      // Browse and add to cart
      await user.click(screen.getByText('Add to Cart'));
      await waitFor(() => expect(screen.getByTestId('cart-items')).toHaveTextContent('1'));
      
      // Login before checkout
      await user.click(screen.getByText('Login'));
      await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
      
      // Cart preserved
      expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
      
      // Add more items
      await user.click(screen.getByText('Add to Cart'));
      await waitFor(() => expect(screen.getByTestId('cart-items')).toHaveTextContent('2'));
    });

    it('should handle logout and re-login flow', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      // Login and add items
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Add to Cart'));
      
      // Logout
      await user.click(screen.getByText('Logout'));
      await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated'));
      
      // Cart preserved
      expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
      
      // Login again
      await user.click(screen.getByText('Login'));
      await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated'));
      
      // Everything still intact
      expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid context updates', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      // Rapid clicks
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Add to Cart'));
      await user.click(screen.getByText('Add to Cart'));
      await user.click(screen.getByText('Switch to Spanish'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('cart-items')).toHaveTextContent('2');
        expect(screen.getByTestId('current-language')).toHaveTextContent('es');
      });
    });

    it('should handle context updates in different orders', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      // Different order: Language -> Cart -> Auth
      await user.click(screen.getByText('Switch to Spanish'));
      await user.click(screen.getByText('Add to Cart'));
      await user.click(screen.getByText('Login'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('es');
        expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });

    it('should handle empty state resets', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <AllProvidersWrapper>
          <MultiContextComponent />
        </AllProvidersWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Add to Cart'));
      await user.click(screen.getByText('Switch to Spanish'));
      
      // Reset all
      await user.click(screen.getByText('Logout'));
      await user.click(screen.getByText('Clear Cart'));
      await user.click(screen.getByText('Switch to English'));
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      });
    });
  });
});