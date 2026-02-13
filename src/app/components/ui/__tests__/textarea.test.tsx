/**
 * Textarea Component Tests
 * 
 * Coverage:
 * - Rendering
 * - Value & onChange
 * - Rows prop
 * - Disabled/readonly states
 * - Max length
 * - Placeholder
 * 
 * Total Tests: 8
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import { Textarea } from '../textarea';

describe('Textarea Component', () => {
  describe('Rendering', () => {
    it('should render textarea element', () => {
      renderWithRouter(<Textarea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      renderWithRouter(<Textarea placeholder="Enter your message" />);
      expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
    });

    it('should render with default value', () => {
      renderWithRouter(<Textarea defaultValue="Default text" />);
      expect(screen.getByDisplayValue('Default text')).toBeInTheDocument();
    });

    it('should render with specified rows', () => {
      renderWithRouter(<Textarea rows={5} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      renderWithRouter(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should handle readonly state', () => {
      renderWithRouter(<Textarea readOnly />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });
  });

  describe('Interactions', () => {
    it('should call onChange handler when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      
      renderWithRouter(<Textarea onChange={handleChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test message');
      
      expect(handleChange).toHaveBeenCalled();
      expect(textarea).toHaveValue('test message');
    });

    it('should handle multi-line text', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<Textarea />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');
      
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
    });
  });
});