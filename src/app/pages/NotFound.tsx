import { Link, useLocation } from 'react-router';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import { Standard404 } from '../components/Standard404';

export function NotFound() {
  const location = useLocation();
  const path = location.pathname;

  // Detect common typos and suggest corrections
  const getSuggestion = (path: string): string | null => {
    // Admin login typos
    if (path.includes('/admin/logiin') || path.includes('/admin/loging') || path.includes('/admin/llogin')) {
      return '/admin/login';
    }
    // Dashboard typos
    if (path.includes('/admin/dashbaord') || path.includes('/admin/dashbord')) {
      return '/admin/dashboard';
    }
    // Client portal typos
    if (path.includes('/client-potal') || path.includes('/client-portall')) {
      return '/client-portal';
    }
    return null;
  };

  const suggestion = getSuggestion(path);

  // Use the new Standard404 component
  return (
    <Standard404
      title="Page Not Found"
      message={suggestion 
        ? `This page doesn't exist. Did you mean ${suggestion}?`
        : "Sorry, the page you're looking for doesn't exist or has been moved."
      }
      suggestions={[
        { label: 'Home', path: '/', description: 'Return to homepage' },
        { label: 'Admin Login', path: '/admin/login', description: 'Access admin portal' },
        { label: 'Client Portal', path: '/client-portal', description: 'View your sites' },
        { label: 'Platform Review', path: '/stakeholder-review', description: 'Learn about wecelebrate' },
      ]}
    />
  );
}