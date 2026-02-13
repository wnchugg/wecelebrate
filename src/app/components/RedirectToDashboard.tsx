import { Navigate } from 'react-router';

/**
 * Simple redirect component for admin index route
 */
export function RedirectToDashboard() {
  return <Navigate to="/admin/dashboard" replace />;
}
