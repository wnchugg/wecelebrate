import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'sonner';
import { router } from './routes';
import { LanguageProvider } from './context/LanguageContext';
import { AdminProvider } from './context/AdminContext';
import { PrivacyProvider } from './context/PrivacyContext';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';

/**
 * Loading fallback component for RouterProvider
 */
function RouterLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Main App Component
 * Updated: 2026-02-12 - CartProvider added to Root component
 * Cache-bust: v12-cart-provider
 */
export default function App() {
  return (
    <LanguageProvider>
      <PrivacyProvider>
        <SiteProvider>
          <AuthProvider>
            <AdminProvider>
              <ErrorBoundary>
                <Suspense fallback={<RouterLoadingFallback />}>
                  <RouterProvider router={router} />
                </Suspense>
              </ErrorBoundary>
              <Toaster 
                position="top-right"
                expand={true}
                richColors={true}
                closeButton={true}
                duration={5000}
                toastOptions={{
                  classNames: {
                    toast: 'rounded-xl shadow-lg',
                    title: 'font-semibold',
                    description: 'text-sm',
                    actionButton: 'bg-[#D91C81] hover:bg-[#B71569]',
                    cancelButton: 'bg-gray-200 hover:bg-gray-300',
                    closeButton: 'bg-white hover:bg-gray-100',
                  },
                }}
              />
            </AdminProvider>
          </AuthProvider>
        </SiteProvider>
      </PrivacyProvider>
    </LanguageProvider>
  );
}