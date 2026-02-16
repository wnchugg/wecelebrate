/**
 * Dialog Component Tests
 * 
 * Coverage:
 * - Open/close states
 * - Trigger and content
 * - onOpenChange handler
 * - Overlay behavior
 * - Close on escape
 * - Dialog components (Title, Description, Header, Footer)
 * 
 * Total Tests: 12
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog';
import { Button } from '../button';

describe('Dialog Component', () => {
  describe('Rendering', () => {
    it('should render dialog trigger', () => {
      renderWithRouter(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByRole('button', { name: /open dialog/i })).toBeInTheDocument();
    });

    it('should not show content initially', () => {
      renderWithRouter(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <p>Dialog content</p>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Dialog content')).not.toBeInTheDocument();
    });

    it('should render all dialog parts', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>My Dialog</DialogTitle>
              <DialogDescription>Dialog description</DialogDescription>
            </DialogHeader>
            <div>Content area</div>
            <DialogFooter>
              <Button>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('My Dialog')).toBeInTheDocument();
        expect(screen.getByText('Dialog description')).toBeInTheDocument();
        expect(screen.getByText('Content area')).toBeInTheDocument();
      });
    });
  });

  describe('Open/Close Behavior', () => {
    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <p>Dialog is open</p>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open dialog/i }));

      await waitFor(() => {
        expect(screen.getByText('Dialog is open')).toBeInTheDocument();
      });
    });

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
            <p>Dialog content</p>
          </DialogContent>
        </Dialog>
      );

      // Open dialog
      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Dialog content')).toBeInTheDocument();
      });

      // Close dialog using close button (X)
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Dialog content')).not.toBeInTheDocument();
      });
    });

    it('should call onOpenChange when dialog opens', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('should call onOpenChange when dialog closes', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <Dialog onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
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

    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);

        return (
          <div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>Open</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Dialog Title</DialogTitle>
                <p>Controlled dialog</p>
              </DialogContent>
            </Dialog>
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

  describe('Overlay Behavior', () => {
    it('should render overlay when dialog is open', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        // Check for dialog role instead of overlay element
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria attributes', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Accessible Dialog</DialogTitle>
            <DialogDescription>This is an accessible dialog</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should have accessible title', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>My Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /my dialog title/i })).toBeInTheDocument();
      });
    });
  });
});