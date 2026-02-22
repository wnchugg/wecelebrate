/**
 * Proxy Session Provider Tests
 * Tests for read-only mode enforcement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProxySessionProvider, useReadOnlyMode } from '../ProxySessionProvider';
import { useProxySession } from '../../hooks/useProxySession';

// Mock the useProxySession hook
vi.mock('../../hooks/useProxySession', () => ({
  useProxySession: vi.fn(),
}));

// Mock the useNameFormat hook
vi.mock('../../hooks/useNameFormat', () => ({
  useNameFormat: () => ({
    formatFullName: (first: string, last: string) => `${first} ${last}`,
  }),
}));

// Test component that uses useReadOnlyMode
function TestComponent() {
  const isReadOnly = useReadOnlyMode();
  return (
    <div>
      <p>Read-only mode: {isReadOnly ? 'Yes' : 'No'}</p>
      <button disabled={isReadOnly}>Purchase</button>
    </div>
  );
}

describe('ProxySessionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render banner when no proxy session exists', () => {
    (useProxySession as any).mockReturnValue({
      session: null,
      isProxySession: false,
      endSession: vi.fn(),
      loading: false,
    });

    render(
      <ProxySessionProvider>
        <div>Test Content</div>
      </ProxySessionProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.queryByText(/Viewing as/i)).not.toBeInTheDocument();
  });

  it('should render banner when proxy session exists', () => {
    const mockSession = {
      id: 'session-123',
      adminId: 'admin-456',
      employeeId: 'emp-789',
      siteId: 'site-abc',
      token: 'token-xyz',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      createdAt: new Date(),
    };

    (useProxySession as any).mockReturnValue({
      session: mockSession,
      isProxySession: true,
      endSession: vi.fn(),
      loading: false,
    });

    render(
      <ProxySessionProvider>
        <div>Test Content</div>
      </ProxySessionProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText(/Session expires in/i)).toBeInTheDocument();
  });

  it('should enforce read-only mode when proxy session is active', () => {
    const mockSession = {
      id: 'session-123',
      adminId: 'admin-456',
      employeeId: 'emp-789',
      siteId: 'site-abc',
      token: 'token-xyz',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      createdAt: new Date(),
    };

    (useProxySession as any).mockReturnValue({
      session: mockSession,
      isProxySession: true,
      endSession: vi.fn(),
      loading: false,
    });

    render(
      <ProxySessionProvider>
        <TestComponent />
      </ProxySessionProvider>
    );

    expect(screen.getByText('Read-only mode: Yes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Purchase/i })).toBeDisabled();
  });

  it('should not enforce read-only mode when no proxy session', () => {
    (useProxySession as any).mockReturnValue({
      session: null,
      isProxySession: false,
      endSession: vi.fn(),
      loading: false,
    });

    render(
      <ProxySessionProvider>
        <TestComponent />
      </ProxySessionProvider>
    );

    expect(screen.getByText('Read-only mode: No')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Purchase/i })).not.toBeDisabled();
  });

  it('should not render children while loading', () => {
    (useProxySession as any).mockReturnValue({
      session: null,
      isProxySession: false,
      endSession: vi.fn(),
      loading: true,
    });

    const { container } = render(
      <ProxySessionProvider>
        <div>Test Content</div>
      </ProxySessionProvider>
    );

    expect(container.firstChild).toBeNull();
  });
});
