import { Navigate } from 'react-router';

/**
 * Simple redirect component for backward compatibility
 * Redirects /gifts to /gift-selection
 */
export function GiftsRedirect() {
  return <Navigate to="/gift-selection" replace />;
}

export default GiftsRedirect;
