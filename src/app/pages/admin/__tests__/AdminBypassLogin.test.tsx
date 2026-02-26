/**
 * Admin Bypass Login Page Test Suite
 * Tests for src/app/pages/admin/AdminBypassLogin.tsx
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminBypassLogin from '../AdminBypassLogin';
import { BrowserRouter } from 'react-router';
import { LanguageProvider } from '../../../context/LanguageContext';

// Mock useParams and useSearchParams
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({ siteId: 'test-site-123' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    useNavigate: () => vi.fn(),
  };
});

// Mock the authApi - must be defined before vi.mock
vi.mock('../../../services/authApi', () => ({
  bypassLogin: vi.fn(),
}));

// Mock dependencies
vi.mock('lucide-react', () => ({
  Shield: () => <div data-testid="shield-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  KeyRound: () => <div data-testid="key-icon" />,
}));

vi.mock('../../../components/EnvironmentBadge', () => ({
  EnvironmentBadge: () => <div data-testid="environment-badge">Dev Environment</div>,
}));

vi.mock('../../../components/BackendConnectionStatus', () => ({
  BackendConnectionStatus: () => <div data-testid="backend-status">Connected</div>,
}));

vi.mock('../../../components/Alert', () => ({
  Alert: ({ title, message }: { title: string; message: string }) => (
    <div data-testid="alert">
      <div data-testid="alert-title">{title}</div>
      <div data-testid="alert-message">{message}</div>
    </div>
  ),
}));

vi.mock('../../../utils/frontendSecurity', () => ({
  validateEmail: vi.fn((email) => email.includes('@')),
  sanitizeString: vi.fn((str) => str),
  checkRateLimit: vi.fn(() => ({ allowed: true, retryAfter: null })),
  clearRateLimit: vi.fn(),
  logSecurityEvent: vi.fn(),
}));

vi.mock('../../../utils/errorHandling', () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

vi.mock('../../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../../../utils/apiErrors', () => ({
  parseError: vi.fn((err) => err?.message || 'An error occurred'),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </LanguageProvider>
  );
}

describe('Admin Bypass Login Component', () => {
  let mockBypassLogin: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const authApi = await import('../../../services/authApi');
    mockBypassLogin = vi.mocked(authApi.bypassLogin);
    mockBypassLogin.mockResolvedValue({ success: true });
  });

  describe('Rendering', () => {
    it('should render the bypass login form', () => {
      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      expect(screen.getByText('Admin Bypass Login')).toBeInTheDocument();
      expect(screen.getByText('Site Manager Access')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should display security notice', () => {
      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      expect(screen.getByText('Secure Access')).toBeInTheDocument();
      expect(screen.getByText(/This is a restricted bypass login/)).toBeInTheDocument();
    });

    it('should show environment badge and backend status', () => {
      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      expect(screen.getByTestId('environment-badge')).toBeInTheDocument();
      expect(screen.getByTestId('backend-status')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should require password to be at least 8 characters', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    it('should clear validation errors when user types', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');

      // Submit the form directly (button is disabled when fields are empty)
      const form = container.querySelector('form');
      expect(form).toBeTruthy();
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      await user.type(emailInput, 'admin@example.com');

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Login Flow - Without 2FA', () => {
    it('should successfully login without 2FA', async () => {
      const user = userEvent.setup();
      mockBypassLogin.mockResolvedValue({
        success: true,
        token: 'test-token',
        user: { id: '1', email: 'admin@example.com', role: 'manager' },
      });

      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockBypassLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'admin@example.com',
            password: 'password123',
            twoFactorCode: undefined,
          })
        );
      });
    });

    it('should show error message on login failure', async () => {
      const user = userEvent.setup();
      mockBypassLogin.mockResolvedValue({
        success: false,
        message: 'Invalid credentials',
      });

      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('alert-message')).toHaveTextContent('Invalid credentials');
      });
    });
  });

  describe('Login Flow - With 2FA', () => {
    it('should show 2FA input when required', async () => {
      const user = userEvent.setup();
      mockBypassLogin.mockResolvedValueOnce({
        success: false,
        requires2FA: true,
        message: 'Two-factor authentication required',
      });

      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Two-Factor Authentication Code')).toBeInTheDocument();
      });
    });

    it('should validate 2FA code length', async () => {
      const user = userEvent.setup();
      mockBypassLogin.mockResolvedValueOnce({
        success: false,
        requires2FA: true,
      });

      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      let submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Two-Factor Authentication Code')).toBeInTheDocument();
      });

      const twoFactorInput = screen.getByLabelText('Two-Factor Authentication Code');
      submitButton = screen.getByRole('button', { name: /verify & sign in/i });

      await user.type(twoFactorInput, '123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('2FA code must be 6 digits')).toBeInTheDocument();
      });
    });

    it('should successfully login with 2FA', async () => {
      const user = userEvent.setup();
      mockBypassLogin
        .mockResolvedValueOnce({
          success: false,
          requires2FA: true,
        })
        .mockResolvedValueOnce({
          success: true,
          token: 'test-token',
          user: { id: '1', email: 'admin@example.com', role: 'manager' },
        });

      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      let submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Two-Factor Authentication Code')).toBeInTheDocument();
      });

      const twoFactorInput = screen.getByLabelText('Two-Factor Authentication Code');
      submitButton = screen.getByRole('button', { name: /verify & sign in/i });

      await user.type(twoFactorInput, '123456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockBypassLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'admin@example.com',
            password: 'password123',
            twoFactorCode: '123456',
          })
        );
      });
    });

    it('should only allow numeric input for 2FA code', async () => {
      const user = userEvent.setup();
      mockBypassLogin.mockResolvedValueOnce({
        success: false,
        requires2FA: true,
      });

      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Two-Factor Authentication Code')).toBeInTheDocument();
      });

      const twoFactorInput = screen.getByLabelText('Two-Factor Authentication Code') as HTMLInputElement;

      await user.type(twoFactorInput, 'abc123def');

      expect(twoFactorInput.value).toBe('123');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      const toggleButton = screen.getByLabelText('Show password');

      expect(passwordInput.type).toBe('password');

      await user.click(toggleButton);

      expect(passwordInput.type).toBe('text');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting', async () => {
      const user = userEvent.setup();
      const { checkRateLimit } = await import('../../../utils/frontendSecurity');
      
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: false,
        retryAfter: 300000, // 5 minutes
      });

      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Too many login attempts/)).toBeInTheDocument();
      });

      expect(mockBypassLogin).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      mockBypassLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Verifying...')).toBeInTheDocument();
      });
    });

    it('should disable form inputs during loading', async () => {
      const user = userEvent.setup();
      mockBypassLogin.mockImplementation(() => new Promise(() => {}));

      render(
        <TestWrapper>
          <AdminBypassLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
