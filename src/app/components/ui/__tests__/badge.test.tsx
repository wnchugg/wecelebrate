/**
 * Badge Component Tests
 * 
 * Coverage:
 * - Variants (default, secondary, destructive, outline)
 * - Content rendering
 * - Styling
 * 
 * Total Tests: 6
 */

import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import { Badge } from '../badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render badge', () => {
      renderWithRouter(<Badge>Badge text</Badge>);
      expect(screen.getByText('Badge text')).toBeInTheDocument();
    });

    it('should render badge with children', () => {
      renderWithRouter(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      renderWithRouter(<Badge variant="default">Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('border-transparent', 'bg-primary');
    });

    it('should render secondary variant', () => {
      renderWithRouter(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass('border-transparent', 'bg-secondary');
    });

    it('should render destructive variant', () => {
      renderWithRouter(<Badge variant="destructive">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('border-transparent', 'bg-destructive');
    });

    it('should render outline variant', () => {
      renderWithRouter(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('text-foreground');
    });
  });
});