import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { Loader2 } from 'lucide-react';

/**
 * RedirectToDashboard - Redirects to the appropriate dashboard based on user role
 */
export function RedirectToDashboard() {
  const { adminUser, isLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && adminUser) {
      // Redirect based on user role
      if (adminUser.role === 'super_admin') {
        void navigate('/admin/system-dashboard', { replace: true });
      } else if (adminUser.role === 'admin') {
        void navigate('/admin/client-dashboard', { replace: true });
      } else {
        // Default to main dashboard
        void navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [adminUser, isLoading, navigate]);

  // Show loading state while determining redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-[#D91C81] animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );
}