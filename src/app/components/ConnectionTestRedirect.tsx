import { Navigate } from 'react-router';

/**
 * Redirect component for /connection-test to /admin/connection-test
 * The connection test page is an admin utility
 */
export function ConnectionTestRedirect() {
  return <Navigate to="/admin/connection-test" replace />;
}

export default ConnectionTestRedirect;
