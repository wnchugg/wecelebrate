import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../context/AdminContext';

export interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { adminUser, isLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete
    if (!isLoading && !adminUser) {
      void navigate('/admin/login', { replace: true });
    }
  }, [adminUser, isLoading, navigate]);

  // Only show loading state on initial load when we don't know the auth status yet
  // If adminUser exists, we're already authenticated - no need to show loading
  if (isLoading && !adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (while navigation is in progress)
  if (!adminUser) {
    return null;
  }

  return <>{children}</>;
}