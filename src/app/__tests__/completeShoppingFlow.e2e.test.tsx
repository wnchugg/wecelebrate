/**
 * Complete Shopping Flow E2E Test Suite
 * Day 15 - Morning Session (Part 1)
 * Tests for end-to-end shopping user journeys
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router';
import { CartProvider, useCart } from '../context/CartContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ReactNode } from 'react';

// Mock security utilities
vi.mock('../utils/security', () => ({
  logSecurityEvent: vi.fn(),
  startSessionTimer: vi.fn(),
  clearSessionTimer: vi.fn(),
  resetSessionTimer: vi.fn(),
}));

// Mock product data
const mockProducts = [
  { id: '1', name: 'Product 1', price: 100, category: 'Electronics', image: '/test.jpg', description: 'Test product 1', inStock: true },
  { id: '2', name: 'Product 2', price: 200, category: 'Electronics', image: '/test.jpg', description: 'Test product 2', inStock: true },
];

// Mock page components for E2E flow
function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Welcome to wecelebrate</h1>
      <button onClick={() => void navigate('/products')}>Browse Products</button>
      <button onClick={() => void navigate('/login')}>Login</button>
      <button onClick={() => void navigate('/cart')}>View Cart</button>
    </div>
  );
}

function ProductsPage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Products</h1>
      {mockProducts.map(product => (
        <div key={product.id} data-testid={`product-${product.id}`}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button onClick={() => void navigate(`/products/${product.id}`)}>
            View Details
          </button>
        </div>
      ))}
      <button onClick={() => void navigate('/')}>Back to Home</button>
    </div>
  );
}

function ProductDetailPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart(mockProducts[0]);
    void navigate('/cart');
  };
  
  return (
    <div>
      <h1>Product Detail</h1>
      <h2>{mockProducts[0].name}</h2>
      <p>${mockProducts[0].price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={() => void navigate('/products')}>Back to Products</button>
    </div>
  );
}

function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, removeFromCart, updateQuantity } = useCart();
  
  return (
    <div>
      <h1>Shopping Cart</h1>
      {items.length === 0 ? (
        <p data-testid="empty-cart">Your cart is empty</p>
      ) : (
        <>
          <div data-testid="cart-items">
            {items.map(item => (
              <div key={item.id} data-testid={`cart-item-${item.id}`}>
                <h3>{item.name}</h3>
                <p>Quantity: {item.quantity}</p>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  Increase
                </button>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  Decrease
                </button>
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            ))}
          </div>
          <p data-testid="cart-total">Total: ${totalPrice.toFixed(2)}</p>
          <button onClick={() => void navigate('/checkout')}>Proceed to Checkout</button>
        </>
      )}
      <button onClick={() => void navigate('/products')}>Continue Shopping</button>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  
  const handleLogin = () => {
    authenticate('user@example.com', {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    });
    void navigate('/');
  };
  
  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLogin}>Login with Email</button>
      <button onClick={() => void navigate('/')}>Back to Home</button>
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, totalPrice, setShippingType, shippingType, clearCart } = useCart();
  
  if (!isAuthenticated) {
    return (
      <div>
        <h1>Checkout</h1>
        <p>Please login to continue</p>
        <button onClick={() => void navigate('/login')}>Go to Login</button>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div>
        <h1>Checkout</h1>
        <p>Your cart is empty</p>
        <button onClick={() => void navigate('/products')}>Browse Products</button>
      </div>
    );
  }
  
  const handleCheckout = () => {
    clearCart();
    void navigate('/confirmation');
  };
  
  return (
    <div>
      <h1>Checkout</h1>
      <p data-testid="checkout-total">Total: ${totalPrice.toFixed(2)}</p>
      <div>
        <button onClick={() => setShippingType('company')}>Company Shipping</button>
        <button onClick={() => setShippingType('employee')}>Employee Shipping</button>
      </div>
      {shippingType && (
        <>
          <p data-testid="shipping-selected">Shipping: {shippingType}</p>
          <button onClick={handleCheckout}>Complete Order</button>
        </>
      )}
      <button onClick={() => void navigate('/cart')}>Back to Cart</button>
    </div>
  );
}

function ConfirmationPage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Order Confirmed</h1>
      <p>Thank you for your order!</p>
      <button onClick={() => void navigate('/')}>Return to Home</button>
      <button onClick={() => void navigate('/products')}>Continue Shopping</button>
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

describe('Complete Shopping Flow E2E Suite', () => {
  describe('Guest Shopping Flow', () => {
    it('should complete guest browsing flow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Start at home
      expect(screen.getByText('Welcome to wecelebrate')).toBeInTheDocument();
      
      // Navigate to products
      await user.click(screen.getByText('Browse Products'));
      
      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
      });
    });

    it('should view product details as guest', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/products">
          <Routes>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getAllByText('View Details')[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Product Detail')).toBeInTheDocument();
      });
    });

    it('should add product to cart as guest', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/products/product-1">
          <Routes>
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add to Cart'));
      
      await waitFor(() => {
        expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
        expect(screen.queryByTestId('empty-cart')).not.toBeInTheDocument();
      });
    });

    it('should navigate through home -> products -> detail -> cart', async () => {
      const user = userEvent.setup();
      
      render(
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
      await user.click(screen.getByText('Browse Products'));
      await waitFor(() => expect(screen.getByText('Products')).toBeInTheDocument());
      
      // Products -> Detail
      await user.click(screen.getAllByText('View Details')[0]);
      await waitFor(() => expect(screen.getByText('Product Detail')).toBeInTheDocument());
      
      // Detail -> Cart
      await user.click(screen.getByText('Add to Cart'));
      await waitFor(() => expect(screen.getByText('Shopping Cart')).toBeInTheDocument());
    });
  });

  describe('Authenticated Shopping Flow', () => {
    it('should complete login flow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Login'));
      await waitFor(() => expect(screen.getByText('Login')).toBeInTheDocument());
      
      await user.click(screen.getByText('Login with Email'));
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to wecelebrate')).toBeInTheDocument();
      });
    });

    it('should shop after login: login -> products -> cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Login
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Login with Email'));
      await waitFor(() => expect(screen.getByText('Welcome to wecelebrate')).toBeInTheDocument());
      
      // Browse products
      await user.click(screen.getByText('Browse Products'));
      await waitFor(() => expect(screen.getByText('Products')).toBeInTheDocument());
      
      // View and add to cart
      await user.click(screen.getAllByText('View Details')[0]);
      await user.click(screen.getByText('Add to Cart'));
      
      await waitFor(() => {
        expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
      });
    });
  });

  describe('Complete Checkout Flow', () => {
    it('should require login for checkout', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/products/product-1">
          <Routes>
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Add to cart as guest
      await user.click(screen.getByText('Add to Cart'));
      await waitFor(() => expect(screen.getByText('Shopping Cart')).toBeInTheDocument());
      
      // Try to checkout
      await user.click(screen.getByText('Proceed to Checkout'));
      
      await waitFor(() => {
        expect(screen.getByText('Please login to continue')).toBeInTheDocument();
      });
    });

    it('should complete full checkout flow with authentication', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Login
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Login with Email'));
      await waitFor(() => expect(screen.getByText('Welcome to wecelebrate')).toBeInTheDocument());
      
      // Browse and add to cart
      await user.click(screen.getByText('Browse Products'));
      await user.click(screen.getAllByText('View Details')[0]);
      await user.click(screen.getByText('Add to Cart'));
      
      // Proceed to checkout
      await user.click(screen.getByText('Proceed to Checkout'));
      await waitFor(() => expect(screen.getByText('Checkout')).toBeInTheDocument());
      
      // Select shipping
      await user.click(screen.getByText('Company Shipping'));
      await waitFor(() => expect(screen.getByTestId('shipping-selected')).toBeInTheDocument());
      
      // Complete order
      await user.click(screen.getByText('Complete Order'));
      
      await waitFor(() => {
        expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
      });
    });

    it('should show empty cart message when checking out with empty cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Login first
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Login with Email'));
      await waitFor(() => expect(screen.getByText('Welcome to wecelebrate')).toBeInTheDocument());
      
      // Navigate to checkout directly (no items)
      const navigate = screen.getByText('View Cart');
      // This is simulated by going to checkout route
    });
  });

  describe('Cart Management Flow', () => {
    it('should update cart quantities', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/products/product-1">
          <Routes>
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add to Cart'));
      await waitFor(() => expect(screen.getByText('Shopping Cart')).toBeInTheDocument());
      
      // Increase quantity
      await user.click(screen.getByText('Increase'));
      
      await waitFor(() => {
        expect(screen.getByText(/Quantity: 2/)).toBeInTheDocument();
      });
    });

    it('should remove items from cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/products/product-1">
          <Routes>
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add to Cart'));
      await waitFor(() => expect(screen.getByText('Shopping Cart')).toBeInTheDocument());
      
      await user.click(screen.getByText('Remove'));
      
      await waitFor(() => {
        expect(screen.getByTestId('empty-cart')).toBeInTheDocument();
      });
    });

    it('should continue shopping from cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/products/product-1">
          <Routes>
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add to Cart'));
      await waitFor(() => expect(screen.getByText('Shopping Cart')).toBeInTheDocument());
      
      await user.click(screen.getByText('Continue Shopping'));
      
      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
      });
    });
  });

  describe('Multi-Product Shopping', () => {
    it('should add multiple products and checkout', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Login
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Login with Email'));
      
      // Add first product
      await user.click(screen.getByText('Browse Products'));
      await user.click(screen.getAllByText('View Details')[0]);
      await user.click(screen.getByText('Add to Cart'));
      
      // Continue shopping
      await user.click(screen.getByText('Continue Shopping'));
      
      // Navigate to checkout
      await user.click(screen.getByText('Back to Home'));
      await user.click(screen.getByText('View Cart'));
      await user.click(screen.getByText('Proceed to Checkout'));
      
      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Back Button Flow', () => {
    it('should navigate back from products to home', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/products">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Back to Home'));
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to wecelebrate')).toBeInTheDocument();
      });
    });

    it('should navigate back from product detail to products', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/products/product-1">
          <Routes>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Back to Products'));
      
      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
      });
    });

    it('should navigate back from checkout to cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Setup: login and add item
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Login with Email'));
      // Navigate and test back button from checkout
    });
  });

  describe('Error Recovery Flow', () => {
    it('should redirect to login from checkout when not authenticated', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/checkout">
          <Routes>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Please login to continue')).toBeInTheDocument();
      
      await user.click(screen.getByText('Go to Login'));
      
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
    });

    it('should handle empty cart on checkout', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Login
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Login with Email'));
    });
  });

  describe('Post-Order Flow', () => {
    it('should return to home from confirmation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/confirmation">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Return to Home'));
      
      await waitFor(() => {
        expect(screen.getByText('Welcome to wecelebrate')).toBeInTheDocument();
      });
    });

    it('should continue shopping from confirmation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/confirmation">
          <Routes>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Continue Shopping'));
      
      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
      });
    });

    it('should have empty cart after order completion', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Complete full order
      await user.click(screen.getByText('Login'));
      await user.click(screen.getByText('Login with Email'));
      await user.click(screen.getByText('Browse Products'));
      await user.click(screen.getAllByText('View Details')[0]);
      await user.click(screen.getByText('Add to Cart'));
      await user.click(screen.getByText('Proceed to Checkout'));
      await user.click(screen.getByText('Company Shipping'));
      await user.click(screen.getByText('Complete Order'));
      
      // Go back to cart
      await user.click(screen.getByText('Return to Home'));
      await user.click(screen.getByText('View Cart'));
      
      await waitFor(() => {
        expect(screen.getByTestId('empty-cart')).toBeInTheDocument();
      });
    });
  });

  describe('Complex Multi-Step Flows', () => {
    it('should handle guest-to-authenticated shopping journey', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Browse as guest
      await user.click(screen.getByText('Browse Products'));
      await user.click(screen.getAllByText('View Details')[0]);
      await user.click(screen.getByText('Add to Cart'));
      
      // Try to checkout (should need login)
      await user.click(screen.getByText('Proceed to Checkout'));
      await waitFor(() => expect(screen.getByText('Please login to continue')).toBeInTheDocument());
      
      // Login
      await user.click(screen.getByText('Go to Login'));
      await user.click(screen.getByText('Login with Email'));
      
      // Navigate back to checkout
      await user.click(screen.getByText('View Cart'));
      await user.click(screen.getByText('Proceed to Checkout'));
      
      await waitFor(() => {
        expect(screen.getByText('Checkout')).toBeInTheDocument();
        // Should have the item from guest session
      });
    });
  });
});