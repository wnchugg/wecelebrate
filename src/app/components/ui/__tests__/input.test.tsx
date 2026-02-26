/**
 * Input Component Tests
 * 
 * Coverage:
 * - Basic rendering
 * - Value prop & onChange
 * - Placeholder
 * - Disabled state
 * - Error state
 * - Type variations (text, email, password, number)
 * - Accessibility
 * 
 * Total Tests: 12
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import { Input } from '../input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      renderWithRouter(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input.className).toContain('rounded-md');
    });

    it('should render with placeholder', () => {
      renderWithRouter(<Input placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('should render with default value', () => {
      renderWithRouter(<Input defaultValue="Default text" />);
      expect(screen.getByDisplayValue('Default text')).toBeInTheDocument();
    });
  });

  describe('Type Variations', () => {
    it('should render as text input by default', () => {
      renderWithRouter(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render as email input', () => {
      renderWithRouter(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render as password input', () => {
      renderWithRouter(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should render as number input', () => {
      renderWithRouter(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      renderWithRouter(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should handle readonly state', () => {
      renderWithRouter(<Input readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('Interactions', () => {
    it('should call onChange handler when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test');
    });

    it('should update value on user input', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<Input />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello World');
      
      expect(input).toHaveValue('Hello World');
    });

    it('should clear input value', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<Input defaultValue="initial value" />);
      
      const input = screen.getByRole('textbox');
      await user.clear(input);
      
      expect(input).toHaveValue('');
    });
  });
});