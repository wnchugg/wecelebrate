/**
 * CartContext Tests
 * Day 8 - Week 2: Context Testing
 * Target: 20 tests
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CartProvider, useCart } from '../CartContext';
import { mockProduct, createMock } from '@/test/helpers';

describe('CartContext', () => {
  const mockProduct1 = mockProduct;

  const mockProduct2 = createMock(mockProduct, {
    id: 'test-2',
    name: 'Test Product 2',
    price: 79.99,
    description: 'Test description 2',
    image: '/test2.jpg',
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  describe('Provider Setup', () => {
    it('should provide cart context', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('items');
      expect(result.current).toHaveProperty('addToCart');
      expect(result.current).toHaveProperty('removeFromCart');
      expect(result.current).toHaveProperty('updateQuantity');
      expect(result.current).toHaveProperty('clearCart');
      expect(result.current).toHaveProperty('getCartCount');
      expect(result.current).toHaveProperty('totalItems');
      expect(result.current).toHaveProperty('totalPrice');
    });

    it('should have empty cart initially', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      expect(result.current.items).toEqual([]);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });

    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useCart());
      }).toThrow('useCart must be used within CartProvider');
      
      consoleSpy.mockRestore();
    });

    it('should have null shipping type initially', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      expect(result.current.shippingType).toBeNull();
    });
  });

  describe('Add to Cart', () => {
    it('should add product to cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
      });
      
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('product-test-1');
      expect(result.current.items[0].quantity).toBe(1);
    });

    it('should add product with quantity 1', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
      });
      
      expect(result.current.items[0].quantity).toBe(1);
    });

    it('should increment quantity when adding existing product', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct1);
      });
      
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('should add multiple different products', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
      });
      
      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].id).toBe('product-test-1');
      expect(result.current.items[1].id).toBe('test-2');
    });

    it('should preserve product properties when adding to cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
      });
      
      const cartItem = result.current.items[0];
      expect(cartItem.name).toBe(mockProduct1.name);
      expect(cartItem.price).toBe(mockProduct1.price);
      expect(cartItem.description).toBe(mockProduct1.description);
    });
  });

  describe('Remove from Cart', () => {
    it('should remove product from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.removeFromCart('product-test-1');
      });
      
      expect(result.current.items).toHaveLength(0);
    });

    it('should remove only specified product', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
        result.current.removeFromCart('product-test-1');
      });
      
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('test-2');
    });

    it('should handle removing non-existent product', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.removeFromCart('non-existent');
      });
      
      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('Update Quantity', () => {
    it('should update product quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.updateQuantity('product-test-1', 5);
      });
      
      expect(result.current.items[0].quantity).toBe(5);
    });

    it('should remove product when quantity is 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.updateQuantity('product-test-1', 0);
      });
      
      expect(result.current.items).toHaveLength(0);
    });

    it('should remove product when quantity is negative', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.updateQuantity('product-test-1', -1);
      });
      
      expect(result.current.items).toHaveLength(0);
    });

    it('should update only specified product quantity', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
        result.current.updateQuantity('product-test-1', 3);
      });
      
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.items[1].quantity).toBe(1);
    });
  });

  describe('Clear Cart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
        result.current.clearCart();
      });
      
      expect(result.current.items).toHaveLength(0);
    });

    it('should reset totals when clearing cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.clearCart();
      });
      
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe('Cart Count', () => {
    it('should return correct cart count', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
      });
      
      expect(result.current.getCartCount()).toBe(2);
    });

    it('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      expect(result.current.getCartCount()).toBe(0);
    });
  });

  describe('Total Items', () => {
    it('should calculate total items correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1); // qty: 1
        result.current.addToCart(mockProduct1); // qty: 2
        result.current.addToCart(mockProduct2); // qty: 1
      });
      
      expect(result.current.totalItems).toBe(3);
    });

    it('should update total items when quantity changes', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.updateQuantity('product-test-1', 5);
      });
      
      expect(result.current.totalItems).toBe(5);
    });
  });

  describe('Total Price', () => {
    it('should calculate total price correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1); // 99.99
        result.current.addToCart(mockProduct2); // 79.99
      });
      
      expect(result.current.totalPrice).toBe(179.98);
    });

    it('should calculate total price with quantities', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.updateQuantity('product-test-1', 3); // 99.99 * 3 = 299.97
      });
      
      expect(result.current.totalPrice).toBeCloseTo(299.97, 2);
    });

    it('should update total price when items are removed', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockProduct1);
        result.current.addToCart(mockProduct2);
        result.current.removeFromCart('product-test-1');
      });
      
      expect(result.current.totalPrice).toBe(79.99);
    });
  });

  describe('Shipping Type', () => {
    it('should set shipping type to company', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.setShippingType('company');
      });
      
      expect(result.current.shippingType).toBe('company');
    });

    it('should set shipping type to employee', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.setShippingType('employee');
      });
      
      expect(result.current.shippingType).toBe('employee');
    });

    it('should update shipping type', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.setShippingType('company');
        result.current.setShippingType('employee');
      });
      
      expect(result.current.shippingType).toBe('employee');
    });
  });
});