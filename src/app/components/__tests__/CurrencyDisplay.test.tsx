/**
 * CurrencyDisplay Component Tests
 * 
 * Coverage:
 * - Currency formatting
 * - Currency conversion
 * - Site currency detection
 * - Different currencies
 * - useCurrency hook
 * 
 * Total Tests: 8
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrencyDisplay, useCurrency } from '../CurrencyDisplay';

vi.mock('../../hooks/useSite', () => ({
  useSite: vi.fn((siteId) => ({
    site: siteId === 'uk-site' 
      ? { id: 'uk-site', currency: 'GBP', country: 'GB' }
      : { id: 'us-site', currency: 'USD', country: 'US' }
  })),
  getSiteCurrency: vi.fn((site) => site?.currency || 'USD'),
}));

vi.mock('../../utils/countries', () => ({
  formatCurrency: vi.fn((amount, currency) => {
    const symbols = { USD: '$', GBP: '£', EUR: '€' };
    const symbol = symbols[currency as keyof typeof symbols] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  }),
  convertCurrency: vi.fn((amount, from, to) => {
    // Simple mock conversion: GBP = USD * 0.8
    if (from === 'USD' && to === 'GBP') return amount * 0.8;
    if (from === 'GBP' && to === 'USD') return amount * 1.25;
    return amount;
  }),
}));

describe('CurrencyDisplay Component', () => {
  describe('Rendering', () => {
    it('should render formatted currency', () => {
      render(<CurrencyDisplay amount={100} />);
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });

    it('should format currency with decimals', () => {
      render(<CurrencyDisplay amount={99.99} />);
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CurrencyDisplay amount={50} className="text-xl font-bold" />
      );
      const span = container.querySelector('span');
      expect(span).toHaveClass('text-xl', 'font-bold');
    });
  });

  describe('Currency Conversion', () => {
    it('should convert USD to GBP for UK site', () => {
      render(<CurrencyDisplay amount={100} baseCurrency="USD" siteId="uk-site" />);
      // 100 USD * 0.8 = 80 GBP
      expect(screen.getByText('£80.00')).toBeInTheDocument();
    });

    it('should not convert when currencies match', () => {
      render(<CurrencyDisplay amount={100} baseCurrency="USD" siteId="us-site" />);
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });

    it('should handle different base currencies', () => {
      render(<CurrencyDisplay amount={80} baseCurrency="GBP" siteId="us-site" />);
      // 80 GBP * 1.25 = 100 USD
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  describe('Site Detection', () => {
    it('should use site-specific currency', () => {
      render(<CurrencyDisplay amount={50} siteId="uk-site" />);
      // 50 USD * 0.8 = 40 GBP (based on mock conversion rate)
      expect(screen.getByText('£40.00')).toBeInTheDocument();
    });

    it('should use default USD when no site specified', () => {
      render(<CurrencyDisplay amount={50} />);
      expect(screen.getByText('$50.00')).toBeInTheDocument();
    });
  });
});

describe('useCurrency Hook', () => {
  it('should return currency conversion functions', () => {
    const TestComponent = () => {
      const { currency, format, convert } = useCurrency();
      return (
        <div>
          <div data-testid="currency">{currency}</div>
          <div data-testid="formatted">{format(100)}</div>
          <div data-testid="converted">{convert(100)}</div>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('currency')).toHaveTextContent('USD');
    expect(screen.getByTestId('formatted')).toHaveTextContent('$100.00');
    expect(screen.getByTestId('converted')).toHaveTextContent('100');
  });
});