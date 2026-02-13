import { Navigate } from 'react-router';

/**
 * Redirect component for /admin-login to /admin/login
 * Handles legacy/incorrect URL format
 */
export function AdminLoginRedirect() {
  return <Navigate to="/admin/login" replace />;
}

export default AdminLoginRedirect;
