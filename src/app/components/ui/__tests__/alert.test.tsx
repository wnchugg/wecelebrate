/**
 * Alert Component Tests
 * 
 * Coverage:
 * - Variants (default, destructive)
 * - Title and description
 * - Icon rendering
 * - Accessibility
 * 
 * Total Tests: 8
 */

import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import { Alert, AlertDescription, AlertTitle } from '../alert';

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('should render alert', () => {
      renderWithRouter(<Alert>Alert message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render alert with title', () => {
      renderWithRouter(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
        </Alert>
      );
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
    });

    it('should render alert with description', () => {
      renderWithRouter(
        <Alert>
          <AlertDescription>Alert description text</AlertDescription>
        </Alert>
      );
      expect(screen.getByText('Alert description text')).toBeInTheDocument();
    });

    it('should render alert with title and description', () => {
      renderWithRouter(
        <Alert>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>This is a warning message</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('This is a warning message')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      renderWithRouter(
        <Alert variant="default">
          <AlertTitle>Default Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-background');
    });

    it('should render destructive variant', () => {
      renderWithRouter(
        <Alert variant="destructive">
          <AlertTitle>Error Alert</AlertTitle>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
    });
  });

  describe('Complex Content', () => {
    it('should render alert with icon and content', () => {
      const AlertIcon = () => <svg data-testid="alert-icon">Icon</svg>;

      renderWithRouter(
        <Alert>
          <AlertIcon />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>Here is some important information</AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(screen.getByText('Here is some important information')).toBeInTheDocument();
    });

    it('should render multiple alerts', () => {
      renderWithRouter(
        <div>
          <Alert variant="default">
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>Information message</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Error message</AlertDescription>
          </Alert>
        </div>
      );

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });
});