/**
 * Proxy Login Banner Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProxyLoginBanner } from '../ProxyLoginBanner';

// Mock the useNameFormat hook
vi.mock('../../hooks/useNameFormat', () => ({
  useNameFormat: () => ({
    formatFullName: (first: string, last: string) => `${first} ${last}`,
  }),
}));

describe('ProxyLoginBanner', () => {
  const mockEndSession = vi.fn();

  const defaultProps = {
    employeeName: 'John Doe',
    employeeFirstName: 'John',
    employeeLastName: 'Doe',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    onEndSession: mockEndSession,
  };

  it('should render the banner with employee name', () => {
    render(<ProxyLoginBanner {...defaultProps} />);

    expect(screen.getByText(/Viewing as John Doe/i)).toBeInTheDocument();
  });

  it('should display countdown timer', async () => {
    render(<ProxyLoginBanner {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Session expires in/i)).toBeInTheDocument();
    });
  });

  it('should call onEndSession when End Session button is clicked', () => {
    render(<ProxyLoginBanner {...defaultProps} />);

    const endButton = screen.getByRole('button', { name: /End Session/i });
    fireEvent.click(endButton);

    expect(mockEndSession).toHaveBeenCalledTimes(1);
  });

  it('should show "Expired" when session time has passed', async () => {
    const expiredProps = {
      ...defaultProps,
      expiresAt: new Date(Date.now() - 1000), // 1 second ago
    };

    render(<ProxyLoginBanner {...expiredProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Expired/i)).toBeInTheDocument();
    });
  });

  it('should format time correctly', async () => {
    const props = {
      ...defaultProps,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000 + 30 * 1000), // 5:30 from now
    };

    render(<ProxyLoginBanner {...props} />);

    await waitFor(() => {
      const timerElement = screen.getByText(/Session expires in/i);
      expect(timerElement.textContent).toContain('5:');
    });
  });

  it('should use formatFullName when employeeName is not provided', () => {
    const props = {
      ...defaultProps,
      employeeName: '',
    };

    render(<ProxyLoginBanner {...props} />);

    expect(screen.getByText(/Viewing as John Doe/i)).toBeInTheDocument();
  });
});
