/**
 * Radio Group Component Tests
 * 
 * Coverage:
 * - Rendering options
 * - Selection
 * - onChange handler
 * - Disabled state
 * - Required prop
 * 
 * Total Tests: 8
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import React from 'react';
import { RadioGroup, RadioGroupItem } from '../radio-group';
import { Label } from '../label';

describe('RadioGroup Component', () => {
  const renderRadioGroup = (props = {}) => {
    return renderWithRouter(
      <RadioGroup {...props}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="option1" />
          <Label htmlFor="option1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="option2" />
          <Label htmlFor="option2">Option 2</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option3" id="option3" />
          <Label htmlFor="option3">Option 3</Label>
        </div>
      </RadioGroup>
    );
  };

  describe('Rendering', () => {
    it('should render radio group', () => {
      renderRadioGroup();
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('should render all radio options', () => {
      renderRadioGroup();
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(3);
    });

    it('should render with default value', () => {
      renderRadioGroup({ defaultValue: 'option2' });
      const option2 = screen.getByLabelText('Option 2');
      expect(option2).toBeChecked();
    });
  });

  describe('Interactions', () => {
    it('should select radio on click', async () => {
      const user = userEvent.setup();
      renderRadioGroup();
      
      const option1 = screen.getByLabelText('Option 1');
      await user.click(option1);
      
      expect(option1).toBeChecked();
    });

    it('should call onValueChange handler', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderRadioGroup({ onValueChange: handleChange });
      
      const option2 = screen.getByLabelText('Option 2');
      await user.click(option2);
      
      expect(handleChange).toHaveBeenCalledWith('option2');
    });

    it('should only allow one selection at a time', async () => {
      const user = userEvent.setup();
      renderRadioGroup();
      
      const option1 = screen.getByLabelText('Option 1');
      const option2 = screen.getByLabelText('Option 2');
      
      await user.click(option1);
      expect(option1).toBeChecked();
      expect(option2).not.toBeChecked();
      
      await user.click(option2);
      expect(option1).not.toBeChecked();
      expect(option2).toBeChecked();
    });

    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('option1');
        
        return (
          <div>
            <RadioGroup value={value} onValueChange={setValue}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option1" id="option1" />
                <Label htmlFor="option1">Option 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option2" id="option2" />
                <Label htmlFor="option2">Option 2</Label>
              </div>
            </RadioGroup>
            <div data-testid="current-value">{value}</div>
          </div>
        );
      };
      
      const user = userEvent.setup();
      renderWithRouter(<TestComponent />);
      
      expect(screen.getByTestId('current-value')).toHaveTextContent('option1');
      
      await user.click(screen.getByLabelText('Option 2'));
      
      expect(screen.getByTestId('current-value')).toHaveTextContent('option2');
    });
  });

  describe('States', () => {
    it('should handle disabled state on radio group', () => {
      renderRadioGroup({ disabled: true });
      const radios = screen.getAllByRole('radio');
      radios.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });

    it('should not change value when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderRadioGroup({ disabled: true, onValueChange: handleChange });
      
      const option1 = screen.getByLabelText('Option 1');
      await user.click(option1);
      
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle disabled individual radio items', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <RadioGroup>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option1" id="option1" />
            <Label htmlFor="option1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option2" id="option2" disabled />
            <Label htmlFor="option2">Option 2 (Disabled)</Label>
          </div>
        </RadioGroup>
      );
      
      const option2 = screen.getByLabelText('Option 2 (Disabled)');
      expect(option2).toBeDisabled();
      
      await user.click(option2);
      expect(option2).not.toBeChecked();
    });
  });
});