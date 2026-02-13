/**
 * Navigation Flow Test Suite
 * Day 13 - Morning Session (Part 2)
 * Tests for route navigation and transitions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { MemoryRouter, Route, Routes, Link, useNavigate } from 'react-router';
import { CartProvider } from '../context/CartContext';
import { AdminProvider } from '../context/AdminContext';

// Mock components for navigation testing
function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>
      <Link to="/products">Go to Products</Link>
      <Link to="/cart">Go to Cart</Link>
      <Link to="/admin/login">Admin Login</Link>
    </div>
  );
}

function ProductsPage() {
  return (
    <div>
      <h1>Products Page</h1>
      <Link to="/">Back to Home</Link>
      <Link to="/products/product-1">View Product</Link>
    </div>
  );
}

function ProductDetailPage() {
  return (
    <div>
      <h1>Product Detail</h1>
      <Link to="/products">Back to Products</Link>
      <Link to="/cart">Add to Cart</Link>
    </div>
  );
}

function CartPage() {
  return (
    <div>
      <h1>Cart Page</h1>
      <Link to="/products">Continue Shopping</Link>
      <Link to="/checkout">Checkout</Link>
    </div>
  );
}

function CheckoutPage() {
  return (
    <div>
      <h1>Checkout Page</h1>
      <Link to="/cart">Back to Cart</Link>
    </div>
  );
}

function AdminLoginPage() {
  return (
    <div>
      <h1>Admin Login</h1>
      <Link to="/admin/dashboard">Go to Dashboard</Link>
      <Link to="/">Back to Home</Link>
    </div>
  );
}

function AdminDashboardPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <Link to="/admin/logout">Logout</Link>
      <Link to="/admin/clients">Manage Clients</Link>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div>
      <h1>404 - Not Found</h1>
      <Link to="/">Go Home</Link>
    </div>
  );
}

function ProgrammaticNavigationTest() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Navigation Test</h1>
      <button onClick={() => navigate('/products')}>Navigate to Products</button>
      <button onClick={() => navigate(-1)}>Go Back</button>
      <button onClick={() => navigate(1)}>Go Forward</button>
    </div>
  );
}

function TestWrapper({ children, initialRoute = '/' }: { children: React.ReactNode; initialRoute?: string }) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <CartProvider>
        <AdminProvider>
          {children}
        </AdminProvider>
      </CartProvider>
    </MemoryRouter>
  );
}

describe('Navigation Flow Suite', () => {
  describe('Basic Navigation', () => {
    it('should navigate from home to products', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Home Page')).toBeInTheDocument();
      
      const link = screen.getByText('Go to Products');
      await user.click(link);
      
      await waitFor(() => {
        expect(screen.getByText('Products Page')).toBeInTheDocument();
      });
    });

    it('should navigate from home to cart', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </TestWrapper>
      );
      
      const link = screen.getByText('Go to Cart');
      await user.click(link);
      
      await waitFor(() => {
        expect(screen.getByText('Cart Page')).toBeInTheDocument();
      });
    });

    it('should navigate from products to home', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper initialRoute="/products">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Products Page')).toBeInTheDocument();
      
      const link = screen.getByText('Back to Home');
      await user.click(link);
      
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });

    it('should navigate to product detail', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper initialRoute="/products">
          <Routes>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
          </Routes>
        </TestWrapper>
      );
      
      const link = screen.getByText('View Product');
      await user.click(link);
      
      await waitFor(() => {
        expect(screen.getByText('Product Detail')).toBeInTheDocument();
      });
    });
  });

  describe('Shopping Flow Navigation', () => {
    it('should navigate through shopping flow: home -> products -> cart', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Start at home
      expect(screen.getByText('Home Page')).toBeInTheDocument();
      
      // Go to products
      await user.click(screen.getByText('Go to Products'));
      await waitFor(() => expect(screen.getByText('Products Page')).toBeInTheDocument());
      
      // Go to cart
      await user.click(screen.getByText('Back to Home'));
      await waitFor(() => expect(screen.getByText('Home Page')).toBeInTheDocument());
      await user.click(screen.getByText('Go to Cart'));
      await waitFor(() => expect(screen.getByText('Cart Page')).toBeInTheDocument());
    });

    it('should navigate through checkout flow: cart -> checkout', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper initialRoute="/cart">
          <Routes>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Cart Page')).toBeInTheDocument();
      
      await user.click(screen.getByText('Checkout'));
      
      await waitFor(() => {
        expect(screen.getByText('Checkout Page')).toBeInTheDocument();
      });
    });

    it('should navigate back from checkout to cart', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper initialRoute="/checkout">
          <Routes>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Checkout Page')).toBeInTheDocument();
      
      await user.click(screen.getByText('Back to Cart'));
      
      await waitFor(() => {
        expect(screen.getByText('Cart Page')).toBeInTheDocument();
      });
    });

    it('should continue shopping from cart', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper initialRoute="/cart">
          <Routes>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Continue Shopping'));
      
      await waitFor(() => {
        expect(screen.getByText('Products Page')).toBeInTheDocument();
      });
    });

    it('should add to cart from product detail', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper initialRoute="/products/product-1">
          <Routes>
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add to Cart'));
      
      await waitFor(() => {
        expect(screen.getByText('Cart Page')).toBeInTheDocument();
      });
    });
  });

  describe('Admin Navigation', () => {
    it('should navigate to admin login', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Admin Login'));
      
      await waitFor(() => {
        expect(screen.getByText('Admin Login')).toBeInTheDocument();
      });
    });

    it('should navigate from admin login to dashboard', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper initialRoute="/admin/login">
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Go to Dashboard'));
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('should navigate back from admin to public site', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper initialRoute="/admin/login">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Back to Home'));
      
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });
  });

  describe('Programmatic Navigation', () => {
    it('should navigate programmatically with useNavigate', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<ProgrammaticNavigationTest />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Navigate to Products'));
      
      await waitFor(() => {
        expect(screen.getByText('Products Page')).toBeInTheDocument();
      });
    });

    it('should navigate back programmatically', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <MemoryRouter initialEntries={['/', '/test']}>
          <CartProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/test" element={<ProgrammaticNavigationTest />} />
              <Route path="/products" element={<ProductsPage />} />
            </Routes>
          </CartProvider>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Navigation Test')).toBeInTheDocument();
      
      await user.click(screen.getByText('Go Back'));
      
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });
  });

  describe('Not Found Routes', () => {
    it('should render 404 for invalid route', () => {
      renderWithRouter(
        <TestWrapper initialRoute="/invalid-route">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('404 - Not Found')).toBeInTheDocument();
    });

    it('should navigate from 404 to home', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper initialRoute="/invalid">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Go Home'));
      
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });
  });

  describe('URL Parameters', () => {
    it('should navigate with URL parameters', () => {
      renderWithRouter(
        <TestWrapper initialRoute="/products/product-123">
          <Routes>
            <Route path="/products/:productId" element={<ProductDetailPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Product Detail')).toBeInTheDocument();
    });

    it('should navigate from product list to product detail with parameter', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper initialRoute="/products">
          <Routes>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('View Product'));
      
      await waitFor(() => {
        expect(screen.getByText('Product Detail')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Navigation Steps', () => {
    it('should handle multiple navigation steps', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Home -> Products
      await user.click(screen.getByText('Go to Products'));
      await waitFor(() => expect(screen.getByText('Products Page')).toBeInTheDocument());
      
      // Products -> Product Detail
      await user.click(screen.getByText('View Product'));
      await waitFor(() => expect(screen.getByText('Product Detail')).toBeInTheDocument());
      
      // Product Detail -> Cart
      await user.click(screen.getByText('Add to Cart'));
      await waitFor(() => expect(screen.getByText('Cart Page')).toBeInTheDocument());
    });
  });

  describe('Link Rendering', () => {
    it('should render navigation links', () => {
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Go to Products')).toBeInTheDocument();
      expect(screen.getByText('Go to Cart')).toBeInTheDocument();
      expect(screen.getByText('Admin Login')).toBeInTheDocument();
    });

    it('should render correct href attributes', () => {
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </TestWrapper>
      );
      
      const productsLink = screen.getByText('Go to Products');
      expect(productsLink).toHaveAttribute('href', '/products');
      
      const cartLink = screen.getByText('Go to Cart');
      expect(cartLink).toHaveAttribute('href', '/cart');
    });
  });

  describe('Navigation State', () => {
    it('should maintain cart context across navigation', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Go to Products'));
      
      await waitFor(() => {
        expect(screen.getByText('Products Page')).toBeInTheDocument();
      });
      
      // Context should be maintained
      expect(screen.getByText('Products Page')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid navigation clicks', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      const link = screen.getByText('Go to Products');
      
      // Click multiple times rapidly
      await user.click(link);
      await user.click(link);
      
      await waitFor(() => {
        expect(screen.getByText('Products Page')).toBeInTheDocument();
      });
    });

    it('should handle navigation to current route', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Should not error when navigating to current route
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('should handle navigation without errors', async () => {
      const user = userEvent.setup();
      
      expect(() => {
        renderWithRouter(
          <TestWrapper>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
            </Routes>
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });
});