/**
 * Switch Component Tests
 * 
 * Coverage:
 * - On/off states
 * - onChange handler
 * - Disabled state
 * - Accessibility
 * 
 * Total Tests: 6
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { Switch } from '../switch';

describe('Switch Component', () => {
  describe('Rendering', () => {
    it('should render switch', () => {
      renderWithRouter(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should render unchecked by default', () => {
      renderWithRouter(<Switch />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('should render checked when checked prop is true', () => {
      renderWithRouter(<Switch checked={true} />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('Interactions', () => {
    it('should toggle on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Switch />);
      
      const switchElement = screen.getByRole('switch');
      
      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'checked');
      
      await user.click(switchElement);
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('should call onCheckedChange handler', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(<Switch onCheckedChange={handleChange} />);
      
      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);
      
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      renderWithRouter(<Switch disabled />);
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('should not toggle when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(<Switch disabled onCheckedChange={handleChange} />);
      
      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);
      
      expect(handleChange).not.toHaveBeenCalled();
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });
  });
});