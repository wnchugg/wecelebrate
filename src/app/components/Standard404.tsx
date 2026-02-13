import { Link } from 'react-router';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

interface Standard404Props {
  /** Custom title for the 404 page */
  title?: string;
  /** Custom message/description */
  message?: string;
  /** Show search suggestions */
  showSuggestions?: boolean;
  /** Custom suggestions to display */
  suggestions?: Array<{
    label: string;
    path: string;
    description?: string;
  }>;
  /** Show back button */
  showBackButton?: boolean;
  /** Custom home path */
  homePath?: string;
}

export function Standard404({
  title = 'Page Not Found',
  message = "Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.",
  showSuggestions = true,
  suggestions,
  showBackButton = true,
  homePath = '/',
}: Standard404Props) {
  const defaultSuggestions = [
    {
      label: 'Home',
      path: '/',
      description: 'Return to homepage',
    },
    {
      label: 'Admin Portal',
      path: '/admin/login',
      description: 'Access admin dashboard',
    },
    {
      label: 'Client Portal',
      path: '/client-portal',
      description: 'View your sites',
    },
    {
      label: 'Platform Review',
      path: '/stakeholder-review',
      description: 'Learn about wecelebrate',
    },
  ];

  const displaySuggestions = suggestions || defaultSuggestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Main 404 Content */}
        <div className="text-center mb-12">
          {/* Large 404 Text */}
          <div className="relative mb-8">
            <h1 className="text-[200px] font-black leading-none bg-gradient-to-br from-pink-200 to-purple-200 bg-clip-text text-transparent select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-24 h-24 text-[#D91C81] opacity-30" />
            </div>
          </div>

          {/* Title and Message */}
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">{message}</p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to={homePath}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#D91C81] text-white rounded-lg font-semibold text-lg hover:bg-[#B71569] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>

            {showBackButton && (
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            )}
          </div>
        </div>

        {/* Suggestions Section */}
        {showSuggestions && displaySuggestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-50 rounded-lg">
                <HelpCircle className="w-6 h-6 text-[#D91C81]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Looking for something else?
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displaySuggestions.map((suggestion, index) => (
                <Link
                  key={index}
                  to={suggestion.path}
                  className="group p-4 rounded-xl border-2 border-gray-100 hover:border-[#D91C81] hover:bg-pink-50/50 transition-all duration-300"
                >
                  <div className="font-semibold text-gray-900 group-hover:text-[#D91C81] mb-1">
                    {suggestion.label}
                  </div>
                  {suggestion.description && (
                    <div className="text-sm text-gray-600">
                      {suggestion.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact support or try again later.
          </p>
        </div>
      </div>
    </div>
  );
}
