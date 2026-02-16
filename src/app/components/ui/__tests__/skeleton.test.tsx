/**
 * Skeleton Component Tests
 * 
 * Coverage:
 * - Rendering
 * - Size variations
 * - Custom styling
 * 
 * Total Tests: 4
 */

import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import { Skeleton } from '../skeleton';

describe('Skeleton Component', () => {
  describe('Rendering', () => {
    it('should render skeleton', () => {
      renderWithRouter(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should have proper styling classes', () => {
      renderWithRouter(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-accent');
    });

    it('should accept custom className', () => {
      renderWithRouter(<Skeleton className="w-full h-12" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-full', 'h-12');
    });

    it('should render multiple skeletons', () => {
      renderWithRouter(
        <div>
          <Skeleton data-testid="skeleton-1" />
          <Skeleton data-testid="skeleton-2" />
          <Skeleton data-testid="skeleton-3" />
        </div>
      );

      expect(screen.getByTestId('skeleton-1')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-2')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-3')).toBeInTheDocument();
    });
  });
});