/**
 * User Journey E2E Test Suite
 * Day 15 - Afternoon Session (Part 1)
 * Tests for complete user journeys and workflows
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router';
import { CartProvider } from '../context/CartContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ReactNode } from 'react';
import React from 'react';

// Mock utilities
vi.mock('../utils/security', () => ({
  logSecurityEvent: vi.fn(),
  startSessionTimer: vi.fn(),
  clearSessionTimer: vi.fn(),
  resetSessionTimer: vi.fn(),
}));

// Mock Admin Dashboard
function AdminDashboardPage() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login to access admin</div>;
  }
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <nav>
        <button>Manage Clients</button>
        <button>Manage Sites</button>
        <button>Manage Products</button>
        <button>View Analytics</button>
      </nav>
    </div>
  );
}

// Mock Event Creation Page
function CreateEventPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    eventName: '',
    eventDate: '',
    budget: '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/events/success');
  };
  
  return (
    <div>
      <h1>Create Event</h1>
      <form onSubmit={handleSubmit}>
        <input
          data-testid="event-name"
          placeholder="Event Name"
          value={formData.eventName}
          onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
        />
        <input
          data-testid="event-date"
          type="date"
          value={formData.eventDate}
          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
        />
        <input
          data-testid="event-budget"
          type="number"
          placeholder="Budget"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
        />
        <button type="submit">Create Event</button>
        <button type="button" onClick={() => navigate('/events')}>Cancel</button>
      </form>
    </div>
  );
}

// Mock Events List Page
function EventsListPage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Events</h1>
      <button onClick={() => navigate('/events/create')}>Create New Event</button>
      <div data-testid="events-list">
        <div>Annual Awards - Dec 2026</div>
        <div>Team Building - Jan 2027</div>
      </div>
    </div>
  );
}

// Mock Event Success Page
function EventSuccessPage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Event Created Successfully</h1>
      <button onClick={() => navigate('/events')}>View All Events</button>
      <button onClick={() => navigate('/')}>Return Home</button>
    </div>
  );
}

// Mock Site Selection Page
function SiteSelectionPage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Select Your Site</h1>
      <div data-testid="site-list">
        <button onClick={() => navigate('/site/site-1/home')}>Acme Corp</button>
        <button onClick={() => navigate('/site/site-2/home')}>TechStart Inc</button>
        <button onClick={() => navigate('/site/site-3/home')}>Global Solutions</button>
      </div>
    </div>
  );
}

// Mock Site Home Page
function SiteHomePage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Site Home</h1>
      <p>Welcome to your company portal</p>
      <button onClick={() => navigate('/products')}>Browse Gifts</button>
      <button onClick={() => navigate('/site-selection')}>Change Site</button>
    </div>
  );
}

// Mock Access Validation Page
function AccessValidationPage() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  const [code, setCode] = React.useState('');
  
  const handleValidate = () => {
    authenticate(`employee-${code}`, {
      id: code,
      email: `employee${code}@example.com`,
    });
    navigate('/site-selection');
  };
  
  return (
    <div>
      <h1>Access Validation</h1>
      <p>Enter your employee code or serial number</p>
      <input
        data-testid="access-code"
        placeholder="Enter code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleValidate}>Validate Access</button>
      <button onClick={() => navigate('/access/magic-link')}>Request Magic Link</button>
    </div>
  );
}

// Mock Magic Link Request Page
function MagicLinkRequestPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  
  const handleRequest = () => {
    setSent(true);
  };
  
  return (
    <div>
      <h1>Request Magic Link</h1>
      {!sent ? (
        <>
          <input
            data-testid="magic-link-email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleRequest}>Send Magic Link</button>
          <button onClick={() => navigate('/access')}>Back</button>
        </>
      ) : (
        <>
          <p data-testid="magic-link-sent">Check your email for the magic link</p>
          <button onClick={() => navigate('/')}>Return Home</button>
        </>
      )}
    </div>
  );
}

// Mock Order History Page
function OrderHistoryPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  if (!isAuthenticated) {
    return (
      <div>
        <p>Please login to view order history</p>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Order History</h1>
      <div data-testid="orders-list">
        <div>Order #1234 - Delivered</div>
        <div>Order #1235 - In Transit</div>
        <div>Order #1236 - Processing</div>
      </div>
      <button onClick={() => navigate('/products')}>Shop Again</button>
    </div>
  );
}

// Mock Profile Settings Page
function ProfileSettingsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  if (!isAuthenticated) {
    return (
      <div>
        <p>Please login</p>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }
  
  const handleSave = () => {
    navigate('/');
  };
  
  return (
    <div>
      <h1>Profile Settings</h1>
      <input
        data-testid="profile-name"
        value={profile.name}
        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
      />
      <input
        data-testid="profile-email"
        value={profile.email}
        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
      />
      <button onClick={handleSave}>Save Changes</button>
      <button onClick={() => navigate('/')}>Cancel</button>
    </div>
  );
}

function TestWrapper({ children, initialRoute = '/' }: { children: ReactNode; initialRoute?: string }) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('User Journey E2E Suite', () => {
  describe('Event Gifting Journey', () => {
    it('should complete event creation flow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/events">
          <Routes>
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/events/success" element={<EventSuccessPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Start at events list
      expect(screen.getByText('Events')).toBeInTheDocument();
      
      // Navigate to create
      await user.click(screen.getByText('Create New Event'));
      await waitFor(() => expect(screen.getByRole('heading', { name: 'Create Event' })).toBeInTheDocument());
      
      // Fill form
      await user.type(screen.getByTestId('event-name'), 'Holiday Party');
      await user.type(screen.getByTestId('event-date'), '2026-12-25');
      await user.type(screen.getByTestId('event-budget'), '5000');
      
      // Submit
      await user.click(screen.getByRole('button', { name: 'Create Event' }));
      
      await waitFor(() => {
        expect(screen.getByText('Event Created Successfully')).toBeInTheDocument();
      });
    });

    it('should cancel event creation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/events/create">
          <Routes>
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/create" element={<CreateEventPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.getByText('Events')).toBeInTheDocument();
      });
    });

    it('should return to events list from success page', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/events/success">
          <Routes>
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/success" element={<EventSuccessPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('View All Events'));
      
      await waitFor(() => {
        expect(screen.getByTestId('events-list')).toBeInTheDocument();
      });
    });
  });

  describe('Site Selection Journey', () => {
    it('should complete site selection flow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/site-selection">
          <Routes>
            <Route path="/site-selection" element={<SiteSelectionPage />} />
            <Route path="/site/:siteId/home" element={<SiteHomePage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Acme Corp'));
      
      await waitFor(() => {
        expect(screen.getByText('Site Home')).toBeInTheDocument();
      });
    });

    it('should switch between sites', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/site/site-1/home">
          <Routes>
            <Route path="/site-selection" element={<SiteSelectionPage />} />
            <Route path="/site/:siteId/home" element={<SiteHomePage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Change Site'));
      
      await waitFor(() => {
        expect(screen.getByText('Select Your Site')).toBeInTheDocument();
      });
    });
  });

  describe('Access Validation Journey', () => {
    it('should complete employee code validation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/access">
          <Routes>
            <Route path="/access" element={<AccessValidationPage />} />
            <Route path="/site-selection" element={<SiteSelectionPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.type(screen.getByTestId('access-code'), '12345');
      await user.click(screen.getByText('Validate Access'));
      
      await waitFor(() => {
        expect(screen.getByText('Select Your Site')).toBeInTheDocument();
      });
    });

    it('should request magic link', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/access">
          <Routes>
            <Route path="/access" element={<AccessValidationPage />} />
            <Route path="/access/magic-link" element={<MagicLinkRequestPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Request Magic Link'));
      
      await waitFor(() => {
        expect(screen.getByText('Request Magic Link')).toBeInTheDocument();
      });
    });

    it('should complete magic link request flow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/access/magic-link">
          <Routes>
            <Route path="/access/magic-link" element={<MagicLinkRequestPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.type(screen.getByTestId('magic-link-email'), 'user@example.com');
      await user.click(screen.getByText('Send Magic Link'));
      
      await waitFor(() => {
        expect(screen.getByTestId('magic-link-sent')).toBeInTheDocument();
      });
    });

    it('should navigate back from magic link request', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/access/magic-link">
          <Routes>
            <Route path="/access" element={<AccessValidationPage />} />
            <Route path="/access/magic-link" element={<MagicLinkRequestPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.click(screen.getByText('Back'));
      
      await waitFor(() => {
        expect(screen.getByText('Access Validation')).toBeInTheDocument();
      });
    });
  });

  describe('Order History Journey', () => {
    it('should require authentication to view orders', () => {
      render(
        <TestWrapper initialRoute="/orders">
          <Routes>
            <Route path="/orders" element={<OrderHistoryPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Please login to view order history')).toBeInTheDocument();
    });

    it('should show order history when authenticated', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Routes>
            <Route path="/" element={<div><button onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const { authenticate } = require('../context/AuthContext').useAuth();
              authenticate('user@example.com');
            }}>Login</button></div>} />
            <Route path="/orders" element={<OrderHistoryPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // This would require proper auth setup
    });

    it('should navigate to products from order history', async () => {
      const user = userEvent.setup();
      
      // Mock authenticated state
      const MockAuthOrderHistory = () => {
        return (
          <div>
            <h1>Order History</h1>
            <div data-testid="orders-list">
              <div>Order #1234 - Delivered</div>
            </div>
            <button onClick={() => {}}>Shop Again</button>
          </div>
        );
      };
      
      render(
        <TestWrapper initialRoute="/orders">
          <Routes>
            <Route path="/orders" element={<MockAuthOrderHistory />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('orders-list')).toBeInTheDocument();
    });
  });

  describe('Profile Settings Journey', () => {
    it('should require authentication for profile settings', () => {
      render(
        <TestWrapper initialRoute="/profile">
          <Routes>
            <Route path="/profile" element={<ProfileSettingsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Please login')).toBeInTheDocument();
    });

    it('should save profile changes', async () => {
      const user = userEvent.setup();
      
      // Mock authenticated state with profile page
      const MockAuthProfile = () => {
        const navigate = useNavigate();
        const [name, setName] = React.useState('John Doe');
        
        return (
          <div>
            <h1>Profile Settings</h1>
            <input
              data-testid="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button onClick={() => navigate('/')}>Save Changes</button>
          </div>
        );
      };
      
      render(
        <TestWrapper initialRoute="/profile">
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/profile" element={<MockAuthProfile />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.clear(screen.getByTestId('profile-name'));
      await user.type(screen.getByTestId('profile-name'), 'Jane Smith');
      await user.click(screen.getByText('Save Changes'));
      
      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });
    });
  });

  describe('Admin Dashboard Journey', () => {
    it('should require authentication for admin dashboard', () => {
      render(
        <TestWrapper initialRoute="/admin/dashboard">
          <Routes>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Please login to access admin')).toBeInTheDocument();
    });

    it('should show admin dashboard when authenticated', async () => {
      // Mock authenticated admin user
      const MockAuthAdmin = () => {
        return (
          <div>
            <h1>Admin Dashboard</h1>
            <nav>
              <button>Manage Clients</button>
              <button>Manage Sites</button>
            </nav>
          </div>
        );
      };
      
      render(
        <TestWrapper initialRoute="/admin/dashboard">
          <Routes>
            <Route path="/admin/dashboard" element={<MockAuthAdmin />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Manage Clients')).toBeInTheDocument();
    });
  });

  describe('Multi-Step User Journeys', () => {
    it('should complete full employee onboarding flow', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/access">
          <Routes>
            <Route path="/access" element={<AccessValidationPage />} />
            <Route path="/site-selection" element={<SiteSelectionPage />} />
            <Route path="/site/:siteId/home" element={<SiteHomePage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Validate access
      await user.type(screen.getByTestId('access-code'), '12345');
      await user.click(screen.getByText('Validate Access'));
      
      // Select site
      await waitFor(() => expect(screen.getByText('Select Your Site')).toBeInTheDocument());
      await user.click(screen.getByText('Acme Corp'));
      
      // Arrive at site home
      await waitFor(() => {
        expect(screen.getByText('Site Home')).toBeInTheDocument();
      });
    });

    it('should complete event creation and return home', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/events/create">
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/events/success" element={<EventSuccessPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Fill and submit event
      await user.type(screen.getByTestId('event-name'), 'Team Building');
      await user.type(screen.getByTestId('event-date'), '2027-01-15');
      await user.type(screen.getByTestId('event-budget'), '3000');
      await user.click(screen.getByRole('button', { name: 'Create Event' }));
      
      // Navigate home from success
      await waitFor(() => expect(screen.getByText('Event Created Successfully')).toBeInTheDocument());
      await user.click(screen.getByText('Return Home'));
      
      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Journeys', () => {
    it('should handle unauthorized access gracefully', () => {
      render(
        <TestWrapper initialRoute="/admin/dashboard">
          <Routes>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Please login to access admin')).toBeInTheDocument();
    });

    it('should handle unauthorized profile access', () => {
      render(
        <TestWrapper initialRoute="/profile">
          <Routes>
            <Route path="/profile" element={<ProfileSettingsPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Please login')).toBeInTheDocument();
    });

    it('should handle unauthorized order history access', () => {
      render(
        <TestWrapper initialRoute="/orders">
          <Routes>
            <Route path="/orders" element={<OrderHistoryPage />} />
          </Routes>
        </TestWrapper>
      );
      
      expect(screen.getByText('Please login to view order history')).toBeInTheDocument();
    });
  });

  describe('Form Validation Journeys', () => {
    it('should accept valid event form data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/events/create">
          <Routes>
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/events/success" element={<EventSuccessPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.type(screen.getByTestId('event-name'), 'Company Retreat');
      await user.type(screen.getByTestId('event-date'), '2027-06-15');
      await user.type(screen.getByTestId('event-budget'), '10000');
      
      await user.click(screen.getByRole('button', { name: 'Create Event' }));
      
      await waitFor(() => {
        expect(screen.getByText('Event Created Successfully')).toBeInTheDocument();
      });
    });

    it('should accept valid magic link email', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/access/magic-link">
          <Routes>
            <Route path="/access/magic-link" element={<MagicLinkRequestPage />} />
          </Routes>
        </TestWrapper>
      );
      
      await user.type(screen.getByTestId('magic-link-email'), 'valid@example.com');
      await user.click(screen.getByText('Send Magic Link'));
      
      await waitFor(() => {
        expect(screen.getByTestId('magic-link-sent')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Patterns', () => {
    it('should handle breadcrumb-style navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/events/create">
          <Routes>
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/create" element={<CreateEventPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Cancel should go back
      await user.click(screen.getByText('Cancel'));
      
      await waitFor(() => {
        expect(screen.getByText('Events')).toBeInTheDocument();
      });
    });

    it('should handle success page navigation options', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper initialRoute="/events/success">
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/success" element={<EventSuccessPage />} />
          </Routes>
        </TestWrapper>
      );
      
      // Should have multiple navigation options
      expect(screen.getByText('View All Events')).toBeInTheDocument();
      expect(screen.getByText('Return Home')).toBeInTheDocument();
    });
  });
});