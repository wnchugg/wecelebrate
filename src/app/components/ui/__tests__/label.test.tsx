/**
 * Label Component Tests
 * 
 * Coverage:
 * - Rendering
 * - For attribute (label association)
 * - Click behavior
 * 
 * Total Tests: 4
 */

import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { Label } from '../label';

describe('Label Component', () => {
  describe('Rendering', () => {
    it('should render label', () => {
      renderWithRouter(<Label>Test Label</Label>);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render with htmlFor attribute', () => {
      renderWithRouter(<Label htmlFor="test-input">Test Label</Label>);
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });
  });

  describe('Behavior', () => {
    it('should associate with input element', () => {
      renderWithRouter(
        <div>
          <Label htmlFor="test-input">Username</Label>
          <input id="test-input" type="text" />
        </div>
      );
      
      const label = screen.getByText('Username');
      const input = screen.getByLabelText('Username');
      
      expect(input).toHaveAttribute('id', 'test-input');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('should focus associated input when label is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <div>
          <Label htmlFor="test-input">Username</Label>
          <input id="test-input" type="text" />
        </div>
      );
      
      const label = screen.getByText('Username');
      const input = screen.getByLabelText('Username');
      
      await user.click(label);
      
      expect(input).toHaveFocus();
    });
  });
});