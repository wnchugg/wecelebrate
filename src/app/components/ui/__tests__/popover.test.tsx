/**
 * Popover Component Tests
 * 
 * Coverage:
 * - Trigger and content
 * - Positioning
 * - onOpenChange
 * - Open/close behavior
 * 
 * Total Tests: 8
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Button } from '../button';

describe('Popover Component', () => {
  describe('Rendering', () => {
    it('should render popover trigger', () => {
      renderWithRouter(
        <Popover>
          <PopoverTrigger asChild>
            <Button>Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );

      expect(screen.getByRole('button', { name: /open popover/i })).toBeInTheDocument();
    });

    it('should not show content initially', () => {
      renderWithRouter(
        <Popover>
          <PopoverTrigger asChild>
            <Button>Open</Button>
          </PopoverTrigger>
          <PopoverContent>Hidden content</PopoverContent>
        </Popover>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('should render content when opened', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Popover>
          <PopoverTrigger asChild>
            <Button>Open</Button>
          </PopoverTrigger>
          <PopoverContent>Popover content here</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Popover content here')).toBeInTheDocument();
      });
    });
  });

  describe('Open/Close Behavior', () => {
    it('should open popover when trigger is clicked', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Popover>
          <PopoverTrigger asChild>
            <Button>Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent>Popover is open</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: /open popover/i }));

      await waitFor(() => {
        expect(screen.getByText('Popover is open')).toBeInTheDocument();
      });
    });

    it('should close popover when trigger is clicked again', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Popover>
          <PopoverTrigger asChild>
            <Button>Toggle</Button>
          </PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: /toggle/i });

      // Open
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });

      // Close
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });

    it('should call onOpenChange when popover state changes', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <Popover onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button>Open</Button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);

        return (
          <div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button>Toggle</Button>
              </PopoverTrigger>
              <PopoverContent>Controlled popover</PopoverContent>
            </Popover>
            <div data-testid="status">{open ? 'Open' : 'Closed'}</div>
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithRouter(<TestComponent />);

      expect(screen.getByTestId('status')).toHaveTextContent('Closed');

      await user.click(screen.getByRole('button', { name: /toggle/i }));

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('Open');
        expect(screen.getByText('Controlled popover')).toBeInTheDocument();
      });
    });
  });

  describe('Content Positioning', () => {
    it('should render popover content with proper positioning', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Popover>
          <PopoverTrigger asChild>
            <Button>Open</Button>
          </PopoverTrigger>
          <PopoverContent align="center" side="bottom">
            Positioned content
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Positioned content')).toBeInTheDocument();
      });
    });
  });
});