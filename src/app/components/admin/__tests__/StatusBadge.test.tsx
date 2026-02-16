/**
 * StatusBadge Component Tests
 * 
 * Coverage:
 * - Different status types
 * - Color variants
 * - Custom colors
 * - Text formatting
 * 
 * Total Tests: 8
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge Component', () => {
  describe('Status Types', () => {
    it('should render active status with green styling', () => {
      render(<StatusBadge status="active" />);
      const badge = screen.getByText('Active');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
    });

    it('should render pending status with amber styling', () => {
      render(<StatusBadge status="pending" />);
      const badge = screen.getByText('Pending');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-amber-100', 'text-amber-800', 'border-amber-200');
    });

    it('should render cancelled status with red styling', () => {
      render(<StatusBadge status="cancelled" />);
      const badge = screen.getByText('Cancelled');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200');
    });

    it('should render shipped status with blue styling', () => {
      render(<StatusBadge status="shipped" />);
      const badge = screen.getByText('Shipped');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200');
    });
  });

  describe('Text Formatting', () => {
    it('should format underscore-separated status text', () => {
      render(<StatusBadge status="in_transit" />);
      expect(screen.getByText('In Transit')).toBeInTheDocument();
    });

    it('should capitalize status text properly', () => {
      render(<StatusBadge status="PROCESSING" />);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });
  });

  describe('Custom Colors', () => {
    it('should apply custom colors when variant is custom', () => {
      const customColor = {
        bg: 'bg-pink-100',
        text: 'text-pink-800',
        border: 'border-pink-200',
      };
      render(<StatusBadge status="custom_status" variant="custom" color={customColor} />);
      const badge = screen.getByText('Custom Status');
      expect(badge).toHaveClass('bg-pink-100', 'text-pink-800', 'border-pink-200');
    });

    it('should use default styling when custom variant but no color provided', () => {
      render(<StatusBadge status="unknown" variant="custom" />);
      const badge = screen.getByText('Unknown');
      expect(badge).toBeInTheDocument();
    });
  });
});
