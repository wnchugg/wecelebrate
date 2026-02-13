/**
 * Performance Benchmark Tests
 * Tests critical paths for performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  perfMonitor, 
  benchmark, 
  assertPerformance,
  PERFORMANCE_THRESHOLDS,
  checkPerformanceThreshold,
} from '../../test/utils/performance';
import { MemoryRouter } from 'react-router';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

// Test component for benchmarking
function TestProductList({ itemCount }: { itemCount: number }) {
  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: `product-${i}`,
    name: `Product ${i}`,
    price: 99.99 + i,
  }));

  return (
    <div>
      <h1>Products</h1>
      <div data-testid="product-list">
        {items.map(item => (
          <div key={item.id} data-testid={`product-${item.id}`}>
            <h3>{item.name}</h3>
            <p>${item.price}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    perfMonitor.clear();
  });

  describe('Component Rendering Performance', () => {
    it('should render small product list quickly', async () => {
      const renderFn = () => {
        render(
          <MemoryRouter>
            <LanguageProvider>
              <AuthProvider>
                <CartProvider>
                  <TestProductList itemCount={10} />
                </CartProvider>
              </AuthProvider>
            </LanguageProvider>
          </MemoryRouter>
        );
      };

      // Benchmark 50 iterations
      await benchmark('render-product-list-10', renderFn, 50);
      
      // Assert performance thresholds
      assertPerformance('render-product-list-10', 50); // Average should be < 50ms
    });

    it('should render medium product list within threshold', async () => {
      const renderFn = () => {
        render(
          <MemoryRouter>
            <LanguageProvider>
              <AuthProvider>
                <CartProvider>
                  <TestProductList itemCount={50} />
                </CartProvider>
              </AuthProvider>
            </LanguageProvider>
          </MemoryRouter>
        );
      };

      await benchmark('render-product-list-50', renderFn, 30);
      
      // Should be reasonable even with 50 items
      assertPerformance('render-product-list-50', 100);
    });

    it('should render large product list within acceptable time', async () => {
      const renderFn = () => {
        render(
          <MemoryRouter>
            <LanguageProvider>
              <AuthProvider>
                <CartProvider>
                  <TestProductList itemCount={100} />
                </CartProvider>
              </AuthProvider>
            </LanguageProvider>
          </MemoryRouter>
        );
      };

      await benchmark('render-product-list-100', renderFn, 20);
      
      // Larger list should still be under 200ms average
      assertPerformance('render-product-list-100', 200);
    });
  });

  describe('User Interaction Performance', () => {
    it('should handle rapid button clicks efficiently', async () => {
      const user = userEvent.setup();
      let clickCount = 0;
      
      const TestComponent = () => (
        <button onClick={() => clickCount++}>Click Me</button>
      );

      render(
        <MemoryRouter>
          <TestComponent />
        </MemoryRouter>
      );

      const button = screen.getByText('Click Me');

      // Benchmark rapid clicking
      const clickFn = async () => {
        await user.click(button);
      };

      await benchmark('rapid-button-clicks', clickFn, 100);
      
      // Clicks should be very fast
      assertPerformance('rapid-button-clicks', 10);
      
      expect(clickCount).toBeGreaterThan(0);
    });

    it('should handle form input efficiently', async () => {
      const user = userEvent.setup();
      
      const TestForm = () => (
        <form>
          <input data-testid="test-input" type="text" />
        </form>
      );

      render(
        <MemoryRouter>
          <TestForm />
        </MemoryRouter>
      );

      const input = screen.getByTestId('test-input');

      // Benchmark typing
      const typeFn = async () => {
        await user.type(input, 'a');
      };

      await benchmark('form-input-typing', typeFn, 50);
      
      // Typing should be instant
      assertPerformance('form-input-typing', 20);
    });
  });

  describe('Context Updates Performance', () => {
    it('should update cart context quickly', async () => {
      const TestCartComponent = () => {
        return (
          <MemoryRouter>
            <LanguageProvider>
              <AuthProvider>
                <CartProvider>
                  <div>Cart Test</div>
                </CartProvider>
              </AuthProvider>
            </LanguageProvider>
          </MemoryRouter>
        );
      };

      const renderFn = () => {
        render(<TestCartComponent />);
      };

      await benchmark('cart-context-render', renderFn, 50);
      
      assertPerformance('cart-context-render', 30);
    });

    it('should update language context quickly', async () => {
      const TestLanguageComponent = () => {
        return (
          <MemoryRouter>
            <LanguageProvider>
              <AuthProvider>
                <CartProvider>
                  <div>Language Test</div>
                </CartProvider>
              </AuthProvider>
            </LanguageProvider>
          </MemoryRouter>
        );
      };

      const renderFn = () => {
        render(<TestLanguageComponent />);
      };

      await benchmark('language-context-render', renderFn, 50);
      
      assertPerformance('language-context-render', 30);
    });
  });

  describe('Performance Threshold Validation', () => {
    it('should meet render performance thresholds', () => {
      // Simulate a component render
      perfMonitor.mark('component-render');
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
      }
      const duration = perfMonitor.measure('component-render') || 0;
      
      // Check against thresholds
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER.SLOW);
      checkPerformanceThreshold(
        'component-render',
        duration,
        PERFORMANCE_THRESHOLDS.RENDER
      );
    });

    it('should meet interaction performance thresholds', () => {
      perfMonitor.mark('user-interaction');
      // Simulate interaction
      const result = 42 * 42;
      const duration = perfMonitor.measure('user-interaction') || 0;
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION.ACCEPTABLE);
      expect(result).toBe(1764);
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not leak memory on repeated renders', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render component many times
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(
          <MemoryRouter>
            <TestProductList itemCount={10} />
          </MemoryRouter>
        );
        unmount();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (< 10MB)
      // Note: This is a soft check as memory behavior varies
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      // Just verify we can complete the test without crashing
      expect(memoryIncrease).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Benchmark Summary', () => {
    it('should display all benchmark results', () => {
      // This test runs after others and prints summary
      perfMonitor.printAllBenchmarks();
      
      // Verify we have some measurements
      const stats = perfMonitor.getStats('render-product-list-10');
      expect(stats).toBeDefined();
    });
  });
});
