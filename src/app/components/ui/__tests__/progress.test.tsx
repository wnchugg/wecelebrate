/**
 * Progress Component Tests
 * 
 * Coverage:
 * - Value prop
 * - Aria attributes
 * - Visual representation
 * 
 * Total Tests: 5
 */

import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import { Progress } from '../progress';

describe('Progress Component', () => {
  describe('Rendering', () => {
    it('should render progress bar', () => {
      renderWithRouter(<Progress value={50} data-testid="progress" />);
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    it('should render with 0 value', () => {
      renderWithRouter(<Progress value={0} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toBeInTheDocument();
    });

    it('should render with 100 value', () => {
      renderWithRouter(<Progress value={100} data-testid="progress" />);
      const progress = screen.getByTestId('progress');
      expect(progress).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes', () => {
      renderWithRouter(<Progress value={75} />);
      const progress = screen.getByRole('progressbar');
      
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
      expect(progress).toHaveAttribute('aria-valuenow', '75');
    });

    it('should handle undefined value', () => {
      renderWithRouter(<Progress />);
      const progress = screen.getByRole('progressbar');
      
      expect(progress).toHaveAttribute('aria-valuemin', '0');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
    });
  });
});