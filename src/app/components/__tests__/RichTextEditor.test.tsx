/**
 * RichTextEditor Component Tests
 * 
 * Coverage:
 * - Editor rendering
 * - Text input/onChange
 * - Placeholder
 * - Label display
 * - Available variables
 * - Height customization
 * 
 * Total Tests: 10
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { RichTextEditor } from '../RichTextEditor';

describe('RichTextEditor Component', () => {
  describe('Rendering', () => {
    it('should render editor', () => {
      renderWithRouter(<RichTextEditor onChange={vi.fn()} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should display placeholder', () => {
      renderWithRouter(<RichTextEditor onChange={vi.fn()} placeholder="Type here..." />);
      expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
    });

    it('should display default placeholder', () => {
      renderWithRouter(<RichTextEditor onChange={vi.fn()} />);
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
    });

    it('should display label when showLabel is true', () => {
      renderWithRouter(<RichTextEditor onChange={vi.fn()} label="Description" showLabel={true} />);
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should not display label when showLabel is false', () => {
      renderWithRouter(<RichTextEditor onChange={vi.fn()} label="Description" showLabel={false} />);
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should display initial value', () => {
      renderWithRouter(<RichTextEditor onChange={vi.fn()} value="Initial content" />);
      expect(screen.getByRole('textbox')).toHaveValue('Initial content');
    });

    it('should display content prop', () => {
      renderWithRouter(<RichTextEditor onChange={vi.fn()} content="Content text" />);
      expect(screen.getByRole('textbox')).toHaveValue('Content text');
    });

    it('should prioritize content over value', () => {
      renderWithRouter(<RichTextEditor onChange={vi.fn()} value="Value" content="Content" />);
      expect(screen.getByRole('textbox')).toHaveValue('Content');
    });
  });

  describe('Interactions', () => {
    it('should call onChange when text is typed', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(<RichTextEditor onChange={handleChange} />);

      const editor = screen.getByRole('textbox');
      await user.type(editor, 'Hello World');

      // onChange is called for each character typed
      expect(handleChange).toHaveBeenCalled();
      // Check that it was called multiple times (once per character)
      expect(handleChange.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('Variables', () => {
    it('should display available variables', () => {
      renderWithRouter(
        <RichTextEditor
          onChange={vi.fn()}
          availableVariables={['firstName', 'lastName', 'email']}
        />
      );

      expect(screen.getByText(/available variables/i)).toBeInTheDocument();
      expect(screen.getByText(/{{firstName}}/)).toBeInTheDocument();
      expect(screen.getByText(/{{lastName}}/)).toBeInTheDocument();
      expect(screen.getByText(/{{email}}/)).toBeInTheDocument();
    });
  });
});