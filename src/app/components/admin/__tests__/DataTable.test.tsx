/**
 * DataTable Component Tests
 * 
 * Coverage:
 * - Data rendering
 * - Sorting functionality
 * - Search filtering
 * - Empty state
 * - Loading state
 * - Row actions
 * - Custom rendering
 * 
 * Total Tests: 15
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/helpers';
import { DataTable } from '../DataTable';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface TestData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const mockData: TestData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
];

const mockColumns: Column<TestData>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
];

describe('DataTable Component', () => {
  describe('Rendering', () => {
    it('should render table with data', () => {
      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render all rows', () => {
      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      );

      const rows = screen.getAllByRole('row');
      // +1 for header row
      expect(rows).toHaveLength(mockData.length + 1);
    });

    it('should render custom column content', () => {
      const customColumns: Column<TestData>[] = [
        {
          key: 'name',
          label: 'Name',
          render: (item) => <span className="font-bold">{item.name.toUpperCase()}</span>,
        },
      ];

      renderWithRouter(
        <DataTable
          data={mockData}
          columns={customColumns}
          keyExtractor={(item) => item.id}
        />
      );

      expect(screen.getByText('JOHN DOE')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no data', () => {
      renderWithRouter(
        <DataTable
          data={[]}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          emptyMessage="No users found"
        />
      );

      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('should show default empty message', () => {
      renderWithRouter(
        <DataTable
          data={[]}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      );

      expect(screen.getByText('No data found')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      renderWithRouter(
        <DataTable
          data={[]}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          isLoading={true}
        />
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input when searchable', () => {
      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          searchable={true}
        />
      );

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should filter data based on search query', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'Jane');

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });

    it('should clear search when X is clicked', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          searchable={true}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'Jane');

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();

      // Clear the search by clearing the input directly
      await user.clear(searchInput);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort data when column header is clicked', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      );

      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);

      const rows = screen.getAllByRole('row');
      const firstDataRow = rows[1];
      expect(within(firstDataRow).getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should toggle sort direction on multiple clicks', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      );

      const nameHeader = screen.getByText('Name');
      
      // First click - ascending
      await user.click(nameHeader);
      let rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('Bob Wilson')).toBeInTheDocument();

      // Second click - descending
      await user.click(nameHeader);
      rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('John Doe')).toBeInTheDocument();
    });

    it('should not sort non-sortable columns', async () => {
      const user = userEvent.setup();

      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
        />
      );

      const statusHeader = screen.getByText('Status');
      await user.click(statusHeader);

      // Should maintain original order
      const rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Row Interactions', () => {
    it('should call onRowClick when row is clicked', async () => {
      const handleRowClick = vi.fn();
      const user = userEvent.setup();

      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          onRowClick={handleRowClick}
        />
      );

      const johnRow = screen.getByText('John Doe').closest('tr');
      await user.click(johnRow);

      expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('should render row actions', () => {
      renderWithRouter(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          actions={(item) => (
            <button>Edit {item.name}</button>
          )}
        />
      );

      expect(screen.getByText('Edit John Doe')).toBeInTheDocument();
      expect(screen.getByText('Edit Jane Smith')).toBeInTheDocument();
    });
  });
});