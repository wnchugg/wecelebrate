/**
 * Pagination Component Tests
 * 
 * Coverage:
 * - Pagination rendering
 * - Page navigation
 * - Previous/Next buttons
 * - Ellipsis
 * 
 * Total Tests: 8
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../pagination';

describe('Pagination Component', () => {
  describe('Rendering', () => {
    it('should render pagination', () => {
      renderWithRouter(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render page numbers', () => {
      renderWithRouter(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#page1">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#page2">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#page3">3</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render previous and next buttons', () => {
      renderWithRouter(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#prev" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#next" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(screen.getByText(/previous/i)).toBeInTheDocument();
      expect(screen.getByText(/next/i)).toBeInTheDocument();
    });
  });

  describe('Page Links', () => {
    it('should render pagination links with href', () => {
      renderWithRouter(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/2">2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(screen.getByText('1')).toHaveAttribute('href', '/page/1');
      expect(screen.getByText('2')).toHaveAttribute('href', '/page/2');
    });

    it('should mark active page', () => {
      renderWithRouter(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      const activePage = screen.getByText('1');
      expect(activePage).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Ellipsis', () => {
    it('should render ellipsis for truncated pages', () => {
      renderWithRouter(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">10</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(screen.getByText('...')).toBeInTheDocument();
    });

    it('should render complete pagination with ellipsis', () => {
      renderWithRouter(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#prev" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#1">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#5" isActive>
                5
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#10">10</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#next" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getAllByText('...')).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper navigation role', () => {
      renderWithRouter(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});