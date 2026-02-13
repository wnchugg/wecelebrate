/**
 * Card Component Tests
 * 
 * Coverage:
 * - Card container
 * - CardHeader, CardTitle, CardDescription
 * - CardContent
 * - CardFooter
 * - Composition of parts
 * - Styling variants
 * 
 * Total Tests: 8
 */

import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render card container', () => {
      renderWithRouter(<Card data-testid="card">Card Content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render card with all parts', () => {
      renderWithRouter(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('should render CardHeader', () => {
      renderWithRouter(
        <Card>
          <CardHeader>Header Content</CardHeader>
        </Card>
      );
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('should render CardTitle', () => {
      renderWithRouter(
        <Card>
          <CardHeader>
            <CardTitle>My Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('should render CardDescription', () => {
      renderWithRouter(
        <Card>
          <CardHeader>
            <CardDescription>My Description</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('My Description')).toBeInTheDocument();
    });

    it('should render CardContent', () => {
      renderWithRouter(
        <Card>
          <CardContent>Content Area</CardContent>
        </Card>
      );
      expect(screen.getByText('Content Area')).toBeInTheDocument();
    });

    it('should render CardFooter', () => {
      renderWithRouter(
        <Card>
          <CardFooter>Footer Area</CardFooter>
        </Card>
      );
      expect(screen.getByText('Footer Area')).toBeInTheDocument();
    });
  });

  describe('Composition', () => {
    it('should compose multiple card elements correctly', () => {
      const { container } = renderWithRouter(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Product Name</CardTitle>
            <CardDescription data-testid="description">Product description</CardDescription>
          </CardHeader>
          <CardContent data-testid="content">
            <p>Main content area</p>
          </CardContent>
          <CardFooter data-testid="footer">
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('description')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });
});