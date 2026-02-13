/**
 * Checkbox Component Tests
 * 
 * Coverage:
 * - Checked/unchecked states
 * - onChange handler
 * - Indeterminate state
 * - Disabled state
 * - Label association
 * - Accessibility
 * 
 * Total Tests: 10
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import React from 'react';
import { Checkbox } from '../checkbox';

describe('Checkbox Component', () => {
  describe('Rendering', () => {
    it('should render checkbox', () => {
      renderWithRouter(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render unchecked by default', () => {
      renderWithRouter(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render checked when checked prop is true', () => {
      renderWithRouter(<Checkbox checked={true} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should render with aria-label', () => {
      renderWithRouter(<Checkbox aria-label="Accept terms" />);
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      renderWithRouter(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should not toggle when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(<Checkbox disabled onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle indeterminate state', () => {
      renderWithRouter(<Checkbox checked="indeterminate" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });
  });

  describe('Interactions', () => {
    it('should toggle on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Checkbox />);
      
      const checkbox = screen.getByRole('checkbox');
      
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should call onCheckedChange handler', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(<Checkbox onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [checked, setChecked] = React.useState<boolean | 'indeterminate'>(false);
        
        return (
          <div>
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            <div data-testid="status">{checked === true ? 'Checked' : checked === 'indeterminate' ? 'Indeterminate' : 'Unchecked'}</div>
          </div>
        );
      };
      
      const user = userEvent.setup();
      renderWithRouter(<TestComponent />);
      
      expect(screen.getByTestId('status')).toHaveTextContent('Unchecked');
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(screen.getByTestId('status')).toHaveTextContent('Checked');
    });
  });
});