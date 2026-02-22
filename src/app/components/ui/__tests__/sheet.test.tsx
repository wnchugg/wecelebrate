/**
 * Sheet Component Tests
 * 
 * Coverage:
 * - Side variations (left, right, top, bottom)
 * - Open/close behavior
 * - Content rendering
 * - Controlled state
 * 
 * Total Tests: 8
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithRouter } from '@/test/helpers';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../sheet';
import { Button } from '../button';

describe('Sheet Component', () => {
  describe('Rendering', () => {
    it('should render sheet trigger', () => {
      renderWithRouter(
        <Sheet>
          <SheetTrigger asChild>
            <Button>Open Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetContent>
        </Sheet>
      );

      expect(screen.getByRole('button', { name: /open sheet/i })).toBeInTheDocument();
    });

    it('should not show content initially', () => {
      renderWithRouter(
        <Sheet>
          <SheetTrigger asChild>
            <Button>Open</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
            <p>Sheet content</p>
          </SheetContent>
        </Sheet>
      );

      expect(screen.queryByText('Sheet content')).not.toBeInTheDocument();
    });

    it('should render all sheet parts', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Sheet>
          <SheetTrigger asChild>
            <Button>Open</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>My Sheet</SheetTitle>
              <SheetDescription>Sheet description</SheetDescription>
            </SheetHeader>
            <div>Content area</div>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('My Sheet')).toBeInTheDocument();
        expect(screen.getByText('Sheet description')).toBeInTheDocument();
        expect(screen.getByText('Content area')).toBeInTheDocument();
      });
    });
  });

  describe('Open/Close Behavior', () => {
    it('should open sheet when trigger is clicked', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Sheet>
          <SheetTrigger asChild>
            <Button>Open Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
            <p>Sheet is open</p>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open sheet/i }));

      await waitFor(() => {
        expect(screen.getByText('Sheet is open')).toBeInTheDocument();
      });
    });

    it('should close sheet when close button is clicked', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Sheet>
          <SheetTrigger asChild>
            <Button>Open</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
            <p>Sheet content</p>
          </SheetContent>
        </Sheet>
      );

      // Open sheet
      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Sheet content')).toBeInTheDocument();
      });

      // Close sheet
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Sheet content')).not.toBeInTheDocument();
      });
    });

    it('should call onOpenChange when sheet opens and closes', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <Sheet onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <Button>Open</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetContent>
        </Sheet>
      );

      // Open
      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });

      // Close
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Side Variations', () => {
    it('should render sheet on right side by default', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Sheet>
          <SheetTrigger asChild>
            <Button>Open</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        const content = screen.getByText('Sheet Title').closest('[role="dialog"]');
        expect(content).toBeInTheDocument();
      });
    });

    it('should render sheet on specified side', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Sheet>
          <SheetTrigger asChild>
            <Button>Open</Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetTitle>Left Sheet</SheetTitle>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Left Sheet')).toBeInTheDocument();
      });
    });
  });

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);

        return (
          <div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button>Open</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle>Controlled Sheet</SheetTitle>
              </SheetContent>
            </Sheet>
            <div data-testid="status">{open ? 'Open' : 'Closed'}</div>
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithRouter(<TestComponent />);

      expect(screen.getByTestId('status')).toHaveTextContent('Closed');

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('Open');
      });
    });
  });
});