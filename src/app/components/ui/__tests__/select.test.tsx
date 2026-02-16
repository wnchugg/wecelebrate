/**
 * Select Component Tests
 * 
 * Coverage:
 * - Rendering with options
 * - Value selection
 * - onChange handler
 * - Disabled state
 * - Placeholder
 * - Multiple options
 * 
 * Total Tests: 12
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';

describe('Select Component', () => {
  const renderSelect = (props = {}) => {
    return renderWithRouter(
      <Select {...props}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  describe('Rendering', () => {
    it('should render select trigger', () => {
      renderSelect();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should show placeholder text', () => {
      renderSelect();
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should render with default value', () => {
      renderWithRouter(
        <Select defaultValue="option2">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByRole('combobox')).toHaveTextContent('Option 2');
    });
  });

  describe('Interactions', () => {
    it('should open dropdown when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderSelect();
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      
      expect(screen.getByText('Option 1')).toBeVisible();
      expect(screen.getByText('Option 2')).toBeVisible();
      expect(screen.getByText('Option 3')).toBeVisible();
    });

    it('should call onValueChange when option is selected', async () => {
      const handleValueChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );
      
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Option 1'));
      
      expect(handleValueChange).toHaveBeenCalledWith('option1');
    });

    it('should update displayed value after selection', async () => {
      const user = userEvent.setup();
      renderSelect();
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await user.click(screen.getByText('Option 2'));
      
      expect(trigger).toHaveTextContent('Option 2');
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      renderWithRouter(
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('should not open when disabled', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      
      // When disabled, the dropdown shouldn't open, so options shouldn't be in the document
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('SelectItem', () => {
    it('should render all select items', async () => {
      const user = userEvent.setup();
      renderSelect();
      
      await user.click(screen.getByRole('combobox'));
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should handle disabled items', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2" disabled>Option 2 (Disabled)</SelectItem>
          </SelectContent>
        </Select>
      );
      
      await user.click(screen.getByRole('combobox'));
      
      const disabledItem = screen.getByText('Option 2 (Disabled)');
      // Verify the disabled item is rendered
      expect(disabledItem).toBeInTheDocument();
      
      // Radix UI disabled items have data-disabled attribute on parent
      const itemElement = disabledItem.closest('[role="option"]');
      expect(itemElement).toHaveAttribute('data-disabled');
    });
  });

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('option1');
        
        return (
          <div>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
            <div data-testid="current-value">{value}</div>
          </div>
        );
      };
      
      const user = userEvent.setup();
      renderWithRouter(<TestComponent />);
      
      expect(screen.getByTestId('current-value')).toHaveTextContent('option1');
      
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Option 2'));
      
      expect(screen.getByTestId('current-value')).toHaveTextContent('option2');
    });
  });
});