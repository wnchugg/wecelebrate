/**
 * OrderContext Tests
 * Day 9 - Week 2: Remaining Contexts Testing
 * Target: 10 tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { OrderProvider, useOrder } from '../OrderContext';
import { Gift } from '../GiftContext';
import { orderApi } from '../../utils/api';

// Mock API
vi.mock('../../utils/api', () => ({
  orderApi: {
    create: vi.fn(),
  },
}));

describe('OrderContext', () => {
  const mockGift: Gift = {
    id: 'gift-1',
    name: 'Test Gift',
    description: 'Test description',
    category: 'Electronics',
    image: 'test.jpg',
    sku: 'TEST-001',
    price: 100,
    inventory: {
      total: 10,
      available: 10,
      reserved: 0,
    },
    status: 'active' as const,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const mockShippingAddress = {
    fullName: 'John Doe',
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA',
    phone: '555-1234',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <OrderProvider>{children}</OrderProvider>
  );

  describe('Provider Setup', () => {
    it('should provide order context', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('selectedGift');
      expect(result.current).toHaveProperty('quantity');
      expect(result.current).toHaveProperty('shippingAddress');
      expect(result.current).toHaveProperty('selectGift');
      expect(result.current).toHaveProperty('setQuantity');
      expect(result.current).toHaveProperty('setShippingAddress');
      expect(result.current).toHaveProperty('submitOrder');
      expect(result.current).toHaveProperty('clearOrder');
    });

    it('should have null selected gift initially', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      expect(result.current.selectedGift).toBeNull();
    });

    it('should have quantity 1 initially', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      expect(result.current.quantity).toBe(1);
    });

    it('should have null shipping address initially', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      expect(result.current.shippingAddress).toBeNull();
    });

    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useOrder());
      }).toThrow('useOrder must be used within OrderProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Gift Selection', () => {
    it('should select a gift', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      act(() => {
        result.current.selectGift(mockGift);
      });
      
      expect(result.current.selectedGift).toEqual(mockGift);
    });

    it('should update selected gift', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      const anotherGift = { ...mockGift, id: 'gift-2', name: 'Another Gift' };
      
      act(() => {
        result.current.selectGift(mockGift);
        result.current.selectGift(anotherGift);
      });
      
      expect(result.current.selectedGift).toEqual(anotherGift);
    });
  });

  describe('Quantity Management', () => {
    it('should set quantity', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      act(() => {
        result.current.setQuantity(5);
      });
      
      expect(result.current.quantity).toBe(5);
    });

    it('should update quantity', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      act(() => {
        result.current.setQuantity(3);
        result.current.setQuantity(7);
      });
      
      expect(result.current.quantity).toBe(7);
    });
  });

  describe('Shipping Address', () => {
    it('should set shipping address', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      act(() => {
        result.current.setShippingAddress(mockShippingAddress);
      });
      
      expect(result.current.shippingAddress).toEqual(mockShippingAddress);
    });

    it('should update shipping address', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      const newAddress = { ...mockShippingAddress, city: 'New York' };
      
      act(() => {
        result.current.setShippingAddress(mockShippingAddress);
        result.current.setShippingAddress(newAddress);
      });
      
      expect(result.current.shippingAddress?.city).toBe('New York');
    });
  });

  describe('Order Submission', () => {
    it('should submit order successfully', async () => {
      vi.mocked(orderApi.create).mockResolvedValue({
        order: { id: 'order-123' },
      });
      
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      act(() => {
        result.current.selectGift(mockGift);
        result.current.setQuantity(2);
        result.current.setShippingAddress(mockShippingAddress);
      });
      
      let orderId: string = '';
      await act(async () => {
        orderId = await result.current.submitOrder({});
      });
      
      expect(orderId).toBe('order-123');
      expect(orderApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gift: mockGift,
          quantity: 2,
          shippingAddress: mockShippingAddress,
        })
      );
    });

    it('should clear order after successful submission', async () => {
      vi.mocked(orderApi.create).mockResolvedValue({
        order: { id: 'order-123' },
      });
      
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      act(() => {
        result.current.selectGift(mockGift);
        result.current.setQuantity(2);
        result.current.setShippingAddress(mockShippingAddress);
      });
      
      await act(async () => {
        await result.current.submitOrder({});
      });
      
      expect(result.current.selectedGift).toBeNull();
      expect(result.current.quantity).toBe(1);
      expect(result.current.shippingAddress).toBeNull();
    });

    it('should handle submission error', async () => {
      vi.mocked(orderApi.create).mockRejectedValue(new Error('Submission failed'));
      
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      act(() => {
        result.current.selectGift(mockGift);
      });
      
      await expect(async () => {
        await act(async () => {
          await result.current.submitOrder({});
        });
      }).rejects.toThrow();
    });
  });

  describe('Clear Order', () => {
    it('should clear all order data', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      act(() => {
        result.current.selectGift(mockGift);
        result.current.setQuantity(5);
        result.current.setShippingAddress(mockShippingAddress);
        result.current.clearOrder();
      });
      
      expect(result.current.selectedGift).toBeNull();
      expect(result.current.quantity).toBe(1);
      expect(result.current.shippingAddress).toBeNull();
    });

    it('should reset to initial state', () => {
      const { result } = renderHook(() => useOrder(), { wrapper });
      
      act(() => {
        result.current.selectGift(mockGift);
        result.current.setQuantity(10);
        result.current.setShippingAddress(mockShippingAddress);
      });
      
      expect(result.current.selectedGift).not.toBeNull();
      
      act(() => {
        result.current.clearOrder();
      });
      
      expect(result.current.selectedGift).toBeNull();
      expect(result.current.quantity).toBe(1);
      expect(result.current.shippingAddress).toBeNull();
    });
  });
});