/**
 * Cart Context Integration Test Suite
 * Day 14 - Morning Session (Part 1)
 * Tests for CartContext integration with components and features
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '../../context/CartContext';
import { BrowserRouter } from 'react-router';
import { ReactNode } from 'react';

// Mock product data
const mockProduct1 = {
  id: 'product-1',
  name: 'Test Product 1',
  description: 'Test description 1',
  price: 100,
  category: 'test',
  image: '/test1.jpg',
  inStock: true,
};

const mockProduct2 = {
  id: 'product-2',
  name: 'Test Product 2',
  description: 'Test description 2',
  price: 200,
  category: 'test',
  image: '/test2.jpg',
  inStock: true,
};

// Test component that uses CartContext
function TestCartComponent() {
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    totalItems,
    totalPrice,
    shippingType,
    setShippingType,
  } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{getCartCount()}</div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="total-price">{totalPrice.toFixed(2)}</div>
      <div data-testid="shipping-type">{shippingType || 'none'}</div>
      
      <button onClick={() => addToCart(mockProduct1)}>Add Product 1</button>
      <button onClick={() => addToCart(mockProduct2)}>Add Product 2</button>
      <button onClick={() => removeFromCart('product-1')}>Remove Product 1</button>
      <button onClick={() => updateQuantity('product-1', 5)}>Update Quantity to 5</button>
      <button onClick={() => updateQuantity('product-1', 0)}>Set Quantity to 0</button>
      <button onClick={() => clearCart()}>Clear Cart</button>
      <button onClick={() => setShippingType('company')}>Set Company Shipping</button>
      <button onClick={() => setShippingType('employee')}>Set Employee Shipping</button>
      
      <ul data-testid="cart-items">
        {items.map(item => (
          <li key={item.id}>
            {item.name} - Qty: {item.quantity} - ${item.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <CartProvider>
        {children}
      </CartProvider>
    </BrowserRouter>
  );
}

describe('Cart Context Integration Suite', () => {
  describe('Context Provider', () => {
    it('should provide cart context to children', () => {
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('cart-count')).toBeInTheDocument();
      expect(screen.getByTestId('total-items')).toBeInTheDocument();
      expect(screen.getByTestId('total-price')).toBeInTheDocument();
    });

    it('should initialize with empty cart', () => {
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(screen.getByTestId('total-items')).toHaveTextContent('0');
      expect(screen.getByTestId('total-price')).toHaveTextContent('0.00');
    });

    it('should initialize with null shipping type', () => {
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      expect(screen.getByTestId('shipping-type')).toHaveTextContent('none');
    });
  });

  describe('Add to Cart', () => {
    it('should add product to cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      });
    });

    it('should update total items when adding product', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('1');
      });
    });

    it('should update total price when adding product', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-price')).toHaveTextContent('100.00');
      });
    });

    it('should increment quantity when adding existing product', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('2');
        expect(screen.getByTestId('cart-count')).toHaveTextContent('1'); // Still 1 unique item
      });
    });

    it('should add multiple different products', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 2'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      });
    });

    it('should calculate correct total with multiple products', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 2'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-price')).toHaveTextContent('300.00');
      });
    });

    it('should display cart items', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      
      await waitFor(() => {
        expect(screen.getByText(/Test Product 1/)).toBeInTheDocument();
      });
    });
  });

  describe('Remove from Cart', () => {
    it('should remove product from cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await waitFor(() => expect(screen.getByTestId('cart-count')).toHaveTextContent('1'));
      
      await user.click(screen.getByText('Remove Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      });
    });

    it('should update total items after removal', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Remove Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('0');
      });
    });

    it('should update total price after removal', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Remove Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-price')).toHaveTextContent('0.00');
      });
    });

    it('should remove correct product when multiple items exist', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 2'));
      await waitFor(() => expect(screen.getByTestId('cart-count')).toHaveTextContent('2'));
      
      await user.click(screen.getByText('Remove Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
        expect(screen.queryByText(/Test Product 1/)).not.toBeInTheDocument();
        expect(screen.getByText(/Test Product 2/)).toBeInTheDocument();
      });
    });
  });

  describe('Update Quantity', () => {
    it('should update product quantity', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Update Quantity to 5'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('5');
      });
    });

    it('should update total price when quantity changes', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Update Quantity to 5'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-price')).toHaveTextContent('500.00');
      });
    });

    it('should remove item when quantity set to 0', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Set Quantity to 0'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      });
    });

    it('should remove item when quantity set to negative', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Set Quantity to 0')); // This tests <= 0
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      });
    });

    it('should display updated quantity in cart items', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Update Quantity to 5'));
      
      await waitFor(() => {
        expect(screen.getByText(/Qty: 5/)).toBeInTheDocument();
      });
    });
  });

  describe('Clear Cart', () => {
    it('should clear all items from cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 2'));
      await waitFor(() => expect(screen.getByTestId('cart-count')).toHaveTextContent('2'));
      
      await user.click(screen.getByText('Clear Cart'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      });
    });

    it('should reset total items when clearing cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Clear Cart'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('0');
      });
    });

    it('should reset total price when clearing cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Clear Cart'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-price')).toHaveTextContent('0.00');
      });
    });

    it('should remove all items from display', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 2'));
      await user.click(screen.getByText('Clear Cart'));
      
      await waitFor(() => {
        expect(screen.queryByText(/Test Product 1/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Test Product 2/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Shipping Type', () => {
    it('should set company shipping type', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Set Company Shipping'));
      
      await waitFor(() => {
        expect(screen.getByTestId('shipping-type')).toHaveTextContent('company');
      });
    });

    it('should set employee shipping type', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Set Employee Shipping'));
      
      await waitFor(() => {
        expect(screen.getByTestId('shipping-type')).toHaveTextContent('employee');
      });
    });

    it('should switch between shipping types', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Set Company Shipping'));
      await waitFor(() => expect(screen.getByTestId('shipping-type')).toHaveTextContent('company'));
      
      await user.click(screen.getByText('Set Employee Shipping'));
      
      await waitFor(() => {
        expect(screen.getByTestId('shipping-type')).toHaveTextContent('employee');
      });
    });
  });

  describe('Cart Count', () => {
    it('should return correct cart count with single item', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      });
    });

    it('should return correct cart count with multiple items', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 2'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
      });
    });

    it('should not count quantity in cart count', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('1'); // Unique items
        expect(screen.getByTestId('total-items')).toHaveTextContent('3'); // Total quantity
      });
    });
  });

  describe('Total Calculations', () => {
    it('should calculate total items correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 2'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('3');
      });
    });

    it('should calculate total price correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1')); // 100
      await user.click(screen.getByText('Add Product 2')); // 200
      
      await waitFor(() => {
        expect(screen.getByTestId('total-price')).toHaveTextContent('300.00');
      });
    });

    it('should calculate total price with quantities', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Update Quantity to 5'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-price')).toHaveTextContent('500.00');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle adding same product multiple times', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('3');
        expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
      });
    });

    it('should handle removing non-existent product gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      // Try to remove without adding
      await user.click(screen.getByText('Remove Product 1'));
      
      // Should not error
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });

    it('should handle updating quantity of non-existent product', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      // Try to update quantity without adding
      await user.click(screen.getByText('Update Quantity to 5'));
      
      // Should not error
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });

    it('should handle clearing empty cart', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Clear Cart'));
      
      // Should not error
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });

    it('should maintain cart state across re-renders', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await waitFor(() => expect(screen.getByTestId('cart-count')).toHaveTextContent('1'));
      
      // Force re-render
      rerender(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      // Cart should still have the item
      expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete shopping flow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      // Add items
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Add Product 2'));
      
      // Update quantity
      await user.click(screen.getByText('Update Quantity to 5'));
      
      // Set shipping
      await user.click(screen.getByText('Set Company Shipping'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
        expect(screen.getByTestId('shipping-type')).toHaveTextContent('company');
      });
    });

    it('should handle add, remove, add sequence', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestCartComponent />
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Add Product 1'));
      await user.click(screen.getByText('Remove Product 1'));
      await user.click(screen.getByText('Add Product 1'));
      
      await waitFor(() => {
        expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
        expect(screen.getByTestId('total-items')).toHaveTextContent('1');
      });
    });
  });
});