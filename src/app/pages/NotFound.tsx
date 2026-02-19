import { Link, useLocation } from 'react-router';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import { Standard404 } from '../components/Standard404';
import { useSiteContent } from '../hooks/useSiteContent';
import { useLanguage } from '../context/LanguageContext';

export function NotFound() {
  const location = useLocation();
  const path = location.pathname;
  const { getTranslatedContent } = useSiteContent();
  const { t } = useLanguage();

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

  // Get translated content
  const title = getTranslatedContent('notFoundPage.title', t('notFound.title') || 'Page Not Found');
  const message = getTranslatedContent('notFoundPage.message', 
    suggestion 
      ? `This page doesn't exist. Did you mean ${suggestion}?`
      : t('notFound.message') || "Sorry, the page you're looking for doesn't exist or has been moved."
  );
  const homeButton = getTranslatedContent('notFoundPage.homeButton', t('notFound.homeButton') || 'Home');
  const adminLoginButton = getTranslatedContent('notFoundPage.adminLoginButton', t('notFound.adminLoginButton') || 'Admin Login');
  const clientPortalButton = getTranslatedContent('notFoundPage.clientPortalButton', t('notFound.clientPortalButton') || 'Client Portal');

  // Use the new Standard404 component
  return (
    <Standard404
      title={title}
      message={message}
      suggestions={[
        { label: homeButton, path: '/', description: 'Return to homepage' },
        { label: adminLoginButton, path: '/admin/login', description: 'Access admin portal' },
        { label: clientPortalButton, path: '/client-portal', description: 'View your sites' },
        { label: 'Platform Review', path: '/stakeholder-review', description: 'Learn about wecelebrate' },
      ]}
    />
  );
}