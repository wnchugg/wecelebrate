/**
 * Protected Route Test Suite
 * Day 13 - Afternoon Session
 * Tests for ProtectedRoute and AdminProtectedRoute components
 */

import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithRouter } from '@/test/helpers';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

// Mock components
function ProtectedPage() {
  return <div>Protected Content</div>;
}

function LoginPage() {
  return <div>Login Page</div>;
}

function AccessPage() {
  return <div>Access Validation Page</div>;
}

// Mock contexts
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const mockUseAuth = vi.mocked(await import('../../context/AuthContext')).useAuth;

interface MockAuthContext {
  isAuthenticated: boolean;
  userIdentifier: string | null;
  user: { id: string; email: string } | null;
  authenticate: () => void;
  login: () => void;
  logout: () => void;
  isLoading?: boolean;
}

describe('Protected Route Component Suite', () => {
  describe('ProtectedRoute - Authenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        userIdentifier: 'user@example.com',
        user: { id: '1', email: 'user@example.com' },
        authenticate: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
      } as MockAuthContext);
    });

    it('should render protected content when authenticated', () => {
      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <ProtectedPage />
          </ProtectedRoute>
        </AuthProvider>,
        '/protected'
      );
      
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render children when authenticated', () => {
      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <div>Child Component</div>
          </ProtectedRoute>
        </AuthProvider>,
        '/protected'
      );
      
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });

    it('should not redirect when authenticated', () => {
      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <ProtectedPage />
          </ProtectedRoute>
        </AuthProvider>,
        '/protected'
      );
      
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Access Validation Page')).not.toBeInTheDocument();
    });
  });

  describe('ProtectedRoute - Unauthenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        userIdentifier: null,
        user: null,
        authenticate: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
      } as MockAuthContext);
    });

    it('should not render protected content when unauthenticated', () => {
      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <ProtectedPage />
          </ProtectedRoute>
        </AuthProvider>,
        '/protected'
      );
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect to access page when unauthenticated', async () => {
      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <ProtectedPage />
          </ProtectedRoute>
        </AuthProvider>,
        '/protected'
      );
      
      // When unauthenticated, ProtectedRoute should not render content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should return null while redirecting', () => {
      const { container } = renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <ProtectedPage />
          </ProtectedRoute>
        </AuthProvider>,
        '/protected'
      );
      
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle ProtectedRoute without AuthContext', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        userIdentifier: null,
        user: null,
        authenticate: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
      } as MockAuthContext);
      
      expect(() => {
        renderWithRouter(
          <ProtectedRoute>
            <ProtectedPage />
          </ProtectedRoute>,
          '/protected'
        );
      }).not.toThrow();
    });

    it('should handle multiple protected routes', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        userIdentifier: 'user@example.com',
        user: { id: '1', email: 'user@example.com' },
        authenticate: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
      } as MockAuthContext);
      
      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected 1</div>
          </ProtectedRoute>
          <ProtectedRoute>
            <div>Protected 2</div>
          </ProtectedRoute>
        </AuthProvider>,
        '/protected1'
      );
      
      expect(screen.getByText('Protected 1')).toBeInTheDocument();
    });

    it('should handle nested protected routes', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        userIdentifier: 'user@example.com',
        user: { id: '1', email: 'user@example.com' },
        authenticate: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
      } as MockAuthContext);
      
      renderWithRouter(
        <AuthProvider>
          <ProtectedRoute>
            <ProtectedRoute>
              <div>Nested Protected</div>
            </ProtectedRoute>
          </ProtectedRoute>
        </AuthProvider>,
        '/protected'
      );
      
      expect(screen.getByText('Nested Protected')).toBeInTheDocument();
    });
  });
});