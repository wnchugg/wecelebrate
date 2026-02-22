import { Suspense } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { useAdmin } from '../../context/AdminContext';
import { AdminLayout } from './AdminLayout';
import { Loader2 } from 'lucide-react';
import { GiftProvider } from '../../context/GiftContext';
import { EmailTemplateProvider } from '../../context/EmailTemplateContext';
import { ShippingConfigProvider } from '../../context/ShippingConfigContext';

/**
 * AdminLayoutWrapper - Protects admin routes with authentication
 * This wrapper checks if user is authenticated before rendering AdminLayout
 * Updated: 2026-02-09 - Simplified, removed error boundary (contexts now return safe defaults)
 * Updated: 2026-02-10 - Added GiftProvider, EmailTemplateProvider, and ShippingConfigProvider
 */
export function AdminLayoutWrapper() {
  const { isAdminAuthenticated, isLoading } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // User is authenticated, render the actual layout with Suspense for lazy-loaded pages
  // IMPORTANT: Wrap with context providers so all admin pages have access to gift, email, and shipping data
  return (
    <GiftProvider>
      <EmailTemplateProvider>
        <ShippingConfigProvider>
          <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading...</p>
              </div>
            </div>
          }>
            <AdminLayout />
          </Suspense>
        </ShippingConfigProvider>
      </EmailTemplateProvider>
    </GiftProvider>
  );
}