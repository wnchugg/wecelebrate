import { useNavigate } from 'react-router';
import { Database, AlertTriangle, ArrowRight } from 'lucide-react';

interface DatabaseNotInitializedProps {
  error?: string;
  showDetails?: boolean;
}

/**
 * Component shown when the database hasn't been initialized
 * Guides users to the initialization page
 */
export function DatabaseNotInitialized({ error, showDetails = true }: DatabaseNotInitializedProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Database Not Initialized
            </h1>
            <p className="text-gray-600">
              Your wecelebrate platform needs to be set up before you can use it
            </p>
          </div>

          {/* Error Details */}
          {showDetails && error && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {/* What's needed */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#D91C81]" />
              What needs to be done:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#D91C81] font-bold">1.</span>
                <span>Initialize the database with demo data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D91C81] font-bold">2.</span>
                <span>Create admin account for platform management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D91C81] font-bold">3.</span>
                <span>Set up demo sites and gifts</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate('/initialize-database')}
            className="w-full bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <Database className="w-5 h-5" />
            Initialize Database Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Additional Help */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-900">
              <strong>ℹ️ Note:</strong> This is a one-time setup that creates your admin account 
              and seeds the database with demo data. It only takes a few seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}